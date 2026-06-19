'use client';

import { useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV_LINKS } from '@/lib/utils/constants';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';
import { getWhatsAppNumber } from '@/lib/utils/constants';

/**
 * MobileNav — hamburger menu visible below 768px with vertical overlay panel.
 * Contains all navigation links in Spanish, "Cotizar ahora" and "WhatsApp" buttons.
 * Closes on link click, outside tap, or Escape key.
 *
 * @see Requirements 3.5, 3.8, 3.9
 */

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function MobileNav({ isOpen, onClose, onToggle }: MobileNavProps) {
  const whatsappNumber = getWhatsAppNumber();
  const whatsappUrl = generateWhatsAppUrl(whatsappNumber, getDefaultWhatsAppMessage());

  // Close on Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when menu is open
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

  // Handle smooth scroll to section and close menu
  const handleLinkClick = (href: string) => {
    onClose();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, 300); // Wait for close animation to start
    }
  };

  return (
    <>
      {/* Hamburger / Close button — visible below md (768px) */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        className="relative z-50 flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-btn text-white transition-colors hover:bg-white/10 md:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop — closes on tap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Slide-in panel */}
            <motion.nav
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-gradient-to-b from-[#011930] to-[#001B33] px-6 py-8 shadow-xl md:hidden"
            >
              {/* Close button inside the panel */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar menú de navegación"
                  className="flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-btn text-white transition-colors hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation links */}
              <ul className="mt-8 flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => handleLinkClick(link.href)}
                      className="flex w-full min-h-[48px] items-center rounded-btn px-4 py-3 text-lg font-medium text-white transition-colors hover:bg-white/10"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}

                {/* Cotizar ahora link */}
                <li>
                  <button
                    type="button"
                    onClick={() => handleLinkClick('#cotizar')}
                    className="flex w-full min-h-[48px] items-center rounded-btn px-4 py-3 text-lg font-semibold text-[#7AC146] transition-colors hover:bg-white/10"
                  >
                    Cotizar ahora
                  </button>
                </li>

                {/* WhatsApp button — only shown if number is available */}
                {whatsappNumber && whatsappUrl && (
                  <li>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="flex w-full min-h-[48px] items-center gap-3 rounded-btn bg-[#25D366] px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#1fb855]"
                    >
                      <FaWhatsapp className="h-5 w-5" />
                      <span>WhatsApp</span>
                    </a>
                  </li>
                )}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
