// Pembersih sekali jalan untuk foto selfie lama (sebelum fitur retensi aktif).
// Menghapus file di bucket `attendance-selfies` + mengosongkan kolom path-nya
// untuk presensi yang (a) sudah disetujui admin, atau (b) tanggalnya lebih tua
// dari RETENTION_DAYS hari. Aturan sama dengan src/lib/attendance/selfie.ts.
//
// Default DRY-RUN (hanya menghitung). Tambahkan --apply untuk benar-benar menghapus.
//
//   node --env-file=.env.local scripts/purge-old-selfies.mjs
//   node --env-file=.env.local scripts/purge-old-selfies.mjs --apply
//
// Butuh NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from "@supabase/supabase-js";

const RETENTION_DAYS = 30;
const BATCH = 200;
const apply = process.argv.includes("--apply");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi.");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const cutoffDate = new Date();
cutoffDate.setUTCDate(cutoffDate.getUTCDate() - RETENTION_DAYS);
const cutoff = cutoffDate.toISOString().slice(0, 10);

const hasPhoto = "check_in_photo_url.not.is.null,check_out_photo_url.not.is.null";
const cols = "id, check_in_photo_url, check_out_photo_url";

async function fetchBatch(kind, after) {
  let q = supabase.from("attendance").select(cols).or(hasPhoto).order("id").limit(BATCH);
  q = kind === "approved" ? q.eq("verified_by_admin", true) : q.lt("date", cutoff);
  if (after) q = q.gt("id", after);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

async function run(kind, label) {
  let rows = 0;
  let files = 0;
  let after = null;
  for (;;) {
    const batch = await fetchBatch(kind, after);
    if (batch.length === 0) break;
    const paths = batch.flatMap((r) => [r.check_in_photo_url, r.check_out_photo_url]).filter(Boolean);
    if (apply) {
      const { error } = await supabase.storage.from("attendance-selfies").remove(paths);
      if (error) throw new Error(`Gagal hapus file (${label}): ${error.message}`);
      const { error: upErr } = await supabase
        .from("attendance")
        .update({ check_in_photo_url: null, check_out_photo_url: null })
        .in("id", batch.map((r) => r.id));
      if (upErr) throw new Error(`Gagal update kolom (${label}): ${upErr.message}`);
      // Baris yang sudah dikosongkan tidak muncul lagi, jadi tidak perlu cursor.
    } else {
      after = batch[batch.length - 1].id; // dry-run: baris tidak berubah, pakai cursor
    }
    rows += batch.length;
    files += paths.length;
    if (batch.length < BATCH) break;
  }
  console.log(`${label}: ${rows} presensi, ${files} file ${apply ? "dihapus" : "akan dihapus"}`);
}

console.log(apply ? "MODE APPLY — menghapus sungguhan." : "MODE DRY-RUN — tidak ada yang dihapus. Tambahkan --apply untuk menghapus.");
console.log(`Batas umur: tanggal absen < ${cutoff}`);
await run("approved", "Sudah disetujui");
await run("old", `Lebih tua dari ${RETENTION_DAYS} hari`);
