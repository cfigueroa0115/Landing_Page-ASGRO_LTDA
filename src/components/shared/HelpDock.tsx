'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { HelpCircle, X, FileText, Briefcase, HelpCircleIcon, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';
import { getWhatsAppNumber } from '@/lib/utils/constants';

/**
 * HelpDock — Small floating help center button at bottom-center.
 * Expands into a compact card with 6 quick action tiles.
 *
 * Position: fixed bottom-center, z-index below WhatsApp and AI buttons.
 */

interface HelpAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  external?: boolean;
}

export default function HelpDock() {
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = getWhatsAppNumber();
  const whatsappUrl = generateWhatsAppUrl(whatsappNumber, getDefaultWhatsAppMessage());

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const actions: HelpAction[] = [
    {
      id: 'help-whatsapp',
      label: 'WhatsApp',
      icon: <FaWhatsapp className="h-5 w-5" />,
      href: whatsappUrl || undefined,
      external: true,
    },
    {
      id: 'help-cotizar',
      label: 'Cotizar',
      icon: <FileText className="h-5 w-5" />,
      href: '/cotizar',
    },
    {
      id: 'help-servicios',
      label: 'Servicios',
      icon: <Briefcase className="h-5 w-5" />,
      href: '/servicios',
    },
    {
      id: 'help-faq',
      label: 'FAQ',
      icon: <HelpCircleIcon className="h-5 w-5" />,
      href: '/preguntas-frecuentes',
    },
    {
      id: 'help-contacto',
      label: 'Contacto',
      icon: <Phone className="h-5 w-5" />,
      href: '/contacto',
    },
  ];

  // Filter out WhatsApp if no number configured
  const visibleActions = actions.filter(
    (action) => !(action.id === 'help-whatsapp' && !whatsappUrl)
  );

  return (
    <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[9990]">
      {/* Expanded panel */}
      {isOpen && (
        <div className="absolute bottom-[56px] left-1/2 -translate-x-1/2 w-[280px] rounded-card bg-white shadow-elevated border border-gray-200 p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-brand-dark-blue">
              ¿Cómo podemos ayudarle?
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar panel de ayuda"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {visibleActions.map((action) => {
              const content = (
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-brand-light-gray transition-colors cursor-pointer text-center">
                  <div className="text-brand-blue">{action.icon}</div>
                  <span className="text-xs font-medium text-gray-700">
                    {action.label}
                  </span>
                </div>
              );

              if (action.external && action.href) {
                return (
                  <a
                    key={action.id}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClose}
                    aria-label={action.label}
                  >
                    {content}
                  </a>
                );
              }

              if (action.href) {
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    onClick={handleClose}
                    aria-label={action.label}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    action.onClick?.();
                    handleClose();
                  }}
                  aria-label={action.label}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Small round help button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? 'Cerrar centro de ayuda' : 'Abrir centro de ayuda'}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-brand-blue hover:bg-brand-light-gray hover:shadow-lg transition-all duration-200 active:scale-95"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <HelpCircle className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
