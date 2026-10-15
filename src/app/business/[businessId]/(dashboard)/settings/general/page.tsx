import Link from "next/link";
import { headers } from "next/headers";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SettingsForm, { type BusinessSettings } from "../settings-form";
import CopyLinkButton from "../copy-link-button";

export default async function GeneralSettingsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const headerList = await headers();

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "name, address, phone, work_start_time, work_end_time, izin_deduction_mode, izin_deduction_weekday, izin_deduction_weekend, late_deduction_per_occurrence, lembur_rate_per_hour, pph21_enabled, office_lat, office_lng, attendance_radius_m, attendance_pin_required, bpjs_enabled, bpjs_jkk_rate, bpjs_jp_wage_cap, bpjs_kesehatan_wage_cap, overtime_approval_required, overtime_min_minutes, overtime_rounding_minutes, overtime_max_hours, overtime_rate_mode, work_days_per_week, attendance_qr_slug, leave_request_slug",
    )
    .eq("id", businessId)
    .single();

  if (!business) return null;

  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const attendanceLink = `${protocol}://${host}/absen/${business.attendance_qr_slug}`;
  const leaveRequestLink = `${protocol}://${host}/cuti/${business.leave_request_slug}`;
  const portalLink = `${protocol}://${host}/karyawan/${business.attendance_qr_slug}`;

  const settings: BusinessSettings = {
    name: business.name,
    address: business.address,
    phone: business.phone,
    work_start_time: business.work_start_time,
    work_end_time: business.work_end_time,
    izin_deduction_mode: business.izin_deduction_mode as "flat" | "full_day",
    izin_deduction_weekday: business.izin_deduction_weekday,
    izin_deduction_weekend: business.izin_deduction_weekend,
    late_deduction_per_occurrence: business.late_deduction_per_occurrence,
    lembur_rate_per_hour: business.lembur_rate_per_hour,
    pph21_enabled: business.pph21_enabled,
    office_lat: business.office_lat,
    office_lng: business.office_lng,
    attendance_radius_m: business.attendance_radius_m,
    attendance_pin_required: business.attendance_pin_required,
    bpjs_enabled: business.bpjs_enabled,
    bpjs_jkk_rate: Number(business.bpjs_jkk_rate),
    bpjs_jp_wage_cap: Number(business.bpjs_jp_wage_cap),
    bpjs_kesehatan_wage_cap: Number(business.bpjs_kesehatan_wage_cap),
    overtime_approval_required: business.overtime_approval_required,
    overtime_min_minutes: business.overtime_min_minutes,
    overtime_rounding_minutes: business.overtime_rounding_minutes,
    overtime_max_hours: Number(business.overtime_max_hours),
    overtime_rate_mode: business.overtime_rate_mode === "pp35" ? "pp35" : "flat",
    work_days_per_week: business.work_days_per_week === 5 ? 5 : 6,
  };

  // Satu link utama (Portal Karyawan) sudah mencakup absen selfie, slip gaji, cuti,
  // dan lembur. Link absen dan cuti langsung tetap ada untuk poster QR / pintasan,
  // tapi dilipat supaya pemilik cukup membagikan satu link.
  const directLinks = [
    {
      title: "Link Absen Selfie",
      desc: "Untuk poster QR di lokasi kerja: karyawan scan lalu langsung ke halaman absen. Pasang PIN absen per karyawan dan batasi lokasi absen di bagian “Keamanan Absen Selfie” di bawah supaya tidak bisa dititipkan atau dilakukan dari luar lokasi kerja.",
      link: attendanceLink,
    },
    {
      title: "Link Pengajuan Cuti",
      desc: "Langsung ke formulir pengajuan cuti (butuh minimal satu jenis cuti aktif di halaman Jenis Cuti). Karyawan yang memakai Portal Karyawan tidak perlu link ini, karena tombol Cuti di portal sudah membukanya.",
      link: leaveRequestLink,
    },
  ];

  return (
    <div>
      <Link
        href={`/business/${businessId}/settings`}
        className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
      >
        <ChevronLeft size={14} /> Pengaturan
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Pengaturan Umum</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Info bisnis, jam kerja, dan aturan payroll.</p>
      </div>

      <div className="mb-5 rounded-xl border-2 border-brand-100 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-800">Link Portal Karyawan</h2>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">Cukup bagikan ini</span>
        </div>
        <p className="mb-3 text-xs text-zinc-500">
          Satu link untuk semua karyawan, tanpa install aplikasi. Karyawan masuk dengan nama + PIN absen, lalu bisa absen selfie, melihat slip gaji, sisa cuti, dan rekap absensi, serta mengajukan cuti dan lembur. Karyawan tanpa PIN tidak bisa masuk — pasang PIN di halaman Karyawan.
        </p>
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
          <code className="flex-1 truncate text-xs text-zinc-600">{portalLink}</code>
          <CopyLinkButton link={portalLink} />
        </div>
      </div>

      <details className="mb-5 rounded-xl border border-zinc-100 bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-zinc-700">
          <span>
            Link langsung (opsional)
            <span className="ml-2 text-xs font-normal text-zinc-400">poster QR absen dan formulir cuti</span>
          </span>
          <ChevronDown size={16} className="shrink-0 text-zinc-400" />
        </summary>
        <div className="space-y-4 border-t border-zinc-100 px-5 py-4">
          {directLinks.map((l) => (
            <div key={l.title}>
              <h3 className="mb-1 text-sm font-semibold text-zinc-800">{l.title}</h3>
              <p className="mb-2 text-xs text-zinc-400">{l.desc}</p>
              <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
                <code className="flex-1 truncate text-xs text-zinc-600">{l.link}</code>
                <CopyLinkButton link={l.link} />
              </div>
            </div>
          ))}
        </div>
      </details>

      <SettingsForm businessId={businessId} settings={settings} />
    </div>
  );
}
