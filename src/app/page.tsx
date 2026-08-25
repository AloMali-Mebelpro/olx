import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import AdSlot from "@/components/AdSlot";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const [listings, categories] = await Promise.all([
    prisma.listing.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { category: true },
      orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const IN_FEED_INTERVAL = 6;

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
            href="/"
            className={`rounded-full border px-3 py-1 text-sm ${
              !category
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-zinc-300 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            Все категории
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?category=${c.slug}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                category === c.slug
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-300 text-zinc-700 hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </nav>

        {listings.length === 0 ? (
          <p className="py-16 text-center text-zinc-500">
            Объявлений не найдено.
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
