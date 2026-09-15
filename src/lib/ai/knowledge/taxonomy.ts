// ============================================================================
// ASGRO — Knowledge Base V2 · Taxonomía (Bloque 5B.1)
// ============================================================================
//
// Tipos TypeScript estrictos para la taxonomía aprobada de la KB V2.
// El objetivo es impedir que aparezcan categorías/subcategorías arbitrarias en
// código o en el corpus. Toda entrada del corpus DEBE usar valores de estos
// conjuntos cerrados.
//
// Esta capa NO se conecta todavía al chat (/api/chat, agent.ts). Es fundación
// para 5B.2 (Retrieval + Intent Router).
// ============================================================================

/**
 * Categoría de primer nivel del conocimiento.
 * Cerrada intencionalmente: no se permiten categorías arbitrarias.
 */
export const KB_CATEGORIES = [
  'personas',
  'empresas',
  'capacidades',
  'transversal',
] as const;

export type KbCategory = (typeof KB_CATEGORIES)[number];

/**
 * Subcategoría (segundo nivel). Cerrada: cualquier valor fuera de esta lista
 * debe ser rechazado por la validación.
 */
export const KB_SUBCATEGORIES = [
  // Personas
  'vida',
  'salud',
  'accidentes_personales',
  'hogar',
  'vehiculos',
  'arrendamiento',
  // Empresas
  'multirriesgo',
  'responsabilidad_civil',
  'cumplimiento',
  'manejo',
  'vida_grupo',
  'otros_riesgos_empresariales',
  // Capacidades
  'arl',
  'sst',
  // Transversal
  'siniestros',
  'cotizacion',
  'contacto',
  'institucional_asgro',
  'faq',
] as const;

export type KbSubcategory = (typeof KB_SUBCATEGORIES)[number];

/**
 * Tipo de fuente del contenido.
 * En 5B.1 se utilizan principalmente `institutional` y `website`.
 * `regulatory` NO se puebla en este bloque.
 */
export const KB_SOURCE_TYPES = [
  'institutional',
  'website',
  'product',
  'regulatory',
  'faq',
] as const;

export type KbSourceType = (typeof KB_SOURCE_TYPES)[number];

/**
 * Autoridad de la afirmación.
 * En 5B.1 la KB inicial solo puede usar `orientative` o `informational`.
 * NO se crea contenido `contractual` en este bloque.
 */
export const KB_AUTHORITIES = ['orientative', 'informational', 'contractual'] as const;

export type KbAuthority = (typeof KB_AUTHORITIES)[number];

// ----------------------------------------------------------------------------
// Type guards / helpers de validación de taxonomía
// ----------------------------------------------------------------------------

export function isKbCategory(value: unknown): value is KbCategory {
  return typeof value === 'string' && (KB_CATEGORIES as readonly string[]).includes(value);
}

export function isKbSubcategory(value: unknown): value is KbSubcategory {
  return typeof value === 'string' && (KB_SUBCATEGORIES as readonly string[]).includes(value);
}

export function isKbSourceType(value: unknown): value is KbSourceType {
  return typeof value === 'string' && (KB_SOURCE_TYPES as readonly string[]).includes(value);
}

export function isKbAuthority(value: unknown): value is KbAuthority {
  return typeof value === 'string' && (KB_AUTHORITIES as readonly string[]).includes(value);
}

/**
 * Autoridades permitidas para crear/aprobar contenido en 5B.1.
 * Regla del bloque: NO crear contenido contractual todavía.
 */
export const KB_5B1_ALLOWED_AUTHORITIES = ['orientative', 'informational'] as const;
export type Kb5B1AllowedAuthority = (typeof KB_5B1_ALLOWED_AUTHORITIES)[number];
