import { query } from "./db";
import { PROGRAMS, type Program } from "./program-data";

export type { Program };

export async function getPublishedPrograms(): Promise<Program[]> {
  try {
    const rows = await query<{
      title: string;
      description: string;
      tag: string;
      img: string;
    }>(
      "SELECT title, description, tag, img FROM programs WHERE published = true ORDER BY sort_order, id"
    );
    if (rows.length > 0) {
      return rows.map((row) => ({
        title: row.title,
        desc: row.description,
        tag: row.tag,
        img: row.img,
      }));
    }
  } catch (err) {
    console.error("[programs] falling back to static list:", err);
  }
  return PROGRAMS;
}
