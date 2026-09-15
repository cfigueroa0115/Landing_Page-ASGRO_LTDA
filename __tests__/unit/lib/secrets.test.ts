import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSecret, hasSecret } from '@/lib/config/secrets';

/**
 * Tests del BLOQUE 3C — Resolver de secretos compatible con AWS Amplify Gen 1.
 *
 * Prioridad esperada:
 *   1. process.env.<NOMBRE>
 *   2. process.env.secrets[<NOMBRE>] (JSON)
 *   3. '' (valor seguro)
 */

const KEYS = ['DATABASE_URL', 'RESEND_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY', 'secrets'];

function clearAll() {
  KEYS.forEach((k) => {
    delete process.env[k];
  });
}

beforeEach(() => {
  clearAll();
});

afterEach(() => {
  clearAll();
});

describe('getSecret — lectura desde process.env directo', () => {
  it('lee RESEND_API_KEY desde process.env.RESEND_API_KEY', () => {
    process.env.RESEND_API_KEY = 'key_directo';
    expect(getSecret('RESEND_API_KEY')).toBe('key_directo');
    expect(hasSecret('RESEND_API_KEY')).toBe(true);
  });

  it('DATABASE_URL funciona con el mismo resolver (process.env directo)', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@host/db';
    expect(getSecret('DATABASE_URL')).toBe('postgresql://user:pass@host/db');
  });
});

describe('getSecret — lectura desde process.env.secrets (JSON de Amplify)', () => {
  it('lee RESEND_API_KEY desde el JSON de secrets cuando no hay variable directa', () => {
    process.env.secrets = JSON.stringify({ RESEND_API_KEY: 'key_desde_json' });
    expect(getSecret('RESEND_API_KEY')).toBe('key_desde_json');
  });

  it('DATABASE_URL funciona con el mismo resolver (desde JSON)', () => {
    process.env.secrets = JSON.stringify({
      DATABASE_URL: 'postgresql://json:pass@host/db',
    });
    expect(getSecret('DATABASE_URL')).toBe('postgresql://json:pass@host/db');
  });
});

describe('getSecret — prioridad y robustez', () => {
  it('prioriza la variable directa sobre el JSON', () => {
    process.env.RESEND_API_KEY = 'key_directo';
    process.env.secrets = JSON.stringify({ RESEND_API_KEY: 'key_desde_json' });
    expect(getSecret('RESEND_API_KEY')).toBe('key_directo');
  });

  it('JSON inválido no rompe la app (retorna valor seguro)', () => {
    process.env.secrets = '{ esto no es json válido';
    expect(() => getSecret('RESEND_API_KEY')).not.toThrow();
    expect(getSecret('RESEND_API_KEY')).toBe('');
  });

  it('secreto faltante (sin variable ni JSON) devuelve cadena vacía', () => {
    expect(getSecret('OPENAI_API_KEY')).toBe('');
    expect(hasSecret('OPENAI_API_KEY')).toBe(false);
  });

  it('secrets como JSON válido pero sin la clave devuelve cadena vacía', () => {
    process.env.secrets = JSON.stringify({ OTRA_COSA: 'x' });
    expect(getSecret('GEMINI_API_KEY')).toBe('');
  });

  it('secrets con valor no-string para la clave devuelve cadena vacía', () => {
    process.env.secrets = JSON.stringify({ DATABASE_URL: 12345 });
    expect(getSecret('DATABASE_URL')).toBe('');
  });
});
