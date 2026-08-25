import { prisma } from "@/lib/prisma";
import type { AdPosition } from "@/lib/types";

async function getAds(position: AdPosition) {
  return prisma.ad.findMany({
    where: { isActive: true, position },
    orderBy: { createdAt: "desc" },
  });
}

const sizeByPosition: Record<AdPosition, string> = {
  BANNER_TOP: "h-24 w-full sm:h-32",
  SIDEBAR_LEFT: "h-64 w-full",
  SIDEBAR_RIGHT: "h-64 w-full",
  IN_FEED: "h-32 w-full",
};

export default async function AdSlot({
  position,
  limit = 1,
}: {
  position: AdPosition;
  limit?: number;
}) {
  const ads = (await getAds(position)).slice(0, limit);

  if (ads.length === 0) {
    return (
      <div
        className={`${sizeByPosition[position]} flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-600`}
      >
        Место для рекламы
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`${sizeByPosition[position]} group relative block overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
            Реклама
          </span>
        </a>
      ))}
    </div>
  );
}
