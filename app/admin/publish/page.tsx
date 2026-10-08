import type { Metadata } from "next";
import { query } from "@/lib/db";
import PublishManager from "./PublishManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Publish - Admin" };

type Row = {
  id: number;
  title: string;
  description: string;
  tag: string;
  img: string;
  published: boolean;
  sort_order: number;
};

export default async function AdminPublishPage() {
  const rows = await query<Row>(
    "SELECT id, title, description, tag, img, published, sort_order FROM programs ORDER BY sort_order, id"
  );

  return <PublishManager initial={rows} />;
}
