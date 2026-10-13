"use client";

import { Download } from "lucide-react";
import { btnOutline } from "@/components/form-ui";

export type ReportColumn = {
  label: string;
  money?: boolean;
  align?: "left" | "right";
  tone?: "positive" | "negative";
};
export type ReportCell = string | number | null;

const rp = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;

function csvCell(v: ReportCell) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function ReportTable({
  filename,
  columns,
  rows,
  totals,
}: {
  filename: string;
  columns: ReportColumn[];
  rows: ReportCell[][];
  totals?: ReportCell[];
}) {
  function exportCsv() {
    const lines = [columns.map((c) => csvCell(c.label)).join(","), ...rows.map((r) => r.map(csvCell).join(","))];
    if (totals) lines.push(totals.map(csvCell).join(","));
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const cell = (c: ReportColumn, v: ReportCell) =>
    c.money && typeof v === "number" ? rp(v) : v == null || v === "" ? "—" : v;

  const toneClass = (c: ReportColumn) =>
    c.tone === "negative" ? "text-red-600" : c.tone === "positive" ? "text-emerald-600" : "";

  // Kolom "No." + kolom pertama (biasanya Nama) tetap kelihatan saat tabel
  // di-scroll ke samping — lebar "No." tetap (w-12 = 3rem) jadi offset sticky
  // kolom berikutnya bisa di-hardcode left-12.
  const firstColSticky = "sticky left-12 z-10 min-w-[160px] whitespace-nowrap border-r border-zinc-200";

  return (
    <div>
      <div className="flex justify-end border-b border-zinc-100 p-3">
        <button type="button" onClick={exportCsv} className={btnOutline} disabled={rows.length === 0}>
          <Download size={14} /> Ekspor CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
            <tr>
              <th className="sticky left-0 z-10 w-12 bg-zinc-50 px-5 py-3">No.</th>
              {columns.map((c, j) => (
                <th
                  key={c.label}
                  className={`px-3 py-3 ${c.align === "right" || c.money ? "text-right" : ""} ${j === 0 ? `${firstColSticky} bg-zinc-50` : ""}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="py-14 text-center text-sm text-zinc-400">
                  Belum ada data slip gaji di bulan ini. Buat slip di menu Payroll terlebih dahulu.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="group">
                <td className="sticky left-0 z-10 bg-white px-5 py-2.5 text-zinc-500 group-hover:bg-zinc-50">{i + 1}</td>
                {columns.map((c, j) => (
                  <td
                    key={c.label}
                    className={`px-3 py-2.5 ${c.align === "right" || c.money ? "text-right" : ""} ${
                      j === 0
                        ? `${firstColSticky} bg-white font-medium text-zinc-900 group-hover:bg-zinc-50`
                        : toneClass(c) || "text-zinc-700"
                    }`}
                  >
                    {cell(c, r[j])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {totals && rows.length > 0 && (
            <tfoot className="border-t-2 border-zinc-200 bg-zinc-50 font-semibold text-zinc-900">
              <tr>
                <td className="sticky left-0 z-10 bg-zinc-50 px-5 py-3" />
                {columns.map((c, j) => (
                  <td
                    key={c.label}
                    className={`px-3 py-3 ${c.align === "right" || c.money ? "text-right" : ""} ${j === 0 ? `${firstColSticky} bg-zinc-50` : ""}`}
                  >
                    {j === 0 ? "Total" : cell(c, totals[j])}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
