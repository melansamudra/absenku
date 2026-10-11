"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { weightedScore } from "@/lib/kpi/score";

export type KpiResult = { error: string | null; id?: string };

export type IndicatorInput = { id?: string; name: string; description: string; weight: number };
export type FormInput = {
  name: string;
  description: string;
  status: "draft" | "active";
  indicators: IndicatorInput[];
};

const kpiPath = (businessId: string, sub = "") => `/business/${businessId}/kpi${sub}`;

/** Simpan formulir KPI beserta indikatornya. Formulir aktif wajib berbobot total 100. */
export async function saveKpiForm(businessId: string, formId: string | null, input: FormInput): Promise<KpiResult> {
  const name = input.name.trim();
  if (!name) return { error: "Nama formulir wajib diisi." };

  const indicators = input.indicators
    .map((i) => ({ ...i, name: i.name.trim(), description: i.description.trim(), weight: Number(i.weight) }))
    .filter((i) => i.name);
  if (indicators.some((i) => !Number.isFinite(i.weight) || i.weight < 0 || i.weight > 100)) {
    return { error: "Bobot indikator harus antara 0 dan 100." };
  }
  const totalWeight = indicators.reduce((t, i) => t + i.weight, 0);
  if (input.status === "active") {
    if (indicators.length === 0) return { error: "Formulir aktif harus punya minimal satu indikator." };
    if (Math.abs(totalWeight - 100) > 0.01) {
      return { error: `Total bobot harus 100% (sekarang ${Math.round(totalWeight * 100) / 100}%).` };
    }
  }

  const supabase = await createClient();
  let id = formId;

  if (id) {
    // Formulir yang sudah dipakai jadwal: indikator dikunci supaya nilai lama tidak berubah.
    const { count } = await supabase
      .from("kpi_schedules")
      .select("id", { count: "exact", head: true })
      .eq("form_id", id)
      .eq("business_id", businessId);
    const locked = (count ?? 0) > 0;

    const { error } = await supabase
      .from("kpi_forms")
      .update({ name, description: input.description.trim() || null, status: input.status })
      .eq("id", id)
      .eq("business_id", businessId);
    if (error) return { error: error.message };
    if (locked) {
      revalidatePath(kpiPath(businessId, "/forms"));
      return { error: null, id };
    }
  } else {
    const { data, error } = await supabase
      .from("kpi_forms")
      .insert({ business_id: businessId, name, description: input.description.trim() || null, status: input.status })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "Gagal menyimpan formulir." };
    id = data.id;
  }

  // Ganti seluruh indikator dengan yang dikirim form.
  const { error: delErr } = await supabase.from("kpi_indicators").delete().eq("form_id", id!).eq("business_id", businessId);
  if (delErr) return { error: delErr.message };
  if (indicators.length > 0) {
    const { error: insErr } = await supabase.from("kpi_indicators").insert(
      indicators.map((i, idx) => ({
        business_id: businessId,
        form_id: id!,
        name: i.name,
        description: i.description || null,
        weight: i.weight,
        sort_order: idx,
      })),
    );
    if (insErr) return { error: insErr.message };
  }

  await logActivity(supabase, businessId, formId ? "Formulir KPI diubah" : "Formulir KPI dibuat", name);
  revalidatePath(kpiPath(businessId, "/forms"));
  return { error: null, id: id! };
}

export async function deleteKpiForm(businessId: string, formId: string): Promise<KpiResult> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("kpi_schedules")
    .select("id", { count: "exact", head: true })
    .eq("form_id", formId)
    .eq("business_id", businessId);
  if ((count ?? 0) > 0) return { error: "Formulir sudah dipakai di jadwal penilaian dan tidak bisa dihapus." };
  const { error } = await supabase.from("kpi_forms").delete().eq("id", formId).eq("business_id", businessId);
  if (error) return { error: error.message };
  revalidatePath(kpiPath(businessId, "/forms"));
  return { error: null };
}

export type ScheduleInput = {
  name: string;
  form_id: string;
  observe_start: string;
  observe_end: string;
  employee_ids: string[];
};

