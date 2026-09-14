// ============================================================================
// ASGRO — Selective Retrieval de KB V2 (Bloque 5B.2)
// ============================================================================
//
// Recuperación SELECTIVA y determinística: a partir de una intención
// (category/subcategory) recupera SOLO contenido V2 elegible, lo rankea y
// devuelve topK (máx 4, preferentemente 2–3). NO trae toda la KB.
//
// La elegibilidad la garantiza el repository (approved ∧ active ∧ vigente).
// El contenido pending/inactive (p. ej. arrendamiento) NUNCA entra.
// ============================================================================

import { getKnowledgeByCategory } from '@/lib/ai/knowledge/repository';
import { normalize } from '@/lib/ai/routing/intent-router';
import type { IntentResult } from '@/lib/ai/routing/intent-router';
import type { KbCategory, KbSubcategory } from '@/lib/ai/knowledge/taxonomy';

/** Máximo de entradas para una consulta general/panorama (breve, ejecutivo). */
export const MAX_GENERAL = 3;

/** Máximo absoluto de entradas devueltas al contexto. */
export const MAX_RETRIEVED = 4;

/** Forma mínima de una entrada recuperable (subset de knowledge_base_v2). */
export interface RetrievableEntry {
  key: string;
  topic: string;
  category: string;
  subcategory: string;
  content: string;
  tags: string;
  priority: number;
}

/**
 * Ranking determinístico de un candidato frente a la intención y la consulta.
 * Orden de señales (de mayor a menor peso):
 *   1. subcategory exacta
 *   2. category exacta
 *   3. coincidencia en topic
 *   4. coincidencia en tags
 *   5. coincidencia lexical con la consulta (content)
 *   6. priority
 */
export function scoreEntry(
  entry: RetrievableEntry,
  intent: IntentResult,
  normalizedQuery: string
): number {
  let score = 0;

  if (intent.subcategory && entry.subcategory === intent.subcategory) score += 100;
  if (intent.category && entry.category === intent.category) score += 50;

  const topicN = normalize(entry.topic);
  const tagsN = normalize(entry.tags.replace(/,/g, ' '));
  const contentN = normalize(entry.content);

  const queryTokens = normalizedQuery.split(' ').filter((t) => t.length >= 4);
  for (const token of queryTokens) {
    if (topicN.includes(token)) score += 8;
    if (tagsN.includes(token)) score += 5;
    if (contentN.includes(token)) score += 2;
  }

  // priority como desempate menor (0..100 → 0..10).
  score += entry.priority / 10;

  return score;
}

/**
 * Ordena y recorta candidatos a topK determinísticamente.
 * Desempate estable por `key` para reproducibilidad.
 */
export function rankAndLimit(
  entries: RetrievableEntry[],
  intent: IntentResult,
  query: string,
  topK: number = MAX_RETRIEVED
): RetrievableEntry[] {
  const normalizedQuery = normalize(query);
  const scored = entries.map((e) => ({ e, s: scoreEntry(e, intent, normalizedQuery) }));
  scored.sort((a, b) => {
    if (b.s !== a.s) return b.s - a.s;
    return a.e.key.localeCompare(b.e.key);
  });
  return scored.slice(0, Math.min(topK, MAX_RETRIEVED)).map((x) => x.e);
}

/**
 * Recupera contenido V2 elegible para una intención.
 *
 * Estrategia:
 * - Si la intención no tiene category (off_topic/unknown/human_advisor sin
 *   dominio), devuelve []. El orquestador decidirá handoff/fallback.
 * - Consulta el repository por category (+subcategory si existe). Si la
 *   subcategory no arroja resultados, reintenta solo por category.
 * - Rankea y limita a topK.
 *
 * @returns entradas elegibles rankeadas (0..4). Puede ser [] (p. ej. arrendamiento).
 */
export async function retrieveForIntent(
  intent: IntentResult,
  query: string,
  topK: number = 3
): Promise<RetrievableEntry[]> {
  // Consulta general / panorama de portafolio: SIN category → balanceado.
  if (intent.primaryIntent === 'general_insurance' || !intent.category) {
    if (intent.primaryIntent === 'general_insurance') {
      return retrieveBalancedGeneral(query);
    }
    return [];
  }

  const category = intent.category as KbCategory;
  const subcategory = intent.subcategory as KbSubcategory | null;

  // 1) Intento con subcategory (más preciso).
  let rows = subcategory
    ? ((await getKnowledgeByCategory(category, subcategory)) as RetrievableEntry[])
    : [];

  // 2) Fallback a solo category si la subcategory no arrojó nada
  //    (p. ej. arrendamiento pending → 0 filas elegibles → NO se rellena con
  //    otra subcategory; se deja vacío intencionalmente para forzar handoff).
  if (rows.length === 0 && !subcategory) {
    rows = (await getKnowledgeByCategory(category)) as RetrievableEntry[];
  }

  return rankAndLimit(rows, intent, query, topK);
}

/**
 * Recuperación balanceada para consultas generales de portafolio
 * ("¿qué seguros manejan?"). Toma la entrada de mayor prioridad de personas y
 * de empresas (orientación general), evitando devolver 10 productos. Máximo
 * MAX_GENERAL (3), breve y ejecutivo. Solo contenido elegible.
 */
export async function retrieveBalancedGeneral(
  query: string
): Promise<RetrievableEntry[]> {
  const [personas, empresas] = await Promise.all([
    getKnowledgeByCategory('personas') as Promise<RetrievableEntry[]>,
    getKnowledgeByCategory('empresas') as Promise<RetrievableEntry[]>,
  ]);

  // getKnowledgeByCategory ya ordena por priority desc, key asc → [0] es la
  // entrada representativa (orientación general) de cada dominio.
  const picks: RetrievableEntry[] = [];
  if (personas[0]) picks.push(personas[0]);
  if (empresas[0]) picks.push(empresas[0]);

  // Tercera entrada opcional: la segunda de mayor prioridad global entre ambos.
  const rest = [...personas.slice(1), ...empresas.slice(1)].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.key.localeCompare(b.key);
  });
  if (rest[0] && picks.length < MAX_GENERAL) picks.push(rest[0]);

  return picks.slice(0, MAX_GENERAL);
}
