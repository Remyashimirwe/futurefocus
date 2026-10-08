import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { GallerySection } from "../components/Sections";
import { query } from "../../lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery — Future Focus Academy",
  description:
    "Photos and moments from Future Focus Academy — classes, events, and student projects.",
};

export default async function GalleryPage() {
  let uploads: { label: string; url: string }[] = [];
  try {
    const rows = await query<{ label: string; url: string; secure_url: string }>(
      "SELECT label, url, secure_url FROM gallery_images ORDER BY created_at DESC"
    );
    uploads = rows.map((row) => ({ label: row.label, url: row.secure_url || row.url }));
  } catch (err) {
    console.error("[gallery] failed to load uploads:", err);
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "88px", background: "var(--ff-50)" }}>
        <GallerySection uploads={uploads} />
      </main>
      <Footer />
    </>
  );
}
