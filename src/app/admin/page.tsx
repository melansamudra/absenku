import { requirePlatformAdmin } from "@/lib/admin/guard";
import MarkPaidButton from "./mark-paid-button";

export const metadata = { title: "Admin — HrCash" };

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminPage() {
  const service = await requirePlatformAdmin();

  const { data: businesses } = await service
    .from("businesses")
    .select("id, name, phone, payment_status, paid_at, created_at, owner_id")
    .order("created_at", { ascending: false });

  // Email owner diambil terpisah lewat auth admin API (bukan tabel public),
  // supaya kelihatan siapa yang harus dihubungi kalau kolom phone kosong.
  const ownerIds = [...new Set((businesses ?? []).map((b) => b.owner_id))];
  const ownerEmails = new Map<string, string>();
  await Promise.all(
    ownerIds.map(async (id) => {
      const { data } = await service.auth.admin.getUserById(id);
      if (data.user?.email) ownerEmails.set(id, data.user.email);
    }),
  );

  const unpaid = (businesses ?? []).filter((b) => b.payment_status !== "paid");
  const paid = (businesses ?? []).filter((b) => b.payment_status === "paid");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Admin — Status Pembayaran Bisnis</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Cek pembayaran masuk secara manual (transfer/kontak), lalu tandai lunas di sini supaya akun bisnisnya langsung aktif.
      </p>

      <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-amber-700">
        Belum Lunas ({unpaid.length})
      </h2>
      <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
        {unpaid.length === 0 && <p className="p-5 text-sm text-zinc-400">Tidak ada yang menunggu pembayaran.</p>}
        {unpaid.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold text-zinc-900">{b.name}</p>
              <p className="text-xs text-zinc-500">
                {ownerEmails.get(b.owner_id) ?? "—"} · {b.phone ?? "Nomor telepon belum diisi"} · daftar {fmtDate(b.created_at)}
              </p>
            </div>
            <MarkPaidButton businessId={b.id} action="paid" label="Tandai Lunas" />
          </div>
        ))}
      </div>

      <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Sudah Lunas ({paid.length})
      </h2>
      <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
        {paid.length === 0 && <p className="p-5 text-sm text-zinc-400">Belum ada.</p>}
        {paid.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold text-zinc-900">{b.name}</p>
              <p className="text-xs text-zinc-500">
                {ownerEmails.get(b.owner_id) ?? "—"} · {b.phone ?? "—"} · lunas {fmtDate(b.paid_at)}
              </p>
            </div>
            <MarkPaidButton businessId={b.id} action="unpaid" label="Batalkan" />
          </div>
        ))}
      </div>
    </div>
  );
}
