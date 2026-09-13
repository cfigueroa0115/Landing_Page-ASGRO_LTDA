// ============================================================================
// Seed independiente — Knowledge Base V2 (Bloque 5B.1)
// Ejecutar con: npx tsx src/lib/db/seed-kb-v2.ts
// ----------------------------------------------------------------------------
// Puebla ÚNICAMENTE la tabla `knowledge_base_v2` con el safe corpus.
// NO toca `knowledge_base` (legacy), `chat_sessions` ni `chat_messages`.
// NO borra ni trunca datos existentes. Upsert idempotente por `key`.
//
// Este script NO se ejecuta en build ni en runtime del chat. Es una utilidad
// de datos para poblar la V2 tras aplicar la migración aditiva en 5B.2.
// ============================================================================

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { sql, type SQL } from 'drizzle-orm';
import { knowledgeBaseV2 } from './schema';
import { SAFE_CORPUS_V2, type CorpusEntry } from '@/lib/ai/knowledge/corpus';
import { knowledgeBaseV2SeedSchema5B1 } from '@/lib/ai/knowledge/validation';

// ----------------------------------------------------------------------------
// Builders puros del payload de upsert (testeable sin base de datos).
// ----------------------------------------------------------------------------

/**
 * Calcula `reviewedAt` para una entrada del corpus. Se refresca a `now` cuando
 * la entrada está aprobada; null en caso contrario.
 *
 * NOTA (gobernanza): en 5B.1.1a `reviewedAt` se refresca durante el seed de una
 * entrada aprobada. Esto NO conserva un historial de revisiones. El versionado
 * histórico completo (tabla de historial, quién/cuándo por versión) queda como
 * hardening de gobernanza para 5B.4. Aquí NO se crea tabla history.
 */
export function computeReviewedAt(entry: CorpusEntry, now: Date): Date | null {
  return entry.isApproved ? now : null;
}

/** Valores para INSERT (incluye version). */
export function buildInsertValues(entry: CorpusEntry, now: Date) {
  return {
    key: entry.key,
    topic: entry.topic,
    category: entry.category,
    subcategory: entry.subcategory,
    content: entry.content,
    tags: entry.tags,
    source: entry.source,
    sourceType: entry.sourceType,
    authority: entry.authority,
    version: entry.version,
    priority: entry.priority,
    isApproved: entry.isApproved,
    isActive: entry.isActive,
    reviewedAt: computeReviewedAt(entry, now),
    reviewedBy: entry.reviewedBy,
  };
}

/**
 * Set para onConflictDoUpdate. Incluye `version` para que un corpus con version
 * mayor actualice realmente la columna. NO incluye `key` (es el target del
 * conflicto y no debe reasignarse).
 */
export function buildUpdateSet(entry: CorpusEntry, now: Date, updatedAt: SQL) {
  return {
    topic: entry.topic,
    category: entry.category,
    subcategory: entry.subcategory,
    content: entry.content,
    tags: entry.tags,
    source: entry.source,
    sourceType: entry.sourceType,
    authority: entry.authority,
    version: entry.version,
    priority: entry.priority,
    isApproved: entry.isApproved,
    isActive: entry.isActive,
    reviewedAt: computeReviewedAt(entry, now),
    reviewedBy: entry.reviewedBy,
    updatedAt,
  };
}

async function seedKbV2() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  console.log('🌱 Seed de knowledge_base_v2 (safe corpus)...\n');

  let processed = 0;

  for (const entry of SAFE_CORPUS_V2) {
    // Validar cada entrada contra la taxonomía y las reglas de 5B.1.
    const parsed = knowledgeBaseV2SeedSchema5B1.safeParse({
      key: entry.key,
      topic: entry.topic,
      category: entry.category,
      subcategory: entry.subcategory,
      content: entry.content,
      tags: entry.tags,
      source: entry.source,
      sourceType: entry.sourceType,
      authority: entry.authority,
      version: entry.version,
      priority: entry.priority,
      isApproved: entry.isApproved,
      isActive: entry.isActive,
      reviewedBy: entry.reviewedBy,
    });

    if (!parsed.success) {
      console.error(`❌ Entrada inválida "${entry.key}":`, parsed.error.issues);
      await pool.end();
      process.exit(1);
    }

    const now = new Date();

    await db
      .insert(knowledgeBaseV2)
      .values(buildInsertValues(entry, now))
      .onConflictDoUpdate({
        target: knowledgeBaseV2.key,
        set: buildUpdateSet(entry, now, sql`now()`),
      });

    processed += 1;
  }

  const approved = SAFE_CORPUS_V2.filter((e) => e.isApproved).length;
  const pending = SAFE_CORPUS_V2.length - approved;

  // Nota: cada fila se aplica mediante upsert (insert-or-update) idempotente.
  // No distinguimos insert de update para evitar estadísticas engañosas: el
  // conteo devuelto por RETURNING con onConflictDoUpdate no diferencia ambos
  // casos de forma confiable entre versiones de PostgreSQL.
  console.log(`✅ ${processed} entradas procesadas mediante upsert`);
  console.log(`   ${approved} aprobadas · ${pending} pendiente(s)`);

  await pool.end();
  console.log('\n🎉 Seed de knowledge_base_v2 completado.');
}

// Ejecutar solo cuando el script se corre directamente (tsx), no al importarlo
// (p. ej. desde tests que consumen los builders puros). Evita abrir conexión.
const isDirectRun =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  /seed-kb-v2(\.[tj]s)?$/.test(process.argv[1] ?? '');

if (isDirectRun) {
  seedKbV2().catch((err) => {
    console.error('❌ Error en seed-kb-v2:', err);
    process.exit(1);
  });
}
