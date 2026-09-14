// ============================================================================
// ASGRO — Prefill seguro del formulario de cotización (Bloque 5B.3.1)
// ============================================================================
//
// Lee los query params PÚBLICOS y allowlisted (?service=&interest=) para
// preseleccionar el servicio del formulario empresarial. Nunca confía en el
// query crudo: sanitiza contra allowlists cerradas. No transporta PII ni texto
// libre.
// ============================================================================

import {
  QUOTE_SERVICE_ALLOWLIST,
  QUOTE_INTEREST_ALLOWLIST,
} from '@/lib/ai/handoff/commercial-handoff';

export type QuoteServiceValue = 'arl' | 'sst' | 'seguros' | 'bienestar';

/** Etiquetas legibles del interés empresarial (para mostrar "Interés: ..."). */
const INTEREST_LABELS: Record<string, string> = {
  multirriesgo: 'Multirriesgo empresarial',
  responsabilidad_civil: 'Responsabilidad civil',
  cumplimiento: 'Póliza de cumplimiento',
  manejo: 'Seguro de manejo',
  vida_grupo: 'Vida grupo',
  arl: 'ARL',
  sst: 'SST',
};

export interface QuotePrefill {
  /** Valor seguro para el select `serviceRequired`, o null si inválido/ausente. */
  service: QuoteServiceValue | null;
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

  const safeInterestLabel =
    interest && QUOTE_INTEREST_ALLOWLIST.has(interest)
      ? INTEREST_LABELS[interest] ?? null
      : null;

  return { service: safeService, interestLabel: safeInterestLabel };
}
