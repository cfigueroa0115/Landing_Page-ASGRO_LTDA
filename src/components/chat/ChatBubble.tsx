'use client';

import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

/**
 * ChatBubble — Burbuja individual de mensaje del chat.
 * Diferencia visualmente mensajes del usuario vs. asistente.
 * Incluye icono, contenido y marca de tiempo.
 */
export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      role="listitem"
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-[32px] h-[32px] rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-brand-blue text-white'
            : 'bg-brand-green/20 text-brand-green'
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="w-[16px] h-[16px]" />
        ) : (
          <Bot className="w-[16px] h-[16px]" />
        )}
      </div>

      {/* Contenido del mensaje */}
      <div
        className={`max-w-[75%] rounded-card px-3 py-2 ${
          isUser
            ? 'bg-brand-blue text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={`block text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-400'
          }`}
          aria-label={`Enviado a las ${formatTime(message.timestamp)}`}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
