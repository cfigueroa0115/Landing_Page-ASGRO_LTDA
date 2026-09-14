// ============================================================================
// Feature flags públicos — ASGRO (Bloque 7A)
// ============================================================================
//
// Flags de lanzamiento controlados por variables NEXT_PUBLIC_*. Son públicos
// por diseño (no son secretos): solo controlan qué se renderiza en el cliente.
// ============================================================================

/**
 * Controla el render de la Asesora (FloatingChatButton).
 *
 * Regla FAIL-CLOSED (7A.1):
 *   - ausente/undefined      → true  (compatibilidad de preview: comportamiento actual).
 *   - "true" (case/espacios) → true.
 *   - cualquier otro valor   → false ("false", "FALSE", "yes", "1", "enabled",
 *                              "abc", cadena vacía, ...).
 *
 * Solo un valor explícitamente reconocido como `true` activa la Asesora cuando
 * el flag está presente; así un error de configuración en producción no la
 * activa silenciosamente. WhatsApp es independiente de este flag.
 *
 * @param flag valor crudo del env (inyectable para tests)
 */
export function isAiAssistantEnabled(
  flag: string | undefined = process.env.NEXT_PUBLIC_AI_ASSISTANT_ENABLED
): boolean {
  if (flag === undefined) return true;
  return flag.trim().toLowerCase() === 'true';
}
