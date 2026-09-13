import { describe, it, expect } from 'vitest';
import { sql } from 'drizzle-orm';
import {
  buildInsertValues,
  buildUpdateSet,
  computeReviewedAt,
} from '@/lib/db/seed-kb-v2';
import { SAFE_CORPUS_V2, type CorpusEntry } from '@/lib/ai/knowledge/corpus';

/**
 * BLOQUE 5B.1.1A — Integridad del versionado en el upsert del seed KB V2.
 * Verifica que el payload de upsert propaga `version` y que `key` no se
 * reasigna en el UPDATE. Builders puros, sin base de datos.
 */

const NOW = new Date('2026-06-01T12:00:00Z');

const approvedEntry: CorpusEntry = {
  key: 'personas-hogar-orientacion-general',
  topic: 'Seguro de hogar',
  category: 'personas',
  subcategory: 'hogar',
  content: 'Orientación sobre protección del hogar.',
  tags: 'hogar,personas',
  source: 'website:/servicios',
  sourceType: 'website',
  authority: 'orientative',
  version: 2,
  priority: 5,
  isApproved: true,
  isActive: true,
  reviewedBy: 'ASGRO-web-approved-source',
};

const pendingEntry: CorpusEntry = {
  ...approvedEntry,
  key: 'personas-arrendamiento-orientacion-general',
  version: 1,
  isApproved: false,
  isActive: false,
  reviewedBy: null,
};

describe('buildInsertValues', () => {
  it('propaga version tal cual', () => {
    expect(buildInsertValues(approvedEntry, NOW).version).toBe(2);
  });

  it('incluye key en el INSERT', () => {
    expect(buildInsertValues(approvedEntry, NOW).key).toBe(approvedEntry.key);
  });

  it('refresca reviewedAt a now para aprobadas', () => {
    expect(buildInsertValues(approvedEntry, NOW).reviewedAt).toEqual(NOW);
  });

  it('reviewedAt null para no aprobadas', () => {
    expect(buildInsertValues(pendingEntry, NOW).reviewedAt).toBeNull();
  });
});

describe('buildUpdateSet — versionado', () => {
  const set = buildUpdateSet(approvedEntry, NOW, sql`now()`);

  it('INCLUYE version para que un corpus v2 actualice la columna', () => {
    expect(set).toHaveProperty('version');
    expect(set.version).toBe(2);
  });

  it('NO reasigna key en el UPDATE (es el target del conflicto)', () => {
    expect(set).not.toHaveProperty('key');
  });

  it('incluye updatedAt', () => {
    expect(set).toHaveProperty('updatedAt');
  });

  it('refresca reviewedAt a now para aprobadas', () => {
    expect(set.reviewedAt).toEqual(NOW);
  });
});

describe('computeReviewedAt', () => {
  it('now para aprobadas, null para el resto', () => {
    expect(computeReviewedAt(approvedEntry, NOW)).toEqual(NOW);
    expect(computeReviewedAt(pendingEntry, NOW)).toBeNull();
  });
});

describe('corpus real — cada entrada propaga su version en el upsert', () => {
  it('buildUpdateSet.version === entry.version para todo el corpus', () => {
    for (const entry of SAFE_CORPUS_V2) {
      const set = buildUpdateSet(entry, NOW, sql`now()`);
      expect(set.version, `version no propagada: ${entry.key}`).toBe(entry.version);
    }
  });
});
