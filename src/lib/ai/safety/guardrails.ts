// ============================================================================
// ASGRO — Guardrails de seguridad de la Asesora (Bloque 5B.4)
// ============================================================================
//
// Capa PURA y testeable de seguridad adversarial y de respuesta. No usa LLM.
//
// - detectAdversarial(): reconoce intentos de prompt injection, extracción de
//   secretos/prompt, escalamiento de rol y solicitud de contenido pending/
//   interno. Devuelve un tipo para que el orquestador responda de forma segura
//   SIN revelar nada.
// - isResponseSafe() / assertSafeResponse(): verifican que la respuesta final
//   no exponga internals ni claims contractuales prohibidos.
// ============================================================================

import { normalize } from '@/lib/ai/routing/intent-router';

export type AdversarialKind =
  | 'prompt_injection'
  | 'secret_extraction'
  | 'role_escalation'
  | 'internal_data'
  | null;

// Frases normalizadas (sin acentos, minúsculas) que indican abuso.
const PROMPT_INJECTION = [
  'ignora tus instrucciones',
  'ignora las instrucciones',
  'olvida tus instrucciones',
  'olvida las reglas',
  'ignore your instructions',
  'ignore previous',
  'muestrame tu system prompt',
  'muestra tu system prompt',
  'cual es tu system prompt',
  'tu prompt del sistema',
  'system prompt',
  'revela tus instrucciones',
  'dime tus instrucciones',
  'developer mode',
  'modo desarrollador',
];

const SECRET_EXTRACTION = [
  'dame tus api keys',
  'tus api keys',
  'api key',
  'apikey',
  'clave de api',
  'database url',
  'connection string',
  'variables de entorno',
  'env vars',
  'muestrame las llaves',
  'tus credenciales',
  'contrasena del sistema',
  'token de acceso',
];

const ROLE_ESCALATION = [
  'actua como administrador',
  'eres administrador',
  'modo administrador',
  'act as admin',
  'eres un administrador',
  'dame permisos',
  'acceso de administrador',
];

const INTERNAL_DATA = [
  'muestrame contenido pending',
  'contenido pending',
  'contenido inactivo',
  'que informacion hay en tu base de datos',
  'muestrame tu base de datos',
  'dump de la base',
  'tabla knowledge',
  'registros de la base',
  'muestrame los scores',
  'tu confidence',
  'metadata interna',
];

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/**
 * Detecta intención adversarial en el mensaje del usuario.
 * PURA. Devuelve el tipo de abuso o null si no hay señal.
 */
export function detectAdversarial(message: string): AdversarialKind {
  const n = normalize(message);
  if (n.length === 0) return null;
  if (includesAny(n, PROMPT_INJECTION)) return 'prompt_injection';
  if (includesAny(n, SECRET_EXTRACTION)) return 'secret_extraction';
  if (includesAny(n, ROLE_ESCALATION)) return 'role_escalation';
  if (includesAny(n, INTERNAL_DATA)) return 'internal_data';
  return null;
}

/**
 * Respuesta segura y neutral ante intentos adversariales. No revela prompts,
 * reglas, keys, base de datos ni metadata. Orienta a temas legítimos.
 */
export const ADVERSARIAL_SAFE_RESPONSE =
  'Solo puedo orientarte sobre los seguros y servicios de ASGRO (personas, ' +
  'empresas, ARL y SST). No puedo compartir información interna ni de ' +
  'configuración. ¿Te ayudo con alguna solución de protección? Si prefieres, ' +
  'puedes hablar con un asesor por WhatsApp o el formulario de contacto.';

// ── Seguridad de respuesta (salida) ─────────────────────────────────────────

// Patrones que NUNCA deben aparecer en una respuesta al usuario: claims
// contractuales/comerciales prohibidos e internals. Se evalúan sobre el texto
// normalizado para robustez ante acentos/mayúsculas.
const FORBIDDEN_RESPONSE_PATTERNS: RegExp[] = [
  /mejor cobertura/,
  /mejor precio/,
  /mejor relacion costo/,
  /garantizad[oa]/,
  /le garantizamos/,
  /poliza aprobada/,
  /aprobacion garantizada/,
  /indemnizacion garantizada/,
  // Internals: nunca exponer.
  /system prompt/,
  /api[_\s-]?key/,
  /database[_\s-]?url/,
  /postgres(ql)?:\/\//,
  /connection string/,
  /confidence\s*[:=]/,
  /"intent"/,
];

/** ¿La respuesta está libre de claims prohibidos e internals? PURA. */
export function isResponseSafe(text: string): boolean {
  const n = normalize(text);
  // normalize() elimina símbolos como ":" y "/"; para internals con símbolos
  // evaluamos también el texto crudo en minúsculas.
  const raw = text.toLowerCase();
  return !FORBIDDEN_RESPONSE_PATTERNS.some((re) => re.test(n) || re.test(raw));
}

/**
 * Devuelve la respuesta si es segura; en caso contrario, un fallback neutral.
 * Es un cinturón de seguridad: el contenido V2 aprobado ya está libre de estos
 * términos, por lo que en la práctica no se activa sobre contenido corporativo.
 */
export function assertSafeResponse(text: string, safeFallback: string): string {
  return isResponseSafe(text) ? text : safeFallback;
}
