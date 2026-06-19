/**
 * WhatsApp URL generation utilities for ASGRO Landing Page.
 * Builds valid wa.me links with phone sanitization and URI-encoded messages.
 *
 * @module lib/utils/whatsapp
 * @see Requirements 18.3, 18.4
 */

/**
 * Generates a WhatsApp URL for direct messaging.
 *
 * Strips all non-digit characters from the phone number and builds a
 * `https://wa.me/{phone}?text={encodedMessage}` URL.
 *
 * @param phone - The phone number (may contain dashes, spaces, parentheses, or country code prefix like "+")
 * @param message - Optional pre-filled message to include in the URL
 * @returns The full WhatsApp URL, or an empty string if phone is empty/invalid
 */
export function generateWhatsAppUrl(phone: string, message?: string): string {
  // Strip all non-digit characters from the phone number
  const sanitizedPhone = phone.replace(/\D/g, '');

  // If phone is empty after stripping, return empty string so UI can hide the button
  if (!sanitizedPhone) {
    return '';
  }

  // Build base URL
  let url = `https://wa.me/${sanitizedPhone}`;

  // Append URI-encoded message if provided
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }

  return url;
}

/**
 * Returns a default WhatsApp greeting message in Spanish,
 * identifying the sender as a website visitor.
 *
 * If a context is provided (e.g., "ARL", "SST", "seguros empresariales"),
 * it is included in the message to reference the specific service.
 *
 * @param context - Optional service or section context to include in the message
 * @returns A Spanish greeting message for WhatsApp
 */
export function getDefaultWhatsAppMessage(context?: string): string {
  if (context) {
    return `Hola, soy visitante del sitio web de ASGRO. Me gustaría recibir información sobre ${context}. ¿Podrían ayudarme?`;
  }

  return 'Hola, soy visitante del sitio web de ASGRO. Me gustaría recibir información sobre sus servicios. ¿Podrían ayudarme?';
}
