import { useEffect, useRef } from "react";
import L from "leaflet";
// leaflet CSS is imported in main.tsx

interface MapMarker {
  city: string;
  lat: number;
  lng: number;
}

interface SaudiMapProps {
  markers: MapMarker[];
  className?: string;
}

const SAUDI_CENTER = { lat: 23.8859, lng: 45.0792 };
const SAUDI_BOUNDS: [[number, number], [number, number]] = [
  [16.0, 34.5],
  [32.5, 56.0]
];

export function SaudiMap({ markers, className = "" }: SaudiMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [SAUDI_CENTER.lat, SAUDI_CENTER.lng],
      zoom: 5,
      minZoom: 4,
      maxZoom: 12,
      maxBounds: SAUDI_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    markers.forEach((marker) => {
      const customIcon = L.divIcon({
        className: "custom-pin",
        html: `
          <div class="relative">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card text-foreground text-xs px-2 py-1 rounded shadow border">
              ${marker.city}
            </div>
          </div>
        `,
        iconSize: [32, 48],
        iconAnchor: [16, 40],
      });

      L.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(
        markersLayerRef.current!
      );
    });

    if (markers.length > 0) {
      const lastMarker = markers[markers.length - 1];
      mapInstanceRef.current.flyTo([lastMarker.lat, lastMarker.lng], 7, {
        duration: 1.5,
      });
    }
  }, [markers]);

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: "200px" }}
      data-testid="saudi-map"
    />
  );
}
