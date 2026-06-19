// ============================================================================
// Drizzle ORM Schema - ASGRO LTDA Landing Page
// Base de datos: Neon PostgreSQL
// ============================================================================

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

// ============================================================================
// Tabla: leads (formulario de contacto expandido)
// ============================================================================

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  company: varchar('company', { length: 120 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 15 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  serviceOfInterest: varchar('service_of_interest', { length: 50 }).notNull(),
  message: text('message').notNull(),
  dataAcceptance: boolean('data_acceptance').notNull(),
  status: varchar('status', { length: 20 }).default('new').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Tabla: quote_requests (formulario de cotización expandido)
// ============================================================================

export const quoteRequests = pgTable('quote_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyName: varchar('company_name', { length: 150 }).notNull(),
  nit: varchar('nit', { length: 20 }).notNull(),
  contactName: varchar('contact_name', { length: 100 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 15 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  economicActivity: varchar('economic_activity', { length: 200 }).notNull(),
  employeeCount: integer('employee_count').notNull(),
  serviceRequired: varchar('service_required', { length: 50 }).notNull(),
  currentArl: text('current_arl'),
  comments: text('comments'),
  dataAcceptance: boolean('data_acceptance').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Tabla: faqs (preguntas frecuentes)
// ============================================================================

export const faqs = pgTable('faqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  question: varchar('question', { length: 500 }).notNull(),
  answer: text('answer').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Tabla: knowledge_base (base de conocimiento para el agente IA)
// Campo `tags` es texto con palabras clave separadas por comas para matching
// ============================================================================

export const knowledgeBase = pgTable('knowledge_base', {
  id: uuid('id').defaultRandom().primaryKey(),
  topic: varchar('topic', { length: 200 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  content: text('content').notNull(),
  tags: text('tags').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Tabla: chat_sessions (sesiones de chat)
// ============================================================================

export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  visitorId: varchar('visitor_id', { length: 100 }),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Tabla: chat_messages (mensajes de chat - FK a chat_sessions)
// ============================================================================

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .references(() => chatSessions.id)
    .notNull(),
  role: varchar('role', { length: 10 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Tabla: metrics (métricas animadas del dashboard)
// ============================================================================

export const metrics = pgTable('metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: varchar('label', { length: 100 }).notNull(),
  value: integer('value').notNull(),
  unit: varchar('unit', { length: 30 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  orderIndex: integer('order_index').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Tabla: site_settings (configuración del sitio)
// ============================================================================

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value').notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
