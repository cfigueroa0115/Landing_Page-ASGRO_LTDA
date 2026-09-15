import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests del BLOQUE 3E — Resolver ASÍNCRONO de secretos con AWS SSM Parameter Store.
 *
 * Prioridad esperada de getSecretAsync:
 *   1. process.env.<NOMBRE>
 *   2. process.env.secrets[<NOMBRE>] (JSON)
 *   3. AWS SSM Parameter Store (SecureString)
 *   4. '' (valor seguro)
 */

// ─── Mock de @aws-sdk/client-ssm ────────────────────────────────────────────
// Controlamos la respuesta de send() por nombre de parámetro solicitado.
const mockSend = vi.fn();

vi.mock('@aws-sdk/client-ssm', () => {
  return {
    SSMClient: class {
      send(command: unknown) {
        return mockSend(command);
      }
    },
    // GetParameterCommand guarda el input para que el mock de send lo lea.
    GetParameterCommand: class {
      input: unknown;
      constructor(input: unknown) {
        this.input = input;
      }
    },
  };
});

import {
  getSecretAsync,
  hasSecretAsync,
  hasSsmSecret,
  isSsmPrefixConfigured,
  _resetSsmCache,
} from '@/lib/config/secrets';
import {
  getResendApiKeyAsync,
  getContactNotificationToAsync,
  getContactFromEmailAsync,
  isEmailNotificationAvailableAsync,
} from '@/lib/config/env';

const SSM_KEYS = [
  'DATABASE_URL',
  'RESEND_API_KEY',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'secrets',
  'CONTACT_NOTIFICATION_TO',
  'CONTACT_FROM_EMAIL',
  'NEXT_PUBLIC_SSM_PATH_PREFIX',
];

const PREVIEW_PREFIX = '/asgro/redesign-seguros-first';
const PRODUCTION_PREFIX = '/asgro/production';

function clearEnv() {
  SSM_KEYS.forEach((k) => delete process.env[k]);
}

/**
 * Configura el mock de SSM para devolver `value` cuando el parámetro solicitado
 * termine en `/<name>`. Para el resto, simula "no encontrado" (rechaza).
 */
function mockSsmValue(name: string, value: string) {
  mockSend.mockImplementation((command: { input?: { Name?: string } }) => {
    const requested = command?.input?.Name ?? '';
    if (requested.endsWith(`/${name}`)) {
      return Promise.resolve({ Parameter: { Value: value } });
    }
    return Promise.reject(new Error('ParameterNotFound'));
  });
}

beforeEach(() => {
  clearEnv();
  _resetSsmCache();
  mockSend.mockReset();
  // Prefijo válido por defecto (preview) para que los tests de SSM consulten.
  // Los tests de fallo cerrado lo sobrescriben explícitamente.
  process.env.NEXT_PUBLIC_SSM_PATH_PREFIX = PREVIEW_PREFIX;
  // Por defecto SSM no encuentra nada.
  mockSend.mockRejectedValue(new Error('ParameterNotFound'));
});

afterEach(() => {
  clearEnv();
  _resetSsmCache();
});

