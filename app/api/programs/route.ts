import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: {
    title?: string;
    description?: string;
    tag?: string;
    img?: string;
    published?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const tag = String(body.tag ?? "").trim();
  const img = String(body.img ?? "").trim();
  const published = Boolean(body.published);

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  try {
    const rows = await query<{ id: number }>(
      `INSERT INTO programs (title, description, tag, img, published, sort_order)
       VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM programs))
       RETURNING id`,
      [title, description, tag, img, published]
    );
    return NextResponse.json({ ok: true, id: rows[0]?.id }, { status: 201 });
  } catch (err) {
    console.error("[programs] create failed:", err);
    return NextResponse.json({ error: "Could not save the program." }, { status: 500 });
  }
}
