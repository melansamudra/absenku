// Hari kerja terjadwal dalam sebuah periode gaji — pure function.
//
// Dipakai untuk membagi gaji bulanan: gaji harian setara = gaji bulanan ÷ jumlah
// hari kerja efektif. Hari libur mingguan (Minggu; plus Sabtu kalau kantor 5 hari
// kerja) dan tanggal merah perusahaan BUKAN hari kerja, jadi tidak perlu ditandai
// "off" satu per satu di absensi. Kalau dulu dibagi jumlah hari kalender, karyawan
// bulanan yang hadir penuh Senin–Sabtu hanya menerima ±86% gajinya.

function parts(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { y, m, d };
}

/** Himpunan tanggal (YYYY-MM-DD) hari kerja terjadwal dari `start` s/d `end` (inklusif). */
export function scheduledWorkdays(
  start: string,
  end: string,
  workDaysPerWeek: 5 | 6,
  holidays: Set<string> = new Set(),
): Set<string> {
  const s = parts(start);
  const e = parts(end);
  const days = new Set<string>();
  const cur = new Date(Date.UTC(s.y, s.m - 1, s.d));
  const last = Date.UTC(e.y, e.m - 1, e.d);
  while (cur.getTime() <= last) {
    const dow = cur.getUTCDay(); // 0 = Minggu, 6 = Sabtu
    const restDay = dow === 0 || (workDaysPerWeek === 5 && dow === 6);
    const iso = cur.toISOString().slice(0, 10);
    if (!restDay && !holidays.has(iso)) days.add(iso);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}
