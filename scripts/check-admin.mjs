import { scryptSync, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Read-only check of the admin login credentials.
 *
 * Replicates authenticateAdmin() from lib/admin.ts (DB row + .env fallback)
 * without writing anything, so you can tell whether email + password work
 * before trying the sign-in page.
 *
 *   node --env-file=.env --env-file=.env.local scripts/check-admin.mjs
 */

const mask = (v) => (v ? "*".repeat(Math.min(v.length, 12)) : "(not set)");

const envEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const envPassword = process.env.ADMIN_PASSWORD ?? "";

console.log("ADMIN_EMAIL   :", envEmail || "(not set)");
console.log("ADMIN_PASSWORD:", mask(envPassword));
console.log("RESEND_API_KEY:", mask(process.env.RESEND_API_KEY));
console.log("DATABASE_URL  :", process.env.DATABASE_URL ? "set" : "(not set)");

if (!process.env.DATABASE_URL) {
  console.error("\n✖ DATABASE_URL is missing — cannot reach the database.");
  process.exit(1);
}

const mode = /(?:[?&])sslmode=([^&]+)/.exec(process.env.DATABASE_URL)?.[1];
let ssl;
if (mode !== "disable") {
  try {
    ssl = {
      ca: readFileSync(join(process.cwd(), "certs", "supabase-pooler-root-ca.pem"), "utf8"),
      rejectUnauthorized: true,
    };
  } catch {
    ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, ssl });

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

let failed = false;

try {
  const { rowCount } = await pool.query("SELECT 1 FROM admin_users LIMIT 1");
  console.log(`\nadmin_users reachable — ${rowCount >= 0 ? "table exists" : "empty"}`);

  const rows = await pool.query(
    "SELECT id, email, name, password_hash FROM admin_users ORDER BY id"
  );

  if (rows.rowCount === 0) {
    console.log("• No admin row yet. authenticateAdmin() will create one on first login");
    console.log("  using ADMIN_EMAIL / ADMIN_PASSWORD from .env.");
    if (!envEmail || !envPassword) {
      console.error("✖ ADMIN_EMAIL / ADMIN_PASSWORD not set — first login would fail.");
      failed = true;
    } else {
      console.log("✔ Env fallback credentials are present, so first login should work.");
    }
  } else {
    console.log(`\n${rows.rowCount} admin account(s):`);
    for (const row of rows.rows) {
      const matchesEnv = row.email.toLowerCase() === envEmail;
      const ok = envPassword ? verifyPassword(envPassword, row.password_hash) : false;
      console.log(
        `  #${row.id} ${row.email} (${row.name ?? "no name"})` +
          (matchesEnv ? " ← ADMIN_EMAIL" : "")
      );
      if (!envPassword) {
        console.log("    ? ADMIN_PASSWORD not set — can't test the stored hash.");
      } else if (matchesEnv && ok) {
        console.log("    ✔ password in .env verifies against the stored hash");
      } else if (matchesEnv && !ok) {
        console.log(
          "    ✖ password in .env does NOT match the stored hash — run " +
            "`node --env-file=.env scripts/seed-admin.mjs` to reset it."
        );
        failed = true;
      }
    }

    if (envEmail && !rows.rows.some((r) => r.email.toLowerCase() === envEmail)) {
      console.log(
        `  ✖ ADMIN_EMAIL (${envEmail}) has no row — first login would try the env ` +
          "fallback and insert a new row."
      );
    }

    // Guard: a wrong password must be rejected.
    if (envPassword) {
      const anyRow = rows.rows[0];
      const wrongOk = verifyPassword("definitely-not-the-password", anyRow.password_hash);
      console.log(
        wrongOk
          ? "  ✖ wrong password was accepted — hashing check is broken!"
          : "  ✔ wrong password is rejected"
      );
      if (wrongOk) failed = true;
    }
  }
} catch (err) {
  console.error("\n✖ DB error:", err instanceof Error ? err.message : err);
  failed = true;
} finally {
  await pool.end();
}

console.log(failed ? "\nRESULT: admin credential check FAILED ✖" : "\nRESULT: admin credentials look good ✔");
process.exit(failed ? 1 : 0);
