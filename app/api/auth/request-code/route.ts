import { NextResponse } from "next/server";
import {
  authenticateAdmin,
  createLoginCode,
  hasRecentCode,
} from "@/lib/admin";
import { mailConfigured, codeRequired, sendLoginCode } from "@/lib/mailer";

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

  // Codes are off (no RESEND_API_KEY, or LOGIN_CODE_REQUIRED=false): sign in
  // with email + password alone.
  if (!codeRequired()) {
    return NextResponse.json({ ok: true, skipCode: true });
  }

  if (await hasRecentCode(email)) {
    return NextResponse.json(
      { error: "A code was just sent. Please wait a moment before requesting another." },
      { status: 429 }
    );
  }

  const code = await createLoginCode(email);

  // Codes forced on without a RESEND_API_KEY: hand the code back so signing in
  // still works. This branch only runs with LOGIN_CODE_REQUIRED=true.
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
