import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { isValidSessionId } from '@/lib/ai/session';

/**
 * BLOQUE 5B.4.1 — Higiene final: el flujo activo no depende del provider legacy
 * y la sesión exige UUID v4 real.
 */

const ROOT = path.resolve(__dirname, '../../../');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ----------------------------------------------------------------------------
// El camino activo NO importa providers.ts (source-check)
// ----------------------------------------------------------------------------

describe('provider legacy aislado del flujo activo', () => {
  it('/api/chat NO importa providers.ts', () => {
    const src = read('src/app/api/chat/route.ts');
    expect(src).not.toMatch(/from ['"][^'"]*ai\/providers['"]/);
  });

  it('agent-v2 NO importa providers.ts', () => {
    const src = read('src/lib/ai/agent-v2.ts');
    expect(src).not.toMatch(/from ['"][^'"]*ai\/providers['"]/);
  });

  it('/api/chat usa el flujo determinístico processMessageV2', () => {
    const src = read('src/app/api/chat/route.ts');
    expect(src).toContain('processMessageV2');
  });

  it('providers.ts está marcado como LEGACY / INACTIVE y sin claim de vigencia', () => {
    const src = read('src/lib/ai/providers.ts');
    expect(src).toMatch(/LEGACY|INACTIVE/i);
    // No debe afirmar que el modelo es "vigente".
    expect(src.toLowerCase()).not.toContain('estable y vigente');
  });

  it('providers.ts no registra el objeto de error crudo', () => {
    const src = read('src/lib/ai/providers.ts');
    // No debe existir un console.error que reciba el objeto `error`.
    expect(src).not.toMatch(/console\.error\([^)]*,\s*error\s*\)/);
    expect(src).toContain('Provider request failed.');
  });
});

// ----------------------------------------------------------------------------
// UUID v4 real
// ----------------------------------------------------------------------------

describe('isValidSessionId — UUID v4', () => {
  it('acepta un UUID v4 válido', () => {
    expect(isValidSessionId('3f2504e0-4f89-41d3-9a0c-0305e82c3301')).toBe(true);
    expect(isValidSessionId('9B1DEB4D-3B7D-4BAD-9BDD-2B0D7B3DCB6D')).toBe(true); // upper
  });

  it('rechaza un UUID v1 (versión != 4)', () => {
    // v1 típico: tercer grupo empieza por '1'.
    expect(isValidSessionId('550e8400-e29b-11d4-a716-446655440000')).toBe(false);
  });

  it('rechaza variante inválida (4º grupo fuera de 8/9/a/b)', () => {
    expect(isValidSessionId('3f2504e0-4f89-41d3-7a0c-0305e82c3301')).toBe(false);
  });

  it('rechaza formatos inválidos / HTML / null / número', () => {
    expect(isValidSessionId('no-uuid')).toBe(false);
    expect(isValidSessionId('<script>alert(1)</script>')).toBe(false);
    expect(isValidSessionId('')).toBe(false);
    expect(isValidSessionId(null)).toBe(false);
    expect(isValidSessionId(123)).toBe(false);
  });
});
