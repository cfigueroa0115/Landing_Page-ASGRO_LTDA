import { z } from 'zod';

/**
 * Esquema Zod para mensajes del chat con el agente IA.
 * Campos: sessionId (UUID opcional), message (1-500 caracteres).
 * Todos los mensajes de error en español.
 */
export const chatSchema = z.object({
  sessionId: z
    .string()
    .uuid('El ID de sesión debe ser un UUID válido')
    .optional(),

  message: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(500, 'El mensaje no puede exceder 500 caracteres'),
});

/** Tipo inferido del esquema de chat */
export type ChatRequestData = z.infer<typeof chatSchema>;
