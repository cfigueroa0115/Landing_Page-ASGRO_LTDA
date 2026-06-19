import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

/**
 * Drizzle ORM client initialization with Neon PostgreSQL.
 *
 * Uses lazy initialization to avoid failing at import/build time
 * when DATABASE_URL is not set (e.g., during static page generation).
 * The pool and drizzle instance are created on first use.
 */

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getPool(): Pool {
  if (_pool) return _pool;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      '❌ DATABASE_URL is not configured. ' +
        'Please set DATABASE_URL in your environment variables.'
    );
  }

  _pool = new Pool({ connectionString: databaseUrl });
  return _pool;
}

/**
 * Get the Drizzle database client instance.
 * Creates the connection pool lazily on first invocation.
 */
export function getDb() {
  if (_db) return _db;

  const pool = getPool();
  _db = drizzle(pool);
  return _db;
}

/**
 * Convenience export — access triggers lazy initialization.
 * Safe to import at module level without causing build failures.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof typeof instance];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});
