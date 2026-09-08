// ============================================================================
// Resolución segura de secretos server-side — ASGRO
//
// Capa reutilizable para obtener secretos con la siguiente prioridad:
//   1. process.env.<NOMBRE>        (desarrollo/local y compatibilidad directa)
//   2. process.env.secrets[<NOMBRE>]  (AWS Amplify Gen 1 — secrets como JSON)
//   3. ''                          (comportamiento seguro si no existe)
//
// Reglas de seguridad (estrictas):
// - NUNCA loguear valores de secretos.
// - NUNCA exponer el contenido de process.env.secrets.
// - NUNCA incluir secretos en mensajes de error.
// - Uso EXCLUSIVAMENTE server-side. No importar desde componentes cliente.
//   (Este módulo no lleva 'use client' y solo debe usarse en rutas/API/server.)
// ============================================================================

/** Nombres de secretos soportados por el resolver. */
export type SecretName =
  | 'DATABASE_URL'
  | 'RESEND_API_KEY'
  | 'OPENAI_API_KEY'
  | 'GEMINI_API_KEY';

/**
 * Parsea process.env.secrets (JSON) de forma segura.
 * Retorna un objeto plano string→string, o {} si no existe o es inválido.
 * No expone ni loguea el contenido; ante error, silencioso y seguro.
 */
function parseAmplifySecrets(): Record<string, unknown> {
  const raw = process.env.secrets;

  if (typeof raw !== 'string' || raw.length === 0) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    // JSON inválido: no rompe la app, no se expone el contenido.
    return {};
  }
}

/**
 * Resuelve un secreto server-side por nombre.
 *
 * Prioridad:
 *   1. Variable de entorno directa (process.env.<NOMBRE>).
 *   2. Clave <NOMBRE> dentro de process.env.secrets (JSON de Amplify Gen 1).
 *   3. Cadena vacía (valor seguro por defecto).
 *
 * @param name Nombre del secreto (p. ej. 'DATABASE_URL').
 * @returns El valor del secreto (recortado) o '' si no está disponible.
 */
export function getSecret(name: SecretName): string {
  // 1) Variable de entorno directa (dev/local y compatibilidad).
  const direct = process.env[name];
  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct.trim();
  }

  // 2) Fallback: secrets JSON de Amplify.
  const secrets = parseAmplifySecrets();
  const fromJson = secrets[name];
  if (typeof fromJson === 'string' && fromJson.trim().length > 0) {
    return fromJson.trim();
  }

  // 3) Comportamiento seguro: no disponible.
  return '';
}

/**
 * Indica si un secreto está disponible por cualquiera de las fuentes.
 * No revela el valor.
 */
export function hasSecret(name: SecretName): boolean {
  return getSecret(name).length > 0;
}
