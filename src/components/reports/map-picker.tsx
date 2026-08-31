"use client";

import React, { useEffect, useRef, useState } from "react";
import { IconGps, IconPin } from "@/components/ui/icons";

interface MapPickerProps {
  address: string;
  latitude: string;
  longitude: string;
  onLocationChange: (loc: { address: string; latitude: string; longitude: string }) => void;
  disabled?: boolean;
}

export default function MapPicker({
  address,
  latitude,
  longitude,
  onLocationChange,
  disabled = false,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Default coordinate: Jakarta / Indonesia center
  const currentLat = latitude ? parseFloat(latitude) : -6.2088;
  const currentLng = longitude ? parseFloat(longitude) : 106.8456;

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Inject Leaflet CSS link if not already present
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (!mapInstanceRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [currentLat, currentLng],
            zoom: latitude && longitude ? 15 : 12,
            zoomControl: false,
          });

          L.control.zoom({ position: "bottomright" }).addTo(map);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(map);

          // Custom editorial SVG icon for map pin
          const pinIcon = L.divIcon({
            className: "custom-map-pin",
            html: `
              <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
                <div style="background-color: #1e4d2b; color: white; border-radius: 9999px; padding: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid #ffffff;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div style="width: 2px; height: 6px; background-color: #1e4d2b;"></div>
              </div>
            `,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
          });

          const marker = L.marker([currentLat, currentLng], {
            draggable: !disabled,
            icon: pinIcon,
          }).addTo(map);

          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onLocationChange({
              address,
              latitude: pos.lat.toFixed(6),
              longitude: pos.lng.toFixed(6),
            });
          });

          map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
            if (disabled) return;
            marker.setLatLng(e.latlng);
            onLocationChange({
              address,
              latitude: e.latlng.lat.toFixed(6),
              longitude: e.latlng.lng.toFixed(6),
            });
          });

          mapInstanceRef.current = map;
          markerRef.current = marker;
          if (isMounted) setMapLoaded(true);
        }
      } catch {
        // Fallback gracefully if leaflet fails in SSR/jsdom
      }
    }

    void initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsMessage("Perangkat Anda tidak mendukung fitur GPS.");
      return;
    }

    setIsLocating(true);
    setGpsMessage("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latStr = pos.coords.latitude.toFixed(6);
        const lngStr = pos.coords.longitude.toFixed(6);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 16);
          markerRef.current.setLatLng([pos.coords.latitude, pos.coords.longitude]);
        }

        onLocationChange({
          address: address || "Lokasi saat ini (terdeteksi via GPS)",
          latitude: latStr,
          longitude: lngStr,
        });

        setIsLocating(false);
        setGpsMessage("Lokasi GPS berhasil terdeteksi.");
      },
      () => {
        setIsLocating(false);
        setGpsMessage("Gagal mendeteksi lokasi GPS. Klik peta atau ketik alamat manual.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Map Canvas Header & GPS Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123] flex items-center gap-1.5">
            <IconPin className="h-4 w-4 text-[#1e4d2b]" />
            <span>Pilih Titik Lokasi pada Peta</span>
            <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-[#7a9a80]">
            Klik peta atau geser pin hijau untuk menandai lokasi kejadian secara presisi.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseGps}
          disabled={disabled || isLocating}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-[#cbe0ce] bg-[#f4f8f4] px-3 py-1.5 text-xs font-semibold text-[#1e4d2b] transition hover:bg-[#e5f0e6] disabled:opacity-50"
        >
          <IconGps className={`h-3.5 w-3.5 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Mencari GPS..." : "Gunakan Lokasi Saya"}</span>
        </button>
      </div>

      {gpsMessage && (
        <p className="text-xs text-[#2d6a36] bg-[#f4f8f4] p-2 rounded-lg border border-[#cbe0ce]">
          {gpsMessage}
        </p>
      )}

      {/* Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-[#c8dfc8] bg-[#fafaf5] shadow-xs">
        <div
          ref={mapContainerRef}
          data-testid="interactive-map"
          className="w-full h-64 sm:h-72 z-10"
        />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#fafaf5]/80 z-20 text-xs text-[#7a9a80]">
            <span>Memuat peta interaktif...</span>
          </div>
        )}

        {/* Selected Coordinates Pin Badge */}
        {latitude && longitude && (
          <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-[#cbe0ce] text-[11px] font-medium text-[#1e4d2b] shadow-xs flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#1e4d2b]" />
            <span>Titik Pin Terpasang</span>
          </div>
        )}
      </div>

      {/* Manual Address Description Field */}
      <div className="space-y-1.5">
        <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-[#1c4123]">
          Alamat / Patokan Lokasi Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) =>
            onLocationChange({
              address: e.target.value,
              latitude,
              longitude,
            })
          }
          placeholder="Contoh: Jl. Bojongsoang No. 45, dekat jembatan, Bandung"
          required
          disabled={disabled}
          className="w-full rounded-xl border border-[#c8dfc8] bg-white px-4 py-3 text-sm text-[#2c2926] outline-none transition focus:border-[#2d6a36] focus:bg-white"
        />
        <p className="text-[11px] text-[#7a9a80]">
          Sebutkan patokan khusus (nama jalan, jembatan, RT/RW) untuk memudahkan verifikasi tim lapangan.
        </p>
      </div>
    </div>
  );
}
