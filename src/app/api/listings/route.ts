import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchScore, distanceKm } from "@/lib/search";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const hasGeo = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

  // Expire promotions whose paid period has ended so the "top" sort and
  // badge stay accurate without needing a background cron job.
  await prisma.listing.updateMany({
    where: { isPromoted: true, promotedUntil: { lt: new Date() } },
    data: { isPromoted: false },
  });

  const listings = await prisma.listing.findMany({
    where: category ? { category: { slug: category } } : {},
    include: { category: true },
    orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
  });

  let results = listings;

  if (q) {
    results = results
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

  if (hasGeo) {
    results = [...results].sort((a, b) => {
      if (a.isPromoted !== b.isPromoted) return a.isPromoted ? -1 : 1;
      if (a.lat == null || a.lng == null) return 1;
      if (b.lat == null || b.lng == null) return -1;
      return (
        distanceKm(lat, lng, a.lat, a.lng) - distanceKm(lat, lng, b.lat, b.lng)
      );
    });
  }

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, price, currency, location, lat, lng, imageUrl, categoryId } =
    body ?? {};

  if (!title || !description || !price || !location || !categoryId) {
    return NextResponse.json(
      { error: "Заполните обязательные поля" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price: Number(price),
      currency: currency || "USD",
      location,
      lat: lat != null && lat !== "" ? Number(lat) : null,
      lng: lng != null && lng !== "" ? Number(lng) : null,
      imageUrl: imageUrl || null,
      categoryId,
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
