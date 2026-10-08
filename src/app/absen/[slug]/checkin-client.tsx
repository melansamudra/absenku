"use client";

import { useEffect, useRef, useState } from "react";

type Employee = { id: string; name: string; note: string | null; hasPin: boolean };

type Status = { checkedIn: boolean; checkedOut: boolean; checkInAt: string | null; checkOutAt: string | null };

function fmtTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLocation(): Promise<{ lat: number | null; lng: number | null }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

export default function CheckinClient({
  slug,
  businessName,
  employees,
  geofenceEnabled,
  pinRequired,
}: {
  slug: string;
  businessName: string;
  employees: Employee[];
  geofenceEnabled: boolean;
  pinRequired: boolean;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [pendingAction, setPendingAction] = useState<"in" | "out" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actionRef = useRef<"in" | "out" | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;
    fetch(`/api/attendance-checkin?slug=${slug}&employeeId=${employeeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.ok) return;
        setStatus({
          checkedIn: data.checkedIn,
          checkedOut: data.checkedOut,
          checkInAt: data.checkInAt,
          checkOutAt: data.checkOutAt,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [employeeId, slug]);

  function startAction(action: "in" | "out") {
    setError(null);
    setMessage(null);
    if (needsPin && !/^\d{4,6}$/.test(pin)) {
      setError("Masukkan PIN absen kamu (4–6 digit).");
      return;
    }
    actionRef.current = action;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const action = actionRef.current;
    e.target.value = "";
    if (!file || !action) return;

    setPendingAction(action);
    setError(null);
    setMessage(null);

    try {
      const { lat, lng } = await getLocation();
      if (geofenceEnabled && (lat === null || lng === null)) {
        setError("Lokasi tidak terbaca. Izinkan akses lokasi (GPS) di browser lalu coba lagi.");
        return;
      }

      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("employeeId", employeeId);
      formData.append("action", action);
      formData.append("photo", file);
      if (pin) formData.append("pin", pin);
      if (lat !== null) formData.append("lat", String(lat));
      if (lng !== null) formData.append("lng", String(lng));

      const res = await fetch("/api/attendance-checkin", { method: "POST", body: formData });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? "Gagal memproses absen.");
      } else {
        setMessage(data.message ?? "Berhasil.");
        setStatus((prev) => ({
          checkedIn: action === "in" ? true : prev?.checkedIn ?? false,
          checkedOut: action === "out" ? true : prev?.checkedOut ?? false,
          checkInAt: action === "in" ? new Date().toISOString() : prev?.checkInAt ?? null,
          checkOutAt: action === "out" ? new Date().toISOString() : prev?.checkOutAt ?? null,
        }));
      }
    } catch {
      setError("Gagal terhubung ke server. Cek koneksi internet lalu coba lagi.");
    } finally {
      setPendingAction(null);
    }
  }

  const selectedEmployee = employees.find((e) => e.id === employeeId) ?? null;
  const needsPin = !!selectedEmployee?.hasPin;
  const blockedNoPin = !!selectedEmployee && pinRequired && !selectedEmployee.hasPin;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            A
          </div>
          <h1 className="text-lg font-bold text-zinc-900">{businessName}</h1>
          <p className="mt-0.5 text-xs text-zinc-500">Absen Selfie</p>
        </div>

        <label className="mb-1.5 block text-xs font-medium text-zinc-600">Pilih Nama Kamu</label>
        <select
          value={employeeId}
          onChange={(e) => {
            setEmployeeId(e.target.value);
            setPin("");
            setStatus(null);
            setMessage(null);
            setError(null);
          }}
          className="mb-4 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          <option value="">— Pilih nama —</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
              {e.note ? ` (${e.note})` : ""}
            </option>
          ))}
        </select>

        {needsPin && (
          <>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">PIN Absen</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="4–6 digit"
              className="mb-4 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm tracking-widest focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </>
        )}

        {blockedNoPin && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Kamu belum punya PIN absen. Minta admin memasangkan PIN dulu.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleFileChange}
        />

        {employeeId && status && (
          <div className="mb-4 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
            {status.checkInAt && <p>Absen masuk: {fmtTime(status.checkInAt)}</p>}
            {status.checkOutAt && <p>Absen pulang: {fmtTime(status.checkOutAt)}</p>}
            {!status.checkInAt && <p>Belum absen masuk hari ini.</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!employeeId || blockedNoPin || !!pendingAction || status?.checkedIn}
            onClick={() => startAction("in")}
            className="rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pendingAction === "in" ? "Memproses…" : "Absen Masuk"}
          </button>
          <button
            type="button"
            disabled={!employeeId || blockedNoPin || !!pendingAction || !status?.checkedIn || status?.checkedOut}
            onClick={() => startAction("out")}
            className="rounded-xl border border-zinc-300 py-3 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pendingAction === "out" ? "Memproses…" : "Absen Pulang"}
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
            {error}
          </p>
        )}

        {selectedEmployee && (
          <p className="mt-4 text-center text-[11px] text-zinc-400">
            Tap tombol di atas, lalu ambil foto selfie untuk konfirmasi.
            {geofenceEnabled && " Pastikan GPS aktif — absen hanya bisa di lokasi kerja."}
          </p>
        )}
      </div>
    </div>
  );
}
