"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/ListingCard";
import { getFavorites } from "@/lib/favorites";
import { useLocale } from "@/lib/i18n/client";
import type { Category, Listing } from "@prisma/client";

type ListingWithCategory = Listing & { category: Category };

export default function FavoritesPage() {
  const { dict } = useLocale();
  const [listings, setListings] = useState<ListingWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const ids = getFavorites();
    if (ids.length === 0) {
      setListings([]);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/listings");
    const all: ListingWithCategory[] = await res.json();
    setListings(all.filter((l) => ids.includes(l.id)));
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const handler = () => load();
    window.addEventListener("favorites-changed", handler);
    return () => window.removeEventListener("favorites-changed", handler);
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{dict.favoritesPage.title}</h1>
      {loading ? (
        <p className="text-zinc-500">{dict.favoritesPage.loading}</p>
      ) : listings.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">
          {dict.favoritesPage.empty}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
