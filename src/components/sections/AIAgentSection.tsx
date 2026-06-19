'use client';

import { useState, useCallback } from 'react';
import { Bot, MessageCircle, X } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import type { ChatMessage, ChatResponse } from '@/types';

/** Mensaje de bienvenida del asistente */
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '¡Hola! Soy el asistente virtual de ASGRO. Puedo ayudarte con consultas sobre seguros, SST, ARL y riesgos laborales. ¿En qué puedo asistirte?',
  timestamp: new Date(),
};

/**
 * AIAgentSection — Sección del agente IA con chat interactivo.
 *
 * Funcionalidades:
 * - Botón flotante para mostrar/ocultar el chat inline
 * - Lista de mensajes con scroll automático
 * - Input con límite de 500 caracteres y contador
 * - POST a /api/chat con gestión de sesión
 * - ARIA live region para accesibilidad
 * - Todo el texto en español
 */
export default function AIAgentSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Crear mensaje del usuario
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: content,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al comunicarse con el agente');
        }

        const data: ChatResponse = await response.json();

        // Guardar sessionId para continuidad de la conversación
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }

        // Crear mensaje del asistente
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(data.timestamp),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        setError('No se pudo obtener una respuesta. Intente nuevamente.');

        // Agregar mensaje de error como respuesta del asistente
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'Lo siento, no pude procesar tu consulta en este momento. Por favor intenta nuevamente o contáctanos por WhatsApp.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  return (
    <section
      id="agente-ia"
      className="py-10 md:py-12 bg-white"
      aria-labelledby="ai-agent-heading"
    >
      <div className="max-w-[800px] mx-auto px-2 md:px-3">
        <AnimatedSection>
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-[40px] h-[40px] rounded-full bg-brand-green/20 flex items-center justify-center">
                <Bot className="w-[24px] h-[24px] text-brand-green" />
              </div>
              <h2
                id="ai-agent-heading"
                className="text-h2 text-brand-dark-blue"
              >
                Agente IA ASGRO
              </h2>
            </div>
            <p className="text-body-lg text-gray-600 max-w-[600px] mx-auto">
              Consulta nuestro asistente virtual para resolver tus dudas sobre seguros,
              ARL, SST y riesgos laborales.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          {/* Botón para abrir/cerrar el chat */}
          <div className="flex justify-center mb-3">
            <button
              onClick={toggleChat}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-brand-blue text-white font-medium hover:bg-brand-blue/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 min-h-[44px]"
              aria-expanded={isOpen}
              aria-controls="ai-chat-container"
            >
              {isOpen ? (
                <>
                  <X className="w-[20px] h-[20px]" />
                  Cerrar chat
                </>
              ) : (
                <>
                  <MessageCircle className="w-[20px] h-[20px]" />
                  Iniciar conversación
                </>
              )}
            </button>
          </div>

          {/* Contenedor del chat */}
          {isOpen && (
            <div
              id="ai-chat-container"
              className="rounded-card border border-gray-200 shadow-card overflow-hidden bg-white"
              role="region"
              aria-label="Chat con el agente IA de ASGRO"
            >
              {/* Cabecera del chat */}
              <div className="bg-brand-dark-blue text-white px-4 py-3 flex items-center gap-2">
                <Bot className="w-[20px] h-[20px] text-brand-green" />
                <span className="font-semibold text-sm">Asistente ASGRO</span>
                <span className="ml-auto text-xs text-gray-300">En línea</span>
              </div>

              {/* Ventana de mensajes */}
              <ChatWindow messages={messages} isLoading={isLoading} />

              {/* Mensaje de error */}
              {error && (
                <div
                  className="px-3 py-1 bg-red-50 border-t border-red-200 text-red-600 text-xs"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              {/* Input de mensaje */}
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}
