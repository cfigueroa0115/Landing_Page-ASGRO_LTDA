'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';
import { useFloatingUI } from '@/components/shared/FloatingUIProvider';

const PANEL_ID = 'asgro-whatsapp-panel';

export interface FloatingWhatsAppProps {
  /** Número de WhatsApp (E.164 o con separadores). Si es vacío, no se renderiza. */
  phoneNumber: string;
}

/**
 * FloatingWhatsApp — Widget flotante premium de WhatsApp (abajo-derecha).
 *
 * Independiente del asistente IA (que vive abajo-izquierda): no se solapan.
 * Al abrir muestra un mini-panel con branding ASGRO, un campo para escribir el
 * mensaje (prellenado) y un botón que abre wa.me con el texto codificado.
 *
 * Accesibilidad:
 * - Popover NO modal: Escape cierra y devuelve el foco al trigger.
 * - Al abrir, el foco pasa al botón Cerrar. aria-expanded/aria-controls.
 * - Respeta prefers-reduced-motion (animaciones con motion-safe).
 *
 * Si phoneNumber es vacío el widget no se muestra (fallo cerrado, igual que hoy).
 */
export default function FloatingWhatsApp({ phoneNumber }: FloatingWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(getDefaultWhatsAppMessage());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Coordinación entre elementos flotantes (asistente/WhatsApp/menú móvil).
  const { openWidget, isMobileNavOpen, openFloating, closeFloating } = useFloatingUI();

  const open = useCallback(() => {
    setIsOpen(true);
    // Registrar en el contexto → cierra el asistente si estuviera abierto.
    openFloating('whatsapp');
  }, [openFloating]);
  const close = useCallback(() => {
    setIsOpen(false);
    closeFloating();
    triggerRef.current?.focus();
  }, [closeFloating]);

  // Al abrir, foco al botón Cerrar.
  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  // Coordinación: si se abre otro widget (asistente) o el menú móvil, cerrar.
  useEffect(() => {
    if (!isOpen) return;
    if (isMobileNavOpen || (openWidget !== null && openWidget !== 'whatsapp')) {
      setIsOpen(false);
    }
  }, [openWidget, isMobileNavOpen, isOpen]);

  // Escape cierra.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  // No renderizar si no hay número configurado (mismo criterio que hoy).
  const previewUrl = generateWhatsAppUrl(phoneNumber, message.trim() || undefined);
  if (!phoneNumber || !previewUrl) {
    return null;
  }

  // Ocultar el widget mientras el menú móvil está abierto (evita superposición).
  if (isMobileNavOpen) return null;

  return (
    <div className="fixed right-[16px] bottom-[calc(20px+env(safe-area-inset-bottom,0px))] z-[9999] md:right-[24px] md:bottom-[calc(28px+env(safe-area-inset-bottom,0px))]">
      {/* Mini-panel */}
      {isOpen && (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-label="Escribir mensaje de WhatsApp a ASGRO"
          className="absolute bottom-[68px] right-0 flex w-[300px] flex-col overflow-hidden rounded-modal border border-white/10 bg-white shadow-premium-hover motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 sm:w-[328px]"
        >
          {/* Header con branding ASGRO */}
          <div className="flex shrink-0 items-center justify-between bg-[#075E54] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#25D366]">
                <FaWhatsapp className="h-[22px] w-[22px]" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight">ASGRO Seguros</p>
                <p className="mt-[2px] inline-flex items-center gap-[6px] text-caption text-white/80">
                  <span className="inline-block h-[8px] w-[8px] rounded-full bg-[#25D366]" aria-hidden="true" />
                  Responde por WhatsApp
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Cerrar WhatsApp"
            >
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>

          {/* Cuerpo: mensaje editable */}
          <div className="bg-brand-light-gray/60 p-4">
            <p className="text-sm text-gray-700">
              Escriba su mensaje y lo abriremos en WhatsApp para enviarlo a un asesor.
            </p>
            <label htmlFor="asgro-whatsapp-message" className="sr-only">
              Mensaje para enviar por WhatsApp
            </label>
            <textarea
              id="asgro-whatsapp-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Escriba su mensaje..."
              className="mt-3 w-full resize-none rounded-input border border-gray-300 bg-white px-3 py-[10px] text-sm text-brand-dark-blue shadow-sm placeholder:text-gray-500 transition-colors duration-200 focus-visible:border-[#075E54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/30"
            />

            {/* Botón enviar → abre wa.me con el mensaje codificado */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              aria-label="Enviar mensaje por WhatsApp"
              className={`mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-btn bg-[#25D366] px-4 text-sm font-bold text-brand-dark-blue shadow-btn transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E54] ${
                message.trim() ? '' : 'pointer-events-none opacity-50'
              }`}
              aria-disabled={message.trim() ? undefined : true}
            >
              <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Botón flotante (48px móvil / 54px desktop). Verde WhatsApp premium. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={isOpen ? close : open}
        aria-label={isOpen ? 'Cerrar WhatsApp de ASGRO' : 'Abrir WhatsApp de ASGRO'}
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#25D366] text-brand-dark-blue shadow-xl shadow-[#075E54]/30 ring-1 ring-white/25 transition-colors duration-200 hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E54] motion-safe:transition-transform motion-safe:active:scale-95 motion-safe:hover:scale-105 md:h-[54px] md:w-[54px]"
      >
        {isOpen ? (
          <X className="h-[24px] w-[24px]" aria-hidden="true" />
        ) : (
          <FaWhatsapp className="h-[26px] w-[26px]" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
