// ============================================================================
// ASGRO — Motor de handoff comercial (Bloque 5B.3)
// ============================================================================
//
// Decisión PURA y testeable de qué CTA ofrecer tras una respuesta de la Asesora.
// Separa la DECISIÓN comercial del render de UI. No abre URLs; el usuario
// siempre decide con un clic.
//
// Salida = acciones PÚBLICAS (allowlist cerrada). NUNCA expone intención,
// scores, keys ni metadata. Máximo 2 acciones (preferido 1).
//
// PII: el mensaje de WhatsApp es genérico y contextual (producto), sin
// sessionId, sin historial, sin datos personales.
// ============================================================================

import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import type { IntentResult, Intent } from '@/lib/ai/routing/intent-router';

/**
 * Acción pública cerrada que puede recibir el cliente.
 * `quote.href` es `/cotizar` opcionalmente con query allowlisted
 * (`?service=...&interest=...`). Ver ENTERPRISE_SERVICE / QUOTE_INTEREST.
 */
export type ChatAction =
  | { type: 'whatsapp'; label: 'Escribir por WhatsApp'; href: string }
  | { type: 'advisory'; label: 'Solicitar asesoría'; href: '/contacto' }
  | { type: 'quote'; label: 'Solicitar cotización'; href: string };

// ----------------------------------------------------------------------------
// Journey de cotización: personas vs empresas (Bloque 5B.3.1)
// ----------------------------------------------------------------------------
//
// El formulario /cotizar es EMPRESARIAL (empresa, NIT, actividad económica,
// nº trabajadores). NO es apropiado para seguros de personas. Por eso:
// - Personas (vehiculos/hogar/vida/salud/accidentes_personales/personas) →
//   ADVISORY + WHATSAPP (no QUOTE) hasta que exista un formulario de personas.
// - Empresas y ARL/SST → QUOTE con contexto NO sensible por query allowlisted.

/** Dominios de PERSONAS: no deben ir al formulario empresarial. */
const PERSONAL_DOMAINS: ReadonlySet<Intent> = new Set<Intent>([
  'vehiculos', 'hogar', 'vida', 'salud', 'accidentes_personales', 'personas', 'arrendamiento',
]);

/**
 * Mapa dominio → `service` allowlisted del formulario (SERVICE_OPTIONS del
 * QuoteSection: arl | sst | seguros | bienestar). Cerrado: cualquier otro
 * dominio no produce query.
 */
const ENTERPRISE_SERVICE: Partial<Record<Intent, 'arl' | 'sst' | 'seguros'>> = {
  empresas: 'seguros',
  multirriesgo: 'seguros',
  responsabilidad_civil: 'seguros',
  cumplimiento: 'seguros',
  manejo: 'seguros',
  vida_grupo: 'seguros',
  arl: 'arl',
  sst: 'sst',
};

/**
 * Valores allowlisted para el query param `interest` (subcategoría empresarial).
 * Cerrado: solo estos valores pueden viajar en la URL.
 */
export const QUOTE_INTEREST_ALLOWLIST: ReadonlySet<string> = new Set<string>([
  'multirriesgo', 'responsabilidad_civil', 'cumplimiento', 'manejo', 'vida_grupo', 'arl', 'sst',
]);

export const QUOTE_SERVICE_ALLOWLIST: ReadonlySet<string> = new Set<string>([
  'arl', 'sst', 'seguros', 'bienestar',
]);

/** Construye el href de /cotizar con query allowlisted (sin PII/texto libre). */
export function buildQuoteHref(intent: IntentResult): string {
  const domain = intent.domainIntent ?? intent.primaryIntent;
  const service = ENTERPRISE_SERVICE[domain];
  if (!service) return '/cotizar';

  const params = new URLSearchParams({ service });
  // `interest` solo si es un subdominio empresarial allowlisted.
  if (intent.subcategory && QUOTE_INTEREST_ALLOWLIST.has(intent.subcategory)) {
    params.set('interest', intent.subcategory);
  }
  return `/cotizar?${params.toString()}`;
}

