import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { cloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      // ── Upload a file straight to Cloudinary ──
      const form = await request.formData();
      const file = form.get("file");
      const label = String(form.get("label") ?? "").trim();

      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: "Please choose an image." }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Image must be under 10MB." }, { status: 400 });
      }
      if (!cloudinaryConfigured()) {
        return NextResponse.json(
          { error: "Cloudinary is not configured. Add your keys to .env." },
          { status: 503 }
        );
      }

      const uploaded = await uploadToCloudinary(file);
      const row = await query<{ id: number }>(
        `INSERT INTO gallery_images (label, public_id, url, secure_url)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          label || file.name.replace(/\.[^.]+$/, ""),
          uploaded.public_id,
          uploaded.url,
          uploaded.secure_url,
        ]
      );
      return NextResponse.json({ ok: true, id: row[0]?.id }, { status: 201 });
    }

    // ── Import by URL ──
    const body = await request.json();
    const url = String(body.url ?? "").trim();
    const label = String(body.label ?? "").trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      return NextResponse.json({ error: "Please enter a valid image URL." }, { status: 400 });
    }
    const row = await query<{ id: number }>(
      `INSERT INTO gallery_images (label, public_id, url, secure_url)
       VALUES ($1, '', $2, $3) RETURNING id`,
      [label || "Imported image", url, url]
    );
    return NextResponse.json({ ok: true, id: row[0]?.id }, { status: 201 });
  } catch (err) {
    console.error("[gallery] upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
