// ============================================================================
// AI Agent Orchestration - ASGRO LTDA
// Mantiene ventana de contexto limitada a los últimos 10 mensajes,
// enruta a API externa o keyword matcher según configuración del entorno,
// genera respuestas de fallback en español para consultas sin coincidencia
// o fuera de tema, y restringe la temática a seguros/SST/ARL.
// ============================================================================

import type { ChatMessage, KnowledgeBaseEntry } from '@/types';
import { matchKeywords } from '@/lib/ai/keyword-matcher';
import { generateAIResponse } from '@/lib/ai/providers';

// ============================================================================
// Constantes
// ============================================================================

/** Número máximo de mensajes en la ventana de contexto */
const MAX_CONTEXT_MESSAGES = 10;

/** Respuesta cuando el mensaje es sobre un tema no relacionado */
const OFF_TOPIC_RESPONSE =
  'Solo puedo ayudarte con temas de seguros, SST, ARL y riesgos laborales. Para otras consultas, te invitamos a contactarnos por WhatsApp o el formulario de contacto.';

/** Respuesta cuando no se encuentra información relevante */
const NO_MATCH_RESPONSE =
  'No encontré información específica sobre tu consulta. Te recomendamos contactar a un asesor humano por WhatsApp o a través del formulario de contacto para una atención personalizada.';

/**
 * Palabras clave para determinar si un mensaje está relacionado con los temas
 * de ASGRO (seguros, SST, ARL, riesgos laborales).
 */
const TOPIC_KEYWORDS: string[] = [
  // Seguros
  'seguro', 'seguros', 'asegurar', 'aseguradora', 'póliza', 'poliza',
  'cobertura', 'prima', 'siniestro', 'indemnización', 'indemnizacion',
  'reclamo', 'beneficiario', 'cotización', 'cotizacion', 'cotizar',
  // ARL
  'arl', 'riesgo', 'riesgos', 'laboral', 'laborales', 'ocupacional',
  'ocupacionales', 'accidente', 'accidentes', 'trabajo', 'trabajador',
  'trabajadores', 'empleado', 'empleados', 'empresa', 'empresarial',
  'empresariales',
  // SST
  'sst', 'seguridad', 'salud', 'ocupacional', 'prevención', 'prevencion',
  'sg-sst', 'sgsst', 'norma', 'normativa', 'normatividad', 'resolución',
  'resolucion', 'decreto', 'ley', 'cumplimiento', 'auditoría', 'auditoria',
  'inspección', 'inspeccion', 'capacitación', 'capacitacion',
  // Bienestar laboral
  'bienestar', 'clima', 'organizacional', 'ergonomía', 'ergonomia',
  'psicosocial', 'epp', 'protección', 'proteccion',
  // Servicios ASGRO
  'asgro', 'asesoría', 'asesoria', 'asesor', 'plan', 'programa',
  'implementación', 'implementacion', 'diagnóstico', 'diagnostico',
  'clasificación', 'clasificacion', 'afiliación', 'afiliacion',
  'servicio', 'servicios', 'nit', 'contrato',
];

// ============================================================================
// Funciones de utilidad
// ============================================================================

/**
 * Limita el array de mensajes a los últimos MAX_CONTEXT_MESSAGES (10).
 */
export function boundContextWindow(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_CONTEXT_MESSAGES) {
    return messages;
  }
  return messages.slice(-MAX_CONTEXT_MESSAGES);
}

/**
 * Verifica si un mensaje está relacionado con los temas de ASGRO
 * (seguros, SST, ARL, riesgos laborales).
 *
 * Busca coincidencias de las palabras clave del tema en el mensaje normalizado.
 */
