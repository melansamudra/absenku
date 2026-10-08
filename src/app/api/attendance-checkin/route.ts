import { createServiceClient } from "@/lib/supabase/service";
import { checkEmployeePin } from "@/lib/attendance/pin-check";
import { distanceMeters } from "@/lib/attendance/geofence";
import { computeOvertimeHours } from "@/lib/payroll/overtime";

// Karyawan tidak login (buka link publik pakai slug), jadi tidak ada session
// buat di-scope lewat RLS biasa — service-role client dipakai di sini karena
// genuinely tidak ada user session, bukan shortcut untuk bypass RLS. Business
// & employee tetap divalidasi manual sebelum tulis apa pun (slug adalah token
// akses acak, employeeId harus benar-benar milik business yang sama & aktif).

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const REPORT_TIMEZONE = "Asia/Jakarta";

function todayWib() {
  return new Date().toLocaleDateString("en-CA", { timeZone: REPORT_TIMEZONE });
}

// Aritmatika murni di atas string YYYY-MM-DD (bukan geser Date "now" yang
// terikat timezone server) — dipakai untuk cari record H-1 saat shift lewat
// tengah malam.
function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function nowWibMinutesOfDay() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: REPORT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

function timeStrToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function nowWibTimeLabel() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: REPORT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

type AttendanceRow = {
  id: string;
  date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  shift_template_id: string | null;
};

// Sumber logic TUNGGAL buat "record attendance mana yang lagi relevan buat
// karyawan ini sekarang" — dipakai POST (proses absen) dan GET (cek status
// buat UI) supaya keduanya tidak pernah punya pemahaman "tanggal" yang beda.
// Shift sore yang jam pulangnya lewat tengah malam bikin absen-masuknya
// tersimpan di tanggal KEMARIN dari sudut pandang jam dinding saat ini —
// makanya selalu cek 2 hari (hari ini + kemarin), bukan cuma hari ini.
async function loadAttendanceContext(
  supabase: ReturnType<typeof createServiceClient>,
  businessId: string,
  employeeId: string,
) {
  const date = todayWib();
  const previousDate = addDaysToDateString(date, -1);

  const { data: rows } = await supabase
    .from("attendance")
    .select("id, date, check_in_at, check_out_at, shift_template_id")
    .eq("business_id", businessId)
    .eq("employee_id", employeeId)
    .in("date", [date, previousDate]);

  const attendanceRows = (rows ?? []) as AttendanceRow[];
  const todayRow = attendanceRows.find((r) => r.date === date) ?? null;
  const previousRow = attendanceRows.find((r) => r.date === previousDate) ?? null;
  const previousOpenRow =
    previousRow && previousRow.check_in_at && !previousRow.check_out_at ? previousRow : null;
  const todayIsOpen = !!(todayRow?.check_in_at && !todayRow?.check_out_at);
  // Baris yang MASIH TERBUKA buat dipasangkan absen-pulang — entah itu baris
  // hari ini, atau baris kemarin yang belum ditutup (shift lewat tengah malam).
  const openRow = todayIsOpen ? todayRow : (previousOpenRow ?? todayRow);

  return { date, previousDate, todayRow, openRow };
}

