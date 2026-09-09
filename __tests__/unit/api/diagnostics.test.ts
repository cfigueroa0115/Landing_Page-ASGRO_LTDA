/**
 * Tests del endpoint TEMPORAL de diagnóstico: /api/diagnostics/runtime.
 *
 * Verifica que:
 * - Reporta los campos esperados como booleanos/estados.
 * - databaseConnectivity refleja ok/failed según SELECT 1.
 * - NUNCA devuelve valores de secretos (ni fragmentos, ni longitudes).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de la conexión a DB: controlamos si SELECT 1 resuelve o falla.
let mockExecuteResult: Promise<unknown>;

vi.mock('@/lib/db', () => {
  const dbMock = { execute: () => mockExecuteResult };
  return {
    db: dbMock,
    getDbAsync: () => Promise.resolve(dbMock),
    getDb: () => dbMock,
  };
});

vi.mock('drizzle-orm', () => ({
  sql: (...args: unknown[]) => args,
}));

// Mock del resolver de secretos: controlamos hasSecret y hasSsmSecret sin exponer valores.
const mockHasSecret = vi.fn();
const mockHasSsmSecret = vi.fn();
vi.mock('@/lib/config/secrets', () => ({
  hasSecret: (name: string) => mockHasSecret(name),
  hasSsmSecret: (name: string) => mockHasSsmSecret(name),
}));

// Mock de la disponibilidad de email (resuelta de forma async, incl. SSM).
const mockEmailAvailable = vi.fn();
vi.mock('@/lib/config/env', () => ({
  isEmailNotificationAvailableAsync: () => mockEmailAvailable(),
}));

describe('GET /api/diagnostics/runtime', () => {
  let GET: () => Promise<Response>;

  const SECRET_VALUE = 'super-secret-value-should-never-appear';

  beforeEach(async () => {
    vi.clearAllMocks();
    mockExecuteResult = Promise.resolve([{ '?column?': 1 }]);
    mockHasSecret.mockReturnValue(true);
    mockHasSsmSecret.mockResolvedValue(false);
    mockEmailAvailable.mockResolvedValue(false);

    // Valores "reales" en el entorno para verificar que NO se filtran.
    process.env.DATABASE_URL = SECRET_VALUE;
    process.env.RESEND_API_KEY = SECRET_VALUE;
    process.env.secrets = JSON.stringify({ DATABASE_URL: SECRET_VALUE });
    process.env.NODE_ENV = 'production';

    const mod = await import('@/app/api/diagnostics/runtime/route');
    GET = mod.GET;
  });

  it('devuelve los campos esperados como booleanos/estados', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.nodeEnv).toBe('production');
    expect(typeof data.databaseUrlAvailable).toBe('boolean');
    expect(typeof data.resendApiKeyAvailable).toBe('boolean');
    expect(typeof data.amplifySecretsContainerAvailable).toBe('boolean');
    expect(typeof data.directDatabaseEnvAvailable).toBe('boolean');
    expect(typeof data.directResendEnvAvailable).toBe('boolean');
    expect(typeof data.ssmDatabaseAvailable).toBe('boolean');
    expect(typeof data.ssmResendAvailable).toBe('boolean');
    expect(typeof data.ssmContactNotificationToAvailable).toBe('boolean');
    expect(typeof data.ssmContactFromEmailAvailable).toBe('boolean');
    expect(typeof data.emailNotificationAvailable).toBe('boolean');
    expect(['ok', 'failed']).toContain(data.databaseConnectivity);
  });

  it('refleja hasSsmSecret/email para los campos de contacto y email', async () => {
    mockHasSsmSecret.mockImplementation((name: string) =>
      Promise.resolve(
        name === 'CONTACT_NOTIFICATION_TO' || name === 'CONTACT_FROM_EMAIL'
      )
    );
    mockEmailAvailable.mockResolvedValue(true);

    const response = await GET();
    const data = await response.json();

    expect(data.ssmContactNotificationToAvailable).toBe(true);
    expect(data.ssmContactFromEmailAvailable).toBe(true);
    expect(data.emailNotificationAvailable).toBe(true);
  });

  it('refleja hasSsmSecret para ssmDatabaseAvailable / ssmResendAvailable', async () => {
    mockHasSsmSecret.mockImplementation((name: string) =>
      Promise.resolve(name === 'RESEND_API_KEY')
    );
    const response = await GET();
    const data = await response.json();

    expect(data.ssmResendAvailable).toBe(true);
    expect(data.ssmDatabaseAvailable).toBe(false);
  });

  it('reporta databaseConnectivity=ok cuando SELECT 1 resuelve', async () => {
    mockExecuteResult = Promise.resolve([{ '?column?': 1 }]);
    const response = await GET();
    const data = await response.json();

    expect(data.databaseConnectivity).toBe('ok');
  });

  it('reporta databaseConnectivity=failed cuando SELECT 1 lanza', async () => {
    mockExecuteResult = Promise.reject(new Error('connection refused'));
    const response = await GET();
    const data = await response.json();

    expect(data.databaseConnectivity).toBe('failed');
  });

  it('refleja hasSecret para databaseUrlAvailable / resendApiKeyAvailable', async () => {
    mockHasSecret.mockImplementation((name: string) => name === 'DATABASE_URL');
    const response = await GET();
    const data = await response.json();

    expect(data.databaseUrlAvailable).toBe(true);
    expect(data.resendApiKeyAvailable).toBe(false);
  });

  it('NUNCA devuelve valores de secretos ni fragmentos', async () => {
    const response = await GET();
    const raw = await response.text();

    // El cuerpo completo no debe contener el valor secreto ni parte de él.
    expect(raw).not.toContain(SECRET_VALUE);
    expect(raw).not.toContain('super-secret');
    // Tampoco debe filtrar el contenido del contenedor de secrets.
    expect(raw).not.toContain('"DATABASE_URL":"');
  });
});
