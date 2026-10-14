import { createServiceClient } from "@/lib/supabase/service";
import { purgeSelfies, selfieRetentionCutoff } from "@/lib/attendance/selfie";

// Dipanggil Vercel Cron (lihat vercel.json) — hapus foto selfie yang tanggal
// absennya sudah lewat SELFIE_RETENTION_DAYS hari tapi belum disetujui.
// Vercel mengirim `Authorization: Bearer $CRON_SECRET`.
const BATCH = 200;
const MAX_BATCHES = 20;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const cutoff = selfieRetentionCutoff();
  let deleted = 0;

  for (let i = 0; i < MAX_BATCHES; i++) {
    const { data, error } = await supabase
      .from("attendance")
      .select("id, check_in_photo_url, check_out_photo_url")
      .lt("date", cutoff)
      .or("check_in_photo_url.not.is.null,check_out_photo_url.not.is.null")
      .limit(BATCH);
    if (error || !data || data.length === 0) break;

    const n = await purgeSelfies(supabase, data);
    if (n === 0) break; // gagal hapus — jangan loop terus
    deleted += n;
    if (data.length < BATCH) break;
  }

  return Response.json({ ok: true, cutoff, deleted });
}
