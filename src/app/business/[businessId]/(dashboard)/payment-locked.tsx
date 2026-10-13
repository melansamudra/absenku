const ADMIN_PHONE = "6281234556757";
const WA_MESSAGE = encodeURIComponent(
  "Halo, saya mau konfirmasi pembayaran HrCash untuk aktivasi akun bisnis saya.",
);

export default function PaymentLocked({ isOwner, businessName }: { isOwner: boolean; businessName: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-xl">
          🔒
        </div>
        <h1 className="text-lg font-bold text-zinc-900">Akun Belum Aktif</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Bisnis <span className="font-medium text-zinc-700">{businessName}</span> belum diaktifkan.
        </p>
        {isOwner ? (
          <>
            <p className="mt-3 text-sm text-zinc-600">
              Lakukan pembayaran untuk mengaktifkan akun, lalu konfirmasi ke{" "}
              <span className="font-semibold text-zinc-900">{ADMIN_PHONE.replace("62", "0")}</span> supaya akun
              langsung diaktifkan.
            </p>
            <a
              href={`https://wa.me/${ADMIN_PHONE}?text=${WA_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Hubungi via WhatsApp
            </a>
          </>
        ) : (
          <p className="mt-3 text-sm text-zinc-600">
            Hubungi pemilik bisnis untuk mengaktifkan akun ini.
          </p>
        )}
      </div>
    </div>
  );
}
