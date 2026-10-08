import { createHash } from "crypto";

export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function sign(params: Record<string, string | number>): string {
  const secret = process.env.CLOUDINARY_API_SECRET!;
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}

export type CloudinaryUpload = {
  public_id: string;
  url: string;
  secure_url: string;
};

export async function uploadToCloudinary(
  file: File,
  folder = "futurefocus/gallery"
): Promise<CloudinaryUpload> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudinaryConfigured()) throw new Error("Cloudinary is not configured.");

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ folder, timestamp });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: file.type || "image/jpeg" }), file.name);
  form.append("api_key", apiKey!);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as CloudinaryUpload & { error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message ?? "Cloudinary upload failed.");
  return data;
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudinaryConfigured() || !publicId) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ public_id: publicId, timestamp });

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("api_key", apiKey!);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, {
    method: "POST",
    body: form,
  });
}
