import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">ABSENKU</h1>
        <p className="max-w-md text-zinc-600">
          Absensi selfie, data karyawan, dan payroll — dalam satu aplikasi
          untuk bisnis Anda.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Daftar
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Masuk
        </Link>
      </div>
    </div>
  );
}
