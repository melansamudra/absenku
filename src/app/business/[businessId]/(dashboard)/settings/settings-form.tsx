"use client";

import { useActionState, useState } from "react";
import { updateBusinessSettings, type ActionState } from "./actions";
import { JKK_RATE_OPTIONS } from "@/lib/payroll/bpjs";

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
  bpjs_enabled: boolean;
  bpjs_jkk_rate: number;
  bpjs_jp_wage_cap: number;
  bpjs_kesehatan_wage_cap: number;
  overtime_approval_required: boolean;
  overtime_min_minutes: number;
  overtime_rounding_minutes: number;
  overtime_max_hours: number;
  overtime_rate_mode: "flat" | "pp35";
  work_days_per_week: 5 | 6;
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
        <h2 className="mb-1 text-sm font-semibold text-zinc-800">Lembur</h2>
        <p className="mb-3 text-xs text-zinc-400">
          Lembur otomatis = waktu setelah jam pulang jadwal, tapi hanya kalau total jam kerja sudah
          melebihi durasi shift (karyawan yang telat harus menutup telatnya dulu).
        </p>
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Minimum (menit)</label>
            <input
              name="overtime_min_minutes"
              type="number"
              min={0}
              max={240}
              step={1}
              defaultValue={settings.overtime_min_minutes}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Dibulatkan per</label>
            <select
              name="overtime_rounding_minutes"
              defaultValue={String(settings.overtime_rounding_minutes)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              <option value="1">1 menit</option>
              <option value="15">15 menit</option>
              <option value="30">30 menit</option>
              <option value="60">1 jam</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Maks. / hari (jam)</label>
            <input
              name="overtime_max_hours"
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              defaultValue={settings.overtime_max_hours}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <p className="-mt-2 mb-4 text-[11px] text-zinc-400">
          Contoh default: lembur di bawah 30 menit tidak dihitung, 1 jam 40 menit dihitung 1,5 jam,
          maksimal 4 jam/hari (PP 35/2021). Berlaku untuk absen pulang berikutnya.
        </p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Cara hitung upah lembur</label>
            <select
              name="overtime_rate_mode"
              defaultValue={settings.overtime_rate_mode}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              <option value="flat">Flat — jam × tarif lembur/jam</option>
              <option value="pp35">PP 35/2021 — 1/173 upah, 1,5× lalu 2×</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Hari kerja / minggu</label>
            <select
              name="work_days_per_week"
              defaultValue={String(settings.work_days_per_week)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              <option value="6">6 hari</option>
              <option value="5">5 hari</option>
            </select>
          </div>
        </div>
        <p className="-mt-2 mb-4 text-[11px] text-zinc-400">
          PP 35/2021: upah sejam = (gaji bulanan + tunjangan tetap) ÷ 173; karyawan harian pakai gaji
          harian × 25 (6 hari kerja) atau × 21 (5 hari kerja). Jam pertama tiap hari 1,5×, jam
          berikutnya 2×. Lembur di hari libur tetap dihitung seperti hari kerja (penyederhanaan).
        </p>

        <label className="flex items-start gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            name="overtime_approval_required"
            defaultChecked={settings.overtime_approval_required}
            className="mt-0.5 rounded"
          />
          <span>
            Lembur harus diajukan karyawan &amp; disetujui admin.
            <br />
            <span className="text-xs text-zinc-400">
              Kalau dicentang, jam lembur TIDAK lagi dihitung otomatis dari jam absen pulang.
              Karyawan mengajukan lembur lewat Portal Karyawan, dan jam lembur baru masuk ke payroll
              setelah disetujui di menu Lembur. Kalau tidak dicentang, lembur dihitung otomatis
              seperti biasa.
            </span>
          </span>
        </label>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">BPJS</h2>
        <label className="mb-3 flex items-start gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            name="bpjs_enabled"
            defaultChecked={settings.bpjs_enabled}
            className="mt-0.5 rounded"
          />
          <span>
            Hitung iuran BPJS otomatis di setiap slip gaji baru.
            <br />
            <span className="text-xs text-zinc-400">
              Bagian karyawan (Kesehatan 1%, JHT 2%, JP 1%) memotong gaji; bagian perusahaan
              (Kesehatan 4%, JHT 3,7%, JP 2%, JKK, JKM 0,3%) dicatat di slip sebagai informasi.
              Kepesertaan & upah dasar per karyawan diatur di halaman Karyawan.
            </span>
          </span>
        </label>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Tarif JKK (tingkat risiko lingkungan kerja)
            </label>
            <select
              name="bpjs_jkk_rate"
              defaultValue={String(settings.bpjs_jkk_rate)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              {JKK_RATE_OPTIONS.map((o) => (
                <option key={o.value} value={String(o.value)}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Batas Upah JP (Rp)
              </label>
              <input
                name="bpjs_jp_wage_cap"
                type="number"
                min={1}
                step={1}
                defaultValue={settings.bpjs_jp_wage_cap}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Batas Upah BPJS Kesehatan (Rp)
              </label>
              <input
                name="bpjs_kesehatan_wage_cap"
                type="number"
                min={1}
                step={1}
                defaultValue={settings.bpjs_kesehatan_wage_cap}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-amber-600">
            Batas upah JP naik tiap Maret sesuai pengumuman BPJS Ketenagakerjaan — perbarui angka di
            atas setiap tahun. Batas bawah (UMK) tidak diterapkan otomatis. Verifikasi ke BPJS /
            konsultan sebelum dipakai untuk pembayaran iuran sungguhan.
          </p>
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
