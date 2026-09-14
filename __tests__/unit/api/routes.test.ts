/**
 * Unit tests for API routes: contact, quote, chat, faqs, metrics, time
 * Tests cover success, validation errors, DB failure scenarios,
 * and the three-state business hours logic for the time API.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mocks
// ============================================================================

// Chainable mock DB that tracks calls and returns configurable results
let mockInsertResult: Promise<unknown>;
let mockSelectResult: Promise<unknown>;
let mockReturningResult: Promise<unknown>;
/** Captura del último payload pasado a db.insert(...).values(...) */
let capturedInsertValues: Record<string, unknown> | null = null;

function resetDbMocks() {
  mockInsertResult = Promise.resolve(undefined);
  mockSelectResult = Promise.resolve([]);
  mockReturningResult = Promise.resolve([{ id: 'mock-uuid-1234' }]);
  capturedInsertValues = null;
}

vi.mock('@/lib/db', () => {
  const dbProxy = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'insert') {
          return () => ({
            values: (vals: unknown) => {
              // Capturar solo objetos (inserts de fila única) para aserciones.
              if (vals && typeof vals === 'object' && !Array.isArray(vals)) {
                capturedInsertValues = vals as Record<string, unknown>;
              }
              return {
                returning: () => mockReturningResult,
                then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
                  mockInsertResult.then(resolve, reject),
                catch: (reject: (e: unknown) => unknown) => mockInsertResult.catch(reject),
              };
            },
          });
        }
        if (prop === 'select') {
          return () => ({
            from: () => ({
              where: () => ({
                orderBy: () => ({
                  limit: () => mockSelectResult,
                  then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
                    mockSelectResult.then(resolve, reject),
                  catch: (reject: (e: unknown) => unknown) => mockSelectResult.catch(reject),
                }),
                limit: () => mockSelectResult,
                then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
                  mockSelectResult.then(resolve, reject),
                catch: (reject: (e: unknown) => unknown) => mockSelectResult.catch(reject),
              }),
              orderBy: () => ({
                limit: () => mockSelectResult,
                then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
                  mockSelectResult.then(resolve, reject),
                catch: (reject: (e: unknown) => unknown) => mockSelectResult.catch(reject),
              }),
            }),
          });
        }
        return undefined;
      },
    }
  );
  return {
    db: dbProxy,
    // Las rutas ahora usan getDbAsync(); devuelve el mismo Proxy mockeado.
    getDbAsync: () => Promise.resolve(dbProxy),
    getDb: () => dbProxy,
  };
});

// Mock @/lib/ai/agent-v2 (flujo V2 gobernado usado por /api/chat)
const mockProcessMessageV2 = vi.fn();
vi.mock('@/lib/ai/agent-v2', () => ({
  processMessageV2: (...args: unknown[]) => mockProcessMessageV2(...args),
}));

// Mock @/lib/email/notifications — controla el resultado `notified` de forma
// determinista (sin depender de env de email ni de la red).
const mockSendContactNotification = vi.fn();
const mockSendQuoteNotification = vi.fn();
vi.mock('@/lib/email/notifications', () => ({
  sendContactNotification: (...args: unknown[]) => mockSendContactNotification(...args),
  sendQuoteNotification: (...args: unknown[]) => mockSendQuoteNotification(...args),
}));

// Mock drizzle-orm operators
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((...args: unknown[]) => args),
  asc: vi.fn((...args: unknown[]) => args),
  desc: vi.fn((...args: unknown[]) => args),
}));

// Mock @/lib/utils/format for time route
const mockGetColombiaTime = vi.fn();
vi.mock('@/lib/utils/format', () => ({
  getColombiaTime: () => mockGetColombiaTime(),
}));

// ============================================================================
// Helpers
// ============================================================================

function createPostRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Valid test data
const validContactBody = {
  fullName: 'Juan Pérez',
  company: 'Empresa Test',
  position: 'Gerente',
  phone: '3001234567',
  email: 'juan@empresa.com',
  city: 'Bogotá',
  serviceOfInterest: 'sst',
  message: 'Necesito información sobre servicios SST para mi empresa',
  dataAcceptance: true,
};