/** ¿La intención corresponde a cotización EMPRESARIAL (elegible para /cotizar)? */
export function isEnterpriseQuote(intent: IntentResult): boolean {
  const domain = intent.domainIntent ?? intent.primaryIntent;
  if (PERSONAL_DOMAINS.has(domain)) return false;
  return ENTERPRISE_SERVICE[domain] !== undefined;
}

export type HandoffKind = 'NONE' | 'WHATSAPP' | 'ADVISORY' | 'QUOTE';

/** Etiqueta legible del producto/dominio para el mensaje de WhatsApp. */
const DOMAIN_LABEL: Partial<Record<Intent, string>> = {
  vida: 'seguro de vida',
  salud: 'seguros de salud',
  accidentes_personales: 'seguro de accidentes personales',
  hogar: 'seguro de hogar',
  vehiculos: 'seguro de vehículo',
  arrendamiento: 'seguro de arrendamiento',
  personas: 'seguros para personas',
  multirriesgo: 'seguro multirriesgo empresarial',
  responsabilidad_civil: 'seguro de responsabilidad civil',
  cumplimiento: 'pólizas de cumplimiento',
  manejo: 'seguro de manejo',
  vida_grupo: 'seguro de vida grupo',
  empresas: 'seguros empresariales',
  arl: 'acompañamiento en ARL',
  sst: 'acompañamiento en SST',
  siniestros: 'la gestión de un siniestro',
};

function productContext(intent: IntentResult): string | undefined {
  if (intent.domainIntent && DOMAIN_LABEL[intent.domainIntent]) {
    return DOMAIN_LABEL[intent.domainIntent];
  }
  // Para intents de dominio directos (vida, hogar, etc.).
  if (DOMAIN_LABEL[intent.primaryIntent]) {
    return DOMAIN_LABEL[intent.primaryIntent];
  }
  return undefined;
}

/**
 * Mensaje contextual y SEGURO para WhatsApp. Sin PII, sin sessionId, sin
 * historial. Solo referencia el producto cuando se conoce.
 */
export function buildWhatsAppMessage(intent: IntentResult): string {
  const ctx = productContext(intent);
  if (ctx) {
    return `Hola, vengo del sitio web de ASGRO y me interesa recibir orientación sobre ${ctx}.`;
  }
  return 'Hola, vengo del sitio web de ASGRO y me interesa recibir orientación sobre sus soluciones.';
}

/** Contexto de decisión (además del IntentResult). */
export interface HandoffContext {
  /** true si la respuesta cayó en fallback seguro (sin contenido elegible). */
  fallback: boolean;
  /** Número WhatsApp público (NEXT_PUBLIC_WHATSAPP_NUMBER). Puede ser ''. */
  whatsappNumber: string;
}

const ADVISORY_ACTION: ChatAction = {
  type: 'advisory',
  label: 'Solicitar asesoría',
  href: '/contacto',
};

function whatsappAction(intent: IntentResult, number: string): ChatAction | null {
  const href = generateWhatsAppUrl(number, buildWhatsAppMessage(intent));
  if (!href) return null; // sin número configurado → no ofrecer WhatsApp
  return { type: 'whatsapp', label: 'Escribir por WhatsApp', href };
}

/**
 * Decide el tipo de handoff (para diagnóstico/tests). Reglas:
 * - off_topic / unknown        → NONE
 * - whatsapp                    → WHATSAPP
 * - human_advisor              → ADVISORY
 * - siniestros                 → ADVISORY (no pedir datos sensibles en chat)
 * - arrendamiento (fallback)   → ADVISORY (contenido pending)
 * - cotizacion / precio-contractual (wantsCommercialOrContractual) → QUOTE
 * - fallback seguro con dominio legítimo → ADVISORY
 * - resto (informativo)        → NONE
 */
