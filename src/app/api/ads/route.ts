import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const position = searchParams.get("position");

  const ads = await prisma.ad.findMany({
    where: {
      isActive: true,
      ...(position ? { position: position as Prisma.AdCreateInput["position"] } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, imageUrl, linkUrl, position } = body ?? {};

  if (!title || !imageUrl || !linkUrl || !position) {
    return NextResponse.json(
      { error: "Заполните обязательные поля" },
      { status: 400 }
    );
  }

  const ad = await prisma.ad.create({
    data: { title, imageUrl, linkUrl, position },
  });

  return NextResponse.json(ad, { status: 201 });
}