describe('Prefijo SSM por entorno (allowlist + fallo cerrado)', () => {
  it('preview: usa /asgro/redesign-seguros-first en la ruta del parámetro', async () => {
    process.env.NEXT_PUBLIC_SSM_PATH_PREFIX = PREVIEW_PREFIX;
    mockSsmValue('DATABASE_URL', 'x');
    await getSecretAsync('DATABASE_URL');
    const command = mockSend.mock.calls[0]![0] as { input: { Name: string } };
    expect(command.input.Name).toBe(`${PREVIEW_PREFIX}/DATABASE_URL`);
    expect(isSsmPrefixConfigured()).toBe(true);
  });

  it('producción: usa /asgro/production en la ruta del parámetro', async () => {
    process.env.NEXT_PUBLIC_SSM_PATH_PREFIX = PRODUCTION_PREFIX;
    mockSsmValue('RESEND_API_KEY', 'x');
    await getSecretAsync('RESEND_API_KEY');
    const command = mockSend.mock.calls[0]![0] as { input: { Name: string } };
    expect(command.input.Name).toBe(`${PRODUCTION_PREFIX}/RESEND_API_KEY`);
    expect(isSsmPrefixConfigured()).toBe(true);
  });

  it('variable ausente → falla cerrada: NO consulta SSM y retorna cadena vacía', async () => {
    delete process.env.NEXT_PUBLIC_SSM_PATH_PREFIX;
    mockSsmValue('DATABASE_URL', 'no-deberia-leerse');
    expect(await getSecretAsync('DATABASE_URL')).toBe('');
    expect(mockSend).not.toHaveBeenCalled();
    expect(isSsmPrefixConfigured()).toBe(false);
  });

  it('prefijo NO autorizado → falla cerrada: NO consulta SSM', async () => {
    process.env.NEXT_PUBLIC_SSM_PATH_PREFIX = '/asgro/otro-entorno';
    mockSsmValue('DATABASE_URL', 'no-deberia-leerse');
    expect(await getSecretAsync('DATABASE_URL')).toBe('');
    expect(mockSend).not.toHaveBeenCalled();
    expect(isSsmPrefixConfigured()).toBe(false);
  });

  it('prefijo vacío → falla cerrada', async () => {
    process.env.NEXT_PUBLIC_SSM_PATH_PREFIX = '';
    mockSsmValue('DATABASE_URL', 'no-deberia-leerse');
    expect(await getSecretAsync('DATABASE_URL')).toBe('');
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe('getSecretAsync — lectura desde SSM Parameter Store', () => {
  it('lee DATABASE_URL desde SSM cuando no hay env ni secrets JSON (Neon via SSM)', async () => {
    mockSsmValue('DATABASE_URL', 'postgresql://ssm:pass@host/db');
    const value = await getSecretAsync('DATABASE_URL');
    expect(value).toBe('postgresql://ssm:pass@host/db');
  });

  it('lee RESEND_API_KEY desde SSM cuando no hay env ni secrets JSON (Resend via SSM)', async () => {
    mockSsmValue('RESEND_API_KEY', 'resend_desde_ssm');
    const value = await getSecretAsync('RESEND_API_KEY');
    expect(value).toBe('resend_desde_ssm');
  });

  it('solicita el parámetro con la ruta y WithDecryption correctos', async () => {
    mockSsmValue('DATABASE_URL', 'x');
    await getSecretAsync('DATABASE_URL');
    const command = mockSend.mock.calls[0]![0] as { input: { Name: string; WithDecryption: boolean } };
    expect(command.input.Name).toBe('/asgro/redesign-seguros-first/DATABASE_URL');
    expect(command.input.WithDecryption).toBe(true);
  });
});

describe('getSecretAsync — prioridad de fuentes', () => {
  it('prioriza process.env directo sobre SSM', async () => {
    process.env.DATABASE_URL = 'desde_env_directo';
    mockSsmValue('DATABASE_URL', 'desde_ssm');
    expect(await getSecretAsync('DATABASE_URL')).toBe('desde_env_directo');
    // No debió consultar SSM.
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('prioriza process.env.secrets (JSON) sobre SSM', async () => {
    process.env.secrets = JSON.stringify({ RESEND_API_KEY: 'desde_json' });
    mockSsmValue('RESEND_API_KEY', 'desde_ssm');
    expect(await getSecretAsync('RESEND_API_KEY')).toBe('desde_json');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('cae a SSM solo cuando no hay env directo ni secrets JSON', async () => {
    mockSsmValue('DATABASE_URL', 'desde_ssm');
    expect(await getSecretAsync('DATABASE_URL')).toBe('desde_ssm');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});

describe('getSecretAsync — robustez', () => {
  it('SSM falla → retorna valor seguro (cadena vacía), sin lanzar', async () => {
    mockSend.mockRejectedValue(new Error('AccessDeniedException'));
    await expect(getSecretAsync('DATABASE_URL')).resolves.toBe('');
  });

  it('hasSecretAsync refleja disponibilidad incluyendo SSM', async () => {
    mockSsmValue('RESEND_API_KEY', 'ok');
    expect(await hasSecretAsync('RESEND_API_KEY')).toBe(true);
    _resetSsmCache();
    mockSend.mockRejectedValue(new Error('ParameterNotFound'));
    expect(await hasSecretAsync('OPENAI_API_KEY')).toBe(false);
  });

  it('hasSsmSecret consulta solo SSM (ignora env directo)', async () => {
    // env directo presente, pero SSM NO tiene el parámetro.
    process.env.DATABASE_URL = 'desde_env';
    mockSend.mockRejectedValue(new Error('ParameterNotFound'));
    expect(await hasSsmSecret('DATABASE_URL')).toBe(false);
  });
});

/**
 * Configura el mock de SSM para devolver un mapa nombre→valor. Cualquier
 * parámetro no presente en el mapa se simula como "no encontrado".
 */
function mockSsmValues(values: Record<string, string>) {
  mockSend.mockImplementation((command: { input?: { Name?: string } }) => {
    const requested = command?.input?.Name ?? '';
    for (const [name, value] of Object.entries(values)) {
      if (requested.endsWith(`/${name}`)) {
        return Promise.resolve({ Parameter: { Value: value } });
      }
    }
    return Promise.reject(new Error('ParameterNotFound'));
  });
}

describe('Config de email — resolución asíncrona vía SSM (RESEND + CONTACT_*)', () => {
  it('getResendApiKeyAsync obtiene la clave desde SSM', async () => {
    mockSsmValue('RESEND_API_KEY', 'resend_ssm_key');
    expect(await getResendApiKeyAsync()).toBe('resend_ssm_key');
  });

  it('getContactNotificationToAsync obtiene el destinatario desde SSM', async () => {
    mockSsmValue('CONTACT_NOTIFICATION_TO', 'destino@example.com');
    expect(await getContactNotificationToAsync()).toBe('destino@example.com');
  });

  it('getContactFromEmailAsync obtiene el remitente desde SSM', async () => {
    mockSsmValue('CONTACT_FROM_EMAIL', 'ASGRO <no-reply@example.com>');
    expect(await getContactFromEmailAsync()).toBe('ASGRO <no-reply@example.com>');
  });

  it('CONTACT_NOTIFICATION_TO: prioriza env directo sobre SSM', async () => {
    process.env.CONTACT_NOTIFICATION_TO = 'env@example.com';
    mockSsmValue('CONTACT_NOTIFICATION_TO', 'ssm@example.com');
    expect(await getContactNotificationToAsync()).toBe('env@example.com');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('isEmailNotificationAvailableAsync=true con las TRES variables vía SSM', async () => {
    mockSsmValues({
      RESEND_API_KEY: 'resend_ssm_key',
      CONTACT_NOTIFICATION_TO: 'destino@example.com',
      CONTACT_FROM_EMAIL: 'ASGRO <no-reply@example.com>',
    });
    expect(await isEmailNotificationAvailableAsync()).toBe(true);
  });

  it('isEmailNotificationAvailableAsync=false si falta CONTACT_NOTIFICATION_TO en SSM', async () => {
    mockSsmValues({
      RESEND_API_KEY: 'resend_ssm_key',
      CONTACT_FROM_EMAIL: 'ASGRO <no-reply@example.com>',
    });
    expect(await isEmailNotificationAvailableAsync()).toBe(false);
  });

  it('isEmailNotificationAvailableAsync=false si falta CONTACT_FROM_EMAIL en SSM', async () => {
    mockSsmValues({
      RESEND_API_KEY: 'resend_ssm_key',
      CONTACT_NOTIFICATION_TO: 'destino@example.com',
    });
    expect(await isEmailNotificationAvailableAsync()).toBe(false);
  });

  it('isEmailNotificationAvailableAsync=false si falta RESEND aun con CONTACT_* presentes', async () => {
    mockSsmValues({
      CONTACT_NOTIFICATION_TO: 'destino@example.com',
      CONTACT_FROM_EMAIL: 'ASGRO <no-reply@example.com>',
    });
    expect(await isEmailNotificationAvailableAsync()).toBe(false);
  });
});
