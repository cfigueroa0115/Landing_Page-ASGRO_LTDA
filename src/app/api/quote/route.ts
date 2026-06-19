import { NextResponse } from 'next/server';

import { quoteSchema } from '@/lib/validations/quote';
import { db } from '@/lib/db';
import { quoteRequests } from '@/lib/db/schema';

/**
 * POST /api/quote
 * Validates the request body against the expanded quote Zod schema,
 * stores the quote request in the quote_requests table,
 * and returns 201 on success. Handles 400/503/500 errors.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = quoteSchema.safeParse(body);

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
      companyName,
      nit,
      contactName,
      position,
      phone,
      email,
      city,
      economicActivity,
      employeeCount,
      serviceRequired,
      currentArl,
      comments,
      dataAcceptance,
    } = validated.data;

    await db.insert(quoteRequests).values({
      companyName,
      nit,
      contactName,
      position,
      phone,
      email,
      city,
      economicActivity,
      employeeCount,
      serviceRequired,
      currentArl: currentArl ?? null,
      comments: comments ?? null,
      dataAcceptance,
    });

    return NextResponse.json(
      { success: true, message: 'Quote request stored successfully' },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Database connectivity errors (pool/connection issues)
    if (
      error instanceof Error &&
      (error.message.includes('DATABASE_URL') ||
        error.message.includes('connect') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('timeout') ||
        error.message.includes('pool'))
    ) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Unknown / unexpected errors
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
