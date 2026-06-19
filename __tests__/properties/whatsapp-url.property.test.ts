/**
 * Property-based tests for WhatsApp URL generation.
 *
 * Feature: asgro-landing-page, Property 2: WhatsApp URL generation
 * Validates: Requirements 18.3, 18.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';

describe('Feature: asgro-landing-page, Property 2: WhatsApp URL generation', () => {
  /**
   * Arbitrary for digit-only strings of a given length range.
   */
  const digitStringArb = (minLength: number, maxLength: number) =>
    fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength, maxLength })
      .map(arr => arr.join(''));

  /**
   * Arbitrary for valid phone numbers: non-empty strings of digits with optional leading +
   */
  const validPhoneArb = fc.tuple(
    fc.constantFrom('', '+'),
    digitStringArb(1, 15)
  ).map(([prefix, digits]) => `${prefix}${digits}`);

  /**
   * Arbitrary for phone numbers that contain non-digit chars (dashes, spaces, parens)
   * but still have at least one digit.
   */
  const phoneWithFormattingArb = fc.tuple(
    fc.constantFrom('', '+'),
    fc.array(
      fc.tuple(
        fc.array(fc.constantFrom(' ', '-', '(', ')'), { minLength: 0, maxLength: 2 }).map(a => a.join('')),
        digitStringArb(1, 3)
      ),
      { minLength: 1, maxLength: 5 }
    )
  ).map(([prefix, parts]) => `${prefix}${parts.map(([sep, d]) => `${sep}${d}`).join('')}`);

  /**
   * Arbitrary for phone numbers that produce empty after stripping non-digits
   * (no digits at all).
   */
  const emptyPhoneArb = fc.constantFrom('', '+', '---', '()', ' ', '+-', '( ) -');

  it('URL starts with "https://wa.me/" for any valid phone and any message', () => {
    fc.assert(
      fc.property(
        validPhoneArb,
        fc.option(fc.string(), { nil: undefined }),
        (phone, message) => {
          const url = generateWhatsAppUrl(phone, message);
          expect(url.startsWith('https://wa.me/')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('phone in URL has all non-digit characters removed', () => {
    fc.assert(
      fc.property(
        phoneWithFormattingArb,
        fc.option(fc.string(), { nil: undefined }),
        (phone, message) => {
          const url = generateWhatsAppUrl(phone, message);
          // Extract phone portion from URL
          const afterPrefix = url.slice('https://wa.me/'.length);
          const phoneInUrl = afterPrefix.split('?')[0];
          // Should contain only digits
          expect(phoneInUrl).toMatch(/^\d+$/);
          // Should equal the original phone with non-digits stripped
          const expectedPhone = phone.replace(/\D/g, '');
          expect(phoneInUrl).toBe(expectedPhone);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('if a message is provided, URL includes "?text=" with URI-encoded message', () => {
    fc.assert(
      fc.property(
        validPhoneArb,
        fc.string({ minLength: 1 }),
        (phone, message) => {
          const url = generateWhatsAppUrl(phone, message);
          expect(url).toContain('?text=');
          // Extract the text parameter value
          const textParam = url.split('?text=')[1]!;
          // Decoding should give back the original message
          expect(decodeURIComponent(textParam)).toBe(message);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('if no message is provided, URL is just "https://wa.me/{cleanPhone}"', () => {
    fc.assert(
      fc.property(
        validPhoneArb,
        (phone) => {
          const url = generateWhatsAppUrl(phone, undefined);
          const expectedPhone = phone.replace(/\D/g, '');
          expect(url).toBe(`https://wa.me/${expectedPhone}`);
          // Should not contain query parameters
          expect(url).not.toContain('?');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for empty phone numbers (no digits), the function returns empty string', () => {
    fc.assert(
      fc.property(
        emptyPhoneArb,
        fc.option(fc.string(), { nil: undefined }),
        (phone, message) => {
          const url = generateWhatsAppUrl(phone, message);
          expect(url).toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });
});
