import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, btnOutline, btnPrimary } from "@/components/form-ui";
import { employmentLabel } from "@/lib/employee/constants";
import SalaryAdjustModal from "./salary-adjust-modal";

const TABS = [
  { key: "personal", label: "Personal" },
  { key: "kepegawaian", label: "Kepegawaian" },
  { key: "karir", label: "Karir" },
  { key: "payroll", label: "Payroll" },
  { key: "riwayat-gaji", label: "Riwayat Gaji" },
] as const;

function fmtDate(v: string | null) {
  if (!v) return null;
  return new Date(`${v}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
const rp = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-zinc-900">{value || <span className="text-zinc-300">—</span>}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mb-4">
      <h3 className="mb-4 text-sm font-bold text-zinc-900">{title}</h3>
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string; employeeId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { businessId, employeeId } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = TABS.some((t) => t.key === tabParam) ? tabParam! : "personal";

  const supabase = await createClient();
  const { data: e } = await supabase
    .from("employees")
    .select("*, organizations(name), positions(name), ranks(name)")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!e) notFound();

  // Foto di bucket privat → signed URL sementara (1 jam), seperti di daftar karyawan.
  let photoUrl: string | null = null;
  if (e.photo_path) {
    const { data: signed } = await supabase.storage.from("employee-photos").createSignedUrl(e.photo_path, 60 * 60);
    photoUrl = signed?.signedUrl ?? null;
  }

  const [{ data: careerRows }, { data: salaryRows }] = await Promise.all([
    tab === "karir"
      ? supabase
          .from("career_history")
          .select("id, effective_date, employment_status, placement_type, organization_name, position_name, rank_name")
          .eq("employee_id", employeeId)
          .eq("business_id", businessId)
          .order("effective_date", { ascending: false })
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
    tab === "riwayat-gaji"
      ? supabase
          .from("salary_history")
          .select("id, effective_date, salary_type, daily_rate, monthly_rate, daily_meal_allowance, daily_attendance_allowance, note")
          .eq("employee_id", employeeId)
          .eq("business_id", businessId)
          .order("effective_date", { ascending: false })
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  const base = `/business/${businessId}/employees`;
  const initials = e.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  const jabatan = e.positions?.name ?? e.note;

  const domicile = e.domicile_same
    ? "Sama dengan alamat kartu identitas"
    : [e.dom_address, e.dom_city, e.dom_province].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={e.name}
        actions={
          <>
            <Link href={base} className={btnOutline}>
              Kembali
            </Link>
            {e.setup_complete ? (
              <Link href={`${base}/${e.id}/setup/1`} className={btnPrimary}>
                <Pencil size={14} /> Ubah Data
              </Link>
            ) : (
              <Link href={`${base}/${e.id}/setup/1`} className={btnPrimary}>
                Lengkapi Data
              </Link>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit text-center">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL sementara dari bucket privat
            <img src={photoUrl} alt={`Foto ${e.name}`} className="mx-auto h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
              {initials || "?"}
            </div>
          )}
          <p className="mt-3 text-sm font-semibold text-zinc-900">{jabatan ?? "Belum ada jabatan"}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{e.employee_code ?? "—"}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                e.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {e.active ? "Aktif" : "Nonaktif"}
            </span>
            {!e.setup_complete && (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                Belum lengkap
              </span>
            )}
          </div>
        </Card>

        <div>
          <div className="mb-4 flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={`${base}/${e.id}?tab=${t.key}`}
                className={`shrink-0 rounded-lg border px-4 py-1.5 text-[13px] ${
                  tab === t.key
                    ? "border-brand-500 bg-white font-semibold text-brand-700"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {tab === "personal" && (
            <>
              <Section title="Data Pribadi">
                <Item label="ID Karyawan" value={e.employee_code} />
                <Item label="Jenis Kelamin" value={e.gender === "P" ? "Perempuan" : e.gender === "L" ? "Laki-laki" : null} />
                <Item label="Tempat, Tgl Lahir" value={[e.birth_place, fmtDate(e.birth_date)].filter(Boolean).join(", ")} />
                <Item label="Status Perkawinan" value={e.marital_status} />
                <Item label="Agama" value={e.religion} />
                <Item label="Golongan Darah" value={e.blood_type} />
                <Item label="Status Warga Negara" value={e.citizenship === "WNA" ? `WNA (${e.citizenship_country ?? "-"})` : "WNI (Indonesia)"} />
                <Item label={`Identitas (${e.id_type})`} value={e.nik ?? e.id_number} />
                <Item label="No. Kartu Keluarga" value={e.family_card_number} />
              </Section>
              <Section title="Kontak & Alamat">
                <Item label="Email" value={e.email} />
                <Item label="Nomor Ponsel" value={e.phone} />
                <Item label="Nomor Telepon" value={e.phone_alt} />
                <Item label="Kontak Darurat" value={[e.emergency_name, e.emergency_phone && `(${e.emergency_phone})`].filter(Boolean).join(" ")} />
                <Item label="Alamat Kartu Identitas" value={[e.id_address, e.id_city, e.id_province].filter(Boolean).join(", ")} />
                <Item label="Alamat Domisili" value={domicile} />
              </Section>
              <Section title="Pendidikan Terakhir">
                <Item label="Jenjang Akademik" value={e.edu_level} />
                <Item label="Lembaga Pendidikan" value={[e.edu_institution, e.edu_major && `(${e.edu_major})`].filter(Boolean).join(" ")} />
              </Section>
            </>
          )}

          {tab === "kepegawaian" && (
            <Section title="Kepegawaian">
              <Item label="Status Karyawan" value={employmentLabel(e.employment_status)} />
              <Item label="Tanggal Bergabung" value={fmtDate(e.join_date)} />
              <Item label="Penempatan Kerja" value={e.placement_type} />
              <Item label="Organisasi" value={e.organizations?.name} />
              <Item label="Jabatan" value={e.positions?.name} />
              <Item label="Pangkat" value={e.ranks?.name} />
              <Item label="Golongan" value={e.grade} />
              <Item label="Masa Akhir Kerja" value={fmtDate(e.contract_end)} />
            </Section>
          )}

          {tab === "karir" && (
            <Card className="!p-0">
              <h3 className="border-b border-zinc-100 px-5 py-4 text-sm font-bold text-zinc-900">Riwayat Karir</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[13px]">
                  <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
                    <tr>
                      <th className="px-5 py-3">Tanggal Efektif</th>
                      <th className="px-3 py-3">Penempatan</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Organisasi</th>
                      <th className="px-3 py-3">Jabatan</th>
                      <th className="px-3 py-3">Pangkat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {(careerRows ?? []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-zinc-400">
                          Belum ada riwayat karir. Tercatat otomatis saat data Kepegawaian disimpan.
                        </td>
                      </tr>
                    )}
                    {(careerRows ?? []).map((c) => (
                      <tr key={c.id}>
                        <td className="px-5 py-3 text-zinc-700">{fmtDate(c.effective_date)}</td>
                        <td className="px-3 py-3 text-zinc-700">{c.placement_type ?? "—"}</td>
                        <td className="px-3 py-3 text-zinc-700">{employmentLabel(c.employment_status)}</td>
                        <td className="px-3 py-3 text-zinc-700">{c.organization_name ?? "—"}</td>
                        <td className="px-3 py-3 text-zinc-700">{c.position_name ?? "—"}</td>
                        <td className="px-3 py-3 text-zinc-700">{c.rank_name ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "riwayat-gaji" && (
            <Card className="!p-0">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <h3 className="text-sm font-bold text-zinc-900">Riwayat Gaji</h3>
                <SalaryAdjustModal
                  businessId={businessId}
                  employeeId={e.id}
                  current={{
                    salary_type: e.salary_type === "harian" ? "harian" : "bulanan",
                    daily_rate: e.daily_rate,
                    monthly_rate: e.monthly_rate,
                    daily_meal_allowance: e.daily_meal_allowance,
                    daily_attendance_allowance: e.daily_attendance_allowance,
                  }}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[13px]">
                  <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
                    <tr>
                      <th className="px-5 py-3">Tanggal Efektif</th>
                      <th className="px-3 py-3">Tipe</th>
                      <th className="px-3 py-3 text-right">Gaji</th>
                      <th className="px-3 py-3 text-right">Uang Makan</th>
                      <th className="px-3 py-3 text-right">Tunj. Hadir</th>
                      <th className="px-5 py-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {(salaryRows ?? []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-zinc-400">
                          Belum ada riwayat gaji. Tercatat otomatis saat gaji disimpan atau disesuaikan.
                        </td>
                      </tr>
                    )}
                    {(salaryRows ?? []).map((s) => (
                      <tr key={s.id}>
                        <td className="px-5 py-3 text-zinc-700">{fmtDate(s.effective_date)}</td>
                        <td className="px-3 py-3 text-zinc-700">{s.salary_type === "harian" ? "Harian" : "Bulanan"}</td>
                        <td className="px-3 py-3 text-right font-semibold text-zinc-900">
                          {rp(s.salary_type === "harian" ? s.daily_rate : s.monthly_rate)}
                        </td>
                        <td className="px-3 py-3 text-right text-zinc-700">{rp(s.daily_meal_allowance)}</td>
                        <td className="px-3 py-3 text-right text-zinc-700">{rp(s.daily_attendance_allowance)}</td>
                        <td className="px-5 py-3 text-zinc-500">{s.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "payroll" && (
            <>
              <Section title="Gaji & Tunjangan">
                <Item label="Tipe Gaji" value={e.salary_type === "harian" ? "Harian" : "Bulanan"} />
                <Item
                  label={e.salary_type === "harian" ? "Gaji per Hari" : "Gaji Pokok per Bulan"}
                  value={rp(e.salary_type === "harian" ? e.daily_rate : e.monthly_rate)}
                />
                <Item label="Uang Makan / hari hadir" value={rp(e.daily_meal_allowance)} />
                <Item label="Tunjangan Hadir / hari" value={rp(e.daily_attendance_allowance)} />
                <Item label="Tarif Lembur / jam" value={e.lembur_rate_per_hour != null ? rp(e.lembur_rate_per_hour) : "Default bisnis"} />
                <Item label="Status PTKP" value={e.ptkp_status} />
              </Section>
              <Section title="NPWP & BPJS">
                <Item label="NPWP" value={e.npwp} />
                <Item label="BPJS Ketenagakerjaan" value={[e.bpjs_tk_number, fmtDate(e.bpjs_tk_effective) && `(efektif ${fmtDate(e.bpjs_tk_effective)})`].filter(Boolean).join(" ")} />
                <Item label="BPJS Kesehatan" value={[e.bpjs_kes_number, fmtDate(e.bpjs_kes_effective) && `(efektif ${fmtDate(e.bpjs_kes_effective)})`].filter(Boolean).join(" ")} />
                <Item label="Anggota Keluarga BPJS Kesehatan" value={e.bpjs_family_count} />
                <Item label="Potongan BPJS di Slip" value={[e.bpjs_kesehatan && "Kesehatan", e.bpjs_ketenagakerjaan && "Ketenagakerjaan"].filter(Boolean).join(", ") || "Tidak ada"} />
                <Item label="Dasar Upah BPJS" value={e.bpjs_wage_base != null ? rp(e.bpjs_wage_base) : "Gaji pokok"} />
              </Section>
              <Section title="Rekening & Absen">
                <Item label="Bank" value={e.bank_name} />
                <Item label="Nomor Rekening" value={e.bank_account_number} />
                <Item label="Nama Pemilik Rekening" value={e.bank_account_name} />
                <Item label="PIN Absen" value={e.attendance_pin_hash ? "Sudah diatur" : "Belum diatur"} />
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
