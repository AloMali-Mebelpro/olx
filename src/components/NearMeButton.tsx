"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function NearMeButton({ active }: { active: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function findNearby() {
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается вашим браузером");
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", String(pos.coords.latitude));
        params.set("lng", String(pos.coords.longitude));
        router.push(`/?${params.toString()}`);
      },
      () => {
        setLoading(false);
        setError("Не удалось определить местоположение");
      }
    );
  }

  function clearNearby() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lat");
    params.delete("lng");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={active ? clearNearby : findNearby}
        disabled={loading}
        className={`rounded-full border px-3 py-1 text-xs disabled:opacity-50 ${
          active
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-zinc-300 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
        }`}
      >
        📍 {loading ? "Определяем..." : active ? "Рядом со мной" : "Рядом со мной"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
