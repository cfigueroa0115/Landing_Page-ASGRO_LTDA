import { NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';

import { chatSchema } from '@/lib/validations/chat';
import { db } from '@/lib/db';
import { chatSessions, chatMessages, knowledgeBase } from '@/lib/db/schema';
import { processMessage } from '@/lib/ai/agent';
import type { ChatMessage } from '@/types';

/**
 * POST /api/chat
 *
 * Endpoint del chat con el agente IA de ASGRO.
 * Acepta sessionId (opcional) + message (1-500 caracteres).
 * Si no se provee sessionId, crea una nueva sesión.
 * Procesa el mensaje a través del agente IA, almacena los mensajes
 * en la base de datos, y retorna la respuesta del asistente.
 */
export async function POST(request: Request) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validated = chatSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { sessionId, message } = validated.data;

    // 2. Resolve session: verify existing or create new
    let resolvedSessionId: string;

    try {
      if (sessionId) {
        // Verify the session exists
        const existingSession = await db
          .select({ id: chatSessions.id })
          .from(chatSessions)
          .where(eq(chatSessions.id, sessionId))
          .limit(1);

        if (existingSession.length === 0) {
          // Session not found, create a new one
          const result = await db
            .insert(chatSessions)
            .values({ status: 'active' })
            .returning({ id: chatSessions.id });

          const newSession = result[0];
          if (!newSession) {
            throw new Error('Failed to create chat session');
          }
          resolvedSessionId = newSession.id;
        } else {
          resolvedSessionId = existingSession[0]!.id;
        }
      } else {
        // No sessionId provided, create a new session
        const result = await db
          .insert(chatSessions)
          .values({ status: 'active' })
          .returning({ id: chatSessions.id });

        const newSession = result[0];
        if (!newSession) {
          throw new Error('Failed to create chat session');
        }
        resolvedSessionId = newSession.id;
      }

      // 3. Fetch active knowledge base entries
      const kbEntries = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.isActive, true));

      // 4. Fetch last 10 messages from the session for context
      const recentMessages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, resolvedSessionId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(10);

      // Convert to ChatMessage[] format (reverse to chronological order)
      const sessionMessages: ChatMessage[] = recentMessages
        .reverse()
        .map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.createdAt,
        }));

      // 5. Process message through AI agent
      const aiResponse = await processMessage(
        message,
        sessionMessages,
        kbEntries.map((entry) => ({
          id: entry.id,
          topic: entry.topic,
          category: entry.category,
          content: entry.content,
          tags: entry.tags,
          isActive: entry.isActive,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        }))
      );

      // 6. Store user message and assistant response in DB
      await db.insert(chatMessages).values([
        {
          sessionId: resolvedSessionId,
          role: 'user',
          content: message,
        },
        {
          sessionId: resolvedSessionId,
          role: 'assistant',
          content: aiResponse,
        },
      ]);

      // 7. Return response
      const timestamp = new Date().toISOString();

      return NextResponse.json({
        sessionId: resolvedSessionId,
        response: aiResponse,
        timestamp,
      });
    } catch (dbError) {
      // Database-related errors
      if (
        dbError instanceof Error &&
        (dbError.message.includes('DATABASE_URL') ||
          dbError.message.includes('connection') ||
          dbError.message.includes('ECONNREFUSED') ||
          dbError.message.includes('timeout'))
      ) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }

      throw dbError;
    }
  } catch (error) {
    console.error('[API /api/chat] Unhandled error:', error);

    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
