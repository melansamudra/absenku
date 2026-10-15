"use client";

import { startTransition, useActionState, useState, useSyncExternalStore } from "react";
import { KeyRound, UserRound } from "lucide-react";
import { PinPad } from "@/components/pin-pad";
import { loginPortal, type PortalActionState } from "./actions";
import { Card, EmptyState, Hero } from "./ui";

type Employee = { id: string; name: string; note: string | null };

const initialState: PortalActionState = { error: null };

// Nama terakhir yang login di HP ini disimpan, supaya login berikutnya langsung
// ke layar PIN (tanpa memilih nama lagi). Dibaca lewat useSyncExternalStore agar
// aman untuk render di server (server selalu menampilkan daftar nama dulu).
const lastKey = (slug: string) => `hrcash_portal_last_${slug}`;
const noopSubscribe = () => () => {};
function useLastEmployeeId(slug: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return localStorage.getItem(lastKey(slug));
      } catch {
        return null;
      }
    },
    () => null,
  );
}

// Login Portal Karyawan dua langkah, sama alurnya dengan Kasirku:
// 1) pilih nama dari daftar, 2) halaman "Halo, <nama>" + keypad PIN.
// PIN tepat 4 digit dan langsung dikirim begitu digit ke-4 diketik (tanpa tombol).
export default function LoginScreen({
  slug,
  businessName,
  employees,
}: {
  slug: string;
  businessName: string;
  employees: Employee[];
}) {
  const lastId = useLastEmployeeId(slug);
  // undefined = belum memilih: pakai nama terakhir (jika ada); null = sengaja "Ganti nama"
  const [picked, setPicked] = useState<Employee | null | undefined>(undefined);
  const selected = picked !== undefined ? picked : (employees.find((e) => e.id === lastId) ?? null);

  if (selected) {
    // key = id karyawan: ganti nama membuang PIN dan pesan error sebelumnya.
    return <PinStep key={selected.id} slug={slug} businessName={businessName} employee={selected} onBack={() => setPicked(null)} />;
  }
  return <NameStep businessName={businessName} employees={employees} onSelect={setPicked} />;
}

const note = (
  <p className="mt-4 text-center text-[11px] text-zinc-400">
    Pakai PIN yang sama dengan PIN absen selfie. Lupa PIN? Minta admin menggantinya.
  </p>
);

function NameStep({
  businessName,
  employees,
  onSelect,
}: {
  businessName: string;
  employees: Employee[];
  onSelect: (e: Employee) => void;
}) {
  const [query, setQuery] = useState("");
  const shown = employees.filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      <Hero
        businessName={businessName}
        title="Portal Karyawan"
        subtitle="Lihat slip gaji, sisa cuti, kasbon, dan ajukan lembur dari HP kamu. Pilih nama untuk masuk."
      />
      <main className="relative z-10 mx-auto -mt-4 max-w-md px-4 pb-10">
        <Card title="Pilih nama" icon={UserRound}>
          <div className="space-y-2">
            {employees.length > 6 && (
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama…"
                className="mb-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-portal-600 focus:outline-none"
              />
            )}
            {shown.length === 0 ? (
              <EmptyState
                icon={UserRound}
                text={
                  employees.length === 0
                    ? "Belum ada karyawan yang punya PIN absen. Minta admin memasangkan PIN dulu."
                    : "Nama tidak ditemukan."
                }
              />
            ) : (
              shown.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onSelect(e)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-portal-500 hover:bg-portal-50/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-portal-50 text-sm font-bold text-portal-700">
                    {e.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800">{e.name}</p>
                    {e.note && <p className="truncate text-[11px] text-zinc-400">{e.note}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
        {note}
      </main>
    </div>
  );
}

function PinStep({
  slug,
  businessName,
  employee,
  onBack,
}: {
  slug: string;
  businessName: string;
  employee: Employee;
  onBack: () => void;
}) {
  const [pin, setPin] = useState("");
  const [state, formAction, pending] = useActionState(
    async (prev: PortalActionState, formData: FormData) => {
      try {
        localStorage.setItem(lastKey(slug), employee.id);
      } catch {
        // penyimpanan browser bisa diblokir — login tetap jalan
      }
      const res = await loginPortal(slug, prev, formData);
      // PIN salah -> kosongkan supaya bisa diketik ulang.
      if (res.error) setPin("");
      return res;
    },
    initialState,
  );

  // Digit ke-4 diketik -> langsung login.
  function submit(value: string) {
    const fd = new FormData();
    fd.set("employee_id", employee.id);
    fd.set("pin", value);
    startTransition(() => formAction(fd));
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      <Hero
        businessName={businessName}
        initial={employee.name}
        title={`Halo, ${employee.name.split(" ")[0]}`}
        subtitle="Masukkan PIN 4 digit untuk melanjutkan."
      />
      <main className="relative z-10 mx-auto -mt-4 max-w-md px-4 pb-10">
        <Card title="Masukkan PIN" icon={KeyRound}>
          <PinPad value={pin} onChange={setPin} onComplete={submit} disabled={pending} activeClass="border-portal-600 bg-portal-600" />
          {state.error && !pending && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-600">{state.error}</p>
          )}
          {pending && <p className="mt-4 text-center text-xs font-medium text-zinc-400">Memeriksa…</p>}
          <button
            type="button"
            onClick={onBack}
            className="mt-5 w-full text-center text-xs font-medium text-zinc-400 hover:text-zinc-600"
          >
            Bukan {employee.name}? Ganti nama
          </button>
        </Card>
        {note}
      </main>
    </div>
  );
}
