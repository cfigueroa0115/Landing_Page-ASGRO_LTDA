import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { contactSchema } from '@/lib/validations/contact';
import { quoteSchema } from '@/lib/validations/quote';
import { chatSchema } from '@/lib/validations/chat';

/**
 * Property 1: Validation schemas accept all valid inputs and reject all invalid inputs with descriptive errors.
 * Feature: asgro-landing-page, Property 1: Validation schemas
 *
 * Validates: Requirements 16.2, 17.3, 14.10, 20.9
 */

// --- Generators ---

const validEmail = fc.tuple(
  fc.stringMatching(/^[a-z][a-z0-9]{0,19}$/),
  fc.stringMatching(/^[a-z][a-z0-9]{0,9}$/),
  fc.constantFrom('com', 'co', 'org', 'net', 'edu')
).map(([user, domain, tld]) => `${user}@${domain}.${tld}`);

const validPhone7to15 = fc.integer({ min: 7, max: 15 }).chain((len) =>
  fc.stringMatching(new RegExp(`^\\d{${len}}$`))
);

const validServiceType = fc.constantFrom('arl', 'sst', 'seguros', 'bienestar') as fc.Arbitrary<'arl' | 'sst' | 'seguros' | 'bienestar'>;

const validMessage10to2000 = fc.integer({ min: 10, max: 200 }).chain((len) =>
  fc.string({ minLength: len, maxLength: len }).filter((s) => s.trim().length >= 10)
);

const validStringField = (minLen: number, maxLen: number) =>
  fc.string({ minLength: minLen, maxLength: Math.min(maxLen, 50) })
    .filter((s) => s.trim().length >= minLen);

const validNit = fc.tuple(
  fc.stringMatching(/^\d{3,10}$/),
  fc.constantFrom('', '-'),
  fc.stringMatching(/^\d{0,5}$/)
).map(([digits, sep, check]) => `${digits}${sep}${check}`.replace(/^$/, '123'));

const validQuotePhone = fc.tuple(
  fc.constantFrom('', '+'),
  fc.integer({ min: 1, max: 15 }).chain((len) =>
    fc.stringMatching(new RegExp(`^\\d{${len}}$`))
  )
).map(([prefix, digits]) => `${prefix}${digits}`);

const validUUID = fc.uuid();

const validChatMessage = fc.string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.length >= 1 && s.length <= 500);

// --- Contact Schema Tests ---

