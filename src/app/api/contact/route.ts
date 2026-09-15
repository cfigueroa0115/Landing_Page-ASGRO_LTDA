import { NextResponse } from 'next/server';

import { contactSchema } from '@/lib/validations/contact';
import { getDbAsync } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { sendContactNotification } from '@/lib/email/notifications';
import { createContactReference } from '@/lib/contact/reference';

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

    // 1) Persistir el lead en la base de datos (fuente de verdad) y recuperar
    //    el UUID realmente almacenado (returning). La referencia se deriva del
    //    UUID persistido; nunca antes del INSERT ni con valores fake.
    const db = await getDbAsync();
    const [createdLead] = await db
      .insert(leads)
      .values({
        fullName,
        company,
        position,
        phone,
        email,
        city,
        serviceOfInterest,
        message,
        dataAcceptance,
      })
      .returning({ id: leads.id });

    if (!createdLead) {
      throw new Error('Lead insert did not return an id');
    }

    // Referencia de atención derivada del UUID real (no expone el UUID completo).
    const reference = createContactReference(createdLead.id);

    // 2) Enviar notificación por email. NO bloquea el éxito del guardado:
    //    si el email falla, el lead ya quedó registrado. Reportamos el estado
    //    real en `notified` sin exponer errores internos ni credenciales. La
    //    referencia enviada por email es EXACTAMENTE la retornada por la API.
    const { sent } = await sendContactNotification({
      fullName,
      company,
      position,
      phone,
      email,
      city,
      serviceOfInterest,
      message,
      reference,
    });

    return NextResponse.json(
      { success: true, message: 'Lead stored successfully', notified: sent, reference },
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
