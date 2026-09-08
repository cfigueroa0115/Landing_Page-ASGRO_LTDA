import { z } from 'zod';
import { getSecret } from '@/lib/config/secrets';

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

  // Public site URL (used for canonical, sitemap, robots, metadataBase).
  // El dominio WEB es .com.co (el .com es solo para correo corporativo).
  NEXT_PUBLIC_SITE_URL: z.string().default('https://asgroseguros.com.co'),

  // Optional API keys — never fail
  OPENAI_API_KEY: z.string().default(''),
  GEMINI_API_KEY: z.string().default(''),
  RESEND_API_KEY: z.string().default(''),

  // Email notification configuration (server-side only) — never fail parse.
  // Destination for lead/quote notifications.
  CONTACT_NOTIFICATION_TO: z.string().default(''),
  // Verified sender address for Resend (e.g. "ASGRO <no-reply@asgroseguros.com>").
  CONTACT_FROM_EMAIL: z.string().default(''),

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
// ---------------------------------------------------------------------------
// Configuración de email (Resend) — VALIDACIÓN INDEPENDIENTE
//
// La disponibilidad del envío por correo depende EXCLUSIVAMENTE de las tres
// variables de email de servidor. NO se acopla al getEnv()/superRefine de
// producción, de modo que la ausencia de variables públicas de contacto
// (NEXT_PUBLIC_WHATSAPP_NUMBER / _COMPANY_PHONE / _COMPANY_EMAIL / _COMPANY_ADDRESS)
// NUNCA impide enviar por Resend. Se leen directamente de process.env.
// Son server-side y jamás llevan prefijo NEXT_PUBLIC_.
// ---------------------------------------------------------------------------

/**
 * Esquema mínimo para las variables de email server-side NO sensibles
 * (destinatario y remitente). El secreto RESEND_API_KEY se resuelve aparte
 * vía el helper de secretos (getSecret).
 */
const emailEnvSchema = z.object({
  CONTACT_NOTIFICATION_TO: z.string().default(''),
  CONTACT_FROM_EMAIL: z.string().default(''),
});

/**
 * Lee y normaliza las variables de email, sin pasar por el getEnv() global
 * (evita el acoplamiento con la validación de producción).
 * - RESEND_API_KEY (secreto): vía getSecret (process.env directo o secrets JSON).
 * - CONTACT_NOTIFICATION_TO / CONTACT_FROM_EMAIL (no sensibles): vía process.env.
 */
function readEmailEnv(): {
  RESEND_API_KEY: string;
  CONTACT_NOTIFICATION_TO: string;
  CONTACT_FROM_EMAIL: string;
} {
  const resendApiKey = getSecret('RESEND_API_KEY');

  const parsed = emailEnvSchema.safeParse({
    CONTACT_NOTIFICATION_TO: process.env.CONTACT_NOTIFICATION_TO,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  });

  if (!parsed.success) {
    return {
      RESEND_API_KEY: resendApiKey,
      CONTACT_NOTIFICATION_TO: '',
      CONTACT_FROM_EMAIL: '',
    };
  }

  return {
    RESEND_API_KEY: resendApiKey,
    CONTACT_NOTIFICATION_TO: parsed.data.CONTACT_NOTIFICATION_TO.trim(),
    CONTACT_FROM_EMAIL: parsed.data.CONTACT_FROM_EMAIL.trim(),
  };
}

/**
 * Returns true if the Resend API key is configured (independent of public vars).
 */
export function isResendAvailable(): boolean {
  return !!readEmailEnv().RESEND_API_KEY;
}

/**
 * Returns the notification recipient for lead/quote emails, or '' if unset.
 * Server-side only. Independent of public contact vars.
 */
export function getContactNotificationTo(): string {
  return readEmailEnv().CONTACT_NOTIFICATION_TO;
}

/**
 * Returns the verified sender address for Resend, or '' if unset.
 * Server-side only. Independent of public contact vars.
 */
export function getContactFromEmail(): string {
  return readEmailEnv().CONTACT_FROM_EMAIL;
}

/**
 * Returns true if email notifications can be sent: requiere ÚNICAMENTE las tres
 * variables de email (RESEND_API_KEY, CONTACT_NOTIFICATION_TO, CONTACT_FROM_EMAIL).
 * La ausencia de variables públicas de contacto NO afecta este resultado.
 */
export function isEmailNotificationAvailable(): boolean {
  const e = readEmailEnv();
  return !!(e.RESEND_API_KEY && e.CONTACT_NOTIFICATION_TO && e.CONTACT_FROM_EMAIL);
}

/**
 * Resets the cached env for testing purposes.
 * @internal
 */
export function _resetEnvCache(): void {
  _env = null;
}
