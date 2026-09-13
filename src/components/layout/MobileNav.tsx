'use client';

import { useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { NAV_LINKS } from '@/lib/utils/constants';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';
import { getWhatsAppNumber } from '@/lib/utils/constants';

/**
 * MobileNav — Menú de navegación móvil modal (diálogo).
 *
 * Comportamiento modal completo: foco inicial al botón Cerrar, focus trap
 * mientras está abierto (Tab/Shift+Tab ciclan dentro del panel), Escape cierra,
 * retorno de foco al elemento que lo abrió (hamburguesa), bloqueo del scroll del
 * body y aria-modal. Respeta prefers-reduced-motion (sin slide lateral).
 */

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const whatsappNumber = getWhatsAppNumber();
  const whatsappUrl = generateWhatsAppUrl(whatsappNumber, getDefaultWhatsAppMessage());

  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Elemento que tenía el foco al abrir (la hamburguesa) para restaurarlo.
  const previouslyFocused = useRef<HTMLElement | null>(null);

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

  // Foco inicial al abrir (botón Cerrar) y retorno de foco al cerrar.
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current =
        (document.activeElement as HTMLElement | null) ?? null;
      // Esperar al montaje del panel antes de enfocar.
      const t = setTimeout(() => closeButtonRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    // Al cerrar, devolver el foco al elemento que lo abrió (la hamburguesa).
    previouslyFocused.current?.focus?.();
  }, [isOpen]);

  // Focus trap: Tab/Shift+Tab ciclan dentro del panel mientras está abierto.
  const handleTrapKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || !panel.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    // "Seguros" (/servicios) es el hub: coincidencia exacta para que las hijas
    // (Empresas, ARL, SST) no marquen también "Seguros". (Alineado con Header, 6C.)
    if (href === '/servicios') return pathname === '/servicios';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Overlay panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop — closes on tap. z por ENCIMA de los widgets flotantes
                (que además se ocultan vía FloatingUIProvider). */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] bg-black/50 min-[1120px]:hidden"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Slide-in panel. Con reduced-motion: sin desplazamiento lateral,
                aparición inmediata (fade mínimo del backdrop). */}
            <motion.nav
              ref={panelRef}
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              onKeyDown={handleTrapKeyDown}
              initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.15 }
                  : { type: 'tween', duration: 0.3, ease: 'easeInOut' }
              }
              className="fixed inset-y-0 right-0 z-[10001] flex w-full max-w-sm flex-col overflow-y-auto bg-gradient-to-b from-[#011930] to-[#001B33] px-[20px] py-[24px] shadow-xl min-[1120px]:hidden"
            >
              {/* Close button inside the panel */}
              <div className="flex justify-end">
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar menú de navegación"
                  className="flex h-[48px] w-[48px] items-center justify-center rounded-btn text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <X className="h-[24px] w-[24px]" />
                </button>
              </div>

              {/* Navigation links */}
              <ul className="mt-[24px] flex flex-col gap-[10px]">
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={`flex w-full min-h-[48px] items-center rounded-btn px-[16px] py-[12px] text-lg font-medium transition-colors hover:bg-white/10 ${
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

                {/* Solicitar asesoría — CTA principal */}
                <li className="mt-[8px]">
                  <Link
                    href="/contacto"
                    onClick={onClose}
                    className="flex w-full min-h-[48px] items-center justify-center rounded-btn bg-white/95 px-[16px] py-[12px] text-lg font-bold text-brand-dark-blue transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
                  >
                    Solicitar asesoría
                  </Link>
                </li>

                {/* Solicitar una cotización — secundario */}
                <li>
                  <Link
                    href="/cotizar"
                    onClick={onClose}
                    className="flex w-full min-h-[48px] items-center rounded-btn px-[16px] py-[12px] text-lg font-semibold text-[#7AC146] transition-colors hover:bg-white/10"
                  >
                    Solicitar una cotización
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
                      className="flex w-full min-h-[48px] items-center gap-3 rounded-btn bg-[#25D366] px-[16px] py-[12px] text-lg font-bold text-brand-dark-blue transition-colors hover:bg-[#20bd5a]"
                    >
                      <FaWhatsapp className="h-[22px] w-[22px]" />
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
