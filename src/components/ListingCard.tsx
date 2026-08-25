import Link from "next/link";
import type { Category, Listing } from "@prisma/client";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("ru-RU").format(price) + " " + currency;
}

export default function ListingCard({
  listing,
}: {
  listing: Listing & { category: Category };
}) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
            Нет фото
          </div>
        )}
        {listing.isPromoted && (
          <span className="absolute left-2 top-2 rounded bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
            TOP
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
          {formatPrice(listing.price, listing.currency)}
        </span>
        <span className="line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {listing.title}
        </span>
        <span className="mt-auto text-xs text-zinc-500 dark:text-zinc-400">
          {listing.location} · {listing.category.name}
        </span>
      </div>
    </Link>
  );
}
