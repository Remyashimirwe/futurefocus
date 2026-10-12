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

  // Resend isn't set up yet: hand the code back so signing in still works.
  // This branch stops applying on its own once RESEND_API_KEY is configured.
  if (!mailConfigured()) {
    return NextResponse.json({ ok: true, devCode: code });
  }

  const sent = await sendLoginCode(email, code);
  if (!sent) {
    return NextResponse.json(
      { error: "Could not send the sign-in code. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
