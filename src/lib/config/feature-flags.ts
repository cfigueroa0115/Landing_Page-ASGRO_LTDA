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
 * Regla de compatibilidad de preview:
 *   - "true"            → renderizar la Asesora.
 *   - "false"           → NO renderizarla.
 *   - ausente/undefined → mantener el comportamiento ACTUAL (renderizarla).
 *
 * Nunca oculta la Asesora de forma inesperada: solo un "false" explícito la
 * desactiva. WhatsApp es independiente de este flag.
 *
 * @param flag valor crudo del env (inyectable para tests)
 */
export function isAiAssistantEnabled(
  flag: string | undefined = process.env.NEXT_PUBLIC_AI_ASSISTANT_ENABLED
): boolean {
  if (flag === undefined) return true;
  return flag.trim().toLowerCase() !== 'false';
}
