import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { PrismaClient } from "@prisma/client";

/**
 * Adds (or resets) an admin account in admin_users.
 *
 *   node --env-file=.env scripts/add-admin.mjs <email> [password]
 *
 * With no password argument, ADMIN_PASSWORD from .env is used — handy for a
 * second admin that shares the bootstrap password. The hash format matches
 * hashPassword() in lib/passwords.ts: "<salt-hex>:<scrypt-hex>".
 */

const email = (process.argv[2] ?? "").trim().toLowerCase();
const password = process.argv[3] ?? process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME?.trim() || "Administrator";

if (!email || !email.includes("@")) {
  console.error("Usage: node --env-file=.env scripts/add-admin.mjs <email> [password]");
  process.exit(1);
}
if (!password) {
  console.error("No password given and ADMIN_PASSWORD is not set in .env.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

const prisma = new PrismaClient();

try {
  const existing = await prisma.admin_users.findUnique({ where: { email } });
  const admin = existing
    ? await prisma.admin_users.update({
        where: { id: existing.id },
        data: { password_hash: passwordHash },
      })
    : await prisma.admin_users.create({ data: { email, password_hash: passwordHash, name } });

  // Prove the stored hash verifies against the password we just wrote.
  const [storedSalt, storedHash] = String(admin.password_hash).split(":");
  const expected = Buffer.from(storedHash, "hex");
  const actual = scryptSync(password, storedSalt, 64);
  const ok = expected.length === actual.length && timingSafeEqual(expected, actual);

  console.log(
    `${existing ? "updated" : "created"} admin_users row #${admin.id}: ${admin.email}`
  );
  console.log(ok ? "password hash verified ✔" : "password hash DID NOT verify ✖");

  const all = await prisma.admin_users.findMany({ select: { id: true, email: true, name: true } });
  console.log(`admin accounts now: ${all.length}`);
  for (const a of all) console.log(`  #${a.id} ${a.email} (${a.name ?? "no name"})`);

  if (!ok) process.exitCode = 1;
} catch (err) {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
