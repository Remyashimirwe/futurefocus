import { readFileSync } from "fs";
import { join } from "path";
import type { ConnectionOptions } from "tls";
import { Pool, type QueryResultRow } from "pg";

const globalForPg = globalThis as unknown as { pgPool?: Pool; poolKey?: string };

/**
 * Supabase's pooler presents a cert signed by "Supabase Root 2021 CA", which is
 * not in Node's CA bundle — so a bare `ssl: true` always fails with
 * "self-signed certificate in certificate chain". We verify against that root
 * explicitly (bundled in certs/), and fall back to an unverified-but-encrypted
 * connection if the file is missing. `sslmode=disable` in the URL opts out.
 */
function sslConfig(): ConnectionOptions | undefined {
  const mode = /(?:[?&])sslmode=([^&]+)/.exec(process.env.DATABASE_URL ?? "")?.[1];
  if (mode === "disable") return undefined;

  const caPath =
    process.env.DATABASE_CA_CERT ?? join(process.cwd(), "certs", "supabase-pooler-root-ca.pem");
  try {
    return { ca: readFileSync(caPath, "utf8"), rejectUnauthorized: true };
  } catch {
    return { rejectUnauthorized: false };
  }
}

// The pool is cached across hot reloads so HMR doesn't leak connections, but a
// cached pool must never outlive a config change — otherwise a .env or TLS edit
// silently keeps using the old settings until the dev server is restarted.
const poolKey = JSON.stringify({ url: process.env.DATABASE_URL ?? "", ssl: sslConfig() });

if (!globalForPg.pgPool || globalForPg.poolKey !== poolKey) {
  globalForPg.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    ssl: sslConfig(),
  });
  globalForPg.poolKey = poolKey;
}

export const pool = globalForPg.pgPool;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query<T>(text, params as never[]);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
