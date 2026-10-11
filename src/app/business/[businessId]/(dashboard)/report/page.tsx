import Link from "next/link";
import { Banknote, BarChart3, FileText, HeartPulse, Landmark, Layers, ListTree, Users, type LucideIcon } from "lucide-react";
import { Card, PageHeader } from "@/components/form-ui";

type Item = { title: string; desc: string; href: string; icon: LucideIcon };

const GROUPS: { name: string; items: Item[] }[] = [
  {
    name: "Payroll",
    items: [
      { title: "Ringkasan Gaji", desc: "Rincian gaji, tunjangan, dan potongan per karyawan", href: "report/salary", icon: Banknote },
      { title: "Ringkasan Gaji per Organisasi", desc: "Total gaji dikelompokkan per organisasi", href: "report/salary-org", icon: Layers },
      { title: "Ringkasan Gaji per Komponen", desc: "Total tiap komponen gaji dan jumlah karyawan", href: "report/salary-component", icon: ListTree },
      { title: "Pembayaran Gaji", desc: "Total transfer dan rekening per bulan", href: "payroll/laporan", icon: FileText },
    ],
  },
  {
    name: "PPh 21",
    items: [{ title: "Pajak Bulanan Pegawai", desc: "PPh 21 yang dipotong per karyawan", href: "report/tax", icon: Landmark }],
  },
  {
    name: "BPJS",
    items: [{ title: "Iuran BPJS", desc: "Iuran karyawan dan perusahaan per karyawan", href: "report/bpjs", icon: HeartPulse }],
  },
  {
    name: "Kehadiran & Karyawan",
    items: [
      { title: "Rekap Presensi", desc: "Rekap kehadiran bulanan per karyawan", href: "attendance/rekap", icon: BarChart3 },
      { title: "Daftar Karyawan", desc: "Data karyawan lengkap — gunakan tombol Ekspor", href: "employees", icon: Users },
    ],
  },
];

export default async function ReportHubPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const base = `/business/${businessId}`;

  return (
    <div>
      <PageHeader title="Laporan" subtitle="Pilih laporan yang ingin dilihat atau diekspor." />
      <div className="space-y-4">
        {GROUPS.map((g) => (
          <Card key={g.name}>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{g.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.items.map((i) => (
                <Link
                  key={i.href}
                  href={`${base}/${i.href}`}
                  className="group flex items-start gap-3 rounded-xl border border-zinc-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100">
                    <i.icon size={19} />
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-zinc-900">{i.title}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{i.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
