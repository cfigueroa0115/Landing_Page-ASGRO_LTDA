// ============================================================================
// Utilidades de formateo - ASGRO LTDA Landing Page
// Formateo de números (locale es-CO) y helpers de fecha/hora para América/Bogotá
// ============================================================================

import type { AvailabilityStatus } from '@/types';

// ============================================================================
// Formateo de números
// ============================================================================

/**
 * Formatea un número usando la convención colombiana (es-CO).
 * Ejemplo: 1000 → "1.000", 10000 → "10.000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value);
}

/**
 * Formatea un número como moneda colombiana (COP).
 * Ejemplo: 1500000 → "$ 1.500.000"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ============================================================================
// Helpers de fecha y hora (América/Bogotá)
// ============================================================================

/** Días de la semana en español indexados por número (0 = domingo) */
const DAYS_OF_WEEK_ES: readonly string[] = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

/** Zona horaria de Colombia */
const COLOMBIA_TIMEZONE = 'America/Bogota';

/** Interfaz del resultado de getColombiaTime */
export interface ColombiaTimeResult {
  /** Fecha formateada (DD/MM/YYYY) */
  date: string;
  /** Hora formateada (HH:MM:SS) */
  time: string;
  /** Día de la semana en español */
  dayOfWeek: string;
  /** Zona horaria utilizada */
  timezone: string;
  /** Si está dentro de horario laboral */
  isBusinessHours: boolean;
  /** Estado de disponibilidad */
  availabilityStatus: AvailabilityStatus;
}

/**
 * Determina el estado de disponibilidad basado en el día y hora en Colombia.
 *
 * Lógica de horario:
 * - Lunes a Viernes 8:00-18:00 → "Disponible"
 * - Sábado 8:00-12:00 → "Disponible"
 * - Sábado después de 12:00 o Lun-Vie fuera de 8-18 → "Fuera de horario"
 * - Domingo todo el día → "Canal digital activo"
 */
export function getAvailabilityStatus(
  dayOfWeek: number,
  hours: number,
  _minutes: number
): AvailabilityStatus {
  // Domingo (0) → Canal digital activo
  if (dayOfWeek === 0) {
    return 'Canal digital activo';
  }

  // Sábado (6)
  if (dayOfWeek === 6) {
    // 8:00 a 11:59 → Disponible
    if (hours >= 8 && hours < 12) {
      return 'Disponible';
    }
    // Fuera de ese rango → Fuera de horario
    return 'Fuera de horario';
  }

  // Lunes (1) a Viernes (5)
  if (hours >= 8 && hours < 18) {
    return 'Disponible';
  }

  return 'Fuera de horario';
}

/**
 * Obtiene la fecha y hora actual en la zona horaria de Colombia (America/Bogota)
 * con información de disponibilidad de negocio.
 *
 * @param now - Fecha opcional para testing (por defecto: new Date())
 */
export function getColombiaTime(now?: Date): ColombiaTimeResult {
  const date = now ?? new Date();

  // Guard against invalid dates
  if (isNaN(date.getTime())) {
    return {
      date: '--/--/----',
      time: '--:--:--',
      dayOfWeek: 'domingo',
      timezone: COLOMBIA_TIMEZONE,
      isBusinessHours: false,
      availabilityStatus: 'Fuera de horario',
    };
  }
  // Obtener componentes de fecha/hora en zona horaria de Colombia
  const dateFormatter = new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const timeFormatter = new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Obtener las partes individuales para el día de la semana y horas
  const partsFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: COLOMBIA_TIMEZONE,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = partsFormatter.formatToParts(date);
  const weekdayPart = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '0';
  const minutePart = parts.find((p) => p.type === 'minute')?.value ?? '0';

  // Mapear weekday corto en inglés a índice numérico
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayIndex = weekdayMap[weekdayPart] ?? 0;
  const hours = parseInt(hourPart, 10);
  const minutes = parseInt(minutePart, 10);

  const availabilityStatus = getAvailabilityStatus(dayIndex, hours, minutes);
  const isBusinessHours = availabilityStatus === 'Disponible';

  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date),
    dayOfWeek: DAYS_OF_WEEK_ES[dayIndex] ?? 'domingo',
    timezone: COLOMBIA_TIMEZONE,
    isBusinessHours,
    availabilityStatus,
  };
}
