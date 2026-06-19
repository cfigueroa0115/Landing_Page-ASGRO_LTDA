// ============================================================================
// Property Test: Time endpoint logic (Property 5)
// Feature: asgro-landing-page, Property 5: Time formatting and business hours
// Validates: Requirements 20.3
// ============================================================================

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getAvailabilityStatus, getColombiaTime } from '@/lib/utils/format';

describe('Feature: asgro-landing-page, Property 5: Time formatting and business hours', () => {
  // Valid days of the week in Spanish
  const VALID_DAYS_ES = [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ];

  // -------------------------------------------------------------------------
  // Property 5.1: timezone is always "America/Bogota"
  // -------------------------------------------------------------------------
  it('timezone is always "America/Bogota"', () => {
    fc.assert(
      fc.property(
        fc.date({
          min: new Date('2020-01-01T00:00:00Z'),
          max: new Date('2030-12-31T23:59:59Z'),
        }),
        (date) => {
          const result = getColombiaTime(date);
          expect(result.timezone).toBe('America/Bogota');
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 5.2: dayOfWeek is always one of the valid Spanish day names
  // -------------------------------------------------------------------------
  it('dayOfWeek is always one of: lunes, martes, miércoles, jueves, viernes, sábado, domingo', () => {
    fc.assert(
      fc.property(
        fc.date({
          min: new Date('2020-01-01T00:00:00Z'),
          max: new Date('2030-12-31T23:59:59Z'),
        }),
        (date) => {
          const result = getColombiaTime(date);
          expect(VALID_DAYS_ES).toContain(result.dayOfWeek);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 5.3: Monday-Friday 8:00-18:00 → "Disponible"
  // -------------------------------------------------------------------------
  it('Monday-Friday 8:00-17:59 local → availabilityStatus = "Disponible"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),   // Monday(1) to Friday(5)
        fc.integer({ min: 8, max: 17 }),   // Hours 8-17 (i.e. before 18:00)
        fc.integer({ min: 0, max: 59 }),   // Minutes
        (dayOfWeek, hours, minutes) => {
          const status = getAvailabilityStatus(dayOfWeek, hours, minutes);
          expect(status).toBe('Disponible');
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 5.4: Saturday 8:00-12:00 local → "Disponible"
  // -------------------------------------------------------------------------
  it('Saturday 8:00-11:59 local → availabilityStatus = "Disponible"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 8, max: 11 }),   // Hours 8-11 (i.e. before 12:00)
        fc.integer({ min: 0, max: 59 }),   // Minutes
        (hours, minutes) => {
          const status = getAvailabilityStatus(6, hours, minutes);
          expect(status).toBe('Disponible');
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 5.5: Monday-Friday outside 8:00-18:00 → "Fuera de horario"
  // -------------------------------------------------------------------------
  it('Monday-Friday outside 8:00-18:00 → availabilityStatus = "Fuera de horario"', () => {
    // Generate hours outside 8-17 range (i.e. 0-7 or 18-23)
    const outsideHours = fc.oneof(
      fc.integer({ min: 0, max: 7 }),
      fc.integer({ min: 18, max: 23 })
    );

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),   // Monday(1) to Friday(5)
        outsideHours,
        fc.integer({ min: 0, max: 59 }),   // Minutes
        (dayOfWeek, hours, minutes) => {
          const status = getAvailabilityStatus(dayOfWeek, hours, minutes);
          expect(status).toBe('Fuera de horario');
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 5.6: Saturday outside 8:00-12:00 → "Fuera de horario"
  // -------------------------------------------------------------------------
  it('Saturday outside 8:00-12:00 → availabilityStatus = "Fuera de horario"', () => {
    // Generate hours outside 8-11 range (i.e. 0-7 or 12-23)
    const outsideSaturdayHours = fc.oneof(
      fc.integer({ min: 0, max: 7 }),
      fc.integer({ min: 12, max: 23 })
    );

    fc.assert(
      fc.property(
        outsideSaturdayHours,
        fc.integer({ min: 0, max: 59 }),   // Minutes
        (hours, minutes) => {
          const status = getAvailabilityStatus(6, hours, minutes);
          expect(status).toBe('Fuera de horario');
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 5.7: Sunday any time → "Canal digital activo"
  // -------------------------------------------------------------------------
  it('Sunday any time → availabilityStatus = "Canal digital activo"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }),   // Any hour
        fc.integer({ min: 0, max: 59 }),   // Any minute
        (hours, minutes) => {
          const status = getAvailabilityStatus(0, hours, minutes);
          expect(status).toBe('Canal digital activo');
        }
      ),
      { numRuns: 100 }
    );
  });
});
