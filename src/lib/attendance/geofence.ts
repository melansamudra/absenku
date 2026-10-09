// Jarak dua titik GPS (meter) pakai rumus haversine — cukup akurat untuk
// radius kantor puluhan–ribuan meter.
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type GeofenceSpot = { lat: number; lng: number; radiusM: number };

// Cek apakah titik berada dalam radius SALAH SATU lokasi kerja. `nearest`
// dipakai untuk pesan error (lokasi terdekat + jaraknya). Daftar kosong =
// geofence tidak aktif (selalu lolos).
export function checkGeofence(
  point: { lat: number; lng: number },
  spots: GeofenceSpot[],
): { ok: boolean; nearest: { distance: number; radiusM: number } | null } {
  if (spots.length === 0) return { ok: true, nearest: null };
  let nearest: { distance: number; radiusM: number } | null = null;
  for (const s of spots) {
    const distance = distanceMeters(point, s);
    if (distance <= s.radiusM) return { ok: true, nearest: { distance, radiusM: s.radiusM } };
    if (!nearest || distance - s.radiusM < nearest.distance - nearest.radiusM) {
      nearest = { distance, radiusM: s.radiusM };
    }
  }
  return { ok: false, nearest };
}
