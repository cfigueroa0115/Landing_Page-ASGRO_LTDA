'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Shield,
  HardHat,
  Heart,
  FileCheck,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';
import { getWhatsAppNumber } from '@/lib/utils/constants';
import type { ServiceModalProps } from '@/types';

/** Map of icon string names to Lucide React components */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  HardHat,
  Heart,
  FileCheck,
};

/**
 * ServiceModal — Modal dialog for service details.
 *
 * Displays service title, icon, full description, sub-services list,
 * and CTA buttons for quoting and WhatsApp contact.
 *
 * Features:
 * - Framer Motion enter/exit animations (fade + scale)
 * - Focus trap (Tab loops between first/last focusable elements)
 * - Close via X button, overlay click, or Escape key
 * - Prevents body scroll when open
 * - Accessible: role="dialog", aria-modal="true", aria-labelledby
 * - Uses rounded-modal (24px) border radius
 *
 * @see Requirements 9.2, 9.4, 9.5, 22.9
 */
export default function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const whatsAppNumber = getWhatsAppNumber();
  const whatsAppMessage = getDefaultWhatsAppMessage(service.title);
  const whatsAppUrl = generateWhatsAppUrl(whatsAppNumber, whatsAppMessage);

  // Scroll to quote section
  const handleQuoteClick = useCallback(() => {
    onClose();
    // Small delay to let the modal close animation finish
    setTimeout(() => {
      const quoteSection = document.getElementById('cotizar');
      if (quoteSection) {
        quoteSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus the close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement | undefined;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement | undefined;

      if (!firstElement || !lastElement) return;

      if (e.shiftKey) {
        // Shift+Tab: if focus is on first element, move to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: if focus is on last element, move to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Resolve service icon from string name
  const ServiceIcon = ICON_MAP[service.icon] ?? Shield;

  const titleId = `service-modal-title-${service.id}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay — click to close */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal content */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-modal bg-white p-4 md:p-6 shadow-elevated"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Cerrar modal"
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-brand-light-gray hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Service icon and title */}
            <div className="flex items-center gap-2 pr-10 mb-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                <ServiceIcon className="h-6 w-6" />
              </div>
              <h2
                id={titleId}
                className="text-h4 text-brand-dark-blue"
              >
                {service.title}
              </h2>
            </div>

            {/* Full description */}
            <p className="text-body text-gray-700 mb-4">
              {service.description}
            </p>

            {/* Sub-services list */}
            <div className="mb-4">
              <h3 className="text-small font-semibold text-brand-dark-blue mb-2">
                Servicios incluidos:
              </h3>
              <ul className="space-y-1.5">
                {service.subServices.map((subService, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-1.5 text-small text-gray-600"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-brand-green" />
                    <span>{subService}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
              {/* Quote CTA */}
              <button
                onClick={handleQuoteClick}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-btn bg-brand-blue px-4 py-3 text-small font-medium text-white transition-colors hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 min-h-[44px]"
              >
                Cotizar este servicio
              </button>

              {/* WhatsApp CTA — only show if number is configured */}
              {whatsAppNumber && whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-btn bg-[#25D366] px-4 py-3 text-small font-medium text-white transition-colors hover:bg-[#1fb855] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 min-h-[44px]"
                >
                  <FaWhatsapp className="h-5 w-5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
