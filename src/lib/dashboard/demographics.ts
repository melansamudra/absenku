// Distribusi demografi karyawan untuk widget Beranda (mengikuti dashboard GajiHub).

export type DemographicEmployee = {
  birth_date: string | null;
  gender: string | null;
  marital_status: string | null;
  religion: string | null;
  edu_level: string | null;
  join_date: string | null;
  employment_status: string | null;
  organizations: { name: string } | null;
};

export type Slice = { label: string; count: number };

const STATUS_LABEL: Record<string, string> = {
  tetap: "Tetap Permanen",
  percobaan: "Tetap Percobaan",
  pkwt: "PKWT",
  lepas: "Pekerja Lepas",
  tenaga_ahli: "Tenaga Ahli",
  magang: "Magang",
  mitra: "Mitra",
};

function tally(values: (string | null | undefined)[], order?: string[]): Slice[] {
  const m = new Map<string, number>();
  for (const v of values) {
    const k = v && v.trim() ? v : "Belum diisi";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  const rows = [...m.entries()].map(([label, count]) => ({ label, count }));
  if (order) {
    const idx = (l: string) => {
      const i = order.indexOf(l);
      return i === -1 ? order.length : i;
    };
    return rows.sort((a, b) => idx(a.label) - idx(b.label) || b.count - a.count);
  }
  return rows.sort((a, b) => b.count - a.count);
}

function yearsBetween(from: string, to: Date) {
  const d = new Date(`${from}T00:00:00Z`);
  let y = to.getUTCFullYear() - d.getUTCFullYear();
  const beforeAnniversary =
    to.getUTCMonth() < d.getUTCMonth() || (to.getUTCMonth() === d.getUTCMonth() && to.getUTCDate() < d.getUTCDate());
  if (beforeAnniversary) y -= 1;
  return y;
}

export function computeDemographics(list: DemographicEmployee[], now = new Date()) {
  const ageBucket = (birth: string | null) => {
    if (!birth) return null;
    const a = yearsBetween(birth, now);
    if (a <= 25) return "≤ 25";
    if (a <= 30) return "26-30";
    if (a <= 35) return "31-35";
    if (a <= 40) return "36-40";
    if (a <= 50) return "41-50";
    return "> 50";
  };
  const tenureBucket = (join: string | null) => {
    if (!join) return null;
    const y = yearsBetween(join, now);
    if (y < 1) return "< 1 tahun";
    if (y < 3) return "1-3 tahun";
    if (y < 5) return "3-5 tahun";
    return "> 5 tahun";
  };

  return {
    usia: tally(list.map((e) => ageBucket(e.birth_date)), ["≤ 25", "26-30", "31-35", "36-40", "41-50", "> 50"]),
    pendidikan: tally(list.map((e) => e.edu_level)),
    statusPerkawinan: tally(list.map((e) => e.marital_status)),
    lamaKerja: tally(list.map((e) => tenureBucket(e.join_date)), ["< 1 tahun", "1-3 tahun", "3-5 tahun", "> 5 tahun"]),
    agama: tally(list.map((e) => e.religion)),
    jenisKelamin: tally(list.map((e) => (e.gender === "P" ? "Perempuan" : e.gender === "L" ? "Laki-laki" : null))),
    organisasi: tally(list.map((e) => e.organizations?.name ?? "Tanpa organisasi")),
    statusKaryawan: tally(list.map((e) => (e.employment_status ? (STATUS_LABEL[e.employment_status] ?? e.employment_status) : "Tetap Permanen"))),
  };
}
