import { Megaphone, Pin } from "lucide-react";
import { announcementCategoryLabel } from "@/lib/announcements/categories";
import type { PortalAnnouncement } from "@/lib/portal/announcements";
import { PortalCard } from "./portal-ui";
import { Badge, fmtDate } from "./ui";

const TONE: Record<string, "green" | "amber" | "red" | "zinc"> = { info: "zinc", penting: "red", libur: "green", acara: "amber" };

// Satu pengumuman; `compact` memotong isi jadi 2 baris (untuk Beranda).
export default function AnnouncementCard({ item, compact = false }: { item: PortalAnnouncement; compact?: boolean }) {
  const date = new Date(item.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  return (
    <PortalCard>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-portal-50 text-portal-600">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={TONE[item.category] ?? "zinc"}>{announcementCategoryLabel(item.category)}</Badge>
            {item.isNew && <Badge tone="green">Baru</Badge>}
            {item.pinned && <Pin className="h-3.5 w-3.5 text-zinc-400" aria-label="Disematkan" />}
          </div>
          <h3 className="mt-1.5 text-sm font-semibold text-zinc-900">{item.title}</h3>
          {item.body && <p className={`mt-1 whitespace-pre-wrap text-sm text-zinc-600 ${compact ? "line-clamp-2" : ""}`}>{item.body}</p>}
          <p className="mt-2 text-[11px] text-zinc-400">{fmtDate(date, { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>
    </PortalCard>
  );
}
