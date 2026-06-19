import { z } from 'zod';

/**
 * Environment variable validation using Zod.
 *
 * Validation tiers:
 * 1. ALWAYS REQUIRED (fail build if missing): DATABASE_URL
 * 2. REQUIRED IN PRODUCTION, graceful in dev:
 *    - NEXT_PUBLIC_WHATSAPP_NUMBER → hide WhatsApp button if missing in dev
 *    - NEXT_PUBLIC_COMPANY_PHONE → hide phone UI if missing in dev
 *    - NEXT_PUBLIC_COMPANY_EMAIL → hide email UI if missing in dev
 *    - NEXT_PUBLIC_COMPANY_ADDRESS → hide address UI if missing in dev
 * 3. OPTIONAL ALWAYS (never fail): OPENAI_API_KEY, GEMINI_API_KEY, RESEND_API_KEY
 *
 * In development (NODE_ENV !== 'production'), missing production-only vars
 * resolve to empty strings. UI components should check them and hide gracefully.
 */

/**
 * Base schema for environment variables.
 * DATABASE_URL is always required with a specific error naming the variable.
 * All other vars have defaults so parsing doesn't fail outside production.
 */
const envSchema = z.object({
  // Always required — fail build if missing
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Required in production; graceful fallback (empty string) in development
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default(''),
  NEXT_PUBLIC_COMPANY_PHONE: z.string().default(''),
  NEXT_PUBLIC_COMPANY_EMAIL: z.string().default(''),
  NEXT_PUBLIC_COMPANY_ADDRESS: z.string().default(''),

  // Optional API keys — never fail
  OPENAI_API_KEY: z.string().default(''),
  GEMINI_API_KEY: z.string().default(''),
  RESEND_API_KEY: z.string().default(''),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Apply production-only validation as a superRefine step.
 * In production, NEXT_PUBLIC_WHATSAPP_NUMBER and the 3 contact vars are mandatory.
 */
const envSchemaWithProductionRules = envSchema.superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (!data.NEXT_PUBLIC_WHATSAPP_NUMBER) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NEXT_PUBLIC_WHATSAPP_NUMBER is required in production',
        path: ['NEXT_PUBLIC_WHATSAPP_NUMBER'],
      });
    }
    if (!data.NEXT_PUBLIC_COMPANY_PHONE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NEXT_PUBLIC_COMPANY_PHONE is required in production',
        path: ['NEXT_PUBLIC_COMPANY_PHONE'],
      });
    }
    if (!data.NEXT_PUBLIC_COMPANY_EMAIL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NEXT_PUBLIC_COMPANY_EMAIL is required in production',
        path: ['NEXT_PUBLIC_COMPANY_EMAIL'],
      });
    }
    if (!data.NEXT_PUBLIC_COMPANY_ADDRESS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NEXT_PUBLIC_COMPANY_ADDRESS is required in production',
        path: ['NEXT_PUBLIC_COMPANY_ADDRESS'],
      });
    }
  }
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment object.
 * Uses lazy initialization so the module can be imported at build time
 * without immediately throwing if env vars are not yet set.
 */
let _env: Env | null = null;

/**
 * Validates and returns the environment configuration.
 * Throws with specific error messages naming each missing required variable.
 */
export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchemaWithProductionRules.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `❌ Environment variable validation failed:\n${formatted}\n\n` +
        'Please check your .env.local file or deployment environment variables.'
    );
  }

  _env = result.data;
  return _env;
}

/**
 * Pre-validated env export for convenience.
 * Accessing properties will trigger validation on first use (lazy).
 */
export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    const validated = getEnv();
    return validated[prop as keyof Env];
  },
});

// ---------------------------------------------------------------------------
// Helper functions for graceful UI rendering
// ---------------------------------------------------------------------------

/**
 * Returns true if all production contact variables are available.
 * In development, returns false if any are missing — UI hides contact elements.
 * In production, these are guaranteed by validation (would have thrown at startup).
 */
export function isProductionContactAvailable(): boolean {
  try {
    const e = getEnv();
    return !!(
      e.NEXT_PUBLIC_COMPANY_PHONE &&
      e.NEXT_PUBLIC_COMPANY_EMAIL &&
      e.NEXT_PUBLIC_COMPANY_ADDRESS
    );
  } catch {
    return false;
  }
}

/**
 * Returns the company phone number, or empty string if not configured.
 * UI components should hide phone links when this returns ''.
 */
export function getCompanyPhone(): string {
  try {
    return getEnv().NEXT_PUBLIC_COMPANY_PHONE;
  } catch {
    return '';
  }
}

/**
 * Returns the company email, or empty string if not configured.
 * UI components should hide email links when this returns ''.
 */
export function getCompanyEmail(): string {
  try {
    return getEnv().NEXT_PUBLIC_COMPANY_EMAIL;
  } catch {
    return '';
  }
}

/**
 * Returns the company address, or empty string if not configured.
 * UI components should hide address display when this returns ''.
 */
export function getCompanyAddress(): string {
  try {
    return getEnv().NEXT_PUBLIC_COMPANY_ADDRESS;
  } catch {
    return '';
  }
}

/**
 * Returns the WhatsApp number, or empty string if not configured.
 * UI components should hide WhatsApp buttons when this returns ''.
 */
export function getWhatsAppNumber(): string {
  try {
    return getEnv().NEXT_PUBLIC_WHATSAPP_NUMBER;
  } catch {
    return '';
  }
}

/**
 * Returns true if the WhatsApp number is configured and non-empty.
 */
export function isWhatsAppAvailable(): boolean {
  return !!getWhatsAppNumber();
}

/**
 * Returns true if any AI API key is configured.
 */
export function isAIAvailable(): boolean {
  try {
    const e = getEnv();
    return !!(e.OPENAI_API_KEY || e.GEMINI_API_KEY);
  } catch {
    return false;
  }
}

/**
 * Returns true if the Resend API key is configured.
 */
export function isResendAvailable(): boolean {
  try {
    return !!getEnv().RESEND_API_KEY;
  } catch {
    return false;
  }
}

/**
 * Resets the cached env for testing purposes.
 * @internal
 */
export function _resetEnvCache(): void {
  _env = null;
}
