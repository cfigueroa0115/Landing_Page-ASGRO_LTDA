import { describe, it, expect } from 'vitest';
import { SAFE_CORPUS_V2, PENDING_CONTENT_APPROVAL } from '@/lib/ai/knowledge/corpus';
import { knowledgeBaseV2SeedSchema5B1 } from '@/lib/ai/knowledge/validation';
import {
  KB_CATEGORIES,
  KB_SUBCATEGORIES,
} from '@/lib/ai/knowledge/taxonomy';

/**
 * BLOQUE 5B.1 — Integridad y seguridad del safe corpus V2.
 * Impide que regresen los claims peligrosos detectados en 5B.0 y garantiza
 * que el corpus cumple las reglas de gobernanza.
 */

// Expresiones riesgosas detectadas en 5B.0 que NO deben aparecer en el corpus.
const FORBIDDEN_PATTERNS: RegExp[] = [
  /500\s*smmlv/i,
  /0\.522/i,
  /6\.960/i,
  /48\s*horas/i,
  /mismo d[ií]a/i,
  /mejor cobertura/i,
  /mejor relaci[oó]n costo-?beneficio/i,
  /\bprima\b/i,
  /\btarifa/i,
  /\d+\s*%/, // cualquier porcentaje explícito
  /garant(i|í)a de (aceptaci[oó]n|emisi[oó]n)/i,
  /indemniza(remos|mos|ci[oó]n garantizada)/i,
];

describe('Safe corpus V2 — estructura', () => {
  it('tiene exactamente 24 entradas', () => {
    expect(SAFE_CORPUS_V2).toHaveLength(24);
  });

  it('conteo exacto de aprobadas (23) y pendientes (1)', () => {
    const approved = SAFE_CORPUS_V2.filter((e) => e.isApproved).length;
    const pending = SAFE_CORPUS_V2.length - approved;
    expect(approved).toBe(23);
    expect(pending).toBe(1);
  });

  it('conteo exacto por categoría', () => {
    const byCategory = (category: string) =>
      SAFE_CORPUS_V2.filter((e) => e.category === category).length;
    expect(byCategory('personas')).toBe(7);
    expect(byCategory('empresas')).toBe(7);
    expect(byCategory('capacidades')).toBe(4);
    expect(byCategory('transversal')).toBe(6);
  });

  it('no hay keys duplicadas', () => {
    const keys = SAFE_CORPUS_V2.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('todas las entradas usan categorías válidas', () => {
    for (const e of SAFE_CORPUS_V2) {
      expect(KB_CATEGORIES).toContain(e.category);
    }
  });

  it('todas las entradas usan subcategorías válidas', () => {
    for (const e of SAFE_CORPUS_V2) {
      expect(KB_SUBCATEGORIES).toContain(e.subcategory);
    }
  });

  it('cada entrada valida contra el schema estricto de 5B.1', () => {
    for (const e of SAFE_CORPUS_V2) {
      const res = knowledgeBaseV2SeedSchema5B1.safeParse({
        key: e.key,
        topic: e.topic,
        category: e.category,
        subcategory: e.subcategory,
        content: e.content,
        tags: e.tags,
        source: e.source,
        sourceType: e.sourceType,
        authority: e.authority,
        version: e.version,
        priority: e.priority,
        isApproved: e.isApproved,
        isActive: e.isActive,
        reviewedBy: e.reviewedBy,
      });
      expect(res.success, `Entrada inválida: ${e.key}`).toBe(true);
    }
  });
});

describe('Safe corpus V2 — gobernanza', () => {
  it('ninguna entrada aprobada carece de source', () => {
    for (const e of SAFE_CORPUS_V2) {
      if (e.isApproved) {
        expect(e.source.trim().length, `sin source: ${e.key}`).toBeGreaterThan(0);
        expect(e.source).not.toBe(PENDING_CONTENT_APPROVAL);
      }
    }
  });

  it('ninguna entrada aprobada tiene content vacío', () => {
    for (const e of SAFE_CORPUS_V2) {
      if (e.isApproved) {
        expect(e.content.trim().length, `content vacío: ${e.key}`).toBeGreaterThan(0);
      }
    }
  });

  it('ninguna entrada es contractual en 5B.1', () => {
    for (const e of SAFE_CORPUS_V2) {
      expect(e.authority, `contractual no permitido: ${e.key}`).not.toBe('contractual');
    }
  });

  it('el contenido pendiente está marcado y no aprobado', () => {
    const pending = SAFE_CORPUS_V2.filter((e) => e.source === PENDING_CONTENT_APPROVAL);
    for (const e of pending) {
      expect(e.isApproved, `pendiente aprobado: ${e.key}`).toBe(false);
      expect(e.isActive, `pendiente activo: ${e.key}`).toBe(false);
    }
  });

  it('las entradas aprobadas tienen reviewedBy no nulo', () => {
    for (const e of SAFE_CORPUS_V2) {
      if (e.isApproved) {
        expect(e.reviewedBy, `reviewedBy nulo: ${e.key}`).toBeTruthy();
      }
    }
  });
});

describe('Safe corpus V2 — seguridad de contenido (anti-regresión 5B.0)', () => {
  it('ninguna entrada contiene claims prohibidos (cifras, SLA, superlativos)', () => {
    for (const e of SAFE_CORPUS_V2) {
      const haystack = `${e.topic}\n${e.content}\n${e.tags}`;
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(
          pattern.test(haystack),
          `"${e.key}" contiene patrón prohibido ${pattern}`
        ).toBe(false);
      }
    }
  });
});
