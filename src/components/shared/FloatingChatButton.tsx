'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, X, Send, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { SITE_CONTENT, ASSISTANT_QUICK_ACTIONS } from '@/lib/utils/constants';
import type { ChatMessage } from '@/types';
import AdvisorAvatar from '@/components/shared/AdvisorAvatar';
import { useFloatingUI } from '@/components/shared/FloatingUIProvider';
import { useVoiceAssistant } from '@/lib/hooks/useVoiceAssistant';
import { readSessionId, writeSessionId } from '@/lib/ai/session';

const PANEL_ID = 'asgro-assistant-panel';

/**
 * FloatingChatButton — Asesora Virtual ASGRO (asistente flotante, abajo-izq.).
 *
 * Refinamiento premium (Bloque 5A):
 * - Avatar femenino profesional (SVG inline), nombre visible "Asesora Virtual
 *   ASGRO" y estado "En línea".
 * - Header, área de conversación e input con jerarquía visual premium.
 * - Acciones rápidas (chips) que precargan consultas frecuentes en el chat.
 * - CTA destacado "Hablar con un asesor" (/contacto).
 *
 * Se conserva TODO lo aprobado en 4B/4H:
 * - Inicia CERRADO, sin autoapertura ni temporizadores.
 * - Al abrir, el foco pasa al botón Cerrar; al cerrar, vuelve al trigger.
 * - Popover NO modal: Escape cierra y devuelve el foco. Sin focus trap.
 * - Respeta prefers-reduced-motion (animaciones con motion-safe).
 * - Contrato de /api/chat intacto: POST { message, sessionId? }.
 */
