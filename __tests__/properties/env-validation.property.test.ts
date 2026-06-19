import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { getEnv, _resetEnvCache } from '@/lib/config/env';

/**
 * Property 6: Environment validation rejects missing required variables with specific error messages.
 * Feature: asgro-landing-page, Property 6: Environment validation
 *
 * Validates: Requirements 24.6
 */

// --- Helpers ---

/** Base valid env with all required variables set */
const baseValidEnv: Record<string, string> = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
  NEXT_PUBLIC_WHATSAPP_NUMBER: '+573001234567',
  NEXT_PUBLIC_COMPANY_PHONE: '+573009876543',
  NEXT_PUBLIC_COMPANY_EMAIL: 'info@asgro.co',
  NEXT_PUBLIC_COMPANY_ADDRESS: 'Calle 100 #15-20, Bogotá',
  NODE_ENV: 'production',
};

/** Sets process.env to a given object, clearing previous env vars */
function stubProcessEnv(envVars: Record<string, string | undefined>) {
  // Clear all env vars that our schema cares about
  const allKeys = [
    'DATABASE_URL',
    'NEXT_PUBLIC_WHATSAPP_NUMBER',
    'NEXT_PUBLIC_COMPANY_PHONE',
    'NEXT_PUBLIC_COMPANY_EMAIL',
    'NEXT_PUBLIC_COMPANY_ADDRESS',
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
    'RESEND_API_KEY',
    'NODE_ENV',
  ];
  for (const key of allKeys) {
    delete process.env[key];
  }
  // Set provided vars
  for (const [key, value] of Object.entries(envVars)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
}

describe('Feature: asgro-landing-page, Property 6: Environment validation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    _resetEnvCache();
  });

  afterEach(() => {
    // Restore original process.env
    const allKeys = [
      'DATABASE_URL',
      'NEXT_PUBLIC_WHATSAPP_NUMBER',
      'NEXT_PUBLIC_COMPANY_PHONE',
      'NEXT_PUBLIC_COMPANY_EMAIL',
      'NEXT_PUBLIC_COMPANY_ADDRESS',
      'OPENAI_API_KEY',
      'GEMINI_API_KEY',
      'RESEND_API_KEY',
      'NODE_ENV',
    ];
    for (const key of allKeys) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
    _resetEnvCache();
  });

  it('missing DATABASE_URL always throws with message containing "DATABASE_URL"', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary non-production NODE_ENV values
        fc.constantFrom('development', 'production', 'test'),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (nodeEnv, whatsapp, phone, email, address) => {
          _resetEnvCache();
          stubProcessEnv({
            // DATABASE_URL intentionally omitted
            NODE_ENV: nodeEnv,
            NEXT_PUBLIC_WHATSAPP_NUMBER: whatsapp,
            NEXT_PUBLIC_COMPANY_PHONE: phone,
            NEXT_PUBLIC_COMPANY_EMAIL: email,
            NEXT_PUBLIC_COMPANY_ADDRESS: address,
          });

          expect(() => getEnv()).toThrow();
          try {
            getEnv();
          } catch (e: unknown) {
            const msg = (e as Error).message;
            expect(msg).toContain('DATABASE_URL');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('in production, missing NEXT_PUBLIC_WHATSAPP_NUMBER throws with specific error', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (phone, email, address) => {
          _resetEnvCache();
          stubProcessEnv({
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
            NODE_ENV: 'production',
            // NEXT_PUBLIC_WHATSAPP_NUMBER intentionally omitted
            NEXT_PUBLIC_COMPANY_PHONE: phone,
            NEXT_PUBLIC_COMPANY_EMAIL: email,
            NEXT_PUBLIC_COMPANY_ADDRESS: address,
          });

          expect(() => getEnv()).toThrow();
          try {
            getEnv();
          } catch (e: unknown) {
            const msg = (e as Error).message;
            expect(msg).toContain('NEXT_PUBLIC_WHATSAPP_NUMBER');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('in production, missing NEXT_PUBLIC_COMPANY_PHONE/EMAIL/ADDRESS throws with specific error', () => {
    const contactVars = [
      'NEXT_PUBLIC_COMPANY_PHONE',
      'NEXT_PUBLIC_COMPANY_EMAIL',
      'NEXT_PUBLIC_COMPANY_ADDRESS',
    ] as const;

    // Generate non-empty subsets using boolean tuple
    const nonEmptySubsetArb = fc.tuple(
      fc.boolean(),
      fc.boolean(),
      fc.boolean()
    ).filter(flags => flags.some(Boolean))
      .map(flags => contactVars.filter((_, i) => flags[i]));

    fc.assert(
      fc.property(
        nonEmptySubsetArb,
        (missingVars) => {
          _resetEnvCache();
          const env: Record<string, string> = {
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
            NODE_ENV: 'production',
            NEXT_PUBLIC_WHATSAPP_NUMBER: '+573001234567',
            NEXT_PUBLIC_COMPANY_PHONE: '+573009876543',
            NEXT_PUBLIC_COMPANY_EMAIL: 'info@asgro.co',
            NEXT_PUBLIC_COMPANY_ADDRESS: 'Calle 100 #15-20, Bogotá',
          };

          // Remove the subset of vars
          for (const varName of missingVars) {
            delete env[varName];
          }

          stubProcessEnv(env);

          expect(() => getEnv()).toThrow();
          try {
            getEnv();
          } catch (e: unknown) {
            const msg = (e as Error).message;
            // Each missing var name should appear in the error message
            for (const varName of missingVars) {
              expect(msg).toContain(varName);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('in development, missing contact vars does NOT throw', () => {
    const contactVarsAll = [
      'NEXT_PUBLIC_WHATSAPP_NUMBER',
      'NEXT_PUBLIC_COMPANY_PHONE',
      'NEXT_PUBLIC_COMPANY_EMAIL',
      'NEXT_PUBLIC_COMPANY_ADDRESS',
    ] as const;

    // Generate any subset (including empty) using boolean flags
    const subsetArb = fc.tuple(
      fc.boolean(),
      fc.boolean(),
      fc.boolean(),
      fc.boolean()
    ).map(flags => contactVarsAll.filter((_, i) => flags[i]));

    fc.assert(
      fc.property(
        fc.constantFrom('development', 'test'),
        subsetArb,
        (nodeEnv, missingVars) => {
          _resetEnvCache();
          const env: Record<string, string> = {
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
            NODE_ENV: nodeEnv,
            NEXT_PUBLIC_WHATSAPP_NUMBER: '+573001234567',
            NEXT_PUBLIC_COMPANY_PHONE: '+573009876543',
            NEXT_PUBLIC_COMPANY_EMAIL: 'info@asgro.co',
            NEXT_PUBLIC_COMPANY_ADDRESS: 'Calle 100 #15-20, Bogotá',
          };

          // Remove the subset of vars
          for (const varName of missingVars) {
            delete env[varName];
          }

          stubProcessEnv(env);

          // Should NOT throw — contact vars are optional in development/test
          expect(() => getEnv()).not.toThrow();
          const result = getEnv();
          expect(result).toBeDefined();
          expect(result.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/testdb');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valid env object with all required vars parses successfully', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary valid values for all required vars
        fc.stringMatching(/^postgresql:\/\/[a-z]+:[a-z]+@[a-z]+:\d{4}\/[a-z]+$/),
        fc.constantFrom('development', 'production', 'test'),
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 80 }),
        (dbUrl, nodeEnv, whatsapp, phone, email, address) => {
          _resetEnvCache();
          stubProcessEnv({
            DATABASE_URL: dbUrl,
            NODE_ENV: nodeEnv,
            NEXT_PUBLIC_WHATSAPP_NUMBER: whatsapp,
            NEXT_PUBLIC_COMPANY_PHONE: phone,
            NEXT_PUBLIC_COMPANY_EMAIL: email,
            NEXT_PUBLIC_COMPANY_ADDRESS: address,
          });

          // Should parse successfully with all required vars present
          expect(() => getEnv()).not.toThrow();
          const result = getEnv();
          expect(result.DATABASE_URL).toBe(dbUrl);
          expect(result.NODE_ENV).toBe(nodeEnv);
        }
      ),
      { numRuns: 100 }
    );
  });
});
