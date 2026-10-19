import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short-lived, signed proof that /api/auth/request-code already verified the
 * admin's password but could not deliver the emailed sign-in code (invalid
 * Resend key, unverified sender domain, provider outage).
 *
 * The client hands it back through the credentials sign-in, so authorize()
 * can accept email + password alone even while codeRequired() is true. It
 * cannot be forged without AUTH_SECRET, it expires like a login code, and the
 * password is still re-checked in authorize() — so a leaked ticket on its own
 * is useless.
 */

const TTL_MS = 10 * 60 * 1000; // same lifetime as an emailed code

function hmac(email: string, expiresAt: number): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(`${email.toLowerCase()}:${expiresAt}`)
    .digest("hex");
}

/** Returns `"<expiresAt>.<signature>"`, or null when AUTH_SECRET is missing. */
export function createFallbackTicket(email: string): string | null {
  if (!process.env.AUTH_SECRET) return null;
  const expiresAt = Date.now() + TTL_MS;
  return `${expiresAt}.${hmac(email, expiresAt)}`;
}

/** True when the ticket was issued for this email and has not expired. */
export function verifyFallbackTicket(email: string, ticket: string): boolean {
  if (!process.env.AUTH_SECRET || !ticket) return false;

  const dot = ticket.indexOf(".");
  if (dot < 1) return false;

  const expiresAt = Number(ticket.slice(0, dot));
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = Buffer.from(hmac(email, expiresAt), "hex");
  const actual = Buffer.from(ticket.slice(dot + 1), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
