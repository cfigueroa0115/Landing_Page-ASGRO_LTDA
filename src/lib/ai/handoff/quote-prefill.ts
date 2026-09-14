// ============================================================================
// ASGRO — Prefill seguro + contexto de cotización (Bloque 5B.3.1 / 5B.3.2)
// ============================================================================
//
// Lee los query params PÚBLICOS y allowlisted (?service=&interest=) para
// preseleccionar el servicio del formulario empresarial y conservar el interés
// comercial. Nunca confía en el query crudo: sanitiza contra allowlists
// cerradas. No transporta PII ni texto libre.
//
// 5B.3.2: además compone (server-side) el contexto comercial que se persiste
// en la columna `comments` existente, sin migración de base de datos.
// ============================================================================

import {
  QUOTE_SERVICE_ALLOWLIST,
  QUOTE_INTEREST_ALLOWLIST,
} from '@/lib/ai/handoff/commercial-handoff';

export type QuoteServiceValue = 'arl' | 'sst' | 'seguros' | 'bienestar';

/** Valores allowlisted del interés comercial (subdominio empresarial). */
export type QuoteInterestValue =
  | 'multirriesgo'
  | 'responsabilidad_civil'
  | 'cumplimiento'
  | 'manejo'
  | 'vida_grupo'
  | 'arl'
  | 'sst';

/** Etiquetas legibles del interés empresarial (para "Interés: ..." y email). */
export const INTEREST_LABELS: Record<QuoteInterestValue, string> = {
  multirriesgo: 'Multirriesgo empresarial',
  responsabilidad_civil: 'Responsabilidad civil',
  cumplimiento: 'Póliza de cumplimiento',
  manejo: 'Seguro de manejo',
  vida_grupo: 'Vida grupo',
  arl: 'ARL',
  sst: 'SST',
};

/** Prefijo con el que se marca el contexto comercial en `comments`. */
export const INTEREST_PREFIX = 'Interés originado desde la Asesora:';

/** Type guard: ¿el valor está en la allowlist cerrada de interés? */
export function isValidInterest(value: unknown): value is QuoteInterestValue {
  return typeof value === 'string' && QUOTE_INTEREST_ALLOWLIST.has(value);
}

/** Etiqueta legible de un interés allowlisted, o null si inválido. */
export function interestLabelOf(value: unknown): string | null {
  return isValidInterest(value) ? INTEREST_LABELS[value] : null;
}

export interface QuotePrefill {
  /** Valor seguro para el select `serviceRequired`, o null si inválido/ausente. */
  service: QuoteServiceValue | null;
  /** Valor allowlisted del interés, o null si inválido/ausente. */
  interest: QuoteInterestValue | null;
  /** Etiqueta del interés a mostrar, o null si inválido/ausente. */
  interestLabel: string | null;
}

/**
 * Sanitiza los parámetros de prefill contra las allowlists.
 *
 * @param raw fuente de parámetros (URLSearchParams o similar con `.get`).
 */
export function parseQuotePrefill(raw: {
  get(name: string): string | null;
}): QuotePrefill {
  const service = raw.get('service');
  const interest = raw.get('interest');

  const safeService =
    service && QUOTE_SERVICE_ALLOWLIST.has(service)
      ? (service as QuoteServiceValue)
      : null;

  const safeInterest = isValidInterest(interest) ? interest : null;

  return {
    service: safeService,
    interest: safeInterest,
    interestLabel: safeInterest ? INTEREST_LABELS[safeInterest] : null,
  };
}

/**
 * Compone (SERVER-SIDE) el valor a persistir en `comments` combinando el
 * contexto comercial (interés allowlisted) con el comentario libre del usuario.
 *
 * Reglas:
 * - `interest` DEBE estar validado contra la allowlist (isValidInterest);
 *   cualquier otro valor se ignora (no se persiste como contexto).
 * - El prefijo NO se duplica: si el comentario ya lo contiene, se respeta tal
 *   cual (no se antepone otra vez).
 * - Sin interés válido → devuelve el comentario del usuario (o null): el
 *   comportamiento legacy queda intacto.
 *
 * @param interest valor crudo del interés (se valida internamente)
 * @param userComments comentario libre del usuario (opcional)
 * @returns valor final para `comments`, o null si no hay nada que guardar
 */
export function composeQuoteComments(
  interest: unknown,
  userComments?: string | null
): string | null {
  const trimmed = (userComments ?? '').trim();
  const label = interestLabelOf(interest);

  if (!label) {
    return trimmed.length > 0 ? trimmed : null;
  }

  // Evitar duplicar el prefijo si ya viene incluido.
  if (trimmed.includes(INTEREST_PREFIX)) {
    return trimmed;
  }

  const context = `[${INTEREST_PREFIX} ${label}]`;
  return trimmed.length > 0 ? `${context}\n${trimmed}` : context;
}
