import { describe, it, expect } from 'vitest';
import { parseQuotePrefill } from '@/lib/ai/handoff/quote-prefill';

/**
 * BLOQUE 5B.3.1 — Prefill seguro del formulario de cotización.
 * Solo params allowlisted; nunca PII ni texto libre.
 */

function params(obj: Record<string, string>) {
  return new URLSearchParams(obj);
}

describe('parseQuotePrefill', () => {
  it('service allowlisted se acepta', () => {
    expect(parseQuotePrefill(params({ service: 'seguros' })).service).toBe('seguros');
    expect(parseQuotePrefill(params({ service: 'arl' })).service).toBe('arl');
    expect(parseQuotePrefill(params({ service: 'sst' })).service).toBe('sst');
  });

  it('service fuera de allowlist se ignora', () => {
    expect(parseQuotePrefill(params({ service: 'hacking' })).service).toBeNull();
    expect(parseQuotePrefill(params({ service: 'personas' })).service).toBeNull();
  });

  it('interest allowlisted produce etiqueta legible', () => {
    expect(parseQuotePrefill(params({ interest: 'cumplimiento' })).interestLabel).toBe('Póliza de cumplimiento');
    expect(parseQuotePrefill(params({ interest: 'responsabilidad_civil' })).interestLabel).toBe('Responsabilidad civil');
  });

  it('interest fuera de allowlist se ignora (posible PII/texto libre)', () => {
    expect(parseQuotePrefill(params({ interest: 'cedula-12345' })).interestLabel).toBeNull();
    expect(parseQuotePrefill(params({ interest: 'juan@x.com' })).interestLabel).toBeNull();
  });

  it('sin params → todo null', () => {
    const r = parseQuotePrefill(params({}));
    expect(r.service).toBeNull();
    expect(r.interestLabel).toBeNull();
  });

  it('ignora claves no relacionadas (email/nit/nombre)', () => {
    const r = parseQuotePrefill(params({ email: 'juan@x.com', nit: '900', name: 'Juan' }));
    expect(r.service).toBeNull();
    expect(r.interestLabel).toBeNull();
  });
});