/** Buat jadwal penilaian + satu evaluasi (pending) untuk tiap karyawan peserta. */
export async function createKpiSchedule(businessId: string, input: ScheduleInput): Promise<KpiResult> {
  const name = input.name.trim();
  if (!name) return { error: "Nama jadwal wajib diisi." };
  if (!input.form_id) return { error: "Pilih formulir KPI." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.observe_start) || !/^\d{4}-\d{2}-\d{2}$/.test(input.observe_end)) {
    return { error: "Periode observasi wajib diisi." };
  }
  if (input.observe_end < input.observe_start) return { error: "Tanggal selesai tidak boleh sebelum tanggal mulai." };
  if (input.employee_ids.length === 0) return { error: "Pilih minimal satu karyawan yang dinilai." };

  const supabase = await createClient();
  const { data: form } = await supabase
    .from("kpi_forms")
    .select("status")
    .eq("id", input.form_id)
    .eq("business_id", businessId)
    .maybeSingle();
  if (!form) return { error: "Formulir tidak ditemukan." };
  if (form.status !== "active") return { error: "Formulir harus berstatus aktif untuk dijadwalkan." };

  const { data: schedule, error } = await supabase
    .from("kpi_schedules")
    .insert({
      business_id: businessId,
      form_id: input.form_id,
      name,
      observe_start: input.observe_start,
      observe_end: input.observe_end,
      status: "active",
    })
    .select("id")
    .single();
  if (error || !schedule) return { error: error?.message ?? "Gagal membuat jadwal." };

  const { error: revErr } = await supabase.from("kpi_reviews").insert(
    input.employee_ids.map((employee_id) => ({ business_id: businessId, schedule_id: schedule.id, employee_id })),
  );
  if (revErr) {
    await supabase.from("kpi_schedules").delete().eq("id", schedule.id);
    return { error: revErr.message };
  }

  await logActivity(supabase, businessId, "Jadwal KPI dibuat", name);
  revalidatePath(kpiPath(businessId, "/schedules"));
  revalidatePath(kpiPath(businessId, "/reviews"));
  return { error: null, id: schedule.id };
}

export async function deleteKpiSchedule(businessId: string, scheduleId: string): Promise<KpiResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("kpi_schedules").delete().eq("id", scheduleId).eq("business_id", businessId);
  if (error) return { error: error.message };
  revalidatePath(kpiPath(businessId, "/schedules"));
  revalidatePath(kpiPath(businessId, "/reviews"));
  return { error: null };
}

export type ScoreInput = { indicator_id: string; score: number; note: string };

/** Simpan penilaian satu karyawan: hitung nilai akhir tertimbang lalu tandai selesai. */
export async function saveKpiReview(
  businessId: string,
  reviewId: string,
  scores: ScoreInput[],
  notes: string,
): Promise<KpiResult> {
  const supabase = await createClient();
  const { data: review } = await supabase
    .from("kpi_reviews")
    .select("id, schedule_id, kpi_schedules(form_id), employees(name)")
    .eq("id", reviewId)
    .eq("business_id", businessId)
    .maybeSingle();
  if (!review) return { error: "Evaluasi tidak ditemukan." };

  const formId = (review.kpi_schedules as unknown as { form_id: string } | null)?.form_id;
  const { data: indicators } = await supabase
    .from("kpi_indicators")
    .select("id, weight")
    .eq("form_id", formId ?? "")
    .eq("business_id", businessId);
  const weightById = new Map((indicators ?? []).map((i) => [i.id, Number(i.weight)]));

  const rows = scores.filter((s) => weightById.has(s.indicator_id));
  if (rows.length !== weightById.size) return { error: "Semua indikator harus diberi nilai." };
  if (rows.some((s) => !Number.isFinite(s.score) || s.score < 0 || s.score > 100)) {
    return { error: "Nilai tiap indikator harus antara 0 dan 100." };
  }

  const total = weightedScore(rows.map((s) => ({ score: s.score, weight: weightById.get(s.indicator_id) ?? 0 })));

  const { error: upErr } = await supabase.from("kpi_review_scores").upsert(
    rows.map((s) => ({
      business_id: businessId,
      review_id: reviewId,
      indicator_id: s.indicator_id,
      score: s.score,
      note: s.note.trim() || null,
    })),
    { onConflict: "review_id,indicator_id" },
  );
  if (upErr) return { error: upErr.message };

  const { error } = await supabase
    .from("kpi_reviews")
    .update({ status: "done", total_score: total, notes: notes.trim() || null, reviewed_at: new Date().toISOString() })
    .eq("id", reviewId)
    .eq("business_id", businessId);
  if (error) return { error: error.message };

  // Jadwal otomatis selesai kalau semua peserta sudah dinilai.
  const { count } = await supabase
    .from("kpi_reviews")
    .select("id", { count: "exact", head: true })
    .eq("schedule_id", review.schedule_id)
    .eq("status", "pending");
  if ((count ?? 0) === 0) {
    await supabase.from("kpi_schedules").update({ status: "done" }).eq("id", review.schedule_id).eq("business_id", businessId);
  }

  await logActivity(supabase, businessId, "KPI dinilai", (review.employees as unknown as { name: string } | null)?.name);
  revalidatePath(kpiPath(businessId, "/reviews"));
  revalidatePath(kpiPath(businessId, "/schedules"));
  return { error: null, id: reviewId };
}
