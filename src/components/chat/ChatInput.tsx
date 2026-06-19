'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  maxLength?: number;
}

/**
 * ChatInput — Campo de entrada del chat con contador de caracteres.
 * Límite de 500 caracteres con indicador visual (ej: "45/500").
 * Deshabilitado mientras se espera respuesta del servidor.
 */
export default function ChatInput({
  onSend,
  isLoading,
  maxLength = 500,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const charCount = message.length;
  const isOverLimit = charCount > maxLength;
  const isEmpty = message.trim().length === 0;
  const canSend = !isEmpty && !isOverLimit && !isLoading;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canSend) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSend(message.trim());
        setMessage('');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 p-3"
      aria-label="Enviar mensaje al agente IA"
    >
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu consulta..."
            maxLength={maxLength}
            rows={2}
            disabled={isLoading}
            className="w-full rounded-input border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-none"
            aria-label="Mensaje para el agente IA"
            aria-describedby="chat-char-counter"
          />
          {/* Contador de caracteres */}
          <span
            id="chat-char-counter"
            className={`absolute bottom-1 right-2 text-xs ${
              isOverLimit
                ? 'text-red-500 font-semibold'
                : charCount > maxLength * 0.9
                ? 'text-amber-500'
                : 'text-gray-400'
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {charCount}/{maxLength}
          </span>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={!canSend}
          className="flex-shrink-0 w-[44px] h-[44px] flex items-center justify-center rounded-btn bg-brand-blue text-white hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          aria-label={isLoading ? 'Enviando mensaje...' : 'Enviar mensaje'}
        >
          {isLoading ? (
            <Loader2 className="w-[20px] h-[20px] animate-spin" />
          ) : (
            <Send className="w-[20px] h-[20px]" />
          )}
        </button>
      </div>
    </form>
  );
}
