// ============================================================================
// GET /api/time — Endpoint de fecha, hora y disponibilidad (America/Bogota)
// Retorna la fecha, hora, día de la semana en español, zona horaria y estado
// de disponibilidad del negocio basado en el horario de ASGRO LTDA.
// ============================================================================

import { NextResponse } from 'next/server';
import { getColombiaTime } from '@/lib/utils/format';

export async function GET() {
  try {
    const colombiaTime = getColombiaTime();

    // Convert date from DD/MM/YYYY format to YYYY-MM-DD (ISO)
    const dateParts = colombiaTime.date.split('/');
    const isoDate =
      dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        : colombiaTime.date;

    // Extract HH:MM from HH:MM:SS
    const timeShort = colombiaTime.time.substring(0, 5);

    return NextResponse.json({
      date: isoDate,
      time: timeShort,
      dayOfWeek: colombiaTime.dayOfWeek,
      timezone: colombiaTime.timezone,
      isBusinessHours: colombiaTime.isBusinessHours,
      availabilityStatus: colombiaTime.availabilityStatus,
    });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
