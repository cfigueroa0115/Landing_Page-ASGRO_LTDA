'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, X, Send, Loader2, Headset } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/utils/constants';
import type { ChatMessage } from '@/types';

/**
 * Icono humanizado del asistente — silueta de persona con diadema.
 * Comunica "asesor virtual" en lugar de "robot".
 */
function AIAvatarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c0-3.5 3-6.5 6.5-6.5s6.5 3 6.5 6.5" />
      <path d="M4 12c0-1.2.8-2.2 2-2.2" />
      <path d="M18 12c0-1.2.8-2.2 2-2.2" />
      <path d="M4 12v1.5" />
      <path d="M20 12v1.5" />
    </svg>
  );
}

const PANEL_ID = 'asgro-assistant-panel';

/**
 * FloatingChatButton — Asistente flotante de orientación de ASGRO (abajo-izq.).
 *
 * Comportamiento (Bloque 4B):
 * - Inicia CERRADO. Sin panel, tooltip, tarjeta ni mensaje automáticos.
 * - Sin temporizadores de autoapertura.
 * - Abre solo por clic/tap/teclado. No hay autoapertura de ningún tipo, por lo
 *   que no se requiere persistencia de "cerrado" (sin sessionStorage/cookies).
 * - Al abrir, el foco se mueve al botón Cerrar; al cerrar, vuelve al trigger.
 * - Popover NO modal: Escape cierra y devuelve el foco al botón. Sin focus trap.
 * - Respeta prefers-reduced-motion (sin animación pulsante permanente).
 * - Botón compacto y ejecutivo (52px desktop / 48px móvil).
 * - Encabezado de orientación + CTA "Hablar con un asesor" (/contacto) + chat IA.
 */
export default function FloatingChatButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll de mensajes (solo dentro del panel; no afecta la página).
  // Sin transición suave si el usuario pidió reducir movimiento.
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView(
      prefersReduced ? undefined : { behavior: 'smooth' }
    );
  }, [messages, isLoading]);

  // Al abrir, mover el foco al primer control del panel (botón Cerrar).
  // Popover NO modal: no se implementa focus trap.
  useEffect(() => {
    if (isPanelOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isPanelOpen]);

  // Mensaje de bienvenida al abrir el panel por primera vez.
  useEffect(() => {
    if (isPanelOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: SITE_CONTENT.aiAgentWelcome,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isPanelOpen, messages.length]);

  const handleOpenPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    // Devolver el foco al botón que abrió el panel (popover no modal).
    triggerRef.current?.focus();
  }, []);

  // Cerrar con Escape cuando el panel está abierto.
  useEffect(() => {
    if (!isPanelOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClosePanel();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isPanelOpen, handleClosePanel]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText.trim(),
            sessionId: sessionId ?? undefined,
          }),
        });

        if (!response.ok) {
          throw new Error('Error en la respuesta');
        }

        const data = await response.json();
        setSessionId(data.sessionId);

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: SITE_CONTENT.aiAgentFallback,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="fixed bottom-[20px] left-[16px] md:bottom-[28px] md:left-[24px] z-[9998]">
      {/* Panel de orientación + chat (popover no modal) */}
      {isPanelOpen && (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-label="Asistente de orientación de ASGRO"
          className="absolute bottom-[64px] left-0 flex w-[300px] flex-col overflow-hidden rounded-card border border-gray-200 bg-white shadow-elevated motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 sm:w-[320px]"
          style={{ maxHeight: 'min(500px, calc(100dvh - 96px))' }}
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between rounded-t-card bg-brand-blue px-3 py-2 text-white">
            <div className="flex items-center gap-2 pl-1">
              <Headset className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-semibold">Orientación ASGRO</span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClosePanel}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Cerrar asistente"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Bloque de orientación */}
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-brand-dark-blue">
              ¿Necesita orientación?
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Le ayudamos a identificar la solución de seguros más adecuada para su necesidad.
            </p>
            <Link
              href="/contacto"
              onClick={handleClosePanel}
              className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center rounded-btn bg-brand-green px-3 py-2 text-sm font-bold text-brand-dark-blue transition-colors hover:bg-brand-green-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              Hablar con un asesor
            </Link>
          </div>

          {/* Área de mensajes del chat */}
          <div className="min-h-[160px] max-h-[280px] flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
                  <Loader2 className="h-4 w-4 text-brand-blue motion-safe:animate-spin" aria-hidden="true" />
                  <span className="text-xs italic text-gray-500">Escribiendo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Entrada de texto */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escriba su consulta..."
                rows={1}
                maxLength={500}
                disabled={isLoading}
                className="flex-1 resize-none rounded-input border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 transition-colors duration-200 focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Mensaje para el asistente"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-btn bg-brand-blue text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Enviar mensaje"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Botón flotante compacto (52px desktop / 48px móvil) */}
      <button
        ref={triggerRef}
        type="button"
        onClick={isPanelOpen ? handleClosePanel : handleOpenPanel}
        aria-label={isPanelOpen ? 'Cerrar asistente de orientación' : 'Abrir asistente de orientación de ASGRO'}
        aria-expanded={isPanelOpen}
        aria-controls={PANEL_ID}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg shadow-brand-blue/25 transition-colors duration-200 hover:bg-brand-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue motion-safe:transition-transform motion-safe:active:scale-95 motion-safe:hover:scale-105 md:h-[54px] md:w-[54px]"
      >
        {isPanelOpen ? (
          <ChevronDown className="h-6 w-6" aria-hidden="true" />
        ) : (
          <AIAvatarIcon className="h-7 w-7" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