export function isOnTopic(message: string): boolean {
  const normalized = message
    .toLowerCase()
    .replace(/[.,;:!?¡¿()[\]{}"'`´\-_/\\@#$%^&*+=<>~|]/g, ' ');

  return TOPIC_KEYWORDS.some((keyword) => {
    // Verificar que la keyword aparece como palabra completa o parte de una
    return normalized.includes(keyword);
  });
}

/**
 * Determina el proveedor de IA disponible según las variables de entorno.
 * Retorna null si no hay ninguna API key configurada.
 */
function getAIProviderConfig(): { provider: 'openai' | 'gemini'; apiKey: string } | null {
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const geminiKey = process.env.GEMINI_API_KEY || '';

  if (openaiKey.length > 0) {
    return { provider: 'openai', apiKey: openaiKey };
  }

  if (geminiKey.length > 0) {
    return { provider: 'gemini', apiKey: geminiKey };
  }

  return null;
}

/**
 * Construye una respuesta basada en las entradas coincidentes de la
 * Base de Conocimiento usando el keyword matcher.
 */
function buildKeywordResponse(matchedEntries: KnowledgeBaseEntry[]): string {
  if (matchedEntries.length === 0) {
    return NO_MATCH_RESPONSE;
  }

  // Tomar las primeras 3 entradas más relevantes para la respuesta
  const topEntries = matchedEntries.slice(0, 3);

  const parts = topEntries.map((entry) => {
    // Resumir el contenido si es muy largo (máx 200 caracteres por entrada)
    const content =
      entry.content.length > 200
        ? entry.content.substring(0, 197) + '...'
        : entry.content;
    return `**${entry.topic}**: ${content}`;
  });

  return parts.join('\n\n');
}

// ============================================================================
// Función principal exportada
// ============================================================================

/**
 * Procesa un mensaje del visitante y genera una respuesta del agente IA.
 *
 * Flujo de procesamiento:
 * 1. Limita la ventana de contexto a los últimos 10 mensajes.
 * 2. Verifica si el mensaje es sobre un tema válido (seguros/SST/ARL).
 * 3. Si hay API key disponible → usa proveedor externo con contexto KB.
 * 4. Si no hay API key → usa keyword matcher.
 * 5. Si el proveedor externo falla (retorna null) → fallback a keyword matcher.
 * 6. Si no hay coincidencias → respuesta de fallback en español.
 *
 * @param message - Mensaje actual del visitante
 * @param sessionMessages - Historial completo de mensajes de la sesión
 * @param knowledgeBaseEntries - Entradas de la Base de Conocimiento
 * @returns Respuesta del agente en español
 */
export async function processMessage(
  message: string,
  sessionMessages: ChatMessage[],
  knowledgeBaseEntries: KnowledgeBaseEntry[]
): Promise<string> {
  // 1. Limitar ventana de contexto a los últimos 10 mensajes
  const contextMessages = boundContextWindow(sessionMessages);

  // 2. Verificar restricción de tema
  if (!isOnTopic(message)) {
    return OFF_TOPIC_RESPONSE;
  }

  // 3. Determinar si hay proveedor de IA disponible
  const providerConfig = getAIProviderConfig();

  if (providerConfig) {
    // Construir contexto de la KB como string para el prompt del sistema
    const kbContext = knowledgeBaseEntries
      .map((entry) => `[${entry.category}] ${entry.topic}: ${entry.content}`)
      .join('\n');

    // Intentar con el proveedor de IA externo
    const aiResponse = await generateAIResponse(
      message,
      kbContext,
      contextMessages
    );

    // Si la IA responde exitosamente, retornar su respuesta
    if (aiResponse !== null) {
      return aiResponse;
    }

    // Si la IA falla (retorna null), fallback al keyword matcher
    console.warn('[AI Agent] AI provider failed, falling back to keyword matcher');
  }

  // 4. Usar keyword matcher (fallback o modo sin API key)
  const matchedEntries = matchKeywords(message, knowledgeBaseEntries);

  // 5. Construir respuesta basada en coincidencias
  return buildKeywordResponse(matchedEntries);
}
