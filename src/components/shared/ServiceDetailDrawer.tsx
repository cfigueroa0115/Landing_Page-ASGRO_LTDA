'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import PremiumButton from '@/components/shared/PremiumButton';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';
import { getWhatsAppNumber } from '@/lib/utils/constants';
import type { ServiceData } from '@/types';

export interface ServiceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceData | null;
}

// Desktop: slides from right. Mobile: slides from bottom.
const desktopVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
};

const mobileVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 },
};

/**
 * Premium drawer/sheet for service details.
 * Desktop: slides from right (max-w 480px).
 * Mobile: slides from bottom (bottom sheet, max-h 85vh).
 */
export default function ServiceDetailDrawer({
  isOpen,
  onClose,
  service,
}: ServiceDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap: focus the close button when drawer opens
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const whatsappNumber = getWhatsAppNumber();
  const whatsappUrl = service
    ? generateWhatsAppUrl(
        whatsappNumber,
        getDefaultWhatsAppMessage(service.title)
      )
    : '';

  return (
    <AnimatePresence>
      {isOpen && service && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer - Desktop (right side) */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle del servicio: ${service.title}`}
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed z-50 flex flex-col overflow-y-auto',
              // Mobile: bottom sheet
              'inset-x-0 bottom-0 max-h-[85vh] rounded-t-modal',
              // Desktop: right panel
              'md:inset-y-0 md:right-0 md:left-auto md:max-h-full md:w-full md:max-w-[480px] md:rounded-t-none md:rounded-l-modal',
              // Glassmorphism
              'bg-white/95 backdrop-blur-md shadow-elevated'
            )}
          >

            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gradient-to-br from-brand-green/20 to-brand-blue/10 text-2xl">
                  {service.icon}
                </div>
                <h2 className="text-h3 font-bold text-brand-dark-blue">
                  {service.title}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-dark-blue"
                aria-label="Cerrar panel"
              >
                <X className="h-[20px] w-[20px]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Description */}
              <p className="text-body text-gray-700">{service.description}</p>

              {/* Sub-services */}
              {service.subServices.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-h4 font-semibold text-brand-dark-blue">
                    Servicios incluidos
                  </h3>
                  <ul className="mt-1 space-y-1">
                    {service.subServices.map((sub) => (
                      <li
                        key={sub}
                        className="flex items-start gap-1 text-sm text-gray-700"
                      >
                        <span className="mt-[2px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex flex-col gap-1">
                <Link href={`/cotizar?servicio=${service.id}`}>
                  <PremiumButton
                    variant="primary"
                    size="lg"
                    icon={<FileText className="h-[18px] w-[18px]" />}
                    className="w-full"
                  >
                    Solicitar cotización
                  </PremiumButton>
                </Link>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PremiumButton
                      variant="whatsapp"
                      size="lg"
                      icon={<MessageCircle className="h-[18px] w-[18px]" />}
                      className="w-full"
                    >
                      WhatsApp
                    </PremiumButton>
                  </a>
                )}

                <Link href={`/servicios/${service.id}`}>
                  <PremiumButton
                    variant="ghost"
                    size="md"
                    icon={<ExternalLink className="h-[16px] w-[16px]" />}
                    className="w-full"
                  >
                    Ver micrositio completo
                  </PremiumButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
