// ============================================================================
// ASGRO — Referencia de solicitud de contacto (Bloque 7B.1)
// ============================================================================
//
// Deriva una referencia de atención legible a partir del UUID REAL del lead
// persistido. Es una referencia de seguimiento, NO un secreto:
// - determinística (mismo UUID → misma referencia);
// - NO expone el UUID completo (solo 8 hex);
// - NO contiene nombre, teléfono, email, NIT ni información sensible.
//
// Formato: ASGRO-C-XXXXXXXX  (8 hex en mayúsculas). Ej: ASGRO-C-7F3A91B2
// ============================================================================

/** Prefijo de referencia para el canal de Contacto. */
export const CONTACT_REFERENCE_PREFIX = 'ASGRO-C-';

/** Patrón oficial de una referencia de contacto válida. */
export const CONTACT_REFERENCE_RE = /^ASGRO-C-[A-F0-9]{8}$/;

/**
 * Crea la referencia de contacto a partir del UUID persistido.
 *
 * Determinístico: se toman los primeros 8 caracteres hexadecimales del UUID
 * (sin guiones) y se convierten a mayúsculas. No expone el UUID completo.
 *
 * @param uuid UUID real del lead (formato con guiones). Debe ser un UUID válido.
 * @returns referencia `ASGRO-C-XXXXXXXX`
 * @throws si el UUID no es válido (evita generar referencias falsas)
 */
export function createContactReference(uuid: string): string {
  const hex = String(uuid).replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) {
    throw new Error('UUID inválido para generar la referencia de contacto');
  }
  return `${CONTACT_REFERENCE_PREFIX}${hex.slice(0, 8).toUpperCase()}`;
}

/** ¿La cadena tiene el formato de una referencia de contacto válida? PURA. */
export function isValidContactReference(value: unknown): value is string {
  return typeof value === 'string' && CONTACT_REFERENCE_RE.test(value);
}
