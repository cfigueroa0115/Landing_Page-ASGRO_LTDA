'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bot, X } from 'lucide-react';

/**
 * FloatingChatButton — Floating AI agent trigger button (bottom-left).
 *
 * Features:
 * - Fixed bottom-left position (distinct from WhatsApp bottom-right)
 * - Pulse animation to draw attention
 * - Scrolls to #agente-ia on click
 * - Auto-help tooltip appears after 10 seconds, dismissible
 * - Does not conflict with WhatsApp floating button
 */
export default function FloatingChatButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  // Show auto-help tooltip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tooltipDismissed) {
        setShowTooltip(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [tooltipDismissed]);

  const handleDismissTooltip = useCallback(() => {
    setShowTooltip(false);
    setTooltipDismissed(true);
  }, []);

  const handleClick = useCallback(() => {
    setShowTooltip(false);
    setTooltipDismissed(true);
    const agentSection = document.getElementById('agente-ia');
    if (agentSection) {
      const headerOffset = 80;
      const elementPosition = agentSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="fixed bottom-[24px] left-[16px] md:bottom-[32px] md:left-[24px] z-[9998]">
      {/* Auto-help tooltip */}
      {showTooltip && (
        <div className="absolute bottom-[72px] left-0 w-[260px] rounded-card bg-white shadow-elevated border border-gray-200 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            type="button"
            onClick={handleDismissTooltip}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar sugerencia"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm text-brand-dark-blue font-medium mb-2 pr-5">
            ¿Necesitas ayuda?
          </p>
          <p className="text-xs text-gray-600 mb-3">
            Nuestro agente IA puede asistirte con consultas sobre seguros, ARL, SST y riesgos laborales.
          </p>
          <button
            type="button"
            onClick={handleClick}
            className="w-full text-xs font-medium text-white bg-brand-blue rounded-btn px-3 py-2 hover:bg-brand-blue/90 transition-colors active:scale-95"
          >
            Consultar agente IA
          </button>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Consultar agente IA de ASGRO"
        className="flex h-14 w-14 min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-brand-blue text-white shadow-lg transition-all duration-200 hover:bg-brand-blue/90 hover:scale-110 active:scale-95 animate-pulse"
      >
        <Bot className="h-7 w-7" />
      </button>
    </div>
  );
}
