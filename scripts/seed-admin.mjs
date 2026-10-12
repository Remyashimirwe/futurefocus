import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { PrismaClient } from "@prisma/client";

/**
 * Seeds (or resets) the admin account in admin_users from the credentials in
 * .env. The password is hashed exactly the way lib/passwords.ts expects, so the
 * normal email + password login flow works without relying on the first-login
 * fallback in lib/admin.ts.
 *
 *   node --env-file=.env scripts/seed-admin.mjs
 */

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME?.trim() || "Administrator";

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set (see .env).");
  process.exit(1);
}

// Same format as hashPassword() in lib/passwords.ts: "<salt-hex>:<scrypt-hex>"
const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

const prisma = new PrismaClient();

try {
  const admin = await prisma.admin_users.upsert({
    where: { email },
    update: { password_hash: passwordHash, name },
    create: { email, password_hash: passwordHash, name },
  });

  // Prove the stored hash actually verifies against the password.
  const [storedSalt, storedHash] = String(admin.password_hash).split(":");
  const expected = Buffer.from(storedHash, "hex");
  const actual = scryptSync(password, storedSalt, 64);
  const ok = expected.length === actual.length && timingSafeEqual(expected, actual);

  console.log(`admin_users row #${admin.id} ready: ${admin.email} (${admin.name})`);
  console.log(ok ? "password hash verified ✔" : "password hash DID NOT verify ✖");
  if (!ok) process.exitCode = 1;
} catch (err) {
  console.error("Seeding failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
