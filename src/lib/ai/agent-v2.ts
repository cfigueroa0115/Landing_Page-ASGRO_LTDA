// ============================================================================
// ASGRO — Orquestador V2 de la Asesora (Bloque 5B.2)
// ============================================================================
//
// Flujo gobernado y determinístico:
//   mensaje → intent router → retrieval selectivo V2 (solo elegible)
//           → formatter determinístico → respuesta segura
//
// Principios:
// - NO envía toda la KB al modelo. NO usa la KB legacy.
// - Funciona 100% sin LLM (formatter determinístico). No hay fallback legacy.
// - Guardrails: no precios/primas, no promesas de indemnización, no claims,
//   no contenido pending; deriva a asesor humano cuando corresponde.
// - No expone intención interna, scores, keys de fuente, SQL ni metadata.
// ============================================================================

import { routeIntent, type RouterContextMessage } from '@/lib/ai/routing/intent-router';
import { retrieveForIntent, type RetrievableEntry } from '@/lib/ai/retrieval/selective-retrieval';

/** Ventana máxima de contexto (se mantiene el criterio actual de 10 mensajes). */
const MAX_CONTEXT_MESSAGES = 10;

const CONTACT_LINE =
  'Si prefieres, puedo orientarte para hablar con un asesor de ASGRO por WhatsApp o mediante el formulario de contacto.';

/** Fallback seguro cuando no hay contenido aprobado suficiente. */
export const SAFE_FALLBACK =
  'No cuento con información aprobada suficiente para responder esa consulta con precisión. ' +
  CONTACT_LINE;

/** Respuesta fuera de alcance. */
const OFF_TOPIC =
  'Puedo ayudarte con seguros para personas y empresas, y con temas de ARL y SST. ' +
  'Para otras consultas, ' +
  CONTACT_LINE.charAt(0).toLowerCase() +
  CONTACT_LINE.slice(1);

/** Deriva a canal humano (asesor / WhatsApp). */
const HUMAN_HANDOFF =
  'Con gusto te ayudo a continuar con una persona del equipo de ASGRO. ' +
  'Puedes escribirnos por WhatsApp o dejar tus datos en el formulario de contacto y te contactaremos.';

/**
 * Nota de orientación para consultas de precio / condición contractual /
 * decisión aseguradora. No da cifras ni promesas; prepara el handoff (5B.3).
 */
const COMMERCIAL_GUARD_NOTE =
  '\n\nTen en cuenta que los valores, las condiciones específicas y la aceptación de una póliza ' +
  'dependen de cada aseguradora y del análisis de tu caso. Para una propuesta a tu medida, ' +
  CONTACT_LINE.charAt(0).toLowerCase() +
  CONTACT_LINE.slice(1);

export interface ProcessV2Result {
  /** Texto para el usuario (seguro, sin internals). */
  response: string;
  /** Diagnóstico interno — NO enviar al cliente. */
  meta: {
    intent: string;
    usedEntries: string[]; // keys internas, solo para logging/tests
    fallback: boolean;
  };
}

function boundContext(messages: RouterContextMessage[]): RouterContextMessage[] {
  return messages.length <= MAX_CONTEXT_MESSAGES
    ? messages
    : messages.slice(-MAX_CONTEXT_MESSAGES);
}

/**
 * Formatter determinístico de entradas V2 recuperadas.
 * Presenta 1..N ideas atómicas de forma profesional, sin claims ni cifras.
 */
export function formatEntries(entries: RetrievableEntry[]): string {
  const parts = entries.map((e) => `**${e.topic}**\n${e.content.trim()}`);
  return parts.join('\n\n');
}

/**
 * Procesa un mensaje con el flujo V2 gobernado.
 *
 * @param message  mensaje actual del usuario
 * @param context  historial de la sesión (orden cronológico)
 * @param deps     inyección para tests (retrieval). Por defecto usa el real.
 */
export async function processMessageV2(
  message: string,
  context: RouterContextMessage[] = [],
  deps: {
    retrieve?: typeof retrieveForIntent;
  } = {}
): Promise<ProcessV2Result> {
  const retrieve = deps.retrieve ?? retrieveForIntent;
  const bounded = boundContext(context);
  const intent = routeIntent(message, bounded);

  // 1) Fuera de alcance.
  if (intent.intent === 'off_topic') {
    return {
      response: OFF_TOPIC,
      meta: { intent: intent.intent, usedEntries: [], fallback: true },
    };
  }

  // 2) Handoff explícito a humano / WhatsApp.
  if (intent.intent === 'human_advisor' || intent.intent === 'whatsapp') {
    return {
      response: HUMAN_HANDOFF,
      meta: { intent: intent.intent, usedEntries: [], fallback: false },
    };
  }

  // 3) Recuperación selectiva de contenido V2 elegible.
  const entries = await retrieve(intent, message, 3);

  // 4) Sin contenido elegible (p. ej. arrendamiento pending, o unknown):
  //    fallback seguro + handoff. NUNCA usar contenido pending ni legacy.
  if (entries.length === 0) {
    return {
      response: SAFE_FALLBACK,
      meta: { intent: intent.intent, usedEntries: [], fallback: true },
    };
  }

  // 5) Respuesta determinística a partir del contenido gobernado.
  let response = formatEntries(entries);

  // 6) Guardrail comercial/contractual: añade nota de orientación + handoff.
  if (intent.wantsCommercialOrContractual) {
    response += COMMERCIAL_GUARD_NOTE;
  }

  return {
    response,
    meta: {
      intent: intent.intent,
      usedEntries: entries.map((e) => e.key),
      fallback: false,
    },
  };
}
