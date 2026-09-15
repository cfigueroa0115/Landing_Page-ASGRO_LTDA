// ============================================================================
// ASGRO — Knowledge Base V2 · Validación (Bloque 5B.1)
// ============================================================================
//
// Zod schema para validar cada unidad de conocimiento de la KB V2 ANTES de
// insertarla (seed) o de tratarla como corpus aprobado. Refuerza la taxonomía
// cerrada, la trazabilidad y las reglas de gobernanza.
//
// Reglas 5B.1:
// - key no vacía y con formato estable (slug).
// - category / subcategory / sourceType / authority dentro de la taxonomía.
// - content y source no vacíos.
// - version >= 1.
// - priority en rango razonable [0, 100].
// - Entradas aprobadas (isApproved=true) REQUIEREN source no vacío.
// - En 5B.1 NO se admite authority = 'contractual'.
// ============================================================================

import { z } from 'zod';
import {
  KB_CATEGORIES,
  KB_SUBCATEGORIES,
  KB_SOURCE_TYPES,
  KB_AUTHORITIES,
} from './taxonomy';

/** Slug estable: minúsculas, dígitos y guiones. Ej: personas-hogar-orientacion-general */
const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const knowledgeBaseV2Schema = z
  .object({
    key: z
      .string()
      .min(1, 'La key no puede estar vacía')
      .max(160, 'La key no puede exceder 160 caracteres')
      .regex(
        KEY_PATTERN,
        'La key debe ser un slug en minúsculas separado por guiones (a-z, 0-9, -)'
      ),
    topic: z
      .string()
      .min(1, 'El topic no puede estar vacío')
      .max(200, 'El topic no puede exceder 200 caracteres'),
    category: z.enum(KB_CATEGORIES, {
      message: 'La categoría no pertenece a la taxonomía aprobada',
    }),
    subcategory: z.enum(KB_SUBCATEGORIES, {
      message: 'La subcategoría no pertenece a la taxonomía aprobada',
    }),
    content: z
      .string()
      .min(1, 'El content no puede estar vacío')
      .max(4000, 'El content no puede exceder 4000 caracteres'),
    tags: z.string().min(1, 'Los tags no pueden estar vacíos'),
    source: z.string().min(1, 'El source es obligatorio'),
    sourceType: z.enum(KB_SOURCE_TYPES, {
      message: 'El sourceType no es válido',
    }),
    authority: z.enum(KB_AUTHORITIES, {
      message: 'La authority no es válida',
    }),
    effectiveFrom: z.date().optional(),
    effectiveTo: z.date().nullable().optional(),
    version: z
      .number()
      .int('La versión debe ser un entero')
      .min(1, 'La versión debe iniciar en 1'),
    priority: z
      .number()
      .int('La prioridad debe ser un entero')
      .min(0, 'La prioridad no puede ser negativa')
      .max(100, 'La prioridad no puede exceder 100'),
    isApproved: z.boolean(),
    isActive: z.boolean(),
    reviewedAt: z.date().nullable().optional(),
    reviewedBy: z.string().max(120).nullable().optional(),
  })
  .refine((entry) => !(entry.isApproved && entry.source.trim().length === 0), {
    message: 'Una entrada aprobada requiere un source no vacío',
    path: ['source'],
  })
  .refine(
    (entry) =>
      entry.effectiveTo == null ||
      entry.effectiveFrom == null ||
      entry.effectiveTo > entry.effectiveFrom,
    {
      message: 'effectiveTo debe ser posterior a effectiveFrom',
      path: ['effectiveTo'],
    }
  );

export type KnowledgeBaseV2Input = z.infer<typeof knowledgeBaseV2Schema>;

/**
 * Schema estricto para 5B.1: prohíbe explícitamente authority = 'contractual'.
 * Úsalo para validar el corpus de este bloque.
 */
export const knowledgeBaseV2SeedSchema5B1 = knowledgeBaseV2Schema.refine(
  (entry) => entry.authority !== 'contractual',
  {
    message: 'En 5B.1 no se permite contenido contractual',
    path: ['authority'],
  }
);
