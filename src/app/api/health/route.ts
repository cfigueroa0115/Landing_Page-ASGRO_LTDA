import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  let status: 'ok' | 'degraded' = 'ok';

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    status = 'degraded';
  }

  return Response.json({
    status,
    service: 'ASGRO Landing Page',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
}
