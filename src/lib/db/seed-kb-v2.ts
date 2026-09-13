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
import { sql } from 'drizzle-orm';
import { knowledgeBaseV2 } from './schema';
import { SAFE_CORPUS_V2 } from '@/lib/ai/knowledge/corpus';
import { knowledgeBaseV2SeedSchema5B1 } from '@/lib/ai/knowledge/validation';

async function seedKbV2() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  console.log('🌱 Seed de knowledge_base_v2 (safe corpus)...\n');

  let inserted = 0;
  let updated = 0;

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
    const reviewedAt = entry.isApproved ? now : null;

    const result = await db
      .insert(knowledgeBaseV2)
      .values({
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
        reviewedAt,
        reviewedBy: entry.reviewedBy,
      })
      .onConflictDoUpdate({
        target: knowledgeBaseV2.key,
        set: {
          topic: entry.topic,
          category: entry.category,
          subcategory: entry.subcategory,
          content: entry.content,
          tags: entry.tags,
          source: entry.source,
          sourceType: entry.sourceType,
          authority: entry.authority,
          priority: entry.priority,
          isApproved: entry.isApproved,
          isActive: entry.isActive,
          reviewedAt,
          reviewedBy: entry.reviewedBy,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: knowledgeBaseV2.id });

    if (result.length > 0) inserted += 1;
    else updated += 1;
  }

  const approved = SAFE_CORPUS_V2.filter((e) => e.isApproved).length;
  const pending = SAFE_CORPUS_V2.length - approved;

  console.log(`✅ Corpus procesado: ${SAFE_CORPUS_V2.length} entradas`);
  console.log(`   aprobadas: ${approved} · pendientes: ${pending}`);
  console.log(`   upserts (insert/update): ${inserted}/${updated}`);

  await pool.end();
  console.log('\n🎉 Seed de knowledge_base_v2 completado.');
}

seedKbV2().catch((err) => {
  console.error('❌ Error en seed-kb-v2:', err);
  process.exit(1);
});
