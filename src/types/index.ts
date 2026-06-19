// ============================================================================
// Interfaces compartidas - ASGRO LTDA Landing Page
// TypeScript strict mode
// ============================================================================

import type { ReactNode } from 'react';

// ============================================================================
// Tipos de servicio
// ============================================================================

/** Tipos de servicio disponibles */
export type ServiceType = 'arl' | 'sst' | 'seguros' | 'bienestar';

/** Estados de disponibilidad para el endpoint de tiempo */
export type AvailabilityStatus =
  | 'Disponible'
  | 'Fuera de horario'
  | 'Canal digital activo';

// ============================================================================
// Props de componentes
// ============================================================================

/** Props del componente AnimatedSection - wrapper de animación con Framer Motion */
export interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Retardo de la animación en milisegundos */
  delay?: number;
  /** Dirección de entrada de la animación */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Umbral de intersección del viewport (0-1) */
  threshold?: number;
}

/** Datos del servicio para el modal */
export interface ServiceData {
  id: string;
  title: string;
  icon: string;
  description: string;
  subServices: string[];
}

/** Props del modal de servicios */
export interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceData;
}

/** Mensaje de chat individual */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** Props del componente del agente IA */
export interface AIAgentProps {
  initialMessages?: ChatMessage[];
}

/** Interfaz para visualización de métricas */
export interface MetricDisplay {
  id: string;
  value: number;
  label: string;
  unit: string;
  icon?: string;
}

/** Elemento de pregunta frecuente */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
}

/** Props del botón de WhatsApp */
export interface WhatsAppButtonProps {
  phoneNumber: string;
  /** Mensaje pre-llenado para WhatsApp */
  message?: string;
  /** Variante de presentación */
  variant?: 'floating' | 'inline';
  /** Contexto de la sección para personalización del mensaje */
  context?: string;
}

// ============================================================================
// Interfaces de solicitudes y respuestas de API
// ============================================================================

/**
 * POST /api/contact - Cuerpo de la solicitud
 * Campos expandidos del formulario de contacto
 */
export interface ContactRequest {
  /** Nombre completo del visitante */
  fullName: string;
  /** Empresa del visitante */
  company: string;
  /** Cargo del visitante */
  position: string;
  /** Teléfono de contacto */
  phone: string;
  /** Correo electrónico */
  email: string;
  /** Ciudad */
  city: string;
  /** Servicio de interés */
  serviceOfInterest: ServiceType;
  /** Mensaje del visitante */
  message: string;
  /** Aceptación del tratamiento de datos personales */
  dataAcceptance: boolean;
}

/**
 * POST /api/quote - Cuerpo de la solicitud
 * Campos expandidos del formulario de cotización
 */
export interface QuoteRequest {
  /** Nombre de la empresa */
  companyName: string;
  /** NIT de la empresa */
  nit: string;
  /** Nombre del contacto */
  contactName: string;
  /** Cargo del contacto */
  position: string;
  /** Teléfono de contacto */
  phone: string;
  /** Correo electrónico */
  email: string;
  /** Ciudad */
  city: string;
  /** Actividad económica de la empresa */
  economicActivity: string;
  /** Número aproximado de trabajadores */
  employeeCount: number;
  /** Servicio o seguro requerido */
  serviceRequired: ServiceType;
  /** ARL actual (opcional) */
  currentArl?: string;
  /** Comentarios adicionales */
  comments?: string;
  /** Aceptación del tratamiento de datos personales */
  dataAcceptance: boolean;
}

/** POST /api/chat - Cuerpo de la solicitud */
export interface ChatRequest {
  /** ID de sesión existente (opcional, crea nueva sesión si no se provee) */
  sessionId?: string;
  /** Mensaje del visitante (1-500 caracteres) */
  message: string;
}

/** POST /api/chat - Cuerpo de la respuesta */
export interface ChatResponse {
  sessionId: string;
  response: string;
  timestamp: string;
}

/** GET /api/health - Respuesta del endpoint de salud */
export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  environment: string;
}

/** GET /api/time - Respuesta del endpoint de tiempo */
export interface TimeResponse {
  date: string;
  time: string;
  dayOfWeek: string;
  timezone: string;
  isBusinessHours: boolean;
  availabilityStatus: AvailabilityStatus;
}

/** Respuesta estándar de error */
export interface ErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// Modelos de datos (tablas de la base de datos)
// ============================================================================

/** Modelo de Lead - tabla leads */
export interface Lead {
  id: string;
  fullName: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  city: string;
  serviceOfInterest: ServiceType;
  message: string;
  dataAcceptance: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Modelo de solicitud de cotización - tabla quote_requests */
export interface QuoteRequestRecord {
  id: string;
  companyName: string;
  nit: string;
  contactName: string;
  position: string;
  phone: string;
  email: string;
  city: string;
  economicActivity: string;
  employeeCount: number;
  serviceRequired: ServiceType;
  currentArl?: string;
  comments?: string;
  dataAcceptance: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Modelo de pregunta frecuente - tabla faqs */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Modelo de entrada de la base de conocimiento - tabla knowledge_base */
export interface KnowledgeBaseEntry {
  id: string;
  topic: string;
  category: string;
  content: string;
  /** Etiquetas para búsqueda por palabras clave */
  tags: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Modelo de sesión de chat - tabla chat_sessions */
export interface ChatSession {
  id: string;
  visitorId?: string;
  status: string;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
}

/** Modelo de mensaje de chat - tabla chat_messages */
export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

/** Modelo de métrica - tabla metrics */
export interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Modelo de configuración del sitio - tabla site_settings */
export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
