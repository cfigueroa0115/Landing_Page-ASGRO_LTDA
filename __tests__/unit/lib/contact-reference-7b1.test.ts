import { describe, it, expect } from 'vitest';
import {
  createContactReference,
  isValidContactReference,
  CONTACT_REFERENCE_RE,
} from '@/lib/contact/reference';

/**
 * BLOQUE 7B.1 — Referencia de solicitud de contacto.
 * Determinística, derivada del UUID persistido, sin exponer el UUID completo.
 */

const UUID = '7f3a91b2-4c5d-4e6f-8a9b-0c1d2e3f4a5b';

describe('createContactReference', () => {
  it('genera el formato ASGRO-C-XXXXXXXX', () => {
    expect(createContactReference(UUID)).toMatch(CONTACT_REFERENCE_RE);
  });

  it('deriva los primeros 8 hex del UUID en mayúsculas', () => {
    expect(createContactReference(UUID)).toBe('ASGRO-C-7F3A91B2');
  });

  it('es determinística (mismo UUID → misma referencia)', () => {
    expect(createContactReference(UUID)).toBe(createContactReference(UUID));
  });

  it('NO contiene el UUID completo', () => {
    expect(createContactReference(UUID)).not.toContain(UUID);
    expect(createContactReference(UUID)).not.toContain('4c5d');
  });

  it('acepta UUID en mayúsculas', () => {
    expect(createContactReference(UUID.toUpperCase())).toBe('ASGRO-C-7F3A91B2');
  });

  it('lanza ante un UUID inválido (no genera referencias falsas)', () => {
    expect(() => createContactReference('no-uuid')).toThrow();
    expect(() => createContactReference('')).toThrow();
    expect(() => createContactReference('1234')).toThrow();
  });
});

describe('isValidContactReference', () => {
  it('acepta referencias válidas y rechaza el resto', () => {
    expect(isValidContactReference('ASGRO-C-7F3A91B2')).toBe(true);
    expect(isValidContactReference('ASGRO-C-7f3a91b2')).toBe(false); // minúsculas
    expect(isValidContactReference('ASGRO-Q-7F3A91B2')).toBe(false); // otro canal
    expect(isValidContactReference('7F3A91B2')).toBe(false);
    expect(isValidContactReference(null)).toBe(false);
  });
});
