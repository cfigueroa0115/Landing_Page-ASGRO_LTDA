// ============================================================================
// Constantes y datos estáticos de respaldo - ASGRO LTDA Landing Page
// Todos los textos en español. Sin lorem ipsum, sin datos de contacto inventados.
// Los datos de contacto (teléfono, email, dirección) se obtienen de variables de entorno.
// ============================================================================

import type { FAQItem, MetricDisplay, ServiceData } from '@/types';
import {
  getCompanyPhone as _getCompanyPhone,
  getCompanyEmail as _getCompanyEmail,
  getCompanyAddress as _getCompanyAddress,
  getWhatsAppNumber as _getWhatsAppNumber,
} from '@/lib/config/env';

// ============================================================================
// Datos de contacto configurables vía variables de entorno
// Delegamos al módulo de validación centralizado (lib/config/env.ts)
// ============================================================================

/**
 * Obtiene el teléfono de la empresa desde env vars.
 * Si no está configurado en desarrollo, retorna cadena vacía → UI oculta el elemento.
 */
export function getCompanyPhone(): string {
  return _getCompanyPhone();
}

/**
 * Obtiene el email de la empresa desde env vars.
 * Si no está configurado en desarrollo, retorna cadena vacía → UI oculta el elemento.
 */
export function getCompanyEmail(): string {
  return _getCompanyEmail();
}

/**
 * Obtiene la dirección de la empresa desde env vars.
 * Si no está configurado en desarrollo, retorna cadena vacía → UI oculta el elemento.
 */
export function getCompanyAddress(): string {
  return _getCompanyAddress();
}

/**
 * Obtiene el número de WhatsApp desde env vars.
 * Si no está configurado en desarrollo, retorna cadena vacía → UI oculta botones.
 */
export function getWhatsAppNumber(): string {
  return _getWhatsAppNumber();
}

// ============================================================================
// FALLBACK_FAQS - Mínimo 8 preguntas frecuentes (2+ por categoría)
// Categorías: servicios, cotización, proceso, cumplimiento
// ============================================================================

