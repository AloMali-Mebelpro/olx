import { prisma } from "@/lib/prisma";
import AdSlot from "@/components/AdSlot";
import { notFound } from "next/navigation";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("ru-RU").format(price) + " " + currency;
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!listing) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
      <div className="flex flex-col gap-4">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
          {listing.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              Нет фото
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="mt-1 text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {formatPrice(listing.price, listing.currency)}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {listing.location} · {listing.category.name} ·{" "}
            {new Date(listing.createdAt).toLocaleDateString("ru-RU")}
          </p>
          <hr className="my-4 border-zinc-200 dark:border-zinc-800" />
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {listing.description}
          </p>
        </div>

        <div>
          <AdSlot position="IN_FEED" />
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Продавец</p>
          <p className="font-semibold">Частное лицо</p>
          <button className="mt-3 w-full rounded-full bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Показать телефон
          </button>
        </div>
        <AdSlot position="SIDEBAR_RIGHT" limit={2} />
      </aside>
    </div>
  );
}
