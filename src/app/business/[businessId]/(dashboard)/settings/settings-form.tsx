"use client";

import { useActionState, useState } from "react";
import { updateBusinessSettings, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export type BusinessSettings = {
  name: string;
  address: string | null;
  phone: string | null;
  work_start_time: string;
  work_end_time: string;
  izin_deduction_mode: "flat" | "full_day";
  izin_deduction_weekday: number;
  izin_deduction_weekend: number;
  late_deduction_per_occurrence: number;
  lembur_rate_per_hour: number;
  pph21_enabled: boolean;
  office_lat: number | null;
  office_lng: number | null;
  attendance_radius_m: number | null;
  attendance_pin_required: boolean;
};

export default function SettingsForm({
  businessId,
  settings,
}: {
  businessId: string;
  settings: BusinessSettings;
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    updateBusinessSettings(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [officeLat, setOfficeLat] = useState(settings.office_lat?.toString() ?? "");
  const [officeLng, setOfficeLng] = useState(settings.office_lng?.toString() ?? "");
  const [radius, setRadius] = useState(settings.attendance_radius_m?.toString() ?? "");
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  function fillCurrentLocation() {
    setLocateError(null);
    if (!navigator.geolocation) {
      setLocateError("Browser ini tidak mendukung lokasi.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOfficeLat(pos.coords.latitude.toFixed(6));
        setOfficeLng(pos.coords.longitude.toFixed(6));
        if (!radius) setRadius("100");
        setLocating(false);
      },
      () => {
        setLocateError("Gagal membaca lokasi — izinkan akses lokasi di browser.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Info Bisnis</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Nama Bisnis</label>
            <input
              name="name"
              required
              defaultValue={settings.name}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Alamat</label>
              <input
                name="address"
                defaultValue={settings.address ?? ""}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Telepon</label>
              <input
                name="phone"
                defaultValue={settings.phone ?? ""}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Jam Kerja Default</h2>
        <p className="mb-3 text-xs text-zinc-400">
          Dipakai untuk hitung telat &amp; lembur otomatis saat karyawan absen selfie.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Jam Masuk</label>
            <input
              name="work_start_time"
              type="time"
              defaultValue={settings.work_start_time.slice(0, 5)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Jam Pulang</label>
            <input
              name="work_end_time"
              type="time"
              defaultValue={settings.work_end_time.slice(0, 5)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-zinc-800">Keamanan Absen Selfie</h2>
        <p className="mb-3 text-xs text-zinc-400">
          Batasi absen hanya dari sekitar lokasi kerja. Kosongkan ketiga kolom lokasi untuk
          mematikan pembatasan.
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Latitude</label>
              <input
                name="office_lat"
                inputMode="decimal"
                value={officeLat}
                onChange={(e) => setOfficeLat(e.target.value)}
                placeholder="-6.200000"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Longitude</label>
              <input
                name="office_lng"
                inputMode="decimal"
                value={officeLng}
                onChange={(e) => setOfficeLng(e.target.value)}
                placeholder="106.816666"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Radius (meter)</label>
              <input
                name="attendance_radius_m"
                type="number"
                min={10}
                max={10000}
                step={1}
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="100"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fillCurrentLocation}
              disabled={locating}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              {locating ? "Membaca lokasi…" : "Pakai lokasi saya sekarang"}
            </button>
            <span className="text-[11px] text-zinc-400">
              Tekan saat berada di lokasi kerja. Radius 100–200 m disarankan karena akurasi GPS
              di dalam gedung bisa meleset puluhan meter.
            </span>
          </div>
          {locateError && <p className="text-xs text-red-600">{locateError}</p>}
          <label className="flex items-start gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              name="attendance_pin_required"
              defaultChecked={settings.attendance_pin_required}
              className="mt-0.5 rounded"
            />
            <span>
              Wajibkan PIN absen untuk semua karyawan.
              <br />
              <span className="text-xs text-zinc-400">
                PIN dipasang per karyawan di halaman Karyawan. Kalau dicentang, karyawan yang belum
                punya PIN tidak bisa absen selfie. Kalau tidak dicentang, PIN hanya diminta dari
                karyawan yang sudah punya PIN.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Aturan Payroll</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Mode Potongan Izin Tanpa Keterangan
            </label>
            <select
              name="izin_deduction_mode"
              defaultValue={settings.izin_deduction_mode}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              <option value="flat">Flat (nominal tetap per hari)</option>
              <option value="full_day">Proporsional (1 hari gaji penuh)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Potongan Izin — Hari Kerja (Rp)
              </label>
              <input
                name="izin_deduction_weekday"
                type="number"
                min={0}
                step={1000}
                defaultValue={settings.izin_deduction_weekday}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Potongan Izin — Akhir Pekan (Rp)
              </label>
              <input
                name="izin_deduction_weekend"
                type="number"
                min={0}
                step={1000}
                defaultValue={settings.izin_deduction_weekend}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Potongan Telat / kejadian (Rp)
              </label>
              <input
                name="late_deduction_per_occurrence"
                type="number"
                min={0}
                step={1000}
                defaultValue={settings.late_deduction_per_occurrence}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Tarif Lembur Default / jam (Rp)
              </label>
              <input
                name="lembur_rate_per_hour"
                type="number"
                min={0}
                step={1000}
                defaultValue={settings.lembur_rate_per_hour}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Pajak (PPh 21)</h2>
        <label className="flex items-start gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            name="pph21_enabled"
            defaultChecked={settings.pph21_enabled}
            className="mt-0.5 rounded"
          />
          <span>
            Aktifkan potongan PPh 21 otomatis (metode TER) di setiap slip gaji baru.
            <br />
            <span className="text-xs text-amber-600">
              Opsional — kalau dinyalakan, isi Status PTKP tiap karyawan di halaman Karyawan.
              Perhitungan pakai tabel TER (PMK 168/2023), disederhanakan (tanpa rekonsiliasi
              tahunan Desember) — verifikasi ke akuntan/konsultan pajak sebelum dipakai untuk
              pelaporan pajak sungguhan.
            </span>
          </span>
        </label>
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan Pengaturan"}
      </button>
    </form>
  );
}
