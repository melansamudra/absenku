import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { loadSalaryEstimates } from "@/lib/payroll/estimate";
import { Card, PageHeader } from "@/components/form-ui";
import ReportTable, { type ReportCell, type ReportColumn } from "../report-table";

const TITLES: Record<string, { title: string; desc: string }> = {
  salary: { title: "Ringkasan Gaji", desc: "Rincian gaji, tunjangan, dan potongan per karyawan." },
  "salary-org": { title: "Ringkasan Gaji per Organisasi", desc: "Total gaji dikelompokkan per organisasi." },
  "salary-component": { title: "Ringkasan Gaji per Komponen", desc: "Total tiap komponen gaji dan jumlah karyawan yang menerimanya." },
  tax: { title: "Pajak Bulanan Pegawai", desc: "PPh 21 yang dipotong per karyawan (aktifkan PPh 21 di Pengaturan Umum)." },
  bpjs: { title: "Iuran BPJS", desc: "Iuran BPJS karyawan dan perusahaan per karyawan (aktifkan BPJS di Pengaturan Umum)." },
};

function currentMonth() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).slice(0, 7);
}
function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}
function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
}
function lastDay(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

const sum = (rows: ReportCell[][], idx: number) => rows.reduce((t, r) => t + (typeof r[idx] === "number" ? (r[idx] as number) : 0), 0);

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string; type: string }>;
  searchParams: Promise<{ month?: string; mode?: string; asof?: string }>;
}) {
  const { businessId, type } = await params;
  const meta = TITLES[type];
  if (!meta) notFound();

  const sp = await searchParams;
  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : currentMonth();
  const base = `/business/${businessId}/report/${type}`;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  // `asof` hanya untuk meninjau "gaji berjalan" pada tanggal lain (mis. uji coba); bawaannya hari ini.
  const asOf = sp.asof && /^\d{4}-\d{2}-\d{2}$/.test(sp.asof) ? sp.asof : today;
  const projection = sp.mode === "proyeksi";

  const supabase = await createClient();
  const { data } = await supabase
    .from("payslips")
    .select(
      "id, employee_id, base_pay, meal_allowance, attendance_allowance, lembur_amount, thr_amount, izin_deduction, late_deduction, kasbon_deduction, personal_loan_deduction, pph21_amount, bpjs_employee_amount, bpjs_employer_amount, ptkp_status, employees(name, employee_code, npwp, organizations(name)), payslip_adjustments(type, amount)",
    )
    .eq("business_id", businessId)
    .gte("period_start", `${month}-01`)
    .lte("period_start", lastDay(month))
    .order("created_at", { ascending: true });

  const slips = (data ?? []).map((p) => {
    const adj = ((p.payslip_adjustments ?? []) as { type: "tunjangan" | "potongan"; amount: number }[]).map((a) => ({
      type: a.type,
      amount: Number(a.amount),
    }));
    const tunj = adj.filter((a) => a.type === "tunjangan").reduce((t, a) => t + a.amount, 0);
    const pot = adj.filter((a) => a.type === "potongan").reduce((t, a) => t + a.amount, 0);
    return {
      p,
      name: p.employees?.name ?? "—",
      code: p.employees?.employee_code ?? null,
      npwp: p.employees?.npwp ?? null,
      org: p.employees?.organizations?.name ?? "Tanpa organisasi",
      tunj,
      pot,
      net: payslipTotal(p, adj),
    };
  });

  let columns: ReportColumn[] = [];
  let rows: ReportCell[][] = [];

  // Estimasi untuk karyawan yang slipnya belum dibuat (hanya Ringkasan Gaji).
  let estimates: Awaited<ReturnType<typeof loadSalaryEstimates>> | null = null;
  if (type === "salary") {
    estimates = await loadSalaryEstimates(supabase, businessId, month, asOf, new Set(slips.map((s) => s.p.employee_id)));
  }
  const estRows = estimates?.rows ?? [];
  const showToggle = estRows.length > 0 && (estimates?.remainingDays ?? 0) > 0;
  const useProjection = showToggle && projection;
  const estLine = (r: (typeof estRows)[number]) => (useProjection ? r.projected : r.running);

  if (type === "salary") {
    columns = [
      { label: "Nama" },
      { label: "ID Karyawan" },
      { label: "Gaji Pokok", money: true },
      { label: "Uang Makan", money: true },
      { label: "Tunj. Hadir", money: true },
      { label: "Lembur", money: true, tone: "positive" },
      { label: "THR", money: true, tone: "positive" },
      { label: "Tunjangan Lain", money: true, tone: "positive" },
      { label: "Potongan", money: true, tone: "negative" },
      { label: "PPh 21", money: true, tone: "negative" },
      { label: "BPJS", money: true, tone: "negative" },
      { label: "Gaji Bersih", money: true },
      ...(estRows.length > 0 ? [{ label: "Status" } as ReportColumn] : []),
    ];
    rows = slips.map((s) => [
      s.name,
      s.code,
      s.p.base_pay,
      s.p.meal_allowance,
      s.p.attendance_allowance,
      s.p.lembur_amount,
      s.p.thr_amount,
      s.tunj,
      s.p.izin_deduction + s.p.late_deduction + s.p.kasbon_deduction + s.p.personal_loan_deduction + s.pot,
      s.p.pph21_amount,
      s.p.bpjs_employee_amount,
      s.net,
      ...(estRows.length > 0 ? ["Slip"] : []),
    ]);
    for (const r of estRows) {
      const l = estLine(r);
      rows.push([r.name, r.code, l.basePay, l.meal, l.attendance, l.lembur, 0, l.tunjanganLain, l.potongan, l.pph21, l.bpjs, l.net, "Estimasi"]);
    }
  } else if (type === "salary-org") {
    columns = [
      { label: "Organisasi" },
      { label: "Jumlah Karyawan", align: "right" },
      { label: "Pendapatan", money: true },
      { label: "Potongan", money: true },
      { label: "Gaji Bersih", money: true },
    ];
    const groups = new Map<string, { n: number; gross: number; ded: number; net: number }>();
    for (const s of slips) {
      const g = groups.get(s.org) ?? { n: 0, gross: 0, ded: 0, net: 0 };
      const gross = s.p.base_pay + s.p.meal_allowance + s.p.attendance_allowance + s.p.lembur_amount + s.p.thr_amount + s.tunj;
      g.n += 1;
      g.gross += gross;
      g.ded += gross - s.net;
      g.net += s.net;
      groups.set(s.org, g);
    }
    rows = [...groups.entries()].sort((a, b) => b[1].net - a[1].net).map(([org, g]) => [org, g.n, g.gross, g.ded, g.net]);
  } else if (type === "salary-component") {
    columns = [
      { label: "Komponen" },
      { label: "Jenis" },
      { label: "Jumlah Karyawan", align: "right" },
      { label: "Total", money: true },
    ];
    const comp: [string, string, (s: (typeof slips)[number]) => number][] = [
      ["Gaji Pokok", "Pendapatan", (s) => s.p.base_pay],
      ["Uang Makan", "Pendapatan", (s) => s.p.meal_allowance],
      ["Tunjangan Hadir", "Pendapatan", (s) => s.p.attendance_allowance],
      ["Lembur", "Pendapatan", (s) => s.p.lembur_amount],
      ["THR", "Pendapatan", (s) => s.p.thr_amount],
      ["Tunjangan Lain", "Pendapatan", (s) => s.tunj],
      ["Potongan Izin", "Potongan", (s) => s.p.izin_deduction],
      ["Potongan Terlambat", "Potongan", (s) => s.p.late_deduction],
      ["Kasbon", "Potongan", (s) => s.p.kasbon_deduction],
      ["Pinjaman Pribadi", "Potongan", (s) => s.p.personal_loan_deduction],
      ["PPh 21", "Potongan", (s) => s.p.pph21_amount],
      ["BPJS Karyawan", "Potongan", (s) => s.p.bpjs_employee_amount],
      ["Potongan Lain", "Potongan", (s) => s.pot],
    ];
    rows = comp
      .map(([label, kind, get]) => {
        const vals = slips.map(get);
        return [label, kind, vals.filter((v) => v > 0).length, vals.reduce((t, v) => t + v, 0)] as ReportCell[];
      })
      .filter((r) => (r[3] as number) > 0);
  } else if (type === "tax") {
    columns = [
      { label: "Nama" },
      { label: "ID Karyawan" },
      { label: "NPWP" },
      { label: "Status PTKP" },
      { label: "Penghasilan Bruto", money: true },
      { label: "PPh 21 Dipotong", money: true, tone: "negative" },
    ];
    rows = slips
      .filter((s) => s.p.pph21_amount > 0 || s.p.ptkp_status)
      .map((s) => [
        s.name,
        s.code,
        s.npwp,
        s.p.ptkp_status,
        s.p.base_pay + s.p.meal_allowance + s.p.attendance_allowance + s.p.lembur_amount + s.p.thr_amount + s.tunj,
        s.p.pph21_amount,
      ]);
  } else {
    columns = [
      { label: "Nama" },
      { label: "ID Karyawan" },
      { label: "Iuran Karyawan", money: true },
      { label: "Iuran Perusahaan", money: true },
      { label: "Total Iuran", money: true },
    ];
    rows = slips
      .filter((s) => s.p.bpjs_employee_amount > 0 || (s.p.bpjs_employer_amount ?? 0) > 0)
      .map((s) => [s.name, s.code, s.p.bpjs_employee_amount, s.p.bpjs_employer_amount ?? 0, s.p.bpjs_employee_amount + (s.p.bpjs_employer_amount ?? 0)]);
  }

  // Kolom "ID Karyawan" cuma kepake kalau kode karyawan beneran diisi —
  // kalau kosong semua (mis. data demo), sembunyikan daripada munculin "—" sebaris penuh.
  const codeIdx = columns.findIndex((c) => c.label === "ID Karyawan");
  if (codeIdx !== -1 && !rows.some((r) => r[codeIdx] != null && r[codeIdx] !== "")) {
    columns = columns.filter((_, j) => j !== codeIdx);
    rows = rows.map((r) => r.filter((_, j) => j !== codeIdx));
  }

  // Total hanya untuk kolom nominal / jumlah.
  const totals: ReportCell[] = columns.map((c, j) => (j === 0 ? "Total" : c.money || (type === "salary-org" && j === 1) ? sum(rows, j) : null));

  return (
    <div>
      <Link href={`/business/${businessId}/report`} className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700">
        <ChevronLeft size={14} /> Laporan
      </Link>
      <PageHeader
        title={meta.title}
        subtitle={meta.desc}
        actions={
          <div className="flex items-center gap-1.5">
            <Link href={`${base}?month=${shiftMonth(month, -1)}`} className="rounded-lg border border-zinc-200 bg-white p-2 hover:bg-zinc-50" aria-label="Bulan sebelumnya">
              <ChevronLeft size={15} />
            </Link>
            <span className="min-w-36 rounded-lg bg-white px-3 py-2 text-center text-[14px] font-semibold shadow-sm">{monthLabel(month)}</span>
            <Link href={`${base}?month=${shiftMonth(month, 1)}`} className="rounded-lg border border-zinc-200 bg-white p-2 hover:bg-zinc-50" aria-label="Bulan berikutnya">
              <ChevronRight size={15} />
            </Link>
          </div>
        }
      />
      {estimates && estRows.length > 0 && (() => {
        const slipNet = slips.reduce((t, s) => t + s.net, 0);
        const runTotal = estRows.reduce((t, r) => t + r.running.net, 0);
        const projTotal = estRows.reduce((t, r) => t + r.projected.net, 0);
        const rp = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;
        const tab = (active: boolean) =>
          `rounded-lg px-3.5 py-1.5 text-[14px] font-semibold ${active ? "bg-brand-600 text-white" : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200"}`;
        const keep = sp.asof ? `&asof=${sp.asof}` : "";
        const asOfLabel = new Date(`${asOf > lastDay(month) ? lastDay(month) : asOf}T00:00:00Z`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
        return (
          <div className="mb-4 space-y-3 print:hidden">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                <p className="text-xs text-zinc-500">Estimasi sampai {asOfLabel}</p>
                <p className="mt-1 text-xl font-bold text-zinc-900">{rp(runTotal)}</p>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                <p className="text-xs text-zinc-500">Proyeksi akhir bulan</p>
                <p className="mt-1 text-xl font-bold text-zinc-900">{showToggle ? rp(projTotal) : "—"}</p>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                <p className="text-xs text-zinc-500">Sudah final (slip dibuat)</p>
                <p className="mt-1 text-xl font-bold text-zinc-900">{rp(slipNet)}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {showToggle && (
                <>
                  <Link href={`${base}?month=${month}${keep}`} className={tab(!useProjection)}>
                    Sampai hari ini
                  </Link>
                  <Link href={`${base}?month=${month}&mode=proyeksi${keep}`} className={tab(useProjection)}>
                    Proyeksi akhir bulan
                  </Link>
                </>
              )}
              <p className="text-[13px] text-zinc-500">
                {useProjection
                  ? "Proyeksi: sisa hari kerja dianggap hadir normal, tanpa telat, izin, atau lembur."
                  : `Estimasi gaji berjalan per ${asOfLabel}: hanya absensi yang sudah tercatat. Belum final.`}{" "}
                Baris berstatus Estimasi belum termasuk kasbon dan reimbursement.
              </p>
            </div>
          </div>
        );
      })()}
      <Card className="!p-0">
        <ReportTable filename={`${type}-${month}`} columns={columns} rows={rows} totals={totals} />
      </Card>
    </div>
  );
}
