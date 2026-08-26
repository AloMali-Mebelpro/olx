import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import ListingCard from "@/components/ListingCard";
import AdSlot from "@/components/AdSlot";
import NearMeButton from "@/components/NearMeButton";
import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n/server";
import { matchScore, distanceKm } from "@/lib/search";

export const dynamic = "force-dynamic";

const SORT_OPTIONS: Record<string, Prisma.ListingOrderByWithRelationInput[]> = {
  new: [{ isPromoted: "desc" }, { createdAt: "desc" }],
  price_asc: [{ isPromoted: "desc" }, { price: "asc" }],
  price_desc: [{ isPromoted: "desc" }, { price: "desc" }],
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    lat?: string;
    lng?: string;
  }>;
}) {
  const { q, category, sort, lat: latStr, lng: lngStr } = await searchParams;
  const sortKey = sort && SORT_OPTIONS[sort] ? sort : "new";
  const { dict } = await getServerDictionary();
  const SORT_LABELS: Record<string, string> = dict.home.sort;

  const lat = latStr ? Number(latStr) : null;
  const lng = lngStr ? Number(lngStr) : null;
  const hasGeo = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  // Expire promotions whose paid period has ended.
  await prisma.listing.updateMany({
    where: { isPromoted: true, promotedUntil: { lt: new Date() } },
    data: { isPromoted: false },
  });

  const [listingsRaw, categories] = await Promise.all([
    prisma.listing.findMany({
      where: category ? { category: { slug: category } } : {},
      include: { category: true },
      orderBy: SORT_OPTIONS[sortKey],
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { listings: true } } },
    }),
  ]);

  let listings = listingsRaw;

  if (q) {
    listings = listingsRaw
      .map((listing) => ({
        listing,
        score: matchScore(q, listing.title, listing.description, listing.location),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => {
        if (a.listing.isPromoted !== b.listing.isPromoted) {
          return a.listing.isPromoted ? -1 : 1;
        }
        return b.score - a.score;
      })
      .map((r) => r.listing);
  }

  if (hasGeo && lat != null && lng != null) {
    listings = [...listings].sort((a, b) => {
      if (a.isPromoted !== b.isPromoted) return a.isPromoted ? -1 : 1;
      if (a.lat == null || a.lng == null) return 1;
      if (b.lat == null || b.lng == null) return -1;
      return (
        distanceKm(lat, lng, a.lat, a.lng) - distanceKm(lat, lng, b.lat, b.lng)
      );
    });
  }

  const IN_FEED_INTERVAL = 6;

  const withParam = (params: Record<string, string | undefined>) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (category) usp.set("category", category);
    if (sort) usp.set("sort", sort);
    if (latStr) usp.set("lat", latStr);
    if (lngStr) usp.set("lng", lngStr);
    for (const [key, value] of Object.entries(params)) {
      if (value) usp.set(key, value);
      else usp.delete(key);
    }
    const qs = usp.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr_200px]">
      <aside className="hidden lg:block">
        <div className="sticky top-20 flex flex-col gap-4">
          <AdSlot position="SIDEBAR_LEFT" limit={2} />
        </div>
      </aside>

      <div className="flex flex-col gap-4">
        <nav className="flex flex-wrap gap-2">
          <Link
            href={withParam({ category: undefined })}
            className={`rounded-full border px-3 py-1 text-sm ${
              !category
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-zinc-300 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {dict.home.allCategories}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={withParam({ category: c.slug })}
              className={`rounded-full border px-3 py-1 text-sm ${
                category === c.slug
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-300 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {c.icon} {c.name} ({c._count.listings})
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-zinc-500">
            {dict.home.found} {listings.length}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={withParam({ sort: key === "new" ? undefined : key })}
                className={`rounded-full border px-3 py-1 text-xs ${
                  sortKey === key && !hasGeo
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-zinc-300 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {label}
              </Link>
            ))}
            <NearMeButton active={hasGeo} />
          </div>
        </div>

        {listings.length === 0 ? (
          <p className="py-16 text-center text-zinc-500">
            {dict.home.noListings}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing, idx) => (
              <Fragment key={listing.id}>
                <ListingCard listing={listing} />
                {(idx + 1) % IN_FEED_INTERVAL === 0 && (
                  <div className="col-span-2 sm:col-span-3 xl:col-span-4">
                    <AdSlot position="IN_FEED" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20 flex flex-col gap-4">
          <AdSlot position="SIDEBAR_RIGHT" limit={2} />
        </div>
      </aside>
    </div>
  );
}
