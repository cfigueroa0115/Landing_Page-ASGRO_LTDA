/**
 * Property-Based Tests for Keyword Matcher
 * Feature: asgro-landing-page, Property 3: Keyword matcher
 *
 * Validates: Requirements 14.7, 14.6
 *
 * Properties tested:
 * 1. For any message containing a word present in a KB entry's topic/content/category/tags, that entry is returned
 * 2. For messages with only stop words, returns empty array
 * 3. Results are ordered by match count (descending)
 * 4. Only active entries (isActive=true) are returned
 * 5. Empty messages return empty array
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { matchKeywords, tokenize, removeStopWords } from '@/lib/ai/keyword-matcher';
import type { KnowledgeBaseEntry } from '@/types';

// ============================================================================
// Helpers
// ============================================================================

function createKBEntry(overrides: Partial<KnowledgeBaseEntry> = {}): KnowledgeBaseEntry {
  return {
    id: overrides.id ?? 'entry-1',
    topic: overrides.topic ?? 'Seguros empresariales',
    category: overrides.category ?? 'seguros',
    content: overrides.content ?? 'Ofrecemos seguros empresariales para proteger su negocio',
    tags: overrides.tags ?? 'seguros,empresariales,protección',
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  };
}

// Spanish stop words (subset used for generating stop-word-only messages)
const STOP_WORDS = [
  'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'a', 'al',
  'con', 'por', 'para', 'sin', 'sobre', 'y', 'o', 'que', 'pero', 'es',
  'son', 'no', 'muy', 'más', 'ya', 'yo', 'tu', 'se', 'me', 'te',
];

// Arbitrary for generating non-stop-word keywords (alphabetic, length > 1)
const keywordArb = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 3, maxLength: 12 })
  .map((chars) => chars.join(''))
  .filter((w) => !STOP_WORDS.includes(w) && w.length > 2);

// ============================================================================
// Tests
// ============================================================================

describe('Feature: asgro-landing-page, Property 3: Keyword matcher', () => {
  it('Property 3.1: For any message containing a word present in a KB entry topic/content/category/tags, that entry is returned', () => {
    fc.assert(
      fc.property(
        keywordArb,
        fc.constantFrom('topic', 'content', 'category', 'tags') as fc.Arbitrary<'topic' | 'content' | 'category' | 'tags'>,
        (keyword, field) => {
          // Create a KB entry that contains the keyword in the specified field
          const entry = createKBEntry({
            id: 'target-entry',
            topic: field === 'topic' ? `Información sobre ${keyword}` : 'tema genérico',
            content: field === 'content' ? `Este contenido trata sobre ${keyword} en detalle` : 'contenido base',
            category: field === 'category' ? keyword : 'general',
            tags: field === 'tags' ? `etiqueta,${keyword},otra` : 'etiqueta,otra',
            isActive: true,
          });

          // Create a decoy entry that does NOT contain the keyword
          const decoy = createKBEntry({
            id: 'decoy-entry',
            topic: 'Otro tema completamente diferente',
            content: 'Contenido que no tiene nada que ver',
            category: 'otra',
            tags: 'irrelevante,distinto',
            isActive: true,
          });

          // Message contains the keyword
          const message = `Quisiera saber sobre ${keyword}`;
          const results = matchKeywords(message, [entry, decoy]);

          // The target entry must be in results
          const resultIds = results.map((r) => r.id);
          expect(resultIds).toContain('target-entry');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3.2: For messages with only stop words, returns empty array', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...STOP_WORDS), { minLength: 1, maxLength: 8 }),
        (stopWords) => {
          const message = stopWords.join(' ');
          const entries = [
            createKBEntry({ id: 'e1', topic: 'Seguros ARL', isActive: true }),
            createKBEntry({ id: 'e2', topic: 'SST laboral', isActive: true }),
          ];

          const results = matchKeywords(message, entries);
          expect(results).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3.3: Results are ordered by match count (descending)', () => {
    fc.assert(
      fc.property(
        keywordArb,
        keywordArb,
        (keyword1, keyword2) => {
          // Ensure keywords are distinct
          if (keyword1 === keyword2) return;

          // Entry with MORE matches (both keywords in topic and content)
          const highMatchEntry = createKBEntry({
            id: 'high-match',
            topic: `${keyword1} y ${keyword2} combinados`,
            content: `Detalles sobre ${keyword1} y también ${keyword2}`,
            category: keyword1,
            tags: `${keyword1},${keyword2}`,
            isActive: true,
          });

          // Entry with FEWER matches (only keyword1 in topic)
          const lowMatchEntry = createKBEntry({
            id: 'low-match',
            topic: `Solo ${keyword1} aquí`,
            content: 'contenido sin coincidencias relevantes',
            category: 'general',
            tags: 'nada,especial',
            isActive: true,
          });

          // Message contains both keywords
          const message = `${keyword1} ${keyword2}`;
          const results = matchKeywords(message, [lowMatchEntry, highMatchEntry]);

          if (results.length >= 2) {
            // The entry with more matches should appear first
            expect(results[0]!.id).toBe('high-match');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3.4: Only active entries (isActive=true) are returned', () => {
    fc.assert(
      fc.property(
        keywordArb,
        (keyword) => {
          // Active entry containing the keyword
          const activeEntry = createKBEntry({
            id: 'active-entry',
            topic: `Información sobre ${keyword}`,
            content: `Detalles de ${keyword}`,
            isActive: true,
          });

          // Inactive entry containing the same keyword
          const inactiveEntry = createKBEntry({
            id: 'inactive-entry',
            topic: `Información sobre ${keyword}`,
            content: `Detalles de ${keyword}`,
            isActive: false,
          });

          const message = `Consulta sobre ${keyword}`;
          const results = matchKeywords(message, [activeEntry, inactiveEntry]);

          // Inactive entries must never appear in results
          const resultIds = results.map((r) => r.id);
          expect(resultIds).not.toContain('inactive-entry');

          // Active entry should be found
          expect(resultIds).toContain('active-entry');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3.5: Empty messages return empty array', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\t', '\n', '  \n  '),
        (emptyMessage) => {
          const entries = [
            createKBEntry({ id: 'e1', topic: 'Seguros ARL', isActive: true }),
            createKBEntry({ id: 'e2', topic: 'SST laboral', isActive: true }),
            createKBEntry({ id: 'e3', topic: 'Bienestar', isActive: true }),
          ];

          const results = matchKeywords(emptyMessage, entries);
          expect(results).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional supporting property: tokenize and removeStopWords consistency
  it('Property 3 (supporting): tokenize produces lowercase tokens > 1 char, removeStopWords filters correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (text) => {
          const tokens = tokenize(text);

          // All tokens should be lowercase
          for (const token of tokens) {
            expect(token).toBe(token.toLowerCase());
          }

          // All tokens should have length > 1
          for (const token of tokens) {
            expect(token.length).toBeGreaterThan(1);
          }

          // removeStopWords should produce a subset of tokens
          const filtered = removeStopWords(tokens);
          for (const word of filtered) {
            expect(tokens).toContain(word);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
