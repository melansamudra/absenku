"use client";

import { useEffect, useRef } from "react";
import type { CircleMarker, FeatureGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair } from "lucide-react";

type Point = { lat: number; lng: number };
type Spot = Point & { radiusM: number };

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38"><path d="M14 0C6.3 0 0 6.1 0 13.7 0 24 14 38 14 38s14-14 14-24.3C28 6.1 21.7 0 14 0z" fill="#dc2626"/><circle cx="14" cy="13.5" r="5" fill="#fff"/></svg>`;

// Peta lokasi kerja (OpenStreetMap): pin + lingkaran radius tiap lokasi, titik biru = posisi karyawan.
export default function OfficeMap({ spots, user }: { spots: Spot[]; user: Point | null }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const userDot = useRef<CircleMarker | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const area = useRef<FeatureGroup | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !el.current || map.current || spots.length === 0) return;
      leaflet.current = L;
      const m = L.map(el.current, { zoomControl: false, attributionControl: true }).setView([spots[0].lat, spots[0].lng], 17);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
      const group = L.featureGroup().addTo(m);
      for (const s of spots) {
        L.circle([s.lat, s.lng], { radius: s.radiusM, color: "#3b82f6", weight: 1.5, fillColor: "#60a5fa", fillOpacity: 0.3 }).addTo(group);
        L.marker([s.lat, s.lng], { icon: L.divIcon({ html: PIN_SVG, className: "", iconSize: [28, 38], iconAnchor: [14, 38] }), interactive: false }).addTo(group);
      }
      area.current = group;
      map.current = m;
      m.fitBounds(group.getBounds(), { padding: [30, 30], maxZoom: 18 });
      if (user) {
        userDot.current = L.circleMarker([user.lat, user.lng], { radius: 9, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }).addTo(m);
      }
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      userDot.current = null;
    };
    // peta dibuat sekali; posisi karyawan ditangani effect di bawah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const L = leaflet.current;
    const m = map.current;
    if (!L || !m || !user) return;
    if (userDot.current) userDot.current.setLatLng([user.lat, user.lng]);
    else userDot.current = L.circleMarker([user.lat, user.lng], { radius: 9, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }).addTo(m);
  }, [user]);

  function recenter() {
    const m = map.current;
    if (!m) return;
    if (user) m.flyTo([user.lat, user.lng], Math.max(m.getZoom(), 17), { duration: 0.6 });
    else if (area.current) m.fitBounds(area.current.getBounds(), { padding: [30, 30], maxZoom: 18 });
  }

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="h-full w-full" />
      <button
        type="button"
        onClick={recenter}
        aria-label="Ke lokasi saya"
        className="absolute bottom-10 right-3 z-[500] flex h-12 w-12 items-center justify-center rounded-full bg-white text-sky-900 shadow-lg active:bg-zinc-100"
      >
        <Crosshair className="h-6 w-6" />
      </button>
    </div>
  );
}
