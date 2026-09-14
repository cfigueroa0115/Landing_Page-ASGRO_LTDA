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

import {
  routeIntent,
  CONFIDENCE_MEDIUM,
  type IntentResult,
  type RouterContextMessage,
} from '@/lib/ai/routing/intent-router';
import { retrieveForIntent, type RetrievableEntry } from '@/lib/ai/retrieval/selective-retrieval';
import {
  decideCommercialHandoff,
  sanitizeActions,
  type ChatAction,
} from '@/lib/ai/handoff/commercial-handoff';

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
  /** Acciones comerciales PÚBLICAS (allowlist, máx 2). Puede ser []. */
  actions: ChatAction[];
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
  // Texto PLANO premium: la UI renderiza texto sin Markdown. Se preservan
  // saltos de línea (topic en su propia línea, luego el contenido). Sin ** ## `.
  const parts = entries.map((e) => `${e.topic.trim()}\n${e.content.trim()}`);
  return parts.join('\n\n');
}

/** Calcula acciones comerciales públicas (allowlist + máx 2). */
function actionsFor(
  intent: IntentResult,
  fallback: boolean,
  whatsappNumber: string
): ChatAction[] {
  return sanitizeActions(
    decideCommercialHandoff(intent, { fallback, whatsappNumber })
  );
}

/**
 * Procesa un mensaje con el flujo V2 gobernado.
 *
 * @param message  mensaje actual del usuario
 * @param context  historial de la sesión (orden cronológico)
 * @param deps     inyección para tests. `whatsappNumber` por defecto desde env.
 */
export async function processMessageV2(
  message: string,
  context: RouterContextMessage[] = [],
  deps: {
    retrieve?: typeof retrieveForIntent;
    whatsappNumber?: string;
  } = {}
): Promise<ProcessV2Result> {
  const retrieve = deps.retrieve ?? retrieveForIntent;
  const whatsappNumber = deps.whatsappNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const bounded = boundContext(context);
  const intent = routeIntent(message, bounded);

  // 1) Fuera de alcance: solo respuesta de alcance, SIN CTA comercial.
  if (intent.intent === 'off_topic') {
    return {
      response: OFF_TOPIC,
      actions: [],
      meta: { intent: intent.intent, usedEntries: [], fallback: true },
    };
  }

  // 2) Handoff explícito a humano / WhatsApp.
  if (intent.intent === 'human_advisor' || intent.intent === 'whatsapp') {
    return {
      response: HUMAN_HANDOFF,
      actions: actionsFor(intent, false, whatsappNumber),
      meta: { intent: intent.intent, usedEntries: [], fallback: false },
    };
  }

  // 3) Confianza insuficiente / intención desconocida sin dominio: no inventar
  //    intent para responder. Se prefiere el fallback seguro con handoff.
  if (
    intent.intent === 'unknown' ||
    (intent.confidence < CONFIDENCE_MEDIUM && !intent.category && intent.primaryIntent !== 'general_insurance')
  ) {
    return {
      response: SAFE_FALLBACK,
      actions: intent.intent === 'unknown' ? [] : actionsFor(intent, true, whatsappNumber),
      meta: { intent: intent.intent, usedEntries: [], fallback: true },
    };
  }

  // 4) Recuperación selectiva de contenido V2 elegible.
  const entries = await retrieve(intent, message, 3);

  // 5) Sin contenido elegible (p. ej. arrendamiento pending): fallback seguro +
  //    handoff (asesoría). NUNCA usar contenido pending ni legacy.
  if (entries.length === 0) {
    return {
      response: SAFE_FALLBACK,
      actions: actionsFor(intent, true, whatsappNumber),
      meta: { intent: intent.intent, usedEntries: [], fallback: true },
    };
  }

  // 6) Respuesta determinística a partir del contenido gobernado.
  let response = formatEntries(entries);

  // 7) Guardrail comercial/contractual: añade nota de orientación + handoff.
  if (intent.wantsCommercialOrContractual) {
    response += COMMERCIAL_GUARD_NOTE;
  }

  return {
    response,
    actions: actionsFor(intent, false, whatsappNumber),
    meta: {
      intent: intent.intent,
      usedEntries: entries.map((e) => e.key),
      fallback: false,
    },
  };
}
