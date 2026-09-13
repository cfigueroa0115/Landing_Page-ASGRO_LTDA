// ============================================================================
// ASGRO — Knowledge Base V2 · Repository / Data Access (Bloque 5B.1)
// ============================================================================
//
// Capa desacoplada de acceso a datos de la KB V2. Prepara 5B.2 (Retrieval +
// Intent Router). NO se conecta todavía a /api/chat ni a agent.ts.
//
// Regla de elegibilidad (gobernanza):
//   isApproved = true
//   AND isActive = true
//   AND (effectiveTo IS NULL OR effectiveTo > now())
//
// La regla se expresa de dos formas equivalentes:
//   - `isEligible(entry, now)` : predicado puro, testeable sin base de datos.
//   - `eligibilityCondition()` : condición Drizzle SQL para consultas en DB.
// ============================================================================

import { and, asc, desc, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { getDbAsync } from '@/lib/db';
import { knowledgeBaseV2 } from '@/lib/db/schema';
import type { KbCategory, KbSubcategory } from './taxonomy';

/**
 * Forma mínima de una entrada para evaluar elegibilidad. Coincide con las
 * columnas de gobernanza de `knowledge_base_v2`.
 */
export interface EligibilityCandidate {
  isApproved: boolean;
  isActive: boolean;
  effectiveTo?: Date | null;
}

/**
 * Predicado PURO de elegibilidad. No toca la base de datos.
 *
 * Devuelve true solo si el contenido está aprobado, activo y vigente.
 * Contenido no aprobado, inactivo o vencido NUNCA es elegible.
 *
 * @param entry candidato con las columnas de gobernanza
 * @param now instante de referencia (por defecto, ahora)
 */
export function isEligible(
  entry: EligibilityCandidate,
  now: Date = new Date()
): boolean {
  if (!entry.isApproved) return false;
  if (!entry.isActive) return false;
  // effectiveTo null => sin expiración; en caso contrario, debe ser futuro.
  if (entry.effectiveTo != null && entry.effectiveTo.getTime() <= now.getTime()) {
    return false;
  }
  return true;
}

/**
 * Condición Drizzle equivalente a `isEligible`, para usar en `.where(...)`.
 * Usa `now()` de PostgreSQL para la comparación de vigencia.
 */
export function eligibilityCondition() {
  return and(
    eq(knowledgeBaseV2.isApproved, true),
    eq(knowledgeBaseV2.isActive, true),
    or(isNull(knowledgeBaseV2.effectiveTo), gt(knowledgeBaseV2.effectiveTo, sql`now()`))
  );
}

/**
 * Devuelve TODAS las entradas elegibles (aprobadas, activas y vigentes),
 * ordenadas por prioridad descendente y luego por key.
 *
 * NOTA: en 5B.1 esta función NO es invocada por el chat. Es fundación de 5B.2.
 */
export async function getEligibleKnowledgeBaseV2() {
  const db = await getDbAsync();
  return db
    .select()
    .from(knowledgeBaseV2)
    .where(eligibilityCondition())
    .orderBy(desc(knowledgeBaseV2.priority), asc(knowledgeBaseV2.key));
}

/**
 * Devuelve entradas elegibles filtradas por categoría (y opcionalmente
 * subcategoría). Útil como primer paso de recuperación por dominio en 5B.2.
 */
export async function getKnowledgeByCategory(
  category: KbCategory,
  subcategory?: KbSubcategory
) {
  const db = await getDbAsync();
  const conditions = [eligibilityCondition(), eq(knowledgeBaseV2.category, category)];
  if (subcategory) {
    conditions.push(eq(knowledgeBaseV2.subcategory, subcategory));
  }
  return db
    .select()
    .from(knowledgeBaseV2)
    .where(and(...conditions))
    .orderBy(desc(knowledgeBaseV2.priority), asc(knowledgeBaseV2.key));
}

/**
 * Devuelve una única entrada por su `key` estable, SOLO si es elegible.
 * Devuelve null si no existe o no es elegible.
 */
export async function getKnowledgeByKey(key: string) {
  const db = await getDbAsync();
  const rows = await db
    .select()
    .from(knowledgeBaseV2)
    .where(and(eligibilityCondition(), eq(knowledgeBaseV2.key, key)))
    .limit(1);
  return rows[0] ?? null;
}