const validQuoteBody = {
  companyName: 'Empresa SST Ltda',
  nit: '900123456-7',
  contactName: 'María García',
  position: 'Director RRHH',
  phone: '3109876543',
  email: 'maria@empresa.com',
  city: 'Medellín',
  economicActivity: 'Construcción',
  employeeCount: 50,
  serviceRequired: 'arl',
  dataAcceptance: true,
};

const validChatBody = {
  message: 'Hola, necesito información sobre seguros ARL',
};

// ============================================================================
// Contact Route Tests
// ============================================================================

describe('POST /api/contact', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetDbMocks();
    // Por defecto la notificación se envía correctamente.
    mockSendContactNotification.mockResolvedValue({ sent: true });
    const mod = await import('@/app/api/contact/route');
    POST = mod.POST;
  });

  it('returns 201 on valid body', async () => {
    const request = createPostRequest('http://localhost/api/contact', validContactBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Lead stored successfully');
  });

  it('returns 201 with notified:true when the email notification is sent', async () => {
    mockSendContactNotification.mockResolvedValue({ sent: true });
    const request = createPostRequest('http://localhost/api/contact', validContactBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.notified).toBe(true);
  });

  it('returns 201 with notified:false when the lead is stored but the email fails', async () => {
    // El lead se guarda igual; solo la notificación falla de forma controlada.
    mockSendContactNotification.mockResolvedValue({ sent: false });
    const request = createPostRequest('http://localhost/api/contact', validContactBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.notified).toBe(false);
  });

  it('returns 400 with field errors on invalid body', async () => {
    const invalidBody = { fullName: '', email: 'not-an-email' };
    const request = createPostRequest('http://localhost/api/contact', invalidBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('returns 400 when dataAcceptance is false', async () => {
    const body = { ...validContactBody, dataAcceptance: false };
    const request = createPostRequest('http://localhost/api/contact', body);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toHaveProperty('dataAcceptance');
  });

  it('returns 503 on database connection error', async () => {
    mockInsertResult = Promise.reject(new Error('ECONNREFUSED: connection refused'));
    const request = createPostRequest('http://localhost/api/contact', validContactBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Service temporarily unavailable');
  });

  it('returns 500 on unexpected error', async () => {
    mockInsertResult = Promise.reject(new Error('Unexpected internal failure'));
    const request = createPostRequest('http://localhost/api/contact', validContactBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An error occurred processing your request');
  });
});

// ============================================================================
// Quote Route Tests
// ============================================================================

describe('POST /api/quote', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetDbMocks();
    // Por defecto la notificación se envía correctamente.
    mockSendQuoteNotification.mockResolvedValue({ sent: true });
    const mod = await import('@/app/api/quote/route');
    POST = mod.POST;
  });

  it('returns 201 on valid body', async () => {
    const request = createPostRequest('http://localhost/api/quote', validQuoteBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Quote request stored successfully');
  });

  it('returns 201 with notified:true when the email notification is sent', async () => {
    mockSendQuoteNotification.mockResolvedValue({ sent: true });
    const request = createPostRequest('http://localhost/api/quote', validQuoteBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.notified).toBe(true);
  });

  it('returns 201 with notified:false when the quote is stored but the email fails', async () => {
    mockSendQuoteNotification.mockResolvedValue({ sent: false });
    const request = createPostRequest('http://localhost/api/quote', validQuoteBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.notified).toBe(false);
  });

  it('returns 201 with optional fields', async () => {
    const body = {
      ...validQuoteBody,
      currentArl: 'Sura',
      comments: 'Necesito cotización urgente',
    };
    const request = createPostRequest('http://localhost/api/quote', body);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });

  // ── 5B.3.2: persistencia segura del contexto comercial (interest) ──────────

  it('persiste el contexto de interés (cumplimiento) en comments', async () => {
    const body = { ...validQuoteBody, serviceRequired: 'seguros', interest: 'cumplimiento' };
    const request = createPostRequest('http://localhost/api/quote', body);
    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(String(capturedInsertValues?.comments)).toContain('Póliza de cumplimiento');
    expect(String(capturedInsertValues?.comments)).toContain('Interés originado desde la Asesora');
  });

  it('preserva el comentario del usuario junto al contexto', async () => {
    const body = {
      ...validQuoteBody,
      serviceRequired: 'seguros',
      interest: 'responsabilidad_civil',
      comments: 'Requiero RC para una obra.',
    };
    const request = createPostRequest('http://localhost/api/quote', body);
    await POST(request);

    const stored = String(capturedInsertValues?.comments);
    expect(stored).toContain('Responsabilidad civil');
    expect(stored).toContain('Requiero RC para una obra.');
  });

  it('ARL/SST persisten su contexto', async () => {
    for (const [interest, service, label] of [
      ['arl', 'arl', 'ARL'],
      ['sst', 'sst', 'SST'],
    ] as const) {
      resetDbMocks();
      mockSendQuoteNotification.mockResolvedValue({ sent: true });
      const request = createPostRequest('http://localhost/api/quote', {
        ...validQuoteBody,
        serviceRequired: service,
        interest,
      });
      await POST(request);
      expect(String(capturedInsertValues?.comments)).toContain(label);
    }
  });

  it('sin interest → comments legacy intacto', async () => {
    const request = createPostRequest('http://localhost/api/quote', {
      ...validQuoteBody,
      comments: 'Comentario simple',
    });
    await POST(request);
    expect(capturedInsertValues?.comments).toBe('Comentario simple');
    expect(String(capturedInsertValues?.comments)).not.toContain('Interés originado');
  });

  it('interest inválido (PII/HTML) es rechazado por Zod (400) y no se persiste', async () => {
    const request = createPostRequest('http://localhost/api/quote', {
      ...validQuoteBody,
      interest: 'juan@email.com',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(capturedInsertValues).toBeNull();
  });

  it('el email recibe la etiqueta de interés (interestLabel)', async () => {
    const request = createPostRequest('http://localhost/api/quote', {
      ...validQuoteBody,
      serviceRequired: 'seguros',
      interest: 'cumplimiento',
    });
    await POST(request);
    const arg = mockSendQuoteNotification.mock.calls[0]?.[0] as { interestLabel?: string };
    expect(arg.interestLabel).toBe('Póliza de cumplimiento');
  });

  it('returns 400 with field errors on invalid body', async () => {
    const invalidBody = { companyName: '', nit: 'abc' };
    const request = createPostRequest('http://localhost/api/quote', invalidBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('returns 400 when employeeCount is not a number', async () => {
    const body = { ...validQuoteBody, employeeCount: 'many' };
    const request = createPostRequest('http://localhost/api/quote', body);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('returns 503 on database connection error', async () => {
    mockInsertResult = Promise.reject(new Error('timeout: database connection timed out'));
    const request = createPostRequest('http://localhost/api/quote', validQuoteBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Service temporarily unavailable');
  });

  it('returns 500 on unexpected error', async () => {
    mockInsertResult = Promise.reject(new Error('Something unexpected'));
    const request = createPostRequest('http://localhost/api/quote', validQuoteBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An error occurred processing your request');
  });
});

// ============================================================================
// Chat Route Tests
// ============================================================================

describe('POST /api/chat', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetDbMocks();
    // Default: session creation returns a valid session ID
    mockReturningResult = Promise.resolve([{ id: 'new-session-uuid-1234' }]);
    // Default: select queries return empty arrays
    mockSelectResult = Promise.resolve([]);
    // Default: V2 governed response (sin acciones comerciales)
    mockProcessMessageV2.mockResolvedValue({
      response: 'Hola, soy el asistente de ASGRO.',
      actions: [],
      meta: { intent: 'general_insurance', usedEntries: [], fallback: false },
    });
    // Default: insert (for messages) resolves
    mockInsertResult = Promise.resolve(undefined);

    const mod = await import('@/app/api/chat/route');
    POST = mod.POST;
  });

  it('returns response with sessionId on valid body (no sessionId)', async () => {
    const request = createPostRequest('http://localhost/api/chat', validChatBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('new-session-uuid-1234');
    expect(data.response).toBe('Hola, soy el asistente de ASGRO.');
    expect(data.timestamp).toBeDefined();
  });

  it('no expone internals del flujo V2 (intent, scores, keys, meta)', async () => {
    const request = createPostRequest('http://localhost/api/chat', validChatBody);
    const response = await POST(request);
    const raw = await response.text();

    expect(raw).not.toContain('usedEntries');
    expect(raw).not.toContain('meta');
    const data = JSON.parse(raw);
    // Sin actions: contrato mínimo backward-compatible.
    expect(Object.keys(data).sort()).toEqual(['response', 'sessionId', 'timestamp']);
  });

  it('incluye actions cuando el flujo V2 las devuelve (contrato extendido)', async () => {
    mockProcessMessageV2.mockResolvedValue({
      response: 'Con gusto te ayudo a cotizar.',
      actions: [{ type: 'quote', label: 'Solicitar cotización', href: '/cotizar' }],
      meta: { intent: 'cotizacion', usedEntries: [], fallback: false },
    });
    const request = createPostRequest('http://localhost/api/chat', validChatBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.actions)).toBe(true);
    expect(data.actions[0]).toEqual({ type: 'quote', label: 'Solicitar cotización', href: '/cotizar' });
    // Nunca expone meta/usedEntries aunque el flujo los tenga internamente.
    expect(data.meta).toBeUndefined();
    expect(data.usedEntries).toBeUndefined();
  });

  it('omite actions cuando el flujo V2 devuelve []', async () => {
    mockProcessMessageV2.mockResolvedValue({
      response: 'Info general.',
      actions: [],
      meta: { intent: 'hogar', usedEntries: [], fallback: false },
    });
    const request = createPostRequest('http://localhost/api/chat', validChatBody);
    const response = await POST(request);
    const data = await response.json();

    expect(data.actions).toBeUndefined();
  });

  it('creates a new session when no sessionId provided', async () => {
    const request = createPostRequest('http://localhost/api/chat', validChatBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBeDefined();
  });

  it('returns 400 with field errors on invalid body', async () => {
    const invalidBody = { message: '' };
    const request = createPostRequest('http://localhost/api/chat', invalidBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('returns 400 when message exceeds 500 characters', async () => {
    const longMessage = 'a'.repeat(501);
    const request = createPostRequest('http://localhost/api/chat', { message: longMessage });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('returns 400 when sessionId is not a valid UUID', async () => {
    const body = { sessionId: 'not-a-uuid', message: 'Hola' };
    const request = createPostRequest('http://localhost/api/chat', body);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toHaveProperty('sessionId');
  });

  it('returns 503 on database connection error', async () => {
    mockReturningResult = Promise.reject(new Error('ECONNREFUSED: connection refused'));
    const request = createPostRequest('http://localhost/api/chat', validChatBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Service temporarily unavailable');
  });
});

// ============================================================================
// FAQs Route Tests
// ============================================================================

describe('GET /api/faqs', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetDbMocks();
    const mod = await import('@/app/api/faqs/route');
    GET = mod.GET;
  });

  it('returns active FAQs ordered by order_index', async () => {
    const mockFaqs = [
      { id: '1', question: '¿Qué es SST?', answer: 'Sistema...', category: 'sst', orderIndex: 0, isActive: true },
      { id: '2', question: '¿Qué es ARL?', answer: 'Administradora...', category: 'arl', orderIndex: 1, isActive: true },
    ];
    mockSelectResult = Promise.resolve(mockFaqs);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockFaqs);
  });

  it('returns empty array when no active FAQs exist', async () => {
    mockSelectResult = Promise.resolve([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('returns 503 on database connection error', async () => {
    mockSelectResult = Promise.reject(new Error('ECONNREFUSED: connection refused'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Service temporarily unavailable');
  });

  it('returns 500 on unexpected error', async () => {
    mockSelectResult = Promise.reject(new Error('Something unexpected'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An error occurred processing your request');
  });
});

// ============================================================================
// Metrics Route Tests
// ============================================================================

describe('GET /api/metrics', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetDbMocks();
    const mod = await import('@/app/api/metrics/route');
    GET = mod.GET;
  });

  it('returns active metrics ordered by order_index', async () => {
    const mockMetrics = [
      { id: '1', label: 'Empresas asesoradas', value: 500, unit: '+', orderIndex: 0, isActive: true },
      { id: '2', label: 'Años de experiencia', value: 15, unit: 'años', orderIndex: 1, isActive: true },
    ];
    mockSelectResult = Promise.resolve(mockMetrics);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockMetrics);
  });

  it('returns empty array when no active metrics exist', async () => {
    mockSelectResult = Promise.resolve([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('returns 503 on database connection error', async () => {
    mockSelectResult = Promise.reject(new Error('timeout: database pool exhausted'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Service temporarily unavailable');
  });

  it('returns 500 on unexpected error', async () => {
    mockSelectResult = Promise.reject(new Error('Unknown failure'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An error occurred processing your request');
  });
});

// ============================================================================
// Time Route Tests — Three-state business hours
// ============================================================================

describe('GET /api/time', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/app/api/time/route');
    GET = mod.GET;
  });

  it('returns date, time, dayOfWeek, timezone, and status fields', async () => {
    mockGetColombiaTime.mockReturnValue({
      date: '15/01/2025',
      time: '10:30:00',
      dayOfWeek: 'miércoles',
      timezone: 'America/Bogota',
      isBusinessHours: true,
      availabilityStatus: 'Disponible',
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.date).toBe('2025-01-15');
    expect(data.time).toBe('10:30');
    expect(data.dayOfWeek).toBe('miércoles');
    expect(data.timezone).toBe('America/Bogota');
    expect(data.isBusinessHours).toBe(true);
    expect(data.availabilityStatus).toBe('Disponible');
  });

  it('returns "Disponible" during weekday business hours (Mon-Fri 8:00-18:00)', async () => {
    mockGetColombiaTime.mockReturnValue({
      date: '13/01/2025',
      time: '09:00:00',
      dayOfWeek: 'lunes',
      timezone: 'America/Bogota',
      isBusinessHours: true,
      availabilityStatus: 'Disponible',
    });

    const response = await GET();
    const data = await response.json();

    expect(data.isBusinessHours).toBe(true);
    expect(data.availabilityStatus).toBe('Disponible');
  });

  it('returns "Fuera de horario" outside weekday business hours', async () => {
    mockGetColombiaTime.mockReturnValue({
      date: '13/01/2025',
      time: '20:00:00',
      dayOfWeek: 'lunes',
      timezone: 'America/Bogota',
      isBusinessHours: false,
      availabilityStatus: 'Fuera de horario',
    });

    const response = await GET();
    const data = await response.json();

    expect(data.isBusinessHours).toBe(false);
    expect(data.availabilityStatus).toBe('Fuera de horario');
  });

  it('returns "Disponible" on Saturday morning (8:00-12:00)', async () => {
    mockGetColombiaTime.mockReturnValue({
      date: '18/01/2025',
      time: '10:00:00',
      dayOfWeek: 'sábado',
      timezone: 'America/Bogota',
      isBusinessHours: true,
      availabilityStatus: 'Disponible',
    });

    const response = await GET();
    const data = await response.json();

    expect(data.isBusinessHours).toBe(true);
    expect(data.availabilityStatus).toBe('Disponible');
  });

  it('returns "Fuera de horario" on Saturday afternoon', async () => {
    mockGetColombiaTime.mockReturnValue({
      date: '18/01/2025',
      time: '14:00:00',
      dayOfWeek: 'sábado',
      timezone: 'America/Bogota',
      isBusinessHours: false,
      availabilityStatus: 'Fuera de horario',
    });

    const response = await GET();
    const data = await response.json();

    expect(data.isBusinessHours).toBe(false);
    expect(data.availabilityStatus).toBe('Fuera de horario');
  });

  it('returns "Canal digital activo" on Sunday', async () => {
    mockGetColombiaTime.mockReturnValue({
      date: '19/01/2025',
      time: '12:00:00',
      dayOfWeek: 'domingo',
      timezone: 'America/Bogota',
      isBusinessHours: false,
      availabilityStatus: 'Canal digital activo',
    });

    const response = await GET();
    const data = await response.json();

    expect(data.isBusinessHours).toBe(false);
    expect(data.availabilityStatus).toBe('Canal digital activo');
  });

  it('returns 500 on unexpected error', async () => {
    mockGetColombiaTime.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An error occurred processing your request');
  });
});
