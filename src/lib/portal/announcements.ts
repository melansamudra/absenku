import type { createServiceClient } from "@/lib/supabase/service";
import { todayWib } from "@/lib/portal/dates";

export type PortalAnnouncement = {
  id: string;
  title: string;
  body: string | null;
  category: string;
  pinned: boolean;
  createdAt: string;
  isNew: boolean;
};

const NEW_DAYS = 3;

// Pengumuman yang masih berlaku (belum lewat tanggal berakhir), yang disematkan
// di atas. Toleran: tabel belum ada → daftar kosong. Wajib di-scope ke bisnis
// dari sesi portal yang sudah diverifikasi.
export async function loadAnnouncements(
  supabase: ReturnType<typeof createServiceClient>,
  businessId: string,
  limit = 30,
): Promise<PortalAnnouncement[]> {
  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, category, pinned, created_at")
    .eq("business_id", businessId)
    .or(`expires_at.is.null,expires_at.gte.${todayWib()}`)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  const now = Date.now();
  return (data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    category: a.category,
    pinned: a.pinned,
    createdAt: a.created_at,
    isNew: now - new Date(a.created_at).getTime() < NEW_DAYS * 86400000,
  }));
}
