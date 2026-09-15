import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { getSecret, getSecretAsync } from '@/lib/config/secrets';

/**
 * Drizzle ORM client initialization with Neon PostgreSQL.
 *
 * Lazy initialization to avoid failing at import/build time when DATABASE_URL
 * is not set (e.g. static page generation). The pool and drizzle instance are
 * created on first use.
 *
 * Secret resolution is ASYNC to support AWS SSM Parameter Store as a source
 * (env → secrets JSON → SSM). Use `getDbAsync()` in server code. The sync `db`
 * Proxy is kept for backward compatibility and resolves only from the sync
 * sources (env / secrets JSON), not SSM.
 */

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function createDbFromUrl(databaseUrl: string): ReturnType<typeof drizzle> {
  if (!_pool) {
    _pool = new Pool({ connectionString: databaseUrl });
  }
  if (!_db) {
    _db = drizzle(_pool);
  }
  return _db;
}

function missingUrlError(): Error {
  return new Error(
    '❌ DATABASE_URL is not configured. ' +
      'Please set DATABASE_URL (env, Amplify secrets, or SSM Parameter Store).'
  );
}

/**
 * Async accessor — resolves DATABASE_URL through the full resolver chain
 * (env → secrets JSON → SSM Parameter Store) and returns the Drizzle instance.
 * Preferred way to access the DB in server code.
 */
export async function getDbAsync(): Promise<ReturnType<typeof drizzle>> {
  if (_db) return _db;

  const databaseUrl = await getSecretAsync('DATABASE_URL');
  if (!databaseUrl) {
    throw missingUrlError();
  }
  return createDbFromUrl(databaseUrl);
}

/**
 * Sync accessor — resolves DATABASE_URL only from sync sources
 * (env / secrets JSON). Does NOT consult SSM. Kept for backward compatibility.
 */
export function getDb(): ReturnType<typeof drizzle> {
  if (_db) return _db;

  const databaseUrl = getSecret('DATABASE_URL');
  if (!databaseUrl) {
    throw missingUrlError();
  }
  return createDbFromUrl(databaseUrl);
}

/**
 * Convenience export — sync Proxy that triggers lazy initialization from the
 * sync sources. For SSM-backed resolution, use `getDbAsync()` instead.
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
