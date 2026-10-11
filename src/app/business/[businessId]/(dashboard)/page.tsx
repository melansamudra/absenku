import Link from "next/link";
import { Banknote, CalendarCheck, FileText, Megaphone, QrCode, Users, UserCheck, UserMinus, UserRoundX, UsersRound, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadPendingCounts } from "@/lib/dashboard/pending";

function todayWib() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export default async function BusinessOverviewPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const today = todayWib();

  const [{ data: employees }, { data: attendanceToday }, pending] = await Promise.all([
    supabase
      .from("employees")
      .select("id, active")
      .eq("business_id", businessId)
      .is("deleted_at", null),
    supabase
      .from("attendance")
      .select("status")
      .eq("business_id", businessId)
      .eq("date", today),
    loadPendingCounts(supabase, businessId),
  ]);

  const activeCount = (employees ?? []).filter((e) => e.active).length;
  const totalCount = (employees ?? []).length;

  const statusCounts: Record<string, number> = {};
  for (const row of attendanceToday ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }
  const belumAbsen = Math.max(0, activeCount - (attendanceToday?.length ?? 0));

  const pendingItems = [
    { label: "Cuti", count: pending.cuti, href: "leave-requests" },
    { label: "Lembur", count: pending.lembur, href: "overtime" },
    { label: "Reimbursement", count: pending.reimbursements, href: "reimbursements" },
  ];
  const pendingTotal = pendingItems.reduce((sum, i) => sum + i.count, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Beranda</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Absensi hari ini, {today}</p>
      </div>

      <div
        className={`mb-6 rounded-xl border p-4 shadow-sm ${
          pendingTotal > 0 ? "border-amber-200 bg-amber-50" : "border-zinc-100 bg-white"
        }`}
      >
        <h2 className="text-sm font-semibold text-zinc-800">
          Menunggu persetujuan{pendingTotal > 0 ? ` (${pendingTotal})` : ""}
        </h2>
        {pendingTotal === 0 ? (
          <p className="mt-1 text-xs text-zinc-500">Tidak ada pengajuan yang menunggu. Semua sudah diproses.</p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {pendingItems.map((i) => (
              <Link
                key={i.href}
                href={`/business/${businessId}/${i.href}`}
                className={`rounded-lg border px-3 py-2 text-center ${
                  i.count > 0
                    ? "border-amber-300 bg-white hover:bg-amber-100"
                    : "border-transparent bg-white/60 text-zinc-400"
                }`}
              >
                <p className={`text-xl font-bold ${i.count > 0 ? "text-amber-700" : "text-zinc-300"}`}>{i.count}</p>
                <p className="text-[11px] font-medium text-zinc-600">{i.label}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={UsersRound} tone="indigo" label="Karyawan Aktif" value={activeCount} note={`dari ${totalCount} total`} />
        <Stat icon={UserCheck} tone="emerald" label="Hadir" value={statusCounts.hadir ?? 0} />
        <Stat icon={UserMinus} tone="amber" label="Izin/Sakit" value={(statusCounts.izin ?? 0) + (statusCounts.sakit ?? 0)} />
        <Stat icon={UserRoundX} tone="zinc" label="Belum Absen" value={belumAbsen} />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-zinc-800">Akses Cepat</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Shortcut href={`/business/${businessId}/employees`} icon={Users} title="Karyawan" desc="Data karyawan & tarif gaji" />
        <Shortcut href={`/business/${businessId}/attendance`} icon={CalendarCheck} title="Absensi" desc="Tandai kehadiran atau cek rekap" />
        <Shortcut href={`/business/${businessId}/payroll`} icon={Banknote} title="Payroll" desc="Buat & kelola slip gaji" />
        <Shortcut href={`/business/${businessId}/payroll/laporan`} icon={FileText} title="Laporan Gaji" desc="Total transfer & rekening per bulan" />
        <Shortcut href={`/business/${businessId}/announcements`} icon={Megaphone} title="Papan Informasi" desc="Pengumuman untuk karyawan" />
        <Shortcut href={`/business/${businessId}/settings`} icon={QrCode} title="Link Absen Selfie" desc="Bagikan link/poster QR ke karyawan" />
      </div>
    </div>
  );
}

const TONES = {
  indigo: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  zinc: "bg-zinc-100 text-zinc-600",
} as const;

function Stat({ icon: Icon, tone, label, value, note }: { icon: LucideIcon; tone: keyof typeof TONES; label: string; value: number; note?: string }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONES[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
      {note && <p className="mt-0.5 text-xs text-zinc-400">{note}</p>}
    </div>
  );
}

function Shortcut({ href, icon: Icon, title, desc }: { href: string; icon: LucideIcon; title: string; desc: string }) {
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/40">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-zinc-900">{title}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{desc}</span>
      </span>
    </Link>
  );
}
