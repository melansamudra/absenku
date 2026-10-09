// Tampilan sementara instan saat pindah halaman di portal — server masih
// mengambil data, tapi layar sudah bereaksi (tidak terasa macet).
export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-[#f6f6f6]" aria-busy="true" aria-label="Memuat">
      <div className="bg-gradient-to-b from-portal-300 to-portal-800">
        <div className="mx-auto flex h-[72px] max-w-md items-center px-4">
          <span className="h-8 w-8 rounded-full bg-white/25" />
          <span className="mx-auto h-4 w-28 animate-pulse rounded bg-white/30" />
          <span className="h-8 w-8" />
        </div>
      </div>
      <div className="mx-auto max-w-md space-y-3 px-4 pt-4">
        <div className="h-24 animate-pulse rounded-2xl bg-white" />
        <div className="h-16 animate-pulse rounded-2xl bg-white" />
        <div className="h-16 animate-pulse rounded-2xl bg-white" />
        <div className="h-16 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}
