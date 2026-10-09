import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LETTER_KINDS, isLetterKind } from "@/lib/letters/templates";
import { todayWib } from "@/lib/portal/dates";
import LetterForm from "./letter-form";
import DeleteLetterButton from "./delete-letter-button";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function LettersPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ emp?: string; kind?: string }>;
}) {
  const { businessId } = await params;
  const sp = await searchParams;
  const empFilter = sp.emp && UUID_RE.test(sp.emp) ? sp.emp : "";
  const kindFilter = sp.kind === "sp" || sp.kind === "sk" ? sp.kind : "";
  const filtered = !!(empFilter || kindFilter);
  const supabase = await createClient();

  const [{ data: business }, { data: employees }, { data: letters }] = await Promise.all([
    supabase.from("businesses").select("name").eq("id", businessId).single(),
    supabase
      .from("employees")
      .select("id, name")
      .eq("business_id", businessId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    (() => {
      let q = supabase
        .from("employee_letters")
        .select("id, kind, letter_number, issued_date, subject, employees(name)")
        .eq("business_id", businessId);
      if (empFilter) q = q.eq("employee_id", empFilter);
      if (kindFilter === "sp") q = q.in("kind", ["sp1", "sp2", "sp3"]);
      if (kindFilter === "sk") q = q.eq("kind", "sk");
      return q.order("issued_date", { ascending: false }).order("created_at", { ascending: false }).limit(100);
    })(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Surat Karyawan</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Buat Surat Peringatan (SP1–SP3) dan Surat Keterangan (SK) dari template, lalu cetak. Surat
          juga muncul di Portal Karyawan masing-masing.
        </p>
      </div>

      <form method="get" className="mb-3 flex flex-wrap items-end gap-2 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
        <div>
          <label htmlFor="f-emp" className="mb-1 block text-[11px] font-medium text-zinc-500">Karyawan</label>
          <select id="f-emp" name="emp" defaultValue={empFilter} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs">
            <option value="">Semua karyawan</option>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-kind" className="mb-1 block text-[11px] font-medium text-zinc-500">Jenis</label>
          <select id="f-kind" name="kind" defaultValue={kindFilter} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs">
            <option value="">Semua jenis</option>
            <option value="sp">Surat Peringatan (SP1–SP3)</option>
            <option value="sk">Surat Keterangan (SK)</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
          Terapkan
        </button>
        {filtered && (
          <Link href={`/business/${businessId}/letters`} className="px-1 py-1.5 text-xs text-zinc-500 hover:text-zinc-800">
            Reset
          </Link>
        )}
      </form>

      {filtered && (letters ?? []).length === 0 && (
        <div className="mb-6 rounded-xl border border-dashed border-zinc-300 bg-white py-8 text-center">
          <p className="text-sm text-zinc-500">Tidak ada surat yang cocok dengan filter.</p>
        </div>
      )}

      {(letters ?? []).length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {(letters ?? []).map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link href={`/business/${businessId}/letters/${l.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900">
                    {(l.employees as unknown as { name: string } | null)?.name ?? "—"} ·{" "}
                    {isLetterKind(l.kind) ? LETTER_KINDS[l.kind] : l.kind}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-400">
                    {l.issued_date} · {l.letter_number} · {l.subject}
                  </p>
                </Link>
                <DeleteLetterButton businessId={businessId} letterId={l.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Buat Surat Baru</h2>
        <LetterForm
          businessId={businessId}
          businessName={business?.name ?? ""}
          employees={employees ?? []}
          today={todayWib()}
        />
      </div>
    </div>
  );
}
