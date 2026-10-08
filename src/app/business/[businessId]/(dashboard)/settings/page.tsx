import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import SettingsForm, { type BusinessSettings } from "./settings-form";
import CopyLinkButton from "./copy-link-button";

export default async function SettingsPage({
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
      "name, address, phone, work_start_time, work_end_time, izin_deduction_mode, izin_deduction_weekday, izin_deduction_weekend, late_deduction_per_occurrence, lembur_rate_per_hour, pph21_enabled, office_lat, office_lng, attendance_radius_m, attendance_pin_required, bpjs_enabled, bpjs_jkk_rate, bpjs_jp_wage_cap, bpjs_kesehatan_wage_cap, overtime_approval_required, attendance_qr_slug, leave_request_slug",
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
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Pengaturan</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Info bisnis, jam kerja, dan aturan payroll.</p>
      </div>

      <div className="mb-5 rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-zinc-800">Link Absen Selfie</h2>
        <p className="mb-3 text-xs text-zinc-400">
          Bagikan link ini ke karyawan (cetak sebagai poster QR di lokasi kerja). Pasang PIN absen
          per karyawan dan batasi lokasi absen di bagian &ldquo;Keamanan Absen&rdquo; di bawah supaya
          tidak bisa dititipkan atau dilakukan dari luar lokasi kerja.
        </p>
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
          <code className="flex-1 truncate text-xs text-zinc-600">{attendanceLink}</code>
          <CopyLinkButton link={attendanceLink} />
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-zinc-800">Link Pengajuan Cuti</h2>
        <p className="mb-3 text-xs text-zinc-400">
          Bagikan link ini ke karyawan supaya mereka bisa mengajukan cuti sendiri (butuh minimal
          satu jenis cuti aktif di halaman Jenis Cuti).
        </p>
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
          <code className="flex-1 truncate text-xs text-zinc-600">{leaveRequestLink}</code>
          <CopyLinkButton link={leaveRequestLink} />
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-zinc-800">Link Portal Karyawan</h2>
        <p className="mb-3 text-xs text-zinc-400">
          Karyawan masuk dengan nama + PIN absen untuk melihat slip gaji, sisa cuti, rekap absensi,
          dan mengajukan lembur. Karyawan tanpa PIN tidak bisa masuk — pasang PIN di halaman
          Karyawan.
        </p>
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
          <code className="flex-1 truncate text-xs text-zinc-600">{portalLink}</code>
          <CopyLinkButton link={portalLink} />
        </div>
      </div>

      <SettingsForm businessId={businessId} settings={settings} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Potongan Telat Bertingkat</h2>
          <p className="mb-3 text-xs text-zinc-400">
            Opsional — atur potongan telat berdasarkan berapa menit terlambat, alih-alih nominal
            flat per kejadian.
          </p>
          <Link
            href={`/business/${businessId}/settings/late-tiers`}
            className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Kelola Tier Potongan Telat
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Tanggal Merah Tambahan</h2>
          <p className="mb-3 text-xs text-zinc-400">
            Tanggal di luar Sabtu/Minggu yang ikut dihitung &ldquo;akhir pekan&rdquo; untuk aturan potongan
            izin akhir pekan.
          </p>
          <Link
            href={`/business/${businessId}/settings/holidays`}
            className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Kelola Tanggal Merah
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Log Aktivitas</h2>
          <p className="mb-3 text-xs text-zinc-400">
            Riwayat aksi sensitif — karyawan dihapus, slip lunas, cuti disetujui/ditolak.
          </p>
          <Link
            href={`/business/${businessId}/activity-log`}
            className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Lihat Log Aktivitas
          </Link>
        </div>
      </div>
    </div>
  );
}
