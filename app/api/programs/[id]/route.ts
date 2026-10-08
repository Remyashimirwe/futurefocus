import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

const FIELDS = ["title", "description", "tag", "img", "sort_order", "published"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const programId = Number(id);
  if (!Number.isInteger(programId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  for (const field of FIELDS) {
    if (!(field in body)) continue;
    let value = body[field];
    if (field === "published") value = Boolean(value);
    else if (field === "sort_order") value = Number(value);
    else value = String(value ?? "").trim();

    if (field === "title" && !value) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    values.push(value);
    sets.push(`${field} = $${values.length}`);
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  values.push(programId);
  try {
    const rows = await query(
      `UPDATE programs SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING id`,
      values
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Program not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[programs] update failed:", err);
    return NextResponse.json({ error: "Could not update the program." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const programId = Number(id);
  if (!Number.isInteger(programId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  try {
    const rows = await query("DELETE FROM programs WHERE id = $1 RETURNING id", [programId]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Program not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[programs] delete failed:", err);
    return NextResponse.json({ error: "Could not delete the program." }, { status: 500 });
  }
}
