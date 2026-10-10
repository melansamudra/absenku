// Papan Informasi — kategori dan label, dipakai halaman admin dan portal.
export const ANNOUNCEMENT_CATEGORIES = [
  { value: "info", label: "Info" },
  { value: "penting", label: "Penting" },
  { value: "libur", label: "Libur" },
  { value: "acara", label: "Acara" },
] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number]["value"];

export const isAnnouncementCategory = (v: string): v is AnnouncementCategory => ANNOUNCEMENT_CATEGORIES.some((c) => c.value === v);

export const announcementCategoryLabel = (v: string) => ANNOUNCEMENT_CATEGORIES.find((c) => c.value === v)?.label ?? "Info";
