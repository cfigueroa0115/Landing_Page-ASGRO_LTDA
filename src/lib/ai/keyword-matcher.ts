// ============================================================================
// Keyword Matcher - Fallback local para el Agente IA
// Busca entradas de la Base de Conocimiento por coincidencia de palabras clave
// en los campos: topic, content, category, y tags
// ============================================================================

import type { KnowledgeBaseEntry } from '@/types';

// ============================================================================
// Stop words en español - se filtran del mensaje del visitante
// ============================================================================

const SPANISH_STOP_WORDS = new Set([
  // Artículos
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  // Preposiciones
  'de', 'del', 'en', 'a', 'al', 'con', 'por', 'para', 'sin', 'sobre',
  'entre', 'hasta', 'desde', 'hacia', 'según', 'durante', 'mediante',
  // Conjunciones
  'y', 'o', 'ni', 'que', 'pero', 'sino', 'aunque', 'porque', 'como',
  'cuando', 'donde', 'si', 'pues',
  // Pronombres
  'yo', 'tu', 'tú', 'el', 'él', 'ella', 'nosotros', 'ellos', 'ellas',
  'me', 'te', 'se', 'nos', 'lo', 'le', 'les', 'su', 'sus', 'mi', 'mis',
  'este', 'esta', 'esto', 'estos', 'estas', 'ese', 'esa', 'eso', 'esos',
  'esas', 'aquel', 'aquella', 'aquello',
  // Verbos comunes
  'es', 'son', 'ser', 'estar', 'está', 'hay', 'tiene', 'tienen',
  'puede', 'hacer', 'haber', 'ha', 'han', 'fue', 'era', 'ser',
  // Adverbios
  'no', 'sí', 'muy', 'más', 'menos', 'ya', 'también', 'bien', 'mal',
  'aquí', 'ahí', 'allí', 'así', 'solo', 'todo', 'todos', 'toda', 'todas',
  // Otros
  'qué', 'cual', 'cuál', 'quién', 'cómo', 'cuándo', 'dónde',
  'quisiera', 'necesito', 'quiero', 'puedo', 'debo',
]);

// ============================================================================
// Interfaz del resultado con puntaje de coincidencia
// ============================================================================

export interface KeywordMatchResult {
  entry: KnowledgeBaseEntry;
  matchCount: number;
}

// ============================================================================
// Funciones principales
// ============================================================================

/**
 * Tokeniza un texto en palabras individuales normalizadas.
 * - Convierte a minúsculas
 * - Elimina signos de puntuación
 * - Divide por espacios y separadores comunes
 * - Filtra tokens vacíos y de un solo carácter
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,;:!?¡¿()[\]{}"'`´\-_/\\@#$%^&*+=<>~|]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1);
}

/**
 * Filtra stop words en español de una lista de tokens.
 */
export function removeStopWords(tokens: string[]): string[] {
  return tokens.filter((token) => !SPANISH_STOP_WORDS.has(token));
}

/**
 * Cuenta cuántas palabras del mensaje aparecen en un texto dado.
 */
function countMatches(messageWords: string[], text: string): number {
  const textLower = text.toLowerCase();
  let count = 0;
  for (const word of messageWords) {
    if (textLower.includes(word)) {
      count++;
    }
  }
  return count;
}

/**
 * Busca entradas relevantes de la Base de Conocimiento comparando las palabras
 * del mensaje del visitante contra los campos: topic, content, category y tags.
 *
 * Solo se consideran entradas activas (isActive === true).
 * Las entradas se ordenan por cantidad de coincidencias (mayor primero).
 * Retorna un array vacío si no hay coincidencias.
 *
 * @param message - Mensaje del visitante
 * @param entries - Entradas de la Base de Conocimiento
 * @returns Entradas relevantes ordenadas por coincidencia, o array vacío
 */
export function matchKeywords(
  message: string,
  entries: KnowledgeBaseEntry[]
): KnowledgeBaseEntry[] {
  // Tokenizar y filtrar stop words del mensaje del visitante
  const tokens = tokenize(message);
  const messageWords = removeStopWords(tokens);

  // Si no quedan palabras significativas después del filtrado, retornar vacío
  if (messageWords.length === 0) {
    return [];
  }

  // Filtrar solo entradas activas
  const activeEntries = entries.filter((entry) => entry.isActive);

  // Calcular coincidencias por cada entrada activa
  const results: KeywordMatchResult[] = [];

  for (const entry of activeEntries) {
    // Buscar coincidencias en los CUATRO campos: topic, content, category, tags
    const topicMatches = countMatches(messageWords, entry.topic);
    const contentMatches = countMatches(messageWords, entry.content);
    const categoryMatches = countMatches(messageWords, entry.category);
    const tagsMatches = countMatches(messageWords, entry.tags);

    const totalMatches =
      topicMatches + contentMatches + categoryMatches + tagsMatches;

    if (totalMatches > 0) {
      results.push({ entry, matchCount: totalMatches });
    }
  }

  // Ordenar por cantidad de coincidencias (mayor primero)
  results.sort((a, b) => b.matchCount - a.matchCount);

  // Retornar solo las entradas (sin el puntaje)
  return results.map((result) => result.entry);
}

/**
 * Versión con resultados detallados que incluye el puntaje de coincidencia.
 * Útil para debugging y para el agente IA al componer respuestas.
 */
export function matchKeywordsWithScore(
  message: string,
  entries: KnowledgeBaseEntry[]
): KeywordMatchResult[] {
  const tokens = tokenize(message);
  const messageWords = removeStopWords(tokens);

  if (messageWords.length === 0) {
    return [];
  }

  const activeEntries = entries.filter((entry) => entry.isActive);
  const results: KeywordMatchResult[] = [];

  for (const entry of activeEntries) {
    const topicMatches = countMatches(messageWords, entry.topic);
    const contentMatches = countMatches(messageWords, entry.content);
    const categoryMatches = countMatches(messageWords, entry.category);
    const tagsMatches = countMatches(messageWords, entry.tags);

    const totalMatches =
      topicMatches + contentMatches + categoryMatches + tagsMatches;

    if (totalMatches > 0) {
      results.push({ entry, matchCount: totalMatches });
    }
  }

  results.sort((a, b) => b.matchCount - a.matchCount);
  return results;
}
