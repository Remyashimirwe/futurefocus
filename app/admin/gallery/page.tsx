import type { Metadata } from "next";
import { query } from "@/lib/db";
import GalleryManager from "./GalleryManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Gallery — Admin" };

type Row = {
  id: number;
  label: string;
  url: string;
  secure_url: string;
  created_at: Date;
};

export default async function AdminGalleryPage() {
  const rows = await query<Row>(
    "SELECT id, label, url, secure_url, created_at FROM gallery_images ORDER BY created_at DESC"
  );

  const initial = rows.map((row) => ({
    id: row.id,
    label: row.label,
    url: row.secure_url || row.url,
  }));

  return <GalleryManager initial={initial} />;
}
