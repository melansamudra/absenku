import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LETTER_KINDS, isLetterKind } from "@/lib/letters/templates";
import { todayWib } from "@/lib/portal/dates";
import LetterForm from "./letter-form";
import DeleteLetterButton from "./delete-letter-button";

export default async function LettersPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: business }, { data: employees }, { data: letters }] = await Promise.all([
    supabase.from("businesses").select("name").eq("id", businessId).single(),
    supabase
      .from("employees")
      .select("id, name")
      .eq("business_id", businessId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("employee_letters")
      .select("id, kind, letter_number, issued_date, subject, employees(name)")
      .eq("business_id", businessId)
      .order("issued_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100),
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
