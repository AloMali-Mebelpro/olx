"use client";

import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export default function FavoriteButton({
  listingId,
  size = "md",
}: {
  listingId: string;
  size?: "sm" | "md";
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(isFavorite(listingId));
  }, [listingId]);

  const dimensions = size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-lg";

  return (
    <button
      type="button"
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(toggleFavorite(listingId));
      }}
      className={`${dimensions} flex items-center justify-center rounded-full border transition-colors ${
        active
          ? "border-amber-400 bg-amber-400 text-white"
          : "border-zinc-300 bg-white/90 text-zinc-500 hover:border-amber-400 hover:text-amber-500 dark:border-zinc-700 dark:bg-zinc-900/90"
      }`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
