import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Разрешены только изображения JPG, PNG, WEBP или GIF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Файл слишком большой (максимум 8MB)" },
      { status: 400 }
    );
  }

  const filename = `${randomUUID()}.${EXT_BY_TYPE[file.type]}`;

  // On Vercel (or anywhere with Blob storage configured) the filesystem is
  // read-only/ephemeral, so uploads go to Vercel Blob instead. Locally,
  // without a token, fall back to writing into public/uploads.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`listings/${filename}`, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
