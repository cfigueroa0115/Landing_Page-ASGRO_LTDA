'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';

/**
 * WhatsApp CTA button component with floating and inline variants.
 * Conditionally renders based on phone number availability.
 *
 * @see Requirements 18.1, 18.2, 18.5, 18.6
 */

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  variant?: 'floating' | 'inline';
  context?: string;
}

export default function WhatsAppButton({
  phoneNumber,
  message,
  variant = 'floating',
  context,
}: WhatsAppButtonProps) {
  // Determine the message to use: explicit prop > default based on context
  const resolvedMessage = message || getDefaultWhatsAppMessage(context);

  // Generate URL — returns empty string if phone is invalid/empty
  const whatsappUrl = generateWhatsAppUrl(phoneNumber, resolvedMessage);

  // If phoneNumber is empty or URL generation fails, hide completely (Req 18.6)
  if (!phoneNumber || !whatsappUrl) {
    return null;
  }

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-[24px] right-[16px] md:bottom-[32px] md:right-[24px] z-[9999] flex h-14 w-14 min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 animate-pulse"
      >
        <FaWhatsapp className="h-7 w-7" />
      </a>
    );
  }

  // Inline variant
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="inline-flex min-h-[48px] min-w-[48px] items-center gap-2 rounded-btn bg-[#25D366] px-5 py-3 text-white font-medium transition-colors hover:bg-[#1fb855]"
    >
      <FaWhatsapp className="h-5 w-5" />
      <span>WhatsApp</span>
    </a>
  );
}
