'use client';

import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import type { ChatMessage } from '@/types';
import { Loader2 } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

/**
 * ChatWindow — Lista de mensajes del chat con scroll automático.
 * Se desplaza al fondo cuando llega un nuevo mensaje.
 * Incluye indicador de carga mientras el agente responde.
 * ARIA live region para anunciar nuevos mensajes a lectores de pantalla.
 */
export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al fondo cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[250px] max-h-[400px]"
      role="list"
      aria-label="Mensajes del chat"
    >
      {/* Región ARIA live para anunciar nuevos mensajes */}
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {messages.length > 0 && (() => {
          const lastMessage = messages[messages.length - 1];
          return lastMessage ? (
            <span>
              {lastMessage.role === 'assistant'
                ? `Respuesta del asistente: ${lastMessage.content}`
                : `Tu mensaje: ${lastMessage.content}`}
            </span>
          ) : null;
        })()}
      </div>

      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}

      {/* Indicador de carga */}
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-500" role="status" aria-label="El asistente está escribiendo">
          <div className="flex-shrink-0 w-[32px] h-[32px] rounded-full flex items-center justify-center bg-brand-green/20 text-brand-green" aria-hidden="true">
            <Loader2 className="w-[16px] h-[16px] animate-spin" />
          </div>
          <span className="text-sm text-gray-400 italic">Escribiendo...</span>
        </div>
      )}

      {/* Referencia para auto-scroll */}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
