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

function resetDbMocks() {
  mockInsertResult = Promise.resolve(undefined);
  mockSelectResult = Promise.resolve([]);
  mockReturningResult = Promise.resolve([{ id: 'mock-uuid-1234' }]);
}

vi.mock('@/lib/db', () => ({
  db: new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'insert') {
          return () => ({
            values: () => {
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
  ),
}));

// Mock @/lib/ai/agent
const mockProcessMessage = vi.fn();
vi.mock('@/lib/ai/agent', () => ({
  processMessage: (...args: unknown[]) => mockProcessMessage(...args),
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
    // Default: AI response
    mockProcessMessage.mockResolvedValue('Hola, soy el asistente de ASGRO.');
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
