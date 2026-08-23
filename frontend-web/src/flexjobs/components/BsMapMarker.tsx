import { MapPin, Navigation } from "lucide-react";

export function BsUserMapMarker() {
  return (
    <span className="fj-map-marker fj-map-marker--user" aria-hidden="true">
      <Navigation size={12} strokeWidth={2.5} />
    </span>
  );
}

export function BsTechnicianMapMarker({ color = "var(--fj-cta-bg)" }: { color?: string }) {
  return (
    <span
      className="fj-map-marker fj-map-marker--tech"
      style={{ backgroundColor: color, color: "#fff" }}
      aria-hidden="true"
    >
      <MapPin size={14} strokeWidth={2.25} fill="currentColor" />
    </span>
  );
}

export function BsAreaMapMarker() {
  return (
    <span className="fj-map-marker fj-map-marker--area" aria-hidden="true">
      <MapPin size={16} strokeWidth={2.25} fill="currentColor" />
    </span>
  );
}
