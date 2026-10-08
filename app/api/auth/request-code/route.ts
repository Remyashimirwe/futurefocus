import { NextResponse } from "next/server";
import {
  authenticateAdmin,
  createLoginCode,
  hasRecentCode,
} from "@/lib/admin";
import { mailConfigured, sendLoginCode } from "@/lib/mailer";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Please enter your email and password." },
      { status: 400 }
    );
  }

  const admin = await authenticateAdmin(email, password);
  if (!admin) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (await hasRecentCode(email)) {
    return NextResponse.json(
      { error: "A code was just sent. Please wait a moment before requesting another." },
      { status: 429 }
    );
  }

  const code = await createLoginCode(email);
  const sent = await sendLoginCode(email, code);

  if (!sent && !mailConfigured() && process.env.NODE_ENV !== "production") {
    // Dev convenience: no Resend key configured — hand the code back for the UI.
    return NextResponse.json({ ok: true, devCode: code });
  }

  if (!sent && !mailConfigured()) {
    return NextResponse.json(
      { error: "Email delivery is not configured. Please contact support." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