export function decideHandoffKind(
  intent: IntentResult,
  ctx: HandoffContext
): HandoffKind {
  if (intent.intent === 'off_topic' || intent.intent === 'unknown') return 'NONE';
  if (intent.primaryIntent === 'whatsapp') return 'WHATSAPP';
  if (intent.primaryIntent === 'human_advisor') return 'ADVISORY';
  if (intent.primaryIntent === 'siniestros') return 'ADVISORY';
  if (intent.primaryIntent === 'arrendamiento') return 'ADVISORY';

  // Preguntas de garantía/indemnización/aprobación → asesoría (evaluación
  // humana), NO cotización. Nunca prometer indemnización ni aprobación.
  if (intent.wantsContractualGuarantee) return 'ADVISORY';

  // Comparación/recomendación ("cuál es mejor / me conviene") → asesoría, NO
  // cotización automática.
  if (intent.wantsComparison) return 'ADVISORY';

  // Intención comercial (cotizar o precio explícito): el journey depende del
  // dominio. PERSONAS → asesoría/WhatsApp (el formulario /cotizar es
  // empresarial). EMPRESAS/ARL/SST → cotización con contexto allowlisted.
  if (intent.primaryIntent === 'cotizacion' || intent.wantsCommercialOrContractual) {
    return isEnterpriseQuote(intent) ? 'QUOTE' : 'ADVISORY';
  }

  // Fallback seguro sobre un dominio legítimo (no off_topic): ofrecer asesoría.
  if (ctx.fallback) return 'ADVISORY';

  return 'NONE';
}

/**
 * Decide las acciones comerciales públicas (máx 2). Función principal.
 *
 * @param intent resultado del intent router
 * @param ctx    contexto (fallback + número WhatsApp)
 */
export function decideCommercialHandoff(
  intent: IntentResult,
  ctx: HandoffContext
): ChatAction[] {
  const kind = decideHandoffKind(intent, ctx);
  const wa = whatsappAction(intent, ctx.whatsappNumber);

  switch (kind) {
    case 'NONE':
      return [];

    case 'WHATSAPP':
      // Petición explícita de WhatsApp: WhatsApp primero (+ asesoría de respaldo).
      return wa ? [wa, ADVISORY_ACTION] : [ADVISORY_ACTION];

    case 'ADVISORY':
      // Asesoría primero; WhatsApp como alternativa si hay número.
      return wa ? [ADVISORY_ACTION, wa] : [ADVISORY_ACTION];

    case 'QUOTE': {
      // Cotización empresarial con contexto allowlisted; asesoría como
      // alternativa (máx 2).
      const quote: ChatAction = {
        type: 'quote',
        label: 'Solicitar cotización',
        href: buildQuoteHref(intent),
      };
      return [quote, ADVISORY_ACTION];
    }

    default:
      return [];
  }
}

/**
 * Valida que el href de `/cotizar` solo lleva query allowlisted
 * (`service` ∈ QUOTE_SERVICE_ALLOWLIST, `interest` ∈ QUOTE_INTEREST_ALLOWLIST).
 * Rechaza texto libre, PII o parámetros no permitidos.
 */
export function isSafeQuoteHref(href: string): boolean {
  if (href === '/cotizar') return true;
  if (!href.startsWith('/cotizar?')) return false;
  const query = href.slice('/cotizar?'.length);
  const params = new URLSearchParams(query);
  for (const [key, value] of params.entries()) {
    if (key === 'service') {
      if (!QUOTE_SERVICE_ALLOWLIST.has(value)) return false;
    } else if (key === 'interest') {
      if (!QUOTE_INTEREST_ALLOWLIST.has(value)) return false;
    } else {
      return false; // clave no permitida
    }
  }
  return true;
}

/**
 * Valida que un arreglo de acciones cumple la allowlist y el máximo de 2.
 * Úsalo en el borde del API para garantizar el contrato público.
 */
export function sanitizeActions(actions: ChatAction[]): ChatAction[] {
  const allowedTypes = new Set(['whatsapp', 'advisory', 'quote']);
  const valid = actions.filter((a) => {
    if (!allowedTypes.has(a.type)) return false;
    if (a.type === 'advisory') return a.href === '/contacto';
    if (a.type === 'quote') return isSafeQuoteHref(a.href);
    if (a.type === 'whatsapp') return a.href.startsWith('https://wa.me/');
    return false;
  });
  return valid.slice(0, 2);
}
