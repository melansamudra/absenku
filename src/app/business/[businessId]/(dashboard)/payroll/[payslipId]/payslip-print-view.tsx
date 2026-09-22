function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export type PrintRow = { label: string; value: number };

// Disembunyikan di layar (hidden), cuma muncul saat print (print:block) —
// dashboard-shell.tsx (sidebar/nav) dan sisa isi halaman ini disembunyikan
// balik lewat print:hidden, jadi window.print() cuma mencetak bagian ini.
export default function PayslipPrintView({
  businessName,
  employeeName,
  periodStart,
  periodEnd,
  rows,
  adjustments,
  total,
  isPaid,
}: {
  businessName: string;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  rows: PrintRow[];
  adjustments: { type: "tunjangan" | "potongan"; label: string; amount: number }[];
  total: number;
  isPaid: boolean;
}) {
  return (
    <div className="hidden print:block">
      <div className="mb-6 flex items-start justify-between border-b border-zinc-300 pb-4">
        <div>
          <h1 className="text-lg font-bold text-zinc-900">{businessName}</h1>
          <p className="text-sm text-zinc-500">Slip Gaji Karyawan</p>
        </div>
        <p className="text-sm text-zinc-500">
          {isPaid ? "LUNAS" : "BELUM DIBAYAR"}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-zinc-500">Nama Karyawan</span>
          <p className="font-semibold text-zinc-900">{employeeName}</p>
        </div>
        <div>
          <span className="text-zinc-500">Periode</span>
          <p className="font-semibold text-zinc-900">
            {periodStart} — {periodEnd}
          </p>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-zinc-200">
              <td className="py-1.5 text-zinc-600">{r.label}</td>
              <td className="py-1.5 text-right text-zinc-900">
                {r.value < 0 ? "-" : ""}
                {fmtRupiah(Math.abs(r.value))}
              </td>
            </tr>
          ))}
          {adjustments.map((a, i) => (
            <tr key={i} className="border-b border-zinc-200">
              <td className="py-1.5 text-zinc-600">
                {a.label} ({a.type})
              </td>
              <td className="py-1.5 text-right text-zinc-900">
                {a.type === "potongan" ? "-" : ""}
                {fmtRupiah(a.amount)}
              </td>
            </tr>
          ))}
          <tr>
            <td className="pt-3 text-base font-bold text-zinc-900">Total Diterima</td>
            <td className="pt-3 text-right text-base font-bold text-zinc-900">
              {fmtRupiah(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-16 grid grid-cols-2 gap-8 text-center text-sm">
        <div>
          <p className="mb-16 text-zinc-500">Karyawan</p>
          <p className="border-t border-zinc-400 pt-1">{employeeName}</p>
        </div>
        <div>
          <p className="mb-16 text-zinc-500">Admin/Pemilik</p>
          <p className="border-t border-zinc-400 pt-1">{businessName}</p>
        </div>
      </div>
    </div>
  );
}
