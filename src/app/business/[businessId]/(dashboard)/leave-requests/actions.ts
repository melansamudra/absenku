"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { countDaysInclusive } from "@/lib/payroll/aggregate";
import { sendLeaveApprovedEmail, sendLeaveRejectedEmail } from "@/lib/email/leave-notifications";
import { logActivity } from "@/lib/activity-log";

export type ActionState = { error: string | null };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function dateRange(start: string, end: string): string[] {
  const days = countDaysInclusive(start, end);
  const [y, m, d] = start.split("-").map(Number);
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + i);
    dates.push(dt.toISOString().slice(0, 10));
  }
  return dates;
}

// Cuti disetujui → upsert baris attendance status='izin' untuk tiap tanggal
// dalam rentang. `note` diisi nama jenis cuti kalau berbayar (jatuh ke jalur
// "izin berketerangan" = dibayar penuh, logic yang sudah ada di
// lib/payroll/aggregate.ts), dibiarkan kosong kalau tidak berbayar (jatuh ke
// jalur "izin tanpa keterangan" = dipotong sesuai aturan izin bisnis).
// Reuse penuh — tidak ada logic payroll baru.
async function applyApprovedLeaveToAttendance(
  supabase: SupabaseServerClient,
  businessId: string,
  employeeId: string,
  leaveRequestId: string,
  leaveTypeName: string,
  paid: boolean,
  startDate: string,
  endDate: string,
) {
  const rows = dateRange(startDate, endDate).map((date) => ({
    business_id: businessId,
    employee_id: employeeId,
    date,
    status: "izin",
    note: paid ? leaveTypeName : null,
    leave_request_id: leaveRequestId,
  }));

  await supabase.from("attendance").upsert(rows, { onConflict: "employee_id,date" });
}

export async function createLeaveRequestByAdmin(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const employeeId = formData.get("employee_id") as string;
  const leaveTypeId = formData.get("leave_type_id") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const reason = ((formData.get("reason") as string) || "").trim() || null;

  if (!employeeId || !leaveTypeId) return { error: "Karyawan & jenis cuti wajib dipilih." };
  if (!startDate || !endDate || endDate < startDate) return { error: "Rentang tanggal tidak valid." };

  const supabase = await createClient();

  const [{ data: leaveType }, { data: employee }, { data: business }] = await Promise.all([
    supabase
      .from("leave_types")
      .select("name, paid")
      .eq("id", leaveTypeId)
      .eq("business_id", businessId)
      .single(),
    supabase
      .from("employees")
      .select("name, email")
      .eq("id", employeeId)
      .eq("business_id", businessId)
      .single(),
    supabase.from("businesses").select("name").eq("id", businessId).single(),
  ]);
  if (!leaveType) return { error: "Jenis cuti tidak ditemukan." };
  if (!employee) return { error: "Karyawan tidak ditemukan." };

  const daysCount = countDaysInclusive(startDate, endDate);

  const { data: request, error } = await supabase
    .from("leave_requests")
    .insert({
      business_id: businessId,
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
      days_count: daysCount,
      reason,
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_note: "Diajukan & disetujui langsung oleh admin.",
    })
    .select("id")
    .single();

  if (error || !request) return { error: error?.message ?? "Gagal membuat pengajuan cuti." };

  await applyApprovedLeaveToAttendance(
    supabase,
    businessId,
    employeeId,
    request.id,
    leaveType.name,
    leaveType.paid,
    startDate,
    endDate,
  );

  await sendLeaveApprovedEmail({
    employeeEmail: employee.email,
    employeeName: employee.name,
    businessName: business?.name ?? "ABSENKU",
    leaveTypeName: leaveType.name,
    startDate,
    endDate,
  });

  revalidatePath(`/business/${businessId}/leave-requests`);
  return { error: null };
}

export async function approveLeaveRequest(businessId: string, leaveRequestId: string) {
  const supabase = await createClient();

  const [{ data: request }, { data: business }] = await Promise.all([
    supabase
      .from("leave_requests")
      .select(
        "employee_id, leave_type_id, start_date, end_date, status, leave_types(name, paid), employees(name, email)",
      )
      .eq("id", leaveRequestId)
      .eq("business_id", businessId)
      .single(),
    supabase.from("businesses").select("name").eq("id", businessId).single(),
  ]);

  if (!request || request.status !== "pending") return;

  const leaveType = request.leave_types as unknown as { name: string; paid: boolean } | null;
  const employee = request.employees as unknown as { name: string; email: string | null } | null;
  if (!leaveType || !employee) return;

  await supabase
    .from("leave_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", leaveRequestId)
    .eq("business_id", businessId);

  await applyApprovedLeaveToAttendance(
    supabase,
    businessId,
    request.employee_id,
    leaveRequestId,
    leaveType.name,
    leaveType.paid,
    request.start_date,
    request.end_date,
  );

  // Best-effort — lihat komentar di lib/email/leave-notifications.ts, gagal
  // kirim email tidak pernah menggagalkan approval yang sudah tersimpan.
  await sendLeaveApprovedEmail({
    employeeEmail: employee.email,
    employeeName: employee.name,
    businessName: business?.name ?? "ABSENKU",
    leaveTypeName: leaveType.name,
    startDate: request.start_date,
    endDate: request.end_date,
  });

  await logActivity(
    supabase,
    businessId,
    "Cuti disetujui",
    `${employee.name} · ${leaveType.name} · ${request.start_date} — ${request.end_date}`,
  );

  revalidatePath(`/business/${businessId}/leave-requests`);
}

export async function rejectLeaveRequest(businessId: string, leaveRequestId: string, note: string | null) {
  const supabase = await createClient();

  const [{ data: request }, { data: business }] = await Promise.all([
    supabase
      .from("leave_requests")
      .select("start_date, end_date, status, leave_types(name), employees(name, email)")
      .eq("id", leaveRequestId)
      .eq("business_id", businessId)
      .single(),
    supabase.from("businesses").select("name").eq("id", businessId).single(),
  ]);

  if (!request || request.status !== "pending") return;

  await supabase
    .from("leave_requests")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_note: note })
    .eq("id", leaveRequestId)
    .eq("business_id", businessId)
    .eq("status", "pending");

  const leaveType = request.leave_types as unknown as { name: string } | null;
  const employee = request.employees as unknown as { name: string; email: string | null } | null;
  if (leaveType && employee) {
    await sendLeaveRejectedEmail({
      employeeEmail: employee.email,
      employeeName: employee.name,
      businessName: business?.name ?? "ABSENKU",
      leaveTypeName: leaveType.name,
      startDate: request.start_date,
      endDate: request.end_date,
      reviewedNote: note,
    });

    await logActivity(
      supabase,
      businessId,
      "Cuti ditolak",
      `${employee.name} · ${leaveType.name} · ${request.start_date} — ${request.end_date}`,
    );
  }

  revalidatePath(`/business/${businessId}/leave-requests`);
}
