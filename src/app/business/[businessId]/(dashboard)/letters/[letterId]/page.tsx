import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LETTER_KINDS, isLetterKind } from "@/lib/letters/templates";
import PrintLetterButton from "./print-button";

function fmtLongDate(iso: string) {
  return new Date(`${iso}T00:00:00+07:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export default async function LetterPage({
  params,
}: {
  params: Promise<{ businessId: string; letterId: string }>;
}) {
  const { businessId, letterId } = await params;
  const supabase = await createClient();

  const [{ data: letter }, { data: business }] = await Promise.all([
    supabase
      .from("employee_letters")
      .select("kind, letter_number, issued_date, subject, body, employees(name, note)")
      .eq("id", letterId)
      .eq("business_id", businessId)
      .maybeSingle(),
    supabase.from("businesses").select("name, address, phone").eq("id", businessId).single(),
  ]);
  if (!letter) notFound();

  const employee = letter.employees as unknown as { name: string; note: string | null } | null;
  const kindLabel = isLetterKind(letter.kind) ? LETTER_KINDS[letter.kind] : letter.kind;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between print:hidden">
        <Link href={`/business/${businessId}/letters`} className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Daftar surat
        </Link>
        <PrintLetterButton />
      </div>

      <article className="mx-auto max-w-2xl rounded-xl border border-zinc-100 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="border-b-2 border-zinc-800 pb-3 text-center">
          <h1 className="text-lg font-bold uppercase tracking-wide text-zinc-900">{business?.name}</h1>
          {business?.address && <p className="text-xs text-zinc-500">{business.address}</p>}
          {business?.phone && <p className="text-xs text-zinc-500">Telp. {business.phone}</p>}
        </header>

        <div className="mt-6 text-center">
          <h2 className="text-base font-bold uppercase underline">{letter.subject}</h2>
          {letter.letter_number && <p className="text-sm text-zinc-600">Nomor: {letter.letter_number}</p>}
          <p className="sr-only">{kindLabel}</p>
        </div>

        <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">{letter.body}</div>

        <div className="mt-10 flex justify-end text-sm text-zinc-800">
          <div className="w-56 text-center">
            <p>{fmtLongDate(letter.issued_date)}</p>
            <p>Hormat kami,</p>
            <div className="h-20" />
            <p className="border-t border-zinc-400 pt-1 font-semibold">{business?.name}</p>
          </div>
        </div>

        {letter.kind !== "sk" && (
          <div className="mt-8 text-sm text-zinc-800">
            <p>Diterima oleh karyawan yang bersangkutan:</p>
            <div className="h-16" />
            <p className="inline-block border-t border-zinc-400 pt-1 font-semibold">{employee?.name}</p>
          </div>
        )}
      </article>
    </div>
  );
}
