import Link from "next/link";

export default function RestrictedAccess({ businessId, reason }: { businessId: string; reason: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-xl">🔒</div>
      <h1 className="text-lg font-bold text-zinc-900">Akses Terbatas</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">{reason}</p>
      <Link href={`/business/${businessId}`} className="mt-5 text-sm font-medium text-brand-600 hover:underline">
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}
