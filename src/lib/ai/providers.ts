// ============================================================================
// AI Provider Abstraction - OpenAI y Gemini
// Usa fetch nativo para evitar dependencias extra.
// Detecta automáticamente el proveedor según variables de entorno.
// Retorna null si la llamada falla, permitiendo fallback al keyword matcher.
// ============================================================================

import type { ChatMessage } from '@/types';

// ============================================================================
// Constantes
// ============================================================================

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/** Timeout máximo para llamadas a APIs externas (5 segundos) */
const API_TIMEOUT_MS = 5000;

/** Prompt del sistema en español — restringe respuestas a seguros, SST, ARL y riesgos laborales */
const SYSTEM_PROMPT_BASE = `Eres el asistente virtual de ASGRO LTDA, una agencia de seguros especializada en gestión de riesgos laborales (ARL), seguridad y salud en el trabajo (SST), bienestar laboral y seguros empresariales a la medida.

REGLAS ESTRICTAS:
1. Solo puedes responder preguntas relacionadas con seguros, SST, ARL, riesgos laborales, bienestar laboral y los servicios de ASGRO.
2. Si el usuario pregunta sobre un tema que NO está relacionado con seguros, SST, ARL o riesgos laborales, responde amablemente que solo puedes asistir en esos temas y sugiere contactar a un asesor por WhatsApp o el formulario de contacto.
3. Basa tus respuestas ÚNICAMENTE en la información proporcionada en la Base de Conocimiento.
4. No inventes información que no esté en la Base de Conocimiento.
5. Responde siempre en español.
6. Sé conciso, profesional y amable.
7. Si no encuentras información relevante en la Base de Conocimiento, indica que no tienes información sobre ese tema específico y recomienda contactar a un asesor humano.`;

// ============================================================================
// Tipos internos
// ============================================================================

type AIProvider = 'openai' | 'gemini';

interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
}

// ============================================================================
// Detección de proveedor
// ============================================================================

/**
 * Detecta qué proveedor de IA está disponible según las variables de entorno.
 * OpenAI tiene prioridad sobre Gemini.
 * Retorna null si ninguna API key está configurada.
 */
function detectProvider(): ProviderConfig | null {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.trim().length > 0) {
    return { provider: 'openai', apiKey: openaiKey.trim() };
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 0) {
    return { provider: 'gemini', apiKey: geminiKey.trim() };
  }

  return null;
}

// ============================================================================
// Construcción del prompt del sistema con contexto de la KB
// ============================================================================

/**
 * Construye el prompt del sistema combinando las instrucciones base
 * con el contexto de la Base de Conocimiento.
 */
function buildSystemPrompt(knowledgeBaseContext: string): string {
  if (!knowledgeBaseContext.trim()) {
    return SYSTEM_PROMPT_BASE;
  }

  return `${SYSTEM_PROMPT_BASE}

--- BASE DE CONOCIMIENTO ---
${knowledgeBaseContext}
--- FIN BASE DE CONOCIMIENTO ---`;
}

// ============================================================================
// Llamada a OpenAI
// ============================================================================

/**
 * Llama a la API de OpenAI (chat completions) con el contexto y el historial.
 * Retorna el texto de la respuesta o null si falla.
 */
async function callOpenAI(
  apiKey: string,
  message: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[]
): Promise<string | null> {
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: message },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        `[AI Providers] OpenAI API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      console.error('[AI Providers] OpenAI response missing content');
      return null;
    }

    return content.trim();
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[AI Providers] OpenAI API timeout (5s exceeded)');
    } else {
      console.error('[AI Providers] OpenAI API call failed:', error);
    }
    return null;
  }
}

// ============================================================================
// Llamada a Gemini
// ============================================================================

/**
 * Llama a la API de Google Gemini (generateContent) con el contexto y el historial.
 * Retorna el texto de la respuesta o null si falla.
 */
async function callGemini(
  apiKey: string,
  message: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[]
): Promise<string | null> {
  // Construir el historial de conversación como texto para Gemini
  const historyText = conversationHistory
    .map(
      (msg) =>
        `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
    )
    .join('\n');

  const fullPrompt = historyText
    ? `${historyText}\nUsuario: ${message}`
    : `Usuario: ${message}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const url = `${GEMINI_API_URL}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        `[AI Providers] Gemini API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content || typeof content !== 'string') {
      console.error('[AI Providers] Gemini response missing content');
      return null;
    }

    return content.trim();
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[AI Providers] Gemini API timeout (5s exceeded)');
    } else {
      console.error('[AI Providers] Gemini API call failed:', error);
    }
    return null;
  }
}

// ============================================================================
// Funciones públicas
// ============================================================================

/**
 * Genera una respuesta del asistente IA usando el proveedor configurado (OpenAI o Gemini).
 *
 * - Detecta automáticamente el proveedor según la variable de entorno disponible
 *   (OPENAI_API_KEY tiene prioridad sobre GEMINI_API_KEY).
 * - Acepta contenido de la Base de Conocimiento como contexto del sistema (string).
 * - Maneja errores de red, timeouts (5s) y respuestas inválidas de forma silenciosa.
 * - Retorna null si no hay proveedor configurado o si la llamada falla,
 *   permitiendo que el llamador use el keyword matcher como fallback.
 *
 * @param message - Mensaje actual del visitante
 * @param context - Contenido de la Base de Conocimiento como string para el prompt del sistema
 * @param conversationHistory - Historial de la conversación (últimos mensajes)
 * @returns Respuesta generada o null si falla / no hay proveedor configurado
 */
export async function generateAIResponse(
  message: string,
  context: string,
  conversationHistory: ChatMessage[]
): Promise<string | null> {
  const config = detectProvider();

  if (!config) {
    return null;
  }

  const systemPrompt = buildSystemPrompt(context);

  switch (config.provider) {
    case 'openai':
      return callOpenAI(config.apiKey, message, systemPrompt, conversationHistory);
    case 'gemini':
      return callGemini(config.apiKey, message, systemPrompt, conversationHistory);
    default:
      return null;
  }
}

/**
 * Verifica si hay un proveedor de IA externo configurado.
 * Útil para determinar si usar el modo IA o el modo keyword matcher.
 */
export function isAIProviderAvailable(): boolean {
  return detectProvider() !== null;
}
