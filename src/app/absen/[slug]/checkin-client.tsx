"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Camera, ChevronLeft, Info, LogIn, LogOut, MapPinned, Route } from "lucide-react";
import { fmtDistance, nearestSpot, type GeofenceSpot } from "@/lib/attendance/geofence";
import { PinPad } from "@/components/pin-pad";

const OfficeMap = dynamic(() => import("./office-map"), { ssr: false });

type Employee = { id: string; name: string; note: string | null; hasPin: boolean };
type Status = { checkedIn: boolean; checkedOut: boolean; checkInAt: string | null; checkOutAt: string | null; shiftStart: string | null; lateMinutesNow: number };
type LocationStatus = "pending" | "ok" | "denied" | "unsupported";
type Result = { ok: boolean; message?: string; error?: string; needLateReason?: boolean };

const hhmm = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":") : "--:--";

// Foto langsung dari kamera HP bisa beberapa MB — kompres ke JPEG max 1000px sebelum upload
// supaya kirim absen cepat di jaringan lemot. Browser tanpa dukungan -> pakai file asli.
async function compressPhoto(file: File, maxDim = 1000, quality = 0.75): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export default function CheckinClient({
  slug,
  businessName,
  employees,
  spots,
  pinRequired,
  lateReasonEnabled,
  lockedEmployeeId,
  backHref,
}: {
  slug: string;
  businessName: string;
  employees: Employee[];
  spots: (GeofenceSpot & { name: string })[];
  pinRequired: boolean;
  lateReasonEnabled: boolean;
  // Dibuka dari Portal Karyawan (sudah login): nama terkunci, tanpa pilih nama
  lockedEmployeeId?: string;
  backHref?: string;
}) {
  const geofenceEnabled = spots.length > 0;
  const [employeeId, setEmployeeId] = useState(lockedEmployeeId ?? "");
  const [pin, setPin] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [pending, setPending] = useState<"in" | "out" | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lateReason, setLateReason] = useState("");
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  // awal selalu "pending" (sama di server & browser supaya hydration cocok); "unsupported" ditentukan di effect
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("pending");

  const selectedEmployee = employees.find((e) => e.id === employeeId) ?? null;
  const needsPin = !!selectedEmployee?.hasPin;
  const blockedNoPin = !!selectedEmployee && pinRequired && !selectedEmployee.hasPin;

  function showToast(ok: boolean, text: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ ok, text });
    toastTimer.current = setTimeout(() => setToast(null), ok ? 6000 : 4000);
  }

  // Lokasi dipantau terus supaya jarak ke lokasi kerja selalu terbaru dan siap saat tombol ditekan.
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationStatus("unsupported");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("ok");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  async function fetchStatus(id: string) {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/attendance-checkin?slug=${encodeURIComponent(slug)}&employeeId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.ok) {
        setStatus({
          checkedIn: !!data.checkedIn,
          checkedOut: !!data.checkedOut,
          checkInAt: data.checkInAt ?? null,
          checkOutAt: data.checkOutAt ?? null,
          shiftStart: data.shiftStart ?? null,
          lateMinutesNow: Number(data.lateMinutesNow ?? 0),
        });
      } else {
        setStatus(null);
      }
    } catch {
      setStatus(null);
    } finally {
      setStatusLoading(false);
    }
  }

  useEffect(() => {
    if (!employeeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(null);
      return;
    }
    fetchStatus(employeeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    const compressed = await compressPhoto(file);
    setCompressing(false);
    setPhoto(compressed);
    setPreview(URL.createObjectURL(compressed));
  }

  async function submit(action: "in" | "out", reason?: string) {
    setPending(action);
    const formData = new FormData();
    formData.set("slug", slug);
    formData.set("employeeId", employeeId);
    formData.set("action", action);
    formData.set("photo", photo!);
    if (pin) formData.set("pin", pin);
    if (reason) formData.set("lateReason", reason);
    if (location) {
      formData.set("lat", String(location.lat));
      formData.set("lng", String(location.lng));
    }
    try {
      const res = await fetch("/api/attendance-checkin", { method: "POST", body: formData });
      const data = (await res.json()) as Result;
      if (data.needLateReason) {
        setSheetError(null);
        setSheetOpen(true);
      } else {
        showToast(data.ok, (data.ok ? data.message : data.error) ?? "");
        // PIN salah -> kosongkan supaya diketik ulang.
        if (!data.ok && /pin/i.test(data.error ?? "")) setPin("");
      }
      if (data.ok) {
        setPhoto(null);
        setPreview(null);
        setLateReason("");
        fetchStatus(employeeId);
      }
    } catch {
      showToast(false, "Gagal terhubung ke server. Cek koneksi internet lalu coba lagi.");
    } finally {
      setPending(null);
    }
  }

  const canOut = !!status?.checkedIn && !status?.checkedOut;
  function handleMain() {
    if (!employeeId) return showToast(false, "Pilih nama dulu.");
    if (blockedNoPin) return showToast(false, "Kamu belum punya PIN absen. Minta admin memasangkan PIN dulu.");
    if (needsPin && !/^\d{4,6}$/.test(pin)) return showToast(false, "Masukkan PIN absen kamu (4–6 digit).");
    if (!photo) return showToast(false, "Anda harus foto terlebih dahulu");
    if (geofenceEnabled && !location) return showToast(false, "Lokasi tidak terbaca. Izinkan akses lokasi (GPS) di browser lalu coba lagi.");
    if (canOut) return void submit("out");
    // terlambat dari jadwal -> alasan wajib (form muncul dulu, baru terkirim)
    if (lateReasonEnabled && (status?.lateMinutesNow ?? 0) > 0 && lateReason.trim().length < 3) {
      setSheetError(null);
      return setSheetOpen(true);
    }
    void submit("in", lateReason.trim() || undefined);
  }

  function handleSendReason() {
    const r = lateReason.trim();
    if (r.length < 3) return setSheetError("Isi alasan terlambat (minimal 3 huruf).");
    setSheetOpen(false);
    void submit("in", r);
  }

  const near = geofenceEnabled && location ? nearestSpot(location, spots) : null;
  const busy = pending !== null || compressing || statusLoading;
  const mainDisabled = busy || !employeeId || blockedNoPin || (!!status?.checkedOut && !canOut);
  const mainLabel = pending ? "Mengirim…" : status?.checkedOut ? "Selesai" : canOut ? "Check Out" : "Check In";
  const selectCls = "w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-100";

  const row = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center text-sky-900">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500">{label}</p>
        <div className="text-base font-semibold leading-tight text-sky-900">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-white">
      <header className="z-[600] bg-gradient-to-b from-sky-300 via-sky-600 to-sky-800 px-3 pb-4 pt-[max(env(safe-area-inset-top),14px)] text-white">
        <div className="flex items-center justify-between">
          {backHref ? (
            <Link href={backHref} aria-label="Kembali" className="flex h-10 w-10 items-center justify-center">
              <ChevronLeft className="h-7 w-7" />
            </Link>
          ) : (
            <button type="button" onClick={() => window.history.back()} aria-label="Kembali" className="flex h-10 w-10 items-center justify-center">
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}
          <h1 className="text-xl font-bold">Check In</h1>
          <button type="button" onClick={() => setShowInfo((v) => !v)} aria-label="Info" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sky-800">
            <Info className="h-6 w-6" />
          </button>
        </div>
        <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-sky-100">{businessName}</p>
        {showInfo && (
          <p className="mt-2 rounded-xl bg-white/15 px-3 py-2 text-xs leading-relaxed">
            Ambil selfie lalu tekan Check In saat tiba dan Check Out saat pulang.
            {geofenceEnabled ? " Absen hanya bisa dilakukan di dalam lingkaran biru (lokasi kerja)." : ""}
            {status?.shiftStart ? ` Jadwal masuk hari ini ${status.shiftStart}.` : ""}
          </p>
        )}
      </header>

      {geofenceEnabled && (
        <div className="relative h-[40vh] min-h-[250px] w-full bg-zinc-200">
          <OfficeMap spots={spots} user={location} />
        </div>
      )}

      <main className={`relative z-[550] flex-1 bg-white px-4 pb-10 pt-4 ${geofenceEnabled ? "-mt-5 rounded-t-3xl shadow-[0_-8px_20px_rgba(0,0,0,0.12)]" : ""}`}>
        {lockedEmployeeId ? (
          <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm font-medium text-sky-900">
            👤 {selectedEmployee?.name ?? "Karyawan"}
            {selectedEmployee?.note ? <span className="font-normal text-sky-700"> · {selectedEmployee.note}</span> : null}
          </div>
        ) : (
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-zinc-600">Pilih Nama Kamu</label>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setPin("");
              }}
              className={selectCls}
            >
              <option value="">— Pilih nama —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.note ? ` (${e.note})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {needsPin && (
          <div className="mb-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <label className="mb-3 block text-center text-xs font-medium text-zinc-600">Masukkan PIN Absen (4–6 digit)</label>
            <PinPad value={pin} onChange={setPin} disabled={busy} compact />
          </div>
        )}

        {blockedNoPin && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">Kamu belum punya PIN absen. Minta admin memasangkan PIN dulu.</p>}

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-3">
          <div className="relative flex min-h-[230px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-zinc-100">
            {compressing ? (
              <div className="flex flex-col items-center text-zinc-400">
                <span className="text-3xl">⏳</span>
                <span className="mt-2 text-xs font-medium">Memproses foto…</span>
              </div>
            ) : preview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview selfie" className="absolute inset-0 h-full w-full object-cover" />
                <label className="absolute left-2 top-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-sky-900 text-white">
                  <Camera className="h-5 w-5" />
                  <input type="file" accept="image/*" capture="user" onChange={handlePhotoChange} className="hidden" />
                </label>
              </>
            ) : (
              <>
                <Camera className="h-16 w-16 text-sky-900" strokeWidth={1.5} />
                <label className="mt-4 cursor-pointer rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-semibold text-sky-950 active:bg-amber-400">
                  Ambil Foto
                  <input type="file" accept="image/*" capture="user" onChange={handlePhotoChange} className="hidden" />
                </label>
              </>
            )}
          </div>

          <div className="flex flex-col justify-between gap-3">
            {row(<LogIn className="h-7 w-7" />, "Check in", hhmm(status?.checkInAt ?? null))}
            {row(<LogOut className="h-7 w-7" />, "Check Out", hhmm(status?.checkOutAt ?? null))}
            {geofenceEnabled &&
              row(
                <Route className="h-7 w-7" />,
                "Jarak Kantor",
                near ? fmtDistance(near.distance) : <span className="text-sm font-medium text-zinc-400">{locationStatus === "pending" ? "Mendeteksi…" : "—"}</span>,
              )}
            {geofenceEnabled &&
              row(
                <MapPinned className="h-7 w-7" />,
                "Status",
                near === null ? (
                  <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    {locationStatus === "pending" ? "Mendeteksi lokasi…" : "Lokasi tidak aktif"}
                  </span>
                ) : near.inRange ? (
                  <span className="inline-block rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-800">Dalam jangkauan</span>
                ) : (
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">Di luar jangkauan</span>
                ),
              )}
            {!geofenceEnabled && (
              <p className={`text-xs ${locationStatus === "ok" ? "text-sky-700" : "text-amber-600"}`}>
                {locationStatus === "pending" && "📍 Mendeteksi lokasi…"}
                {locationStatus === "ok" && "📍 Lokasi terdeteksi"}
                {locationStatus === "denied" && "⚠️ Aktifkan izin lokasi di browser"}
                {locationStatus === "unsupported" && "⚠️ Perangkat tidak mendukung lokasi"}
              </p>
            )}
            <button
              type="button"
              onClick={handleMain}
              disabled={mainDisabled}
              className="rounded-xl bg-sky-900 py-3.5 text-base font-semibold text-white transition-colors active:bg-sky-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mainLabel}
            </button>
          </div>
        </div>

        {geofenceEnabled && near && !near.inRange && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">Anda di luar area kerja — Check In/Out hanya bisa dilakukan di dalam lingkaran biru.</p>
        )}
        {status && !status.checkedIn && status.lateMinutesNow > 0 && lateReasonEnabled && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⏰ Anda terlambat {status.lateMinutesNow} menit dari jadwal {status.shiftStart} — alasan terlambat akan ditanyakan saat Check In.
          </p>
        )}

        {!lockedEmployeeId && (
          <a href={`/karyawan/${slug}`} className="mt-6 block text-center text-xs font-semibold text-sky-700 hover:underline">
            Portal Karyawan — slip gaji, sisa cuti, lembur →
          </a>
        )}
      </main>

      {toast && (
        <div role="status" className={`fixed inset-x-0 bottom-6 z-[900] mx-auto w-[calc(100%-2rem)] max-w-sm rounded-md px-5 py-4 text-base font-medium text-white shadow-lg ${toast.ok ? "bg-emerald-600" : "bg-red-500"}`}>
          {toast.text}
        </div>
      )}

      {sheetOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/55" onClick={() => setSheetOpen(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-slate-50 px-5 pb-8 pt-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-zinc-900">Alasan Terlambat</h2>
            {status?.shiftStart && status.lateMinutesNow > 0 && (
              <p className="mt-0.5 text-xs text-zinc-500">
                Terlambat {status.lateMinutesNow} menit dari jadwal {status.shiftStart}
              </p>
            )}
            <textarea
              autoFocus
              value={lateReason}
              onChange={(e) => {
                setLateReason(e.target.value);
                setSheetError(null);
              }}
              rows={6}
              maxLength={500}
              placeholder="Ketik alasan di sini..."
              className="mt-3 w-full rounded-lg border border-zinc-500 bg-transparent p-3 text-base text-zinc-800 focus:border-sky-900 focus:outline-none"
            />
            {sheetError && <p className="mt-1 text-xs text-red-600">{sheetError}</p>}
            <div className="mt-4 flex justify-center">
              <button type="button" onClick={handleSendReason} className="rounded-xl bg-sky-900 px-12 py-3 text-base font-semibold text-white active:bg-sky-950">
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
