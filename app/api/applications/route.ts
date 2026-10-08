import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

type ApplicationBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  streetAddress?: string;
  city?: string;
  district?: string;
  province?: string;
  country?: string;
  course?: string;
  schedule?: string;
  deliveryMode?: string;
};

const required = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const text = (v: unknown, max = 255) =>
  typeof v === "string" ? v.trim().slice(0, max) : null;

export async function POST(request: Request) {
  let body: ApplicationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!required(body.firstName) || !required(body.lastName) || !required(body.email)) {
    return NextResponse.json(
      { error: "First name, last name and email are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim())) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  try {
    const row = await queryOne<{ id: number }>(
      `INSERT INTO applications
         (first_name, last_name, email, phone, date_of_birth, gender,
          street_address, city, district, province, country,
          course, schedule, delivery_mode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id`,
      [
        text(body.firstName),
        text(body.lastName),
        String(body.email).trim().toLowerCase(),
        text(body.phone),
        text(body.dateOfBirth, 32),
        text(body.gender),
        text(body.streetAddress),
        text(body.city),
        text(body.district),
        text(body.province),
        text(body.country),
        text(body.course),
        text(body.schedule),
        text(body.deliveryMode),
      ]
    );
    return NextResponse.json({ ok: true, id: row?.id }, { status: 201 });
  } catch (err) {
    console.error("[applications] insert failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