export default function FloatingChatButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Continuidad de sesión: se recupera el UUID persistido (sessionStorage) para
  // no perder el hilo al recargar dentro de la misma pestaña. Solo el UUID.
  const [sessionId, setSessionId] = useState<string | null>(() => readSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Coordinación entre elementos flotantes (asistente/WhatsApp/menú móvil).
  const { openWidget, isMobileNavOpen, openFloating, closeFloating } = useFloatingUI();

  // Voz opcional (lectura de respuestas) — opt-in, sin autolectura.
  const [voiceReplies, setVoiceReplies] = useState(false);
  const voiceRepliesRef = useRef(false);
  voiceRepliesRef.current = voiceReplies;
  const voice = useVoiceAssistant({
    lang: 'es-CO',
    onTranscript: (text) => setInputValue(text),
  });

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
    // Registrar en el contexto → cierra WhatsApp si estuviera abierto.
    openFloating('assistant');
  }, [openFloating]);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    voice.stopListening();
    voice.stopSpeaking();
    closeFloating();
    // Devolver el foco al botón que abrió el panel (popover no modal).
    triggerRef.current?.focus();
  }, [closeFloating, voice]);

  // Coordinación: si se abre otro widget (WhatsApp) o el menú móvil, cerrar.
  useEffect(() => {
    if (!isPanelOpen) return;
    if (isMobileNavOpen || (openWidget !== null && openWidget !== 'assistant')) {
      setIsPanelOpen(false);
      voice.stopListening();
      voice.stopSpeaking();
    }
  }, [openWidget, isMobileNavOpen, isPanelOpen, voice]);

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
        // Persistir solo el UUID (sessionStorage) para continuidad de sesión.
        writeSessionId(data.sessionId);

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          // Acciones comerciales opcionales (allowlist ya validada en servidor).
          actions: Array.isArray(data.actions) ? data.actions.slice(0, 2) : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        // Lectura por voz SOLO si el usuario la activó explícitamente.
        if (voiceRepliesRef.current) {
          voice.speak(data.response);
        }
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
    [isLoading, sessionId, voice]
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

  // Solo se muestran las acciones rápidas antes de que el usuario escriba
  // (mientras únicamente exista el mensaje de bienvenida).
  const showQuickActions = messages.length <= 1 && !isLoading;

  // Ocultar el widget mientras el menú móvil está abierto (evita superposición).
  if (isMobileNavOpen) return null;

  return (
    <div className="fixed left-[16px] bottom-[calc(20px+env(safe-area-inset-bottom,0px))] z-[9998] md:left-[24px] md:bottom-[calc(28px+env(safe-area-inset-bottom,0px))]">
      {/* Panel de orientación + chat (popover no modal) */}
      {isPanelOpen && (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-label="Asistente de orientación de ASGRO"
          className="absolute bottom-[68px] left-0 flex w-[320px] flex-col overflow-hidden rounded-modal border border-white/10 bg-white shadow-premium-hover motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 sm:w-[352px]"
          style={{ maxHeight: 'min(560px, calc(100dvh - 96px - env(safe-area-inset-bottom, 0px)))' }}
        >
          {/* Encabezado premium — avatar de asesora + nombre + estado. No se contrae. */}
          <div className="surface-dark-premium relative flex shrink-0 items-center justify-between px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <AdvisorAvatar className="h-[40px] w-[40px]" />
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight">
                  {SITE_CONTENT.aiAssistantName}
                </p>
                <p className="mt-[2px] inline-flex items-center gap-[6px] text-caption text-white/70">
                  <span className="inline-block h-[8px] w-[8px] rounded-full bg-brand-neon-green" aria-hidden="true" />
                  {SITE_CONTENT.aiAssistantRole}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClosePanel}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Cerrar asistente"
            >
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>

          {/* Cuerpo central UNIFICADO (orientación + acciones + conversación) —
              única región flexible con scroll. Header e input permanecen fijos. */}
          <div
            className="min-h-0 flex-1 overflow-y-auto bg-brand-light-gray/50"
            role="log"
            aria-live="polite"
            aria-label="Orientación y conversación con el asistente"
          >
            {/* Bloque de orientación + CTA destacado — SOLO en estado inicial
                (antes de conversar). Evita redundancia con las acciones de
                asesoría dinámicas que aparecen bajo las respuestas. El acceso al
                asesor humano se preserva vía esas acciones y el CTA inferior. */}
            {showQuickActions && (
              <div className="border-b border-gray-100 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-brand-dark-blue">
                  {SITE_CONTENT.aiAssistantTitle}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {SITE_CONTENT.aiAssistantIntro}
                </p>
                <Link
                  href="/contacto"
                  onClick={handleClosePanel}
                  className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-btn bg-brand-green px-3 py-2 text-sm font-bold text-brand-dark-blue shadow-btn transition-colors hover:bg-brand-green-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
                >
                  Hablar con un asesor
                </Link>
              </div>
            )}

            {/* Acciones rápidas (chips) — precargan consultas frecuentes */}
            {showQuickActions && (
              <div className="px-4 py-3">
                <p className="mb-2 text-caption font-semibold uppercase tracking-[0.08em] text-gray-500">
                  Consultas frecuentes
                </p>
                <div className="flex flex-wrap gap-[8px]">
                  {ASSISTANT_QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => action.prompt && handleSendMessage(action.prompt)}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-brand-blue/30 bg-white px-[14px] py-1 text-small font-medium text-brand-blue transition-colors hover:bg-brand-blue/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversación */}
            <div className="space-y-3 px-4 py-3">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <AdvisorAvatar className="h-[26px] w-[26px] flex-shrink-0" aria-hidden="true" />
                    )}
                    <div
                      className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        msg.role === 'user'
                          ? 'rounded-br-sm bg-brand-blue text-white'
                          : 'rounded-bl-sm bg-white text-gray-800 ring-1 ring-gray-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>

                  {/* CTAs comerciales premium (máx 2) — solo respuestas del
                      asistente. WhatsApp abre en nueva pestaña; asesoría/cotizar
                      navegan internamente y cierran el panel. Sin nesting. */}
                  {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                    <div className="ml-[34px] flex flex-wrap gap-2" role="group" aria-label="Acciones sugeridas">
                      {msg.actions.slice(0, 2).map((action) =>
                        action.type === 'whatsapp' ? (
                          <a
                            key={action.type}
                            href={action.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[44px] items-center rounded-full bg-brand-green px-[16px] py-1 text-small font-bold text-brand-dark-blue shadow-btn transition-colors hover:bg-brand-green-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
                          >
                            {action.label}
                          </a>
                        ) : (
                          <Link
                            key={action.type}
                            href={action.href}
                            onClick={handleClosePanel}
                            className="inline-flex min-h-[44px] items-center rounded-full border border-brand-blue/40 bg-white px-[16px] py-1 text-small font-semibold text-brand-blue transition-colors hover:bg-brand-blue/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
                          >
                            {action.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2" role="status">
                  <AdvisorAvatar className="h-[26px] w-[26px] flex-shrink-0" aria-hidden="true" />
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white px-3 py-2 ring-1 ring-gray-100">
                    <Loader2 className="h-[16px] w-[16px] text-brand-blue motion-safe:animate-spin" aria-hidden="true" />
                    <span className="text-xs italic text-gray-500">Escribiendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Área de escritura — no se contrae. Caja evidente y bien delimitada. */}
          <form onSubmit={handleSubmit} className="shrink-0 border-t border-gray-200 bg-white p-3">
            {/* Controles de voz (solo si el navegador soporta la API; opt-in).
                Nunca autoactiva el micrófono ni autolee respuestas. */}
            {(voice.supported || voice.ttsSupported) && (
              <div className="mb-2 flex items-center gap-2">
                {voice.ttsSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (voiceReplies) {
                        voice.stopSpeaking();
                        setVoiceReplies(false);
                      } else {
                        setVoiceReplies(true);
                      }
                    }}
                    aria-pressed={voiceReplies}
                    className={`inline-flex min-h-[44px] items-center gap-[6px] rounded-full border px-[14px] text-caption font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                      voiceReplies
                        ? 'border-brand-blue/30 bg-brand-blue/5 text-brand-blue'
                        : 'border-gray-200 bg-white text-gray-500'
                    }`}
                    aria-label={voiceReplies ? 'Desactivar lectura por voz' : 'Activar lectura por voz'}
                  >
                    {voiceReplies ? (
                      <Volume2 className="h-[16px] w-[16px]" aria-hidden="true" />
                    ) : (
                      <VolumeX className="h-[16px] w-[16px]" aria-hidden="true" />
                    )}
                    {voiceReplies ? 'Voz activa' : 'Voz inactiva'}
                  </button>
                )}
                {voice.isSpeaking && (
                  <span className="inline-flex items-center gap-[6px] text-caption text-brand-blue" role="status">
                    <span className="inline-block h-[8px] w-[8px] rounded-full bg-brand-blue motion-safe:animate-pulse" aria-hidden="true" />
                    Reproduciendo respuesta…
                  </span>
                )}
                {voice.isListening && (
                  <span className="inline-flex items-center gap-[6px] text-caption text-brand-green-alt" role="status">
                    <span className="inline-block h-[8px] w-[8px] rounded-full bg-brand-green motion-safe:animate-pulse" aria-hidden="true" />
                    Escuchando…
                  </span>
                )}
              </div>
            )}
            <label htmlFor="asgro-assistant-input" className="sr-only">
              Escriba su consulta para el asistente
            </label>
            <div className="flex items-end gap-2">
              {/* Micrófono (dictado) — acción explícita; oculto si no hay soporte. */}
              {voice.supported && (
                <button
                  type="button"
                  onClick={() => (voice.isListening ? voice.stopListening() : voice.startListening())}
                  disabled={isLoading}
                  aria-pressed={voice.isListening}
                  aria-label={voice.isListening ? 'Detener dictado por voz' : 'Dictar consulta por voz'}
                  className={`flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-btn shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:opacity-40 ${
                    voice.isListening
                      ? 'bg-brand-green text-brand-dark-blue'
                      : 'bg-brand-light-gray text-brand-blue hover:bg-brand-blue/10'
                  }`}
                >
                  {voice.isListening ? (
                    <MicOff className="h-[18px] w-[18px]" aria-hidden="true" />
                  ) : (
                    <Mic className="h-[18px] w-[18px]" aria-hidden="true" />
                  )}
                </button>
              )}
              <textarea
                id="asgro-assistant-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escriba su consulta..."
                rows={1}
                maxLength={500}
                disabled={isLoading}
                className="min-h-[44px] flex-1 resize-none rounded-input border border-gray-300 bg-white px-3 py-[10px] text-sm text-brand-dark-blue shadow-sm placeholder:text-gray-500 transition-colors duration-200 focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Mensaje para el asistente"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-btn bg-brand-blue text-white shadow-sm transition-colors hover:bg-brand-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Enviar mensaje"
              >
                {isLoading ? (
                  <Loader2 className="h-[18px] w-[18px] motion-safe:animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-[18px] w-[18px]" aria-hidden="true" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Botón flotante premium (54px móvil / 60px desktop). Cerrado: muestra el
          retrato de la Asesora Virtual ASGRO (agente IA del proyecto). Abierto:
          chevron para contraer. Punto verde de presencia "en línea". */}
      <button
        ref={triggerRef}
        type="button"
        onClick={isPanelOpen ? handleClosePanel : handleOpenPanel}
        aria-label={isPanelOpen ? 'Cerrar asistente de orientación' : 'Abrir asistente de orientación de ASGRO'}
        aria-expanded={isPanelOpen}
        aria-controls={PANEL_ID}
        className={
          isPanelOpen
            ? 'flex h-[54px] w-[54px] items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-dark-blue text-white shadow-xl shadow-brand-dark-blue/30 ring-1 ring-white/15 transition-colors duration-200 hover:from-brand-blue hover:to-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue motion-safe:transition-transform motion-safe:active:scale-95 motion-safe:hover:scale-105 md:h-[60px] md:w-[60px]'
            : 'relative flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white shadow-xl shadow-brand-dark-blue/30 ring-2 ring-white transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue motion-safe:active:scale-95 motion-safe:hover:scale-105 md:h-[60px] md:w-[60px]'
        }
      >
        {isPanelOpen ? (
          <ChevronDown className="h-[24px] w-[24px]" aria-hidden="true" />
        ) : (
          <>
            <AdvisorAvatar className="h-full w-full ring-0" />
            {/* Punto de presencia "en línea" */}
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-[14px] w-[14px] rounded-full border-2 border-white bg-brand-neon-green"
            />
          </>
        )}
      </button>
    </div>
  );
}
