import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const imageId = Number(id);
  if (!Number.isInteger(imageId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const row = await queryOne<{ public_id: string }>(
    "DELETE FROM gallery_images WHERE id = $1 RETURNING public_id",
    [imageId]
  );
  if (!row) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  if (row.public_id) {
    try {
      await deleteFromCloudinary(row.public_id);
    } catch (err) {
      console.error("[gallery] cloudinary delete failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
