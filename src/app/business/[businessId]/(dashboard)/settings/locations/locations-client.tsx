"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addOfficeLocation, deleteOfficeLocation, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export type OfficeLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
};

const inputClass = "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm";

export default function LocationsClient({
  businessId,
  primary,
  locations,
}: {
  businessId: string;
  primary: { lat: number; lng: number; radius_m: number } | null;
  locations: OfficeLocation[];
}) {
  const [state, formAction, pending] = useActionState(
    (prev: ActionState, formData: FormData) => addOfficeLocation(businessId, prev, formData),
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  function fillCurrentLocation() {
    setLocateError(null);
    if (!navigator.geolocation) {
      setLocateError("Browser ini tidak mendukung lokasi.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (latRef.current) latRef.current.value = pos.coords.latitude.toFixed(6);
        if (lngRef.current) lngRef.current.value = pos.coords.longitude.toFixed(6);
        setLocating(false);
      },
      () => {
        setLocateError("Tidak bisa membaca lokasi. Izinkan akses lokasi di browser.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="mt-2">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Lokasi Kantor</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Karyawan bisa absen di titik mana pun yang terdaftar (kantor pusat, cabang, gudang, dll.).
          Titik utama diatur di Pengaturan → Keamanan Absen; titik tambahan diatur di sini.
        </p>
      </div>

      <div className="mb-5 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
        <div className="divide-y divide-zinc-100">
          <div className="px-5 py-3">
            <p className="font-medium text-zinc-900">Titik utama</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {primary
                ? `${primary.lat}, ${primary.lng} · radius ${primary.radius_m} m`
                : "Belum diatur (kosong)"}
            </p>
          </div>
          {locations.map((l) => (
            <div key={l.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium text-zinc-900">{l.name}</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {l.lat}, {l.lng} · radius {l.radius_m} m
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus lokasi "${l.name}"?`)) deleteOfficeLocation(businessId, l.id);
                }}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Tambah Lokasi</h2>
        <form
          ref={formRef}
          action={(formData) => {
            hasSubmitted.current = true;
            formAction(formData);
          }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Nama lokasi</label>
            <input name="name" required placeholder="mis. Cabang Bandung" className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Latitude</label>
              <input
                name="lat"
                required
                inputMode="decimal"
                ref={latRef}
                placeholder="-6.914744"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Longitude</label>
              <input
                name="lng"
                required
                inputMode="decimal"
                ref={lngRef}
                placeholder="107.609810"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Radius (m)</label>
              <input
                name="radius_m"
                required
                type="number"
                min={10}
                max={10000}
                step={1}
                defaultValue={100}
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={fillCurrentLocation}
            disabled={locating}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
          >
            {locating ? "Membaca lokasi…" : "Pakai lokasi saya sekarang"}
          </button>
          {locateError && <p className="text-xs text-red-600">{locateError}</p>}
          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
          <div>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "Menyimpan…" : "Tambah Lokasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