export const FALLBACK_FAQS: FAQItem[] = [
  // Categoría: servicios
  {
    id: 'faq-1',
    question: '¿Qué servicios ofrece ASGRO LTDA en gestión de riesgos laborales?',
    answer:
      'Ofrecemos asesoría integral en ARL, diseño e implementación de sistemas de gestión de seguridad y salud en el trabajo (SG-SST), seguros empresariales a la medida, y programas de bienestar laboral adaptados a las necesidades específicas de cada empresa.',
    category: 'servicios',
    orderIndex: 1,
  },
  {
    id: 'faq-2',
    question: '¿Qué tipo de seguros empresariales a la medida manejan?',
    answer:
      'Diseñamos soluciones de seguros empresariales a la medida que incluyen pólizas de responsabilidad civil, seguros de cumplimiento, seguros multirriesgo empresarial, y cobertura patrimonial, adaptadas al sector económico y tamaño de su organización.',
    category: 'servicios',
    orderIndex: 2,
  },
  {
    id: 'faq-3',
    question: '¿Trabajan con empresas de todos los tamaños?',
    answer:
      'Sí, atendemos desde pequeñas empresas con 5 trabajadores hasta organizaciones con más de 1.000 colaboradores. Nuestras soluciones se adaptan al tamaño, actividad económica y nivel de riesgo de cada cliente.',
    category: 'servicios',
    orderIndex: 3,
  },
  // Categoría: cotización
  {
    id: 'faq-4',
    question: '¿Cómo puedo solicitar una cotización de servicios?',
    answer:
      'Puede solicitar una cotización a través de nuestro formulario en línea, por WhatsApp o contactándonos directamente. Necesitaremos información básica de su empresa como NIT, número de trabajadores y el servicio de interés para elaborar una propuesta personalizada.',
    category: 'cotización',
    orderIndex: 4,
  },
  {
    id: 'faq-5',
    question: '¿Cuánto tiempo toma recibir una propuesta comercial?',
    answer:
      'Una vez recibida su solicitud con la información requerida, elaboramos la propuesta comercial en un plazo de 24 a 48 horas hábiles. Para servicios complejos o de gran alcance, el plazo puede extenderse hasta 5 días hábiles.',
    category: 'cotización',
    orderIndex: 5,
  },
  // Categoría: proceso
  {
    id: 'faq-6',
    question: '¿Cuál es el proceso para implementar el SG-SST con ASGRO?',
    answer:
      'Nuestro proceso inicia con un diagnóstico de las condiciones actuales de su empresa, seguido de la planeación del sistema, implementación de controles y medidas, seguimiento periódico de indicadores y mejora continua basada en resultados medibles.',
    category: 'proceso',
    orderIndex: 6,
  },
  {
    id: 'faq-7',
    question: '¿Cuánto tiempo toma la implementación de un programa de SST?',
    answer:
      'El tiempo de implementación varía según el tamaño y complejidad de la empresa. Un programa básico puede implementarse en 2 a 4 meses, mientras que un sistema integral para empresas de alto riesgo puede requerir de 4 a 8 meses con acompañamiento continuo.',
    category: 'proceso',
    orderIndex: 7,
  },
  // Categoría: cumplimiento
  {
    id: 'faq-8',
    question: '¿Qué normatividad colombiana respalda el SG-SST?',
    answer:
      'El Sistema de Gestión de Seguridad y Salud en el Trabajo está regulado por el Decreto 1072 de 2015, la Resolución 0312 de 2019 que define estándares mínimos, y la Ley 1562 de 2012 que modernizó el sistema de riesgos laborales en Colombia.',
    category: 'cumplimiento',
    orderIndex: 8,
  },
  {
    id: 'faq-9',
    question: '¿Qué sanciones existen por no cumplir con la normativa de SST?',
    answer:
      'El incumplimiento de las normas de SST puede generar multas de hasta 500 SMMLV, cierre temporal del establecimiento, y en casos graves, responsabilidad penal. Además, la empresa puede enfrentar incrementos en la tasa de cotización a la ARL.',
    category: 'cumplimiento',
    orderIndex: 9,
  },
  {
    id: 'faq-10',
    question: '¿Cómo ayuda ASGRO a mantener el cumplimiento normativo vigente?',
    answer:
      'Realizamos auditorías periódicas, actualizamos los programas ante cambios normativos, generamos informes de cumplimiento documentados y capacitamos al personal responsable para garantizar que su empresa mantenga los estándares exigidos por la legislación colombiana.',
    category: 'cumplimiento',
    orderIndex: 10,
  },
];

// ============================================================================
// FALLBACK_METRICS - Mínimo 4 métricas con datos realistas para agencia de seguros
// ============================================================================

export const FALLBACK_METRICS: MetricDisplay[] = [
  {
    id: 'metric-1',
    value: 350,
    label: 'Empresas asesoradas',
    unit: 'empresas',
    icon: 'Building2',
  },
  {
    id: 'metric-2',
    value: 15,
    label: 'Años de experiencia',
    unit: 'años',
    icon: 'Award',
  },
  {
    id: 'metric-3',
    value: 98,
    label: 'Tasa de cumplimiento normativo',
    unit: '%',
    icon: 'ShieldCheck',
  },
  {
    id: 'metric-4',
    value: 12000,
    label: 'Trabajadores protegidos',
    unit: 'personas',
    icon: 'Users',
  },
  {
    id: 'metric-5',
    value: 45,
    label: 'Reducción de accidentalidad',
    unit: '%',
    icon: 'TrendingDown',
  },
];

// ============================================================================
// PILLARS_DATA - 4 pilares estratégicos
// Título máximo 40 caracteres, descripción máximo 120 caracteres
// ============================================================================

