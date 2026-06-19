import { db } from '@/lib/db';
import { metrics } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const results = await db
      .select()
      .from(metrics)
      .where(eq(metrics.isActive, true))
      .orderBy(asc(metrics.orderIndex));

    return Response.json(results);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('DATABASE_URL') ||
        error.message.includes('connect') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('timeout'))
    ) {
      return Response.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    return Response.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
