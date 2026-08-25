import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();

  const listings = await prisma.listing.findMany({
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
  });

  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, price, currency, location, imageUrl, categoryId } =
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
      imageUrl: imageUrl || null,
      categoryId,
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
