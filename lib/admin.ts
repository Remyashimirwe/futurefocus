import { query, queryOne } from "./db";
import { generateCode, hashPassword, verifyPassword } from "./passwords";

export type Admin = {
  id: number;
  email: string;
  name: string | null;
};

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  return queryOne<Admin>(
    "SELECT id, email, name FROM admin_users WHERE lower(email) = lower($1)",
    [email]
  );
}

/**
 * Checks email + password against the admin_users table.
 * The very first admin is created from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<Admin | null> {
  const admin = await getAdminByEmail(email);

  if (admin) {
    const row = await queryOne<{ password_hash: string }>(
      "SELECT password_hash FROM admin_users WHERE id = $1",
      [admin.id]
    );
    if (row && verifyPassword(password, row.password_hash)) return admin;
    return null;
  }

  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envEmail || !envPassword) return null;
  if (email.toLowerCase() !== envEmail || password !== envPassword) return null;

  const created = await queryOne<Admin>(
    "INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
    [email.toLowerCase(), hashPassword(password), "Administrator"]
  );
  return created;
}

/** Creates a fresh 6-digit code and invalidates any previous unused ones. */
export async function createLoginCode(email: string): Promise<string> {
  await query("UPDATE auth_codes SET used = true WHERE email = $1 AND used = false", [
    email.toLowerCase(),
  ]);
  const code = generateCode();
  await query(
    "INSERT INTO auth_codes (email, code, expires_at) VALUES ($1, $2, now() + interval '10 minutes')",
    [email.toLowerCase(), code]
  );
  return code;
}

export async function hasRecentCode(email: string): Promise<boolean> {
  const row = await queryOne<{ id: number }>(
    "SELECT id FROM auth_codes WHERE email = $1 AND used = false AND created_at > now() - interval '60 seconds' LIMIT 1",
    [email.toLowerCase()]
  );
  return Boolean(row);
}

/** Returns true when the code is valid, unexpired and unused — and marks it used. */
export async function consumeLoginCode(email: string, code: string): Promise<boolean> {
  const row = await queryOne<{ id: number }>(
    `UPDATE auth_codes
       SET used = true
     WHERE email = $1 AND code = $2 AND used = false AND expires_at > now()
     RETURNING id`,
    [email.toLowerCase(), code.toUpperCase()]
  );
  return Boolean(row);
}
