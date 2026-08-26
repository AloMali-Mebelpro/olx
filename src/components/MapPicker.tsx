"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: typeof google;
    __mapPickerCallbacks?: Array<() => void>;
  }
}

type LatLng = { lat: number; lng: number };

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER: LatLng = { lat: 34.5553, lng: 69.2075 }; // Kabul, adjust as needed

let loaderPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export default function MapPicker({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (value: LatLng) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<google.maps.Map | null>(null);
  const markerObj = useRef<google.maps.Marker | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    GOOGLE_MAPS_KEY ? "loading" : "idle"
  );

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY) return;

    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;
        const center = value ?? DEFAULT_CENTER;

        const map = new window.google!.maps.Map(mapRef.current, {
          center,
          zoom: value ? 15 : 6,
        });
        const marker = new window.google!.maps.Marker({
          position: center,
          map,
          draggable: true,
        });

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) onChange({ lat: pos.lat(), lng: pos.lng() });
        });

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          marker.setPosition(e.latLng);
          onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });

        mapObj.current = map;
        markerObj.current = marker;
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="flex flex-col gap-2 rounded border border-dashed border-zinc-300 p-3 text-sm text-zinc-500 dark:border-zinc-700">
        <p>
          Карта недоступна: не настроен Google Maps API ключ. Укажите координаты
          вручную.
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            placeholder="Широта (lat)"
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={value?.lat ?? ""}
            onChange={(e) =>
              onChange({ lat: Number(e.target.value), lng: value?.lng ?? 0 })
            }
          />
          <input
            type="number"
            step="any"
            placeholder="Долгота (lng)"
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={value?.lng ?? ""}
            onChange={(e) =>
              onChange({ lat: value?.lat ?? 0, lng: Number(e.target.value) })
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={mapRef}
        className="h-64 w-full rounded border border-zinc-300 dark:border-zinc-700"
      />
      {status === "loading" && (
        <p className="text-xs text-zinc-500">Загрузка карты...</p>
      )}
      <p className="text-xs text-zinc-500">
        Кликните на карту или перетащите метку, чтобы указать точный адрес.
      </p>
    </div>
  );
}
