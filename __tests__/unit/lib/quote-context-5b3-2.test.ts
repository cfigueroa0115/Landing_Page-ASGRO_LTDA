import { describe, it, expect } from 'vitest';
import {
  composeQuoteComments,
  interestLabelOf,
  isValidInterest,
  INTEREST_PREFIX,
} from '@/lib/ai/handoff/quote-prefill';
import { quoteSchema } from '@/lib/validations/quote';

/**
 * BLOQUE 5B.3.2 — Persistencia segura del contexto comercial (interest).
 * Validación + composición server-side hacia `comments`. Sin PII, sin migración.
 */

// ----------------------------------------------------------------------------
// isValidInterest / interestLabelOf (allowlist cerrada)
// ----------------------------------------------------------------------------

describe('isValidInterest', () => {
  it('acepta valores allowlisted', () => {
    for (const v of ['multirriesgo', 'responsabilidad_civil', 'cumplimiento', 'manejo', 'vida_grupo', 'arl', 'sst']) {
      expect(isValidInterest(v)).toBe(true);
    }
  });
  it('rechaza texto libre / PII / HTML / URL', () => {
    expect(isValidInterest('cedula')).toBe(false);
    expect(isValidInterest('juan@email.com')).toBe(false);
    expect(isValidInterest('<script>')).toBe(false);
    expect(isValidInterest('../../etc')).toBe(false);
    expect(isValidInterest('')).toBe(false);
    expect(isValidInterest(undefined)).toBe(false);
    expect(isValidInterest(null)).toBe(false);
  });
});

describe('interestLabelOf', () => {
  it('devuelve etiqueta legible para valor válido', () => {
    expect(interestLabelOf('cumplimiento')).toBe('Póliza de cumplimiento');
    expect(interestLabelOf('responsabilidad_civil')).toBe('Responsabilidad civil');
    expect(interestLabelOf('arl')).toBe('ARL');
    expect(interestLabelOf('sst')).toBe('SST');
  });
  it('devuelve null para valor inválido', () => {
    expect(interestLabelOf('cedula')).toBeNull();
    expect(interestLabelOf('<script>')).toBeNull();
  });
});

// ----------------------------------------------------------------------------
// composeQuoteComments (server-side, no duplica, preserva comentario)
// ----------------------------------------------------------------------------

describe('composeQuoteComments', () => {
  it('cumplimiento → prefijo con etiqueta legible', () => {
    const out = composeQuoteComments('cumplimiento', undefined);
    expect(out).toBe(`[${INTEREST_PREFIX} Póliza de cumplimiento]`);
  });

  it('RC / ARL / SST → contexto correcto', () => {
    expect(composeQuoteComments('responsabilidad_civil', '')).toContain('Responsabilidad civil');
    expect(composeQuoteComments('arl', null)).toContain('ARL');
    expect(composeQuoteComments('sst', null)).toContain('SST');
  });

  it('preserva el comentario del usuario tras el contexto', () => {
    const out = composeQuoteComments('cumplimiento', 'Necesito la póliza para una licitación.');
    expect(out).toContain('Póliza de cumplimiento');
    expect(out).toContain('Necesito la póliza para una licitación.');
  });

  it('metadata server-authoritative: el prefijo REAL siempre va primero (5B.4)', () => {
    // El usuario intenta falsificar metadata escribiendo un prefijo falso (ARL)
    // en su comentario, pero el interés real es cumplimiento.
    const spoof = `[${INTEREST_PREFIX} ARL]`;
    const out = composeQuoteComments('cumplimiento', spoof)!;
    // La PRIMERA línea debe ser el contexto real generado por el servidor.
    expect(out.startsWith(`[${INTEREST_PREFIX} Póliza de cumplimiento]`)).toBe(true);
    // El texto del usuario se preserva debajo (no se borra).
    expect(out).toContain(spoof);
  });

  it('sin interés válido → comportamiento legacy (solo comentario o null)', () => {
    expect(composeQuoteComments(undefined, 'Solo comentario')).toBe('Solo comentario');
    expect(composeQuoteComments('cedula', 'Solo comentario')).toBe('Solo comentario');
    expect(composeQuoteComments(undefined, undefined)).toBeNull();
    expect(composeQuoteComments('cedula', '')).toBeNull();
  });

  it('interés inválido NUNCA se persiste como contexto (PII/HTML/URL)', () => {
    for (const bad of ['cedula', 'juan@email.com', '<script>alert(1)</script>', '../../etc', 'texto libre']) {
      const out = composeQuoteComments(bad, 'x');
      expect(out).toBe('x'); // solo el comentario; el "interés" malicioso se ignora
      expect(out).not.toContain(INTEREST_PREFIX);
    }
  });
});

// ----------------------------------------------------------------------------
// quoteSchema — interest opcional allowlisted
// ----------------------------------------------------------------------------

describe('quoteSchema — interest', () => {
  const base = {
    companyName: 'Empresa Test',
    nit: '900123456-7',
    contactName: 'María García',
    position: 'Director',
    phone: '3109876543',
    email: 'maria@empresa.com',
    city: 'Medellín',
    economicActivity: 'Construcción',
    employeeCount: 50,
    serviceRequired: 'seguros',
    dataAcceptance: true,
  } as const;

  it('acepta body sin interest (legacy)', () => {
    expect(quoteSchema.safeParse(base).success).toBe(true);
  });

  it('acepta interest allowlisted', () => {
    expect(quoteSchema.safeParse({ ...base, interest: 'cumplimiento' }).success).toBe(true);
  });

  it('rechaza interest fuera de la allowlist (texto libre/PII)', () => {
    expect(quoteSchema.safeParse({ ...base, interest: 'cedula' }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...base, interest: '<script>' }).success).toBe(false);
  });
});
