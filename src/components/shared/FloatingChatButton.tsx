'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/utils/constants';
import type { ChatMessage } from '@/types';

/**
 * FloatingChatButton — Floating AI agent trigger button (bottom-left)
 * with an expandable chat panel overlay.
 *
 * Features:
 * - Fixed bottom-left position (distinct from WhatsApp bottom-right)
 * - Pulse animation to draw attention
 * - On click: opens a floating chat panel (max-width 380px, max-height 500px)
 * - Chat panel uses /api/chat endpoint
 * - Auto-help tooltip appears after 10 seconds, dismissible
 * - Panel includes close button to minimize back to floating button
 * - Accessible from ANY page (rendered in layout)
 */
export default function FloatingChatButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show auto-help tooltip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tooltipDismissed && !isPanelOpen) {
        setShowTooltip(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [tooltipDismissed, isPanelOpen]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Add welcome message when panel opens for the first time
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

  const handleDismissTooltip = useCallback(() => {
    setShowTooltip(false);
    setTooltipDismissed(true);
  }, []);

  const handleOpenPanel = useCallback(() => {
    setShowTooltip(false);
    setTooltipDismissed(true);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

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
    <div className="fixed bottom-[24px] left-[16px] md:bottom-[32px] md:left-[24px] z-[9998]">
      {/* Floating Chat Panel */}
      {isPanelOpen && (
        <div className="absolute bottom-[72px] left-0 w-[340px] sm:w-[380px] max-h-[500px] rounded-card bg-white shadow-elevated border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-blue text-white rounded-t-card">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold text-sm">Asistente ASGRO</span>
            </div>
            <button
              type="button"
              onClick={handleClosePanel}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="Cerrar panel de chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[340px]">
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
                <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
                  <span className="text-xs text-gray-500 italic">Escribiendo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
            <div className="flex gap-2 items-end">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta..."
                rows={1}
                maxLength={500}
                disabled={isLoading}
                className="flex-1 rounded-input border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-none"
                aria-label="Mensaje para el asistente"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex-shrink-0 w-[40px] h-[40px] flex items-center justify-center rounded-btn bg-brand-blue text-white hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar mensaje"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Auto-help tooltip */}
      {showTooltip && !isPanelOpen && (
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
            ¿Necesitas orientación?
          </p>
          <p className="text-xs text-gray-600 mb-3">
            Nuestro asistente IA puede ayudarte con consultas sobre seguros, ARL, SST y riesgos laborales.
          </p>
          <button
            type="button"
            onClick={handleOpenPanel}
            className="w-full text-xs font-medium text-white bg-brand-blue rounded-btn px-3 py-2 hover:bg-brand-blue/90 transition-colors active:scale-95"
          >
            Consultar asistente
          </button>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={isPanelOpen ? handleClosePanel : handleOpenPanel}
        aria-label={isPanelOpen ? 'Cerrar asistente IA' : 'Consultar asistente IA de ASGRO'}
        className={`flex h-14 w-14 min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-brand-blue text-white shadow-lg transition-all duration-200 hover:bg-brand-blue/90 hover:scale-110 active:scale-95 ${
          !isPanelOpen ? 'animate-pulse' : ''
        }`}
      >
        {isPanelOpen ? <X className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
      </button>
    </div>
  );
}
