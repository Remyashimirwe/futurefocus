import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Accepts a multipart upload and stores it on Cloudinary, returning the URL to
 * save on the record (programs, and reusable by anything else that needs one).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Please choose an image." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 10MB." }, { status: 400 });
  }
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Add your keys to .env." },
      { status: 503 }
    );
  }

  try {
    const uploaded = await uploadToCloudinary(file, "futurefocus/programs");
    return NextResponse.json(
      { ok: true, url: uploaded.secure_url, publicId: uploaded.public_id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[upload] Cloudinary failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}
