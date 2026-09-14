// ============================================================================
// ASGRO — Continuidad de sesión del chat (Bloque 5B.4)
// ============================================================================
//
// Persiste ÚNICAMENTE el UUID de sesión en sessionStorage (no localStorage,
// para evitar retención innecesaria; se limpia al cerrar la pestaña). NUNCA se
// persiste el contenido de la conversación ni PII en el navegador.
//
// Solo se acepta/almacena un UUID v4 con formato válido (defensa ante valores
// manipulados). Silencioso y seguro ante entornos sin sessionStorage (SSR).
// ============================================================================

const STORAGE_KEY = 'asgro_chat_session_id';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ¿Es un UUID con formato válido? PURA. */
export function isValidSessionId(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

/** Lee el sessionId persistido (o null). Seguro en SSR / sin storage. */
export function readSessionId(): string | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return isValidSessionId(v) ? v : null;
  } catch {
    return null;
  }
}

/** Persiste el sessionId (solo si es un UUID válido). Seguro/silencioso. */
export function writeSessionId(id: unknown): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    if (!isValidSessionId(id)) return;
    window.sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Silencioso: la continuidad de sesión es una mejora, no un requisito.
  }
}