async function resolveShift(
  supabase: ReturnType<typeof createServiceClient>,
  businessId: string,
  employeeId: string,
  date: string,
  fallback: { start_time: string; end_time: string },
) {
  const { data: assignment } = await supabase
    .from("employee_shift_assignments")
    .select("shift_template_id, shift_templates(start_time, end_time)")
    .eq("business_id", businessId)
    .eq("employee_id", employeeId)
    .eq("date", date)
    .maybeSingle();

  const template = assignment?.shift_templates as unknown as
    | { start_time: string; end_time: string }
    | null;

  if (assignment && template) {
    return { shiftTemplateId: assignment.shift_template_id as string, start: template.start_time, end: template.end_time };
  }
  return { shiftTemplateId: null as string | null, start: fallback.start_time, end: fallback.end_time };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const employeeId = url.searchParams.get("employeeId");

  if (!slug || !employeeId) {
    return Response.json({ ok: false, error: "Data tidak lengkap." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("attendance_qr_slug", slug)
    .maybeSingle();
  if (!business) {
    return Response.json({ ok: false, error: "Link absen tidak valid." }, { status: 404 });
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("id", employeeId)
    .eq("business_id", business.id)
    .eq("active", true)
    .maybeSingle();
  if (!employee) {
    return Response.json({ ok: false, error: "Karyawan tidak ditemukan/tidak aktif." }, { status: 404 });
  }

  const { openRow } = await loadAttendanceContext(supabase, business.id, employeeId);

  return Response.json({
    ok: true,
    checkedIn: !!openRow?.check_in_at,
    checkInAt: openRow?.check_in_at ?? null,
    checkedOut: !!openRow?.check_out_at,
    checkOutAt: openRow?.check_out_at ?? null,
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = formData.get("slug") as string | null;
  const employeeId = formData.get("employeeId") as string | null;
  const action = formData.get("action") as string | null;
  const file = formData.get("photo") as File | null;
  const latRaw = formData.get("lat") as string | null;
  const lngRaw = formData.get("lng") as string | null;
  const pin = ((formData.get("pin") as string | null) ?? "").trim();
  const latNum = latRaw ? Number(latRaw) : NaN;
  const lngNum = lngRaw ? Number(lngRaw) : NaN;
  const hasLocation = Number.isFinite(latNum) && Number.isFinite(lngNum);
  const lat = hasLocation ? latNum : null;
  const lng = hasLocation ? lngNum : null;

  if (!slug || !employeeId || (action !== "in" && action !== "out")) {
    return Response.json({ ok: false, error: "Data tidak lengkap." }, { status: 400 });
  }
  if (!file) {
    return Response.json({ ok: false, error: "Foto selfie wajib diisi." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ ok: false, error: "Ukuran foto maksimal 3 MB." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ ok: false, error: "Format foto harus JPG, PNG, atau WEBP." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, work_start_time, work_end_time, office_lat, office_lng, attendance_radius_m, attendance_pin_required, overtime_approval_required, overtime_min_minutes, overtime_rounding_minutes, overtime_max_hours",
    )
    .eq("attendance_qr_slug", slug)
    .maybeSingle();
  if (!business) {
    return Response.json({ ok: false, error: "Link absen tidak valid." }, { status: 404 });
  }

  const [{ data: employee }, { date, previousDate, todayRow, openRow }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name, attendance_pin_hash")
      .eq("id", employeeId)
      .eq("business_id", business.id)
      .eq("active", true)
      .maybeSingle(),
    loadAttendanceContext(supabase, business.id, employeeId),
  ]);

  if (!employee) {
    return Response.json({ ok: false, error: "Karyawan tidak ditemukan/tidak aktif." }, { status: 404 });
  }

  // Cooldown 5 detik per karyawan — proteksi spam sederhana (bukan infra
  // rate-limit eksternal) supaya bot/klik-berulang tidak membanjiri upload
  // foto sebelum baris attendance-nya sempat ada untuk di-short-circuit oleh
  // pengecekan "sudah absen" di bawah.
  const { data: recentSubmission } = await supabase
    .from("public_submission_log")
    .select("id")
    .eq("business_id", business.id)
    .eq("kind", "absen")
    .eq("employee_id", employeeId)
    .gte("created_at", new Date(Date.now() - 5000).toISOString())
    .limit(1)
    .maybeSingle();

  if (recentSubmission) {
    return Response.json({ ok: false, error: "Terlalu cepat, tunggu sebentar." }, { status: 429 });
  }

  await supabase
    .from("public_submission_log")
    .insert({ business_id: business.id, kind: "absen", employee_id: employeeId });

  // PIN absen — dicek SETELAH cooldown di atas, supaya tiap tebakan PIN juga
  // kena jeda 5 detik, dan ditambah kunci sementara setelah beberapa kali salah
  // (lib/attendance/pin-check.ts).
  if (employee.attendance_pin_hash) {
    const pinCheck = await checkEmployeePin(
      supabase,
      business.id,
      employeeId,
      employee.attendance_pin_hash,
      pin,
    );
    if (!pinCheck.ok) {
      return Response.json({ ok: false, error: pinCheck.error }, { status: pinCheck.status });
    }
  } else if (business.attendance_pin_required) {
    return Response.json(
      { ok: false, error: "Kamu belum punya PIN absen. Minta admin memasangkan PIN dulu." },
      { status: 403 },
    );
  }

  // Geofence — aktif hanya kalau titik kantor & radius sudah diisi di
  // Pengaturan. Lokasi dari browser tetap bisa dipalsukan oleh pengguna yang
  // niat (GPS spoofing), tapi ini menutup kasus umum absen dari rumah.
  if (
    business.office_lat !== null &&
    business.office_lng !== null &&
    business.attendance_radius_m !== null
  ) {
    if (lat === null || lng === null) {
      return Response.json(
        { ok: false, error: "Lokasi wajib aktif untuk absen. Izinkan akses lokasi di browser lalu coba lagi." },
        { status: 400 },
      );
    }
    const distance = distanceMeters(
      { lat, lng },
      { lat: Number(business.office_lat), lng: Number(business.office_lng) },
    );
    if (distance > business.attendance_radius_m) {
      return Response.json(
        {
          ok: false,
          error: `Kamu berada sekitar ${Math.round(distance)} m dari lokasi kerja (batas ${business.attendance_radius_m} m). Absen hanya bisa dilakukan di lokasi kerja.`,
        },
        { status: 403 },
      );
    }
  }

  // "Sudah absen masuk hari ini?" HARUS murni lihat baris hari ini (todayRow)
  // — tapi absen pulang harus dipasangkan ke baris yang MASIH TERBUKA
  // (openRow), entah itu baris hari ini atau baris kemarin yang belum ditutup.
  const existing = action === "in" ? todayRow : openRow;

  if (action === "in" && existing?.check_in_at) {
    return Response.json({
      ok: true,
      message: `${employee.name} sudah absen masuk hari ini jam ${new Date(existing.check_in_at).toLocaleTimeString("id-ID", { timeZone: REPORT_TIMEZONE, hour: "2-digit", minute: "2-digit" })}.`,
    });
  }
  if (action === "out" && !existing?.check_in_at) {
    return Response.json({ ok: false, error: "Belum absen masuk hari ini — absen masuk dulu." }, { status: 400 });
  }
  if (action === "out" && existing?.check_out_at) {
    return Response.json({
      ok: true,
      message: `${employee.name} sudah absen pulang hari ini jam ${new Date(existing.check_out_at).toLocaleTimeString("id-ID", { timeZone: REPORT_TIMEZONE, hour: "2-digit", minute: "2-digit" })}.`,
    });
  }

  // Jadwal shift buat absen MASUK selalu dicari dari jadwal HARI INI. Buat
  // PULANG, shift-nya diambil dari shift_template_id yang sudah tersimpan di
  // baris `existing` saat absen masuk tadi (bisa jadi jadwal kemarin) —
  // bukan query ulang berdasarkan tanggal hari ini yang salah untuk kasus
  // lewat tengah malam.
  let shiftStart = business.work_start_time;
  let shiftEnd = business.work_end_time;
  let shiftTemplateId: string | null = null;

  if (action === "in") {
    const resolved = await resolveShift(supabase, business.id, employeeId, date, {
      start_time: business.work_start_time,
      end_time: business.work_end_time,
    });
    shiftStart = resolved.start;
    shiftEnd = resolved.end;
    shiftTemplateId = resolved.shiftTemplateId;
  } else if (existing?.shift_template_id) {
    const { data: template } = await supabase
      .from("shift_templates")
      .select("start_time, end_time")
      .eq("id", existing.shift_template_id)
      .maybeSingle();
    if (template) {
      shiftStart = template.start_time;
      shiftEnd = template.end_time;
      shiftTemplateId = existing.shift_template_id;
    }
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${business.id}/${employeeId}/${date}-${action}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("attendance-selfies")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return Response.json({ ok: false, error: uploadError.message }, { status: 500 });
  }

  if (action === "in") {
    const nowMinutes = nowWibMinutesOfDay();
    const lateMinutes = Math.max(0, nowMinutes - timeStrToMinutes(shiftStart));

    const { error } = await supabase.from("attendance").upsert(
      {
        business_id: business.id,
        employee_id: employeeId,
        date,
        status: "hadir",
        late: lateMinutes > 0,
        late_minutes: lateMinutes,
        check_in_at: new Date().toISOString(),
        check_in_photo_url: path,
        check_in_lat: lat,
        check_in_lng: lng,
        shift_template_id: shiftTemplateId,
      },
      { onConflict: "employee_id,date" },
    );

    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

    const message =
      lateMinutes > 0
        ? `Absen masuk jam ${nowWibTimeLabel()} — terlambat ${lateMinutes} menit dari jadwal ${shiftStart.slice(0, 5)}.`
        : `Absen masuk jam ${nowWibTimeLabel()} — tepat waktu.`;

    return Response.json({ ok: true, message, lateMinutes });
  }

  // action === "out" — kalau baris terbuka itu dari KEMARIN (shift lewat
  // tengah malam), jam sekarang (dihitung sebagai menit-sejak-tengah-malam-
  // HARI-INI) harus ditambah 24 jam dulu supaya perbandingan ke jadwal jam
  // pulang (mis. 23:00) tidak salah jadi negatif/0.
  const crossedMidnight = existing?.date === previousDate;
  const nowMinutes = nowWibMinutesOfDay() + (crossedMidnight ? 24 * 60 : 0);
  // Lembur = min(waktu setelah jam pulang, total kerja − durasi shift), lalu
  // aturan minimum/pembulatan/batas harian bisnis — lib/payroll/overtime.ts.
  const { hours: computedOvertimeHours } = computeOvertimeHours({
    checkInAt: new Date(existing!.check_in_at!),
    checkOutAt: new Date(),
    checkOutMinutesFromShiftDay: nowMinutes,
    shiftStart,
    shiftEnd,
    rules: {
      minMinutes: business.overtime_min_minutes,
      roundingMinutes: business.overtime_rounding_minutes,
      maxHoursPerDay: Number(business.overtime_max_hours),
    },
  });
  // Mode approval lembur: jam lembur baru masuk lewat pengajuan yang disetujui
  // admin (lihat overtime_requests), jadi absen pulang tidak mengisinya.
  const overtimeHours = business.overtime_approval_required ? 0 : computedOvertimeHours;

  const { error } = await supabase
    .from("attendance")
    .update({
      check_out_at: new Date().toISOString(),
      check_out_photo_url: path,
      check_out_lat: lat,
      check_out_lng: lng,
      overtime_hours: overtimeHours,
    })
    .eq("id", existing!.id);

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  const message =
    overtimeHours > 0
      ? `Absen pulang jam ${nowWibTimeLabel()} — lembur ${overtimeHours} jam dari jadwal ${shiftEnd.slice(0, 5)}.`
      : business.overtime_approval_required && computedOvertimeHours > 0
        ? `Absen pulang jam ${nowWibTimeLabel()}. Ada lembur? Ajukan lewat Portal Karyawan supaya disetujui admin.`
        : `Absen pulang jam ${nowWibTimeLabel()}.`;

  return Response.json({ ok: true, message, overtimeHours });
}
