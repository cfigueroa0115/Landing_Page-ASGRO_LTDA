'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV_LINKS } from '@/lib/utils/constants';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';
import { getWhatsAppNumber } from '@/lib/utils/constants';

/**
 * MobileNav — Slide-in menu for mobile with route-based navigation.
 * Uses next/link for all navigation items. Closes on link click, outside tap, or Escape key.
 */

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
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

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
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
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-gradient-to-b from-[#011930] to-[#001B33] px-6 py-8 shadow-xl lg:hidden"
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
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={`flex w-full min-h-[48px] items-center rounded-btn px-4 py-3 text-lg font-medium transition-colors hover:bg-white/10 ${
                          active
                            ? 'text-brand-neon-green font-semibold bg-white/5'
                            : 'text-white'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}

                {/* Cotizar ahora link */}
                <li>
                  <Link
                    href="/cotizar"
                    onClick={onClose}
                    className="flex w-full min-h-[48px] items-center rounded-btn px-4 py-3 text-lg font-semibold text-[#7AC146] transition-colors hover:bg-white/10"
                  >
                    Cotizar ahora
                  </Link>
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
