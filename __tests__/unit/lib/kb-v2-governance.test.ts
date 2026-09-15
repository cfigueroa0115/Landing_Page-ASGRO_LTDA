import { describe, it, expect } from 'vitest';
import { isEligible } from '@/lib/ai/knowledge/repository';
import {
  knowledgeBaseV2Schema,
  knowledgeBaseV2SeedSchema5B1,
} from '@/lib/ai/knowledge/validation';
import {
  KB_CATEGORIES,
  KB_SUBCATEGORIES,
  isKbCategory,
  isKbSubcategory,
} from '@/lib/ai/knowledge/taxonomy';

/**
 * BLOQUE 5B.1 — Gobernanza de la Knowledge Base V2.
 * Verifica la regla de elegibilidad y la validación de entradas.
 */

const NOW = new Date('2026-06-01T12:00:00Z');
const PAST = new Date('2026-01-01T00:00:00Z');
const FUTURE = new Date('2026-12-31T23:59:59Z');

describe('isEligible — regla de elegibilidad', () => {
  it('approved + active + sin expiración = elegible', () => {
    expect(isEligible({ isApproved: true, isActive: true, effectiveTo: null }, NOW)).toBe(true);
  });

  it('approved + active + effectiveTo futuro = elegible', () => {
    expect(isEligible({ isApproved: true, isActive: true, effectiveTo: FUTURE }, NOW)).toBe(true);
  });

  it('approved + inactive = NO elegible', () => {
    expect(isEligible({ isApproved: true, isActive: false, effectiveTo: null }, NOW)).toBe(false);
  });

  it('unapproved = NO elegible', () => {
    expect(isEligible({ isApproved: false, isActive: true, effectiveTo: null }, NOW)).toBe(false);
  });

  it('expirado (effectiveTo pasado) = NO elegible', () => {
    expect(isEligible({ isApproved: true, isActive: true, effectiveTo: PAST }, NOW)).toBe(false);
  });

  it('effectiveTo exactamente ahora = NO elegible (no estrictamente futuro)', () => {
    expect(isEligible({ isApproved: true, isActive: true, effectiveTo: NOW }, NOW)).toBe(false);
  });

  it('effectiveTo undefined se trata como sin expiración', () => {
    expect(isEligible({ isApproved: true, isActive: true }, NOW)).toBe(true);
  });
});

describe('Zod schema — validación de entradas V2', () => {
  const base = {
    key: 'personas-hogar-orientacion-general',
    topic: 'Seguro de hogar',
    category: 'personas' as const,
    subcategory: 'hogar' as const,
    content: 'Orientación sobre protección del hogar.',
    tags: 'hogar,personas',
    source: 'website:/servicios',
    sourceType: 'website' as const,
    authority: 'orientative' as const,
    version: 1,
    priority: 5,
    isApproved: true,
    isActive: true,
    reviewedBy: 'ASGRO-web-approved-source',
  };

  it('acepta una entrada válida', () => {
    expect(knowledgeBaseV2Schema.safeParse(base).success).toBe(true);
  });

  it('rechaza key vacía', () => {
    expect(knowledgeBaseV2Schema.safeParse({ ...base, key: '' }).success).toBe(false);
  });

  it('rechaza key con formato no-slug', () => {
    expect(knowledgeBaseV2Schema.safeParse({ ...base, key: 'Personas Hogar' }).success).toBe(false);
  });

  it('rechaza categoría fuera de taxonomía', () => {
    expect(
      knowledgeBaseV2Schema.safeParse({ ...base, category: 'inventada' as never }).success
    ).toBe(false);
  });

  it('rechaza subcategoría fuera de taxonomía', () => {
    expect(
      knowledgeBaseV2Schema.safeParse({ ...base, subcategory: 'cripto' as never }).success
    ).toBe(false);
  });

  it('rechaza content vacío', () => {
    expect(knowledgeBaseV2Schema.safeParse({ ...base, content: '' }).success).toBe(false);
  });

  it('rechaza source vacío', () => {
    expect(knowledgeBaseV2Schema.safeParse({ ...base, source: '' }).success).toBe(false);
  });

  it('rechaza version < 1', () => {
    expect(knowledgeBaseV2Schema.safeParse({ ...base, version: 0 }).success).toBe(false);
  });

  it('rechaza priority fuera de rango', () => {
    expect(knowledgeBaseV2Schema.safeParse({ ...base, priority: 999 }).success).toBe(false);
  });

  it('rechaza entrada aprobada con source vacío', () => {
    const res = knowledgeBaseV2Schema.safeParse({ ...base, isApproved: true, source: '   ' });
    expect(res.success).toBe(false);
  });

  it('el schema 5B.1 rechaza authority contractual', () => {
    const res = knowledgeBaseV2SeedSchema5B1.safeParse({ ...base, authority: 'contractual' });
    expect(res.success).toBe(false);
  });

  it('el schema base sí admite contractual (no es 5B.1)', () => {
    const res = knowledgeBaseV2Schema.safeParse({ ...base, authority: 'contractual' });
    expect(res.success).toBe(true);
  });
});

describe('Taxonomía — conjuntos cerrados', () => {
  it('type guards aceptan valores válidos', () => {
    expect(isKbCategory('personas')).toBe(true);
    expect(isKbSubcategory('hogar')).toBe(true);
  });

  it('type guards rechazan valores inválidos', () => {
    expect(isKbCategory('otra')).toBe(false);
    expect(isKbSubcategory('otra')).toBe(false);
  });

  it('las categorías y subcategorías son no vacías', () => {
    expect(KB_CATEGORIES.length).toBeGreaterThan(0);
    expect(KB_SUBCATEGORIES.length).toBeGreaterThan(0);
  });
});
