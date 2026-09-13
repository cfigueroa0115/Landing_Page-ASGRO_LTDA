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
  index,
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

// ============================================================================
// Tabla: knowledge_base_v2 (Bloque 5B.1 — KB V2 gobernada)
// ----------------------------------------------------------------------------
// Tabla ADITIVA. Convive con `knowledge_base` (legacy). No la reemplaza ni la
// modifica. La transición se realizará en 5B.2, solo tras validar la V2.
//
// Gobernanza: cada unidad de conocimiento es atómica (una sola idea) y lleva
// metadatos de trazabilidad, aprobación, vigencia y versión. La `key` estable
// (no el UUID) es el identificador legible del contenido corporativo.
//
// Índices preparados para 5B.2 (category, subcategory, isApproved, isActive,
// priority). Sin pgvector, sin embeddings, sin FTS en este bloque.
// ============================================================================

export const knowledgeBaseV2 = pgTable(
  'knowledge_base_v2',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // Clave estable legible (p.ej. "personas-hogar-orientacion-general").
    // Nunca depender del UUID para identificar contenido corporativo.
    key: varchar('key', { length: 160 }).unique().notNull(),
    // Tema/título corto humano de la unidad de conocimiento.
    topic: varchar('topic', { length: 200 }).notNull(),
    // Taxonomía (validada en la capa de aplicación / Zod).
    category: varchar('category', { length: 40 }).notNull(),
    subcategory: varchar('subcategory', { length: 60 }).notNull(),
    content: text('content').notNull(),
    // Etiquetas separadas por comas (mismo formato que legacy para continuidad).
    tags: text('tags').notNull(),
    // Trazabilidad de origen.
    source: varchar('source', { length: 200 }).notNull(),
    sourceType: varchar('source_type', { length: 30 }).notNull(),
    authority: varchar('authority', { length: 20 }).notNull(),
    // Vigencia. effectiveTo NULL = sin fecha de expiración.
    effectiveFrom: timestamp('effective_from').defaultNow().notNull(),
    effectiveTo: timestamp('effective_to'),
    // Versionado. Inicia en 1; futuras ediciones deben incrementarlo.
    version: integer('version').default(1).notNull(),
    // Prioridad para ranking futuro (0 = neutro).
    priority: integer('priority').default(0).notNull(),
    // Gobernanza de elegibilidad.
    isApproved: boolean('is_approved').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    // Auditoría de revisión.
    reviewedAt: timestamp('reviewed_at'),
    reviewedBy: varchar('reviewed_by', { length: 120 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index('kb_v2_category_idx').on(table.category),
    subcategoryIdx: index('kb_v2_subcategory_idx').on(table.subcategory),
    approvedIdx: index('kb_v2_is_approved_idx').on(table.isApproved),
    activeIdx: index('kb_v2_is_active_idx').on(table.isActive),
    priorityIdx: index('kb_v2_priority_idx').on(table.priority),
  })
);