export interface PillarData {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const PILLARS_DATA: PillarData[] = [
  {
    id: 'pillar-1',
    icon: 'ShieldCheck',
    title: 'Protección integral',
    description:
      'Soluciones de cobertura diseñadas para proteger el patrimonio y la operación de su empresa ante riesgos laborales.',
  },
  {
    id: 'pillar-2',
    icon: 'ClipboardCheck',
    title: 'Cumplimiento normativo',
    description:
      'Acompañamiento experto para garantizar el cumplimiento de la legislación colombiana en SST y riesgos laborales.',
  },
  {
    id: 'pillar-3',
    icon: 'HeartPulse',
    title: 'Bienestar laboral',
    description:
      'Programas orientados a mejorar la calidad de vida de los colaboradores y fortalecer la cultura organizacional.',
  },
  {
    id: 'pillar-4',
    icon: 'TrendingUp',
    title: 'Prevención y mejora continua',
    description:
      'Estrategias basadas en datos para reducir la accidentalidad y optimizar los indicadores de gestión de riesgos.',
  },
];

// ============================================================================
// SERVICES_DATA - 4 categorías de servicios
// ARL, SST, seguros empresariales a la medida, bienestar laboral
// ============================================================================

export const SERVICES_DATA: ServiceData[] = [
  {
    id: 'service-arl',
    title: 'ARL y Riesgos Laborales',
    icon: 'Shield',
    description:
      'Gestión integral de la Administradora de Riesgos Laborales con enfoque en clasificación de riesgos, afiliaciones y asesoría en prevención de accidentes de trabajo.',
    subServices: [
      'Clasificación y reclasificación de riesgo',
      'Gestión de afiliaciones y novedades',
      'Investigación de accidentes de trabajo',
      'Asesoría en reporte de enfermedades laborales',
      'Análisis de indicadores de accidentalidad',
      'Acompañamiento en reclamaciones ante ARL',
    ],
  },
  {
    id: 'service-sst',
    title: 'Seguridad y Salud en el Trabajo',
    icon: 'HardHat',
    description:
      'Diseño, implementación y mantenimiento del Sistema de Gestión de Seguridad y Salud en el Trabajo conforme al Decreto 1072 de 2015 y la Resolución 0312 de 2019.',
    subServices: [
      'Diseño del SG-SST según estándares mínimos',
      'Matrices de identificación de peligros (IPEVR)',
      'Plan de emergencias y simulacros',
      'Capacitación y formación en SST',
      'Exámenes médicos ocupacionales',
      'Inspecciones y auditorías de seguridad',
    ],
  },
  {
    id: 'service-seguros',
    title: 'Seguros empresariales a la medida',
    icon: 'FileCheck',
    description:
      'Portafolio de seguros empresariales a la medida diseñados para proteger el patrimonio, la operación y la responsabilidad legal de las organizaciones ante riesgos específicos de cada sector.',
    subServices: [
      'Seguros de responsabilidad civil extracontractual',
      'Pólizas de cumplimiento',
      'Seguros multirriesgo empresarial',
      'Seguros de transporte de mercancías',
      'Cobertura patrimonial y de activos',
      'Seguros de vida grupo y accidentes personales',
    ],
  },
  {
    id: 'service-bienestar',
    title: 'Bienestar Laboral',
    icon: 'Heart',
    description:
      'Programas integrales de bienestar que fortalecen la cultura organizacional, mejoran el clima laboral y promueven hábitos saludables entre los colaboradores.',
    subServices: [
      'Programas de promoción y prevención en salud',
      'Pausas activas y ergonomía en el puesto de trabajo',
      'Programas de riesgo psicosocial',
      'Actividades de integración y bienestar',
      'Medición de clima organizacional',
      'Asesoría en comité de convivencia laboral',
    ],
  },
];

// ============================================================================
// METHODOLOGY_STEPS - 5 pasos de la metodología
// Diagnóstico, Planeación, Implementación, Seguimiento, Mejora continua
// ============================================================================

export interface MethodologyStep {
  id: string;
  step: number;
  title: string;
  description: string;
}

export const METHODOLOGY_STEPS: MethodologyStep[] = [
  {
    id: 'step-1',
    step: 1,
    title: 'Diagnóstico',
    description:
      'Evaluamos las condiciones actuales de su empresa, identificamos riesgos, brechas normativas y oportunidades de mejora mediante un análisis integral.',
  },
  {
    id: 'step-2',
    step: 2,
    title: 'Planeación',
    description:
      'Diseñamos un plan de acción con objetivos medibles, cronograma de implementación y asignación de responsabilidades alineado a la normatividad vigente.',
  },
  {
    id: 'step-3',
    step: 3,
    title: 'Implementación',
    description:
      'Ejecutamos las estrategias definidas con acompañamiento técnico, capacitación al personal y puesta en marcha de controles operativos efectivos.',
  },
  {
    id: 'step-4',
    step: 4,
    title: 'Seguimiento',
    description:
      'Monitoreamos indicadores de gestión, realizamos auditorías periódicas y generamos informes de avance para garantizar el cumplimiento de metas.',
  },
  {
    id: 'step-5',
    step: 5,
    title: 'Mejora continua',
    description:
      'Analizamos resultados, implementamos acciones correctivas y ajustamos estrategias para optimizar continuamente la gestión de riesgos de su empresa.',
  },
];

// ============================================================================
// BENEFITS_DATA - Mínimo 6 beneficios con resultados específicos
// ============================================================================

export interface BenefitData {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const BENEFITS_DATA: BenefitData[] = [
  {
    id: 'benefit-1',
    icon: 'TrendingDown',
    title: 'Reducción de accidentalidad',
    description:
      'Disminución promedio del 45% en la tasa de accidentalidad laboral durante el primer año de implementación del SG-SST.',
  },
  {
    id: 'benefit-2',
    icon: 'ShieldCheck',
    title: 'Cumplimiento normativo garantizado',
    description:
      'Alcance del 98% de cumplimiento de los estándares mínimos exigidos por la Resolución 0312 de 2019.',
  },
  {
    id: 'benefit-3',
    icon: 'DollarSign',
    title: 'Optimización de costos',
    description:
      'Reducción de hasta el 30% en costos asociados a incapacidades, multas y sanciones por incumplimiento normativo.',
  },
  {
    id: 'benefit-4',
    icon: 'Users',
    title: 'Mejora del clima laboral',
    description:
      'Incremento medible en los índices de satisfacción y bienestar de los colaboradores mediante programas especializados.',
  },
  {
    id: 'benefit-5',
    icon: 'Clock',
    title: 'Respuesta oportuna',
    description:
      'Tiempos de atención inferiores a 24 horas para gestión de incidentes, reclamaciones y requerimientos normativos urgentes.',
  },
  {
    id: 'benefit-6',
    icon: 'BarChart3',
    title: 'Indicadores en tiempo real',
    description:
      'Tableros de gestión con indicadores actualizados que facilitan la toma de decisiones basada en datos concretos.',
  },
  {
    id: 'benefit-7',
    icon: 'GraduationCap',
    title: 'Capacitación especializada',
    description:
      'Programas de formación que reducen en un 60% los comportamientos inseguros identificados en inspecciones de campo.',
  },
];

// ============================================================================
// DIFFERENTIATORS_DATA - 5 diferenciadores competitivos
// ============================================================================

export interface DifferentiatorData {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const DIFFERENTIATORS_DATA: DifferentiatorData[] = [
  {
    id: 'diff-1',
    icon: 'Target',
    title: 'Enfoque personalizado',
    description:
      'Cada solución se diseña a la medida de su empresa, considerando su sector económico, tamaño, nivel de riesgo y objetivos estratégicos específicos.',
  },
  {
    id: 'diff-2',
    icon: 'Award',
    title: 'Experiencia comprobada',
    description:
      'Más de 15 años asesorando empresas colombianas en gestión de riesgos laborales, SST y seguros empresariales con resultados documentados y medibles.',
  },
  {
    id: 'diff-3',
    icon: 'BookOpen',
    title: 'Actualización normativa permanente',
    description:
      'Equipo especializado que monitorea cambios en la legislación colombiana para mantener su empresa siempre al día con los requisitos vigentes.',
  },
  {
    id: 'diff-4',
    icon: 'Headphones',
    title: 'Acompañamiento integral',
    description:
      'Soporte continuo desde el diagnóstico hasta la mejora continua, con canales de comunicación directa y tiempos de respuesta inferiores a 24 horas.',
  },
  {
    id: 'diff-5',
    icon: 'BarChart3',
    title: 'Gestión basada en datos',
    description:
      'Indicadores de gestión, informes periódicos y tableros de control que demuestran el retorno de inversión y el avance en sus objetivos de seguridad.',
  },
];

// ============================================================================
// NAV_LINKS - Enlaces de navegación en español
// ============================================================================

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { id: 'nav-inicio', label: 'Inicio', href: '#inicio' },
  { id: 'nav-nosotros', label: 'Nosotros', href: '#nosotros' },
  { id: 'nav-servicios', label: 'Servicios', href: '#servicios' },
  { id: 'nav-metodologia', label: 'Metodología', href: '#metodologia' },
  { id: 'nav-resultados', label: 'Resultados', href: '#resultados' },
  { id: 'nav-agente-ia', label: 'Agente IA', href: '#agente-ia' },
  {
    id: 'nav-preguntas',
    label: 'Preguntas frecuentes',
    href: '#preguntas-frecuentes',
  },
  { id: 'nav-contacto', label: 'Contacto', href: '#contacto' },
];

// ============================================================================
// SERVICE_OPTIONS - Opciones para select de formularios
// ============================================================================

export interface ServiceOption {
  value: string;
  label: string;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { value: 'arl', label: 'ARL y Riesgos Laborales' },
  { value: 'sst', label: 'Seguridad y Salud en el Trabajo' },
  { value: 'seguros', label: 'Seguros empresariales a la medida' },
  { value: 'bienestar', label: 'Bienestar Laboral' },
];

// ============================================================================
// Contenido estático del sitio
// ============================================================================

export const SITE_CONTENT = {
  /** Nombre de la empresa */
  companyName: 'ASGRO LTDA Agencia de Seguros',

  /** Nombre corto */
  companyShortName: 'ASGRO LTDA',

  /** Slogan / tagline */
  tagline: 'Protegemos lo que más importa: su empresa y sus colaboradores',

  /** Descripción del hero (máx 80 caracteres para headline) */
  heroHeadline: 'Gestión integral de riesgos laborales y seguros empresariales',

  /** Subtítulo del hero */
  heroSubtitle:
    'Soluciones especializadas en ARL, SST, seguros empresariales a la medida y bienestar laboral para proteger su empresa y sus colaboradores.',

  /** Badges del hero */
  heroBadges: [
    'ARL',
    'SST',
    'Bienestar laboral',
    'Seguros empresariales a la medida',
  ],

  /** Descripción de la sección "Nosotros" */
  aboutDescription:
    'Somos una agencia de seguros con más de 15 años de experiencia en la gestión integral de riesgos laborales, seguridad y salud en el trabajo, y seguros empresariales a la medida. Acompañamos a las empresas colombianas en la protección de su capital humano y patrimonio organizacional.',

  /** Propuesta de valor destacada */
  aboutValueProposition:
    'Combinamos conocimiento técnico, experiencia sectorial y tecnología para ofrecer soluciones que generan resultados medibles y sostenibles para su empresa.',

  /** Misión */
  mission:
    'Brindar asesoría integral en gestión de riesgos laborales, seguros y bienestar, generando valor para las empresas colombianas mediante soluciones que protegen su talento humano y fortalecen su sostenibilidad operativa.',

  /** Visión */
  vision:
    'Ser la agencia de seguros líder en Colombia en soluciones integrales de gestión de riesgos laborales, reconocida por la excelencia en el servicio, la innovación y el impacto positivo en la seguridad y bienestar de los trabajadores.',

  /** Especialidades listadas en "Nosotros" */
  specializations: [
    'Administración de Riesgos Laborales (ARL)',
    'Seguridad y Salud en el Trabajo (SST)',
    'Riesgos laborales y prevención',
    'Seguros empresariales a la medida',
  ],

  /** Texto del CTA principal */
  ctaPrimary: 'Solicitar asesoría',

  /** Texto del CTA secundario */
  ctaSecondary: 'Cotizar ahora',

  /** Texto del CTA WhatsApp */
  ctaWhatsApp: 'Hablar por WhatsApp',

  /** Texto del CTA Agente IA */
  ctaAIAgent: 'Consultar Agente IA',

  /** Mensaje pre-llenado de WhatsApp (general) */
  whatsappDefaultMessage:
    'Hola, soy visitante del sitio web de ASGRO LTDA y me gustaría recibir información sobre sus servicios.',

  /** Texto del copyright */
  copyrightText: `© ${new Date().getFullYear()} ASGRO LTDA Agencia de Seguros. Todos los derechos reservados.`,

  /** Texto legal */
  legalNotice: 'Política de tratamiento de datos personales',

  /** Texto del formulario de contacto - aceptación de datos */
  dataAcceptanceLabel: 'Acepto el tratamiento de datos personales',

  /** Placeholder del formulario de contacto */
  contactFormTitle: 'Contáctenos',
  contactFormSubtitle:
    'Déjenos sus datos y un asesor se comunicará con usted en las próximas 24 horas.',

  /** Placeholder del formulario de cotización */
  quoteFormTitle: 'Solicitar cotización',
  quoteFormSubtitle:
    'Complete la información de su empresa para recibir una propuesta personalizada.',

  /** Título de la sección de métricas */
  metricsTitle: 'Nuestro impacto en cifras',

  /** Título de la sección de FAQ */
  faqTitle: 'Preguntas frecuentes',

  /** Título de la sección de beneficios */
  benefitsTitle: '¿Por qué elegirnos?',

  /** Título de la sección de metodología */
  methodologyTitle: 'Nuestra metodología',
  methodologySubtitle:
    'Un proceso estructurado de cinco etapas diseñado para generar resultados medibles en la gestión de riesgos de su empresa.',

  /** Título de la sección de servicios */
  servicesTitle: 'Nuestros servicios',
  servicesSubtitle:
    'Soluciones integrales adaptadas a las necesidades específicas de cada organización.',

  /** Título de la sección de diferenciadores */
  whyChooseTitle: '¿Por qué ASGRO?',
  whyChooseSubtitle:
    'Cinco razones que nos diferencian en el mercado de gestión de riesgos laborales y seguros.',

  /** Título de la sección AI Agent */
  aiAgentTitle: 'Agente IA',
  aiAgentSubtitle:
    'Consulte información sobre seguros, ARL, SST y riesgos laborales en tiempo real.',

  /** Mensaje de bienvenida del agente IA */
  aiAgentWelcome:
    '¡Hola! Soy el asistente virtual de ASGRO LTDA. Puedo ayudarle con preguntas sobre seguros, ARL, SST y gestión de riesgos laborales. ¿En qué puedo asistirle?',

  /** Mensaje de fallback del agente IA */
  aiAgentFallback:
    'No encontré información específica sobre su consulta en nuestra base de conocimiento. Le recomiendo contactar a un asesor directamente por WhatsApp o a través de nuestro formulario de contacto para una atención personalizada.',
} as const;

// ============================================================================
// SEO - Metadatos para SEO
// ============================================================================

export const SEO_METADATA = {
  title: 'ASGRO LTDA | Gestión de Riesgos Laborales y Seguros',
  description:
    'Agencia de seguros especializada en ARL, SST, seguros empresariales a la medida y bienestar laboral en Colombia. Más de 15 años protegiendo empresas.',
  keywords: [
    'ARL Colombia',
    'seguridad y salud en el trabajo',
    'seguros empresariales',
    'riesgos laborales',
    'SG-SST',
    'bienestar laboral',
    'agencia de seguros Colombia',
  ],
  locale: 'es_CO',
  type: 'website',
} as const;
