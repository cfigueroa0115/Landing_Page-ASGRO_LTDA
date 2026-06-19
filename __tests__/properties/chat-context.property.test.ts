/**
 * Property-Based Test: Chat Context Window
 * Feature: asgro-landing-page, Property 4: Chat context window bounded to 10 messages
 *
 * Validates: Requirements 14.3
 *
 * Properties tested:
 * 1. For any session with N messages where N > 10, boundContextWindow returns exactly 10 messages
 * 2. For any session with N ≤ 10 messages, boundContextWindow returns all N messages
 * 3. The returned messages are always the LAST N (most recent), preserving chronological order
 * 4. Output length is always min(N, 10)
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { boundContextWindow } from '@/lib/ai/agent';
import type { ChatMessage } from '@/types';

// ============================================================================
// Generadores
// ============================================================================

/** Generador de un ChatMessage arbitrario */
const chatMessageArb: fc.Arbitrary<ChatMessage> = fc.record({
  id: fc.uuid(),
  role: fc.constantFrom('user' as const, 'assistant' as const),
  content: fc.string({ minLength: 1, maxLength: 500 }),
  timestamp: fc.date(),
});

/** Generador de un array de ChatMessages con más de 10 elementos */
const moreThan10MessagesArb: fc.Arbitrary<ChatMessage[]> = fc.array(chatMessageArb, {
  minLength: 11,
  maxLength: 100,
});

/** Generador de un array de ChatMessages con 10 o menos elementos */
const atMost10MessagesArb: fc.Arbitrary<ChatMessage[]> = fc.array(chatMessageArb, {
  minLength: 0,
  maxLength: 10,
});

/** Generador de un array de ChatMessages de cualquier longitud */
const anyMessagesArb: fc.Arbitrary<ChatMessage[]> = fc.array(chatMessageArb, {
  minLength: 0,
  maxLength: 100,
});

// ============================================================================
// Tests de propiedades
// ============================================================================

describe('Feature: asgro-landing-page, Property 4: Chat context window bounded to 10 messages', () => {
  it('returns exactly 10 messages when session has more than 10 messages', () => {
    fc.assert(
      fc.property(moreThan10MessagesArb, (messages) => {
        const result = boundContextWindow(messages);
        expect(result).toHaveLength(10);
      }),
      { numRuns: 100 }
    );
  });

  it('returns all N messages when session has N ≤ 10 messages', () => {
    fc.assert(
      fc.property(atMost10MessagesArb, (messages) => {
        const result = boundContextWindow(messages);
        expect(result).toHaveLength(messages.length);
      }),
      { numRuns: 100 }
    );
  });

  it('returns the LAST N messages (most recent), preserving chronological order', () => {
    fc.assert(
      fc.property(moreThan10MessagesArb, (messages) => {
        const result = boundContextWindow(messages);
        const expectedSlice = messages.slice(-10);

        // Verify the returned messages are the last 10 from the original array
        expect(result).toEqual(expectedSlice);

        // Verify order is preserved (same relative order as input)
        for (let i = 0; i < result.length - 1; i++) {
          const indexInOriginal = messages.indexOf(result[i]!);
          const nextIndexInOriginal = messages.indexOf(result[i + 1]!);
          expect(indexInOriginal).toBeLessThan(nextIndexInOriginal);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('output length is always min(N, 10) for any input size', () => {
    fc.assert(
      fc.property(anyMessagesArb, (messages) => {
        const result = boundContextWindow(messages);
        const expectedLength = Math.min(messages.length, 10);
        expect(result).toHaveLength(expectedLength);
      }),
      { numRuns: 100 }
    );
  });
});