describe('Feature: asgro-landing-page, Property 1: Validation schemas', () => {
  describe('contactSchema', () => {
    it('accepts all valid inputs', () => {
      fc.assert(
        fc.property(
          validStringField(1, 100),
          validStringField(1, 120),
          validStringField(1, 100),
          validPhone7to15,
          validEmail,
          validStringField(1, 100),
          validServiceType,
          validMessage10to2000,
          (fullName, company, position, phone, email, city, serviceOfInterest, message) => {
            const input = {
              fullName,
              company,
              position,
              phone,
              email,
              city,
              serviceOfInterest,
              message,
              dataAcceptance: true,
            };
            const result = contactSchema.safeParse(input);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects empty required fields with error messages', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('fullName', 'company', 'position', 'phone', 'email', 'city', 'message'),
          (field) => {
            const validInput = {
              fullName: 'Juan Pérez',
              company: 'Empresa ABC',
              position: 'Gerente',
              phone: '3001234567',
              email: 'test@example.com',
              city: 'Bogotá',
              serviceOfInterest: 'arl' as const,
              message: 'Este es un mensaje de prueba válido',
              dataAcceptance: true,
            };
            const invalidInput = { ...validInput, [field]: '' };
            const result = contactSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
            if (!result.success) {
              const fieldErrors = result.error.flatten().fieldErrors;
              expect(fieldErrors[field as keyof typeof fieldErrors]).toBeDefined();
              expect((fieldErrors[field as keyof typeof fieldErrors] as string[]).length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects invalid email formats', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('noatsign', '@nodomain', 'spaces in@email.com', 'missing@.com', '@', ''),
          (invalidEmail) => {
            const input = {
              fullName: 'Juan Pérez',
              company: 'Empresa ABC',
              position: 'Gerente',
              phone: '3001234567',
              email: invalidEmail,
              city: 'Bogotá',
              serviceOfInterest: 'arl' as const,
              message: 'Este es un mensaje de prueba válido',
              dataAcceptance: true,
            };
            const result = contactSchema.safeParse(input);
            expect(result.success).toBe(false);
            if (!result.success) {
              const fieldErrors = result.error.flatten().fieldErrors;
              expect(fieldErrors.email).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects too-short messages (less than 10 chars)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 9 }),
          (shortMessage) => {
            const input = {
              fullName: 'Juan Pérez',
              company: 'Empresa ABC',
              position: 'Gerente',
              phone: '3001234567',
              email: 'test@example.com',
              city: 'Bogotá',
              serviceOfInterest: 'arl' as const,
              message: shortMessage,
              dataAcceptance: true,
            };
            const result = contactSchema.safeParse(input);
            expect(result.success).toBe(false);
            if (!result.success) {
              const fieldErrors = result.error.flatten().fieldErrors;
              expect(fieldErrors.message).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects dataAcceptance=false with error message', () => {
      const input = {
        fullName: 'Juan Pérez',
        company: 'Empresa ABC',
        position: 'Gerente',
        phone: '3001234567',
        email: 'test@example.com',
        city: 'Bogotá',
        serviceOfInterest: 'arl' as const,
        message: 'Este es un mensaje de prueba válido',
        dataAcceptance: false,
      };
      const result = contactSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.dataAcceptance).toBeDefined();
      }
    });
  });

  // --- Quote Schema Tests ---

  describe('quoteSchema', () => {
    it('accepts all valid inputs', () => {
      fc.assert(
        fc.property(
          validStringField(1, 150),
          validNit,
          validStringField(1, 100),
          validStringField(1, 100),
          validQuotePhone,
          validEmail,
          validStringField(1, 100),
          validStringField(1, 200),
          fc.integer({ min: 1, max: 99999 }),
          validServiceType,
          (companyName, nit, contactName, position, phone, email, city, economicActivity, employeeCount, serviceRequired) => {
            const input = {
              companyName,
              nit,
              contactName,
              position,
              phone,
              email,
              city,
              economicActivity,
              employeeCount,
              serviceRequired,
              dataAcceptance: true,
            };
            const result = quoteSchema.safeParse(input);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects invalid inputs with specific field errors', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            { field: 'companyName', value: '' },
            { field: 'nit', value: 'ABC-XYZ' },
            { field: 'nit', value: '' },
            { field: 'contactName', value: '' },
            { field: 'position', value: '' },
            { field: 'phone', value: 'abc123' },
            { field: 'email', value: 'not-an-email' },
            { field: 'city', value: '' },
            { field: 'economicActivity', value: '' },
            { field: 'employeeCount', value: 0 },
            { field: 'employeeCount', value: 100000 },
            { field: 'dataAcceptance', value: false }
          ),
          ({ field, value }) => {
            const validInput = {
              companyName: 'Empresa Test',
              nit: '900123456-7',
              contactName: 'María López',
              position: 'Directora',
              phone: '+573001234567',
              email: 'maria@empresa.com',
              city: 'Medellín',
              economicActivity: 'Construcción',
              employeeCount: 50,
              serviceRequired: 'sst' as const,
              dataAcceptance: true,
            };
            const invalidInput = { ...validInput, [field]: value };
            const result = quoteSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
            if (!result.success) {
              const fieldErrors = result.error.flatten().fieldErrors;
              expect(fieldErrors[field as keyof typeof fieldErrors]).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('accepts valid optional fields (currentArl, comments)', () => {
      fc.assert(
        fc.property(
          fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          fc.option(fc.string({ minLength: 1, maxLength: 1000 }), { nil: undefined }),
          (currentArl, comments) => {
            const input = {
              companyName: 'Empresa Test',
              nit: '900123456-7',
              contactName: 'María López',
              position: 'Directora',
              phone: '+573001234567',
              email: 'maria@empresa.com',
              city: 'Medellín',
              economicActivity: 'Construcción',
              employeeCount: 50,
              serviceRequired: 'sst' as const,
              currentArl,
              comments,
              dataAcceptance: true,
            };
            const result = quoteSchema.safeParse(input);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // --- Chat Schema Tests ---

  describe('chatSchema', () => {
    it('accepts valid messages (1-500 chars, optional UUID sessionId)', () => {
      fc.assert(
        fc.property(
          validChatMessage,
          fc.option(validUUID, { nil: undefined }),
          (message, sessionId) => {
            const input: Record<string, unknown> = { message };
            if (sessionId !== undefined) {
              input.sessionId = sessionId;
            }
            const result = chatSchema.safeParse(input);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects empty messages', () => {
      const input = { message: '' };
      const result = chatSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.message).toBeDefined();
      }
    });

    it('rejects messages exceeding 500 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 501, maxLength: 600 }),
          (longMessage) => {
            const input = { message: longMessage };
            const result = chatSchema.safeParse(input);
            expect(result.success).toBe(false);
            if (!result.success) {
              const fieldErrors = result.error.flatten().fieldErrors;
              expect(fieldErrors.message).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
