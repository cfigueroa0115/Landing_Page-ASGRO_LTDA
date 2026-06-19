import { NextResponse } from 'next/server';

import { contactSchema } from '@/lib/validations/contact';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = contactSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      fullName,
      company,
      position,
      phone,
      email,
      city,
      serviceOfInterest,
      message,
      dataAcceptance,
    } = validated.data;

    await db.insert(leads).values({
      fullName,
      company,
      position,
      phone,
      email,
      city,
      serviceOfInterest,
      message,
      dataAcceptance,
    });

    return NextResponse.json(
      { success: true, message: 'Lead stored successfully' },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Database connection or query errors → 503
    if (isDatabaseError(error)) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Generic server error → 500 (no internal details exposed)
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

/**
 * Determines if an error is a database-related error.
 * Covers Neon/pg connection failures and Drizzle query errors.
 */
function isDatabaseError(error: unknown): boolean {
  if (error === null || error === undefined) return false;

  // Check by error name (pg and neon errors)
  if (error instanceof Error) {
    const dbErrorNames = [
      'NeonDbError',
      'ConnectionError',
      'PoolError',
      'DatabaseError',
    ];
    if (dbErrorNames.includes(error.constructor.name)) return true;

    // Check by common database error codes or messages
    const msg = error.message.toLowerCase();
    if (
      msg.includes('database') ||
      msg.includes('connection') ||
      msg.includes('econnrefused') ||
      msg.includes('timeout') ||
      msg.includes('pool') ||
      msg.includes('database_url')
    ) {
      return true;
    }

    // pg error codes (Class 08 — Connection Exception)
    if ('code' in error && typeof (error as { code: unknown }).code === 'string') {
      const code = (error as { code: string }).code;
      if (code.startsWith('08') || code === '57P01' || code === '57P03') {
        return true;
      }
    }
  }

  return false;
}
