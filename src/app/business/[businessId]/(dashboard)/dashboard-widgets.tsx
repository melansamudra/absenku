import type { Slice } from "@/lib/dashboard/demographics";

const COLORS = ["bg-brand-600", "bg-brand-400", "bg-amber-400", "bg-emerald-500", "bg-sky-400", "bg-zinc-400", "bg-rose-400"];

/** Kartu distribusi: bar horizontal + persentase (tanpa library chart agar ringan). */
export function DistributionCard({ title, data, empty = "Belum ada data" }: { title: string; data: Slice[]; empty?: string }) {
  const total = data.reduce((t, s) => t + s.count, 0);
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{title}</h3>
      {total === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-400">{empty}</p>
      ) : (
        <>
          <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-zinc-100">
            {data.map((s, i) => (
              <span key={s.label} className={COLORS[i % COLORS.length]} style={{ width: `${(s.count / total) * 100}%` }} title={`${s.label}: ${s.count}`} />
            ))}
          </div>
          <ul className="space-y-1.5">
            {data.slice(0, 6).map((s, i) => (
              <li key={s.label} className="flex items-center gap-2 text-[13px]">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${COLORS[i % COLORS.length]}`} />
                <span className="flex-1 truncate text-zinc-700">{s.label}</span>
                <span className="font-semibold text-zinc-900">{s.count}</span>
                <span className="w-10 text-right text-xs text-zinc-400">{Math.round((s.count / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export type CalendarMarks = {
  holidays: Record<number, string>;
  birthdays: Record<number, string[]>;
  leaves: Record<number, string[]>;
};

const DOW = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

/** Kalender bulan berjalan dengan penanda tanggal merah, ulang tahun, dan cuti karyawan. */
export function MonthCalendar({ year, month, today, marks }: { year: number; month: number; today: number | null; marks: CalendarMarks }) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Senin = 0
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const label = first.toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
  const agenda: { day: number; text: string; tone: string }[] = [];
  for (const [d, t] of Object.entries(marks.holidays)) agenda.push({ day: Number(d), text: t, tone: "text-red-600" });
  for (const [d, names] of Object.entries(marks.birthdays)) agenda.push({ day: Number(d), text: `Ulang tahun ${names.join(", ")}`, tone: "text-brand-700" });
  for (const [d, names] of Object.entries(marks.leaves)) agenda.push({ day: Number(d), text: `Cuti: ${names.join(", ")}`, tone: "text-amber-700" });
  agenda.sort((a, b) => a.day - b.day);

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Kalender</h3>
        <span className="text-[13px] font-semibold text-zinc-800">{label}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DOW.map((d) => (
          <span key={d} className="py-1 text-[10px] font-semibold text-zinc-400">
            {d}
          </span>
        ))}
        {cells.map((c, i) => {
          if (c === null) return <span key={i} />;
          const holiday = marks.holidays[c];
          const sunday = i % 7 === 6;
          const isToday = c === today;
          return (
            <span
              key={i}
              title={holiday}
              className={`relative flex h-9 flex-col items-center justify-center rounded-lg text-[13px] ${
                isToday ? "bg-brand-600 font-bold text-white" : holiday || sunday ? "text-red-500" : "text-zinc-700"
              }`}
            >
              {c}
              <span className="absolute bottom-1 flex gap-0.5">
                {marks.birthdays[c] && <i className="h-1 w-1 rounded-full bg-brand-500" />}
                {marks.leaves[c] && <i className="h-1 w-1 rounded-full bg-amber-500" />}
                {holiday && !isToday && <i className="h-1 w-1 rounded-full bg-red-500" />}
              </span>
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-red-500" /> Libur</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-brand-500" /> Ulang tahun</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-500" /> Cuti</span>
      </div>
      <div className="mt-3 border-t border-zinc-100 pt-3">
        <p className="mb-1.5 text-xs font-semibold text-zinc-700">{agenda.length} agenda bulan ini</p>
        {agenda.length === 0 ? (
          <p className="text-xs text-zinc-400">Tidak ada agenda.</p>
        ) : (
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {agenda.map((a, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <span className="w-6 shrink-0 text-right font-semibold text-zinc-500">{a.day}</span>
                <span className={a.tone}>{a.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
