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
    question: '¿Qué es ASGRO y qué ofrece?',
    answer:
      'ASGRO es una agencia de seguros y aliado integral en gestión del riesgo. Ofrecemos soluciones de seguros para personas, patrimonio y empresas, y complementamos con acompañamiento en gestión de riesgos laborales (ARL) y seguridad y salud en el trabajo (SST).',
    category: 'servicios',
    orderIndex: 1,
  },
  {
    id: 'faq-2',
    question: '¿Qué seguros puedo obtener a través de ASGRO?',
    answer:
      'Acompañamos la búsqueda de soluciones para personas (vida, salud, accidentes personales), patrimonio (hogar, automóviles, arrendamiento) y empresas (multirriesgo, responsabilidad civil, cumplimiento, manejo, vida grupo y otros riesgos empresariales), acordes con su perfil y exposición al riesgo.',
    category: 'servicios',
    orderIndex: 2,
  },
  {
    id: 'faq-3',
    question: '¿Atienden tanto a personas como a empresas?',
    answer:
      'Sí. Acompañamos a personas y familias en la protección de su vida, su salud y su patrimonio, y a empresas en la protección de su operación, su talento y su continuidad. Cada solución se ajusta a la necesidad y exposición al riesgo de cada cliente.',
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
// FALLBACK_METRICS - Indicadores institucionales SEGUROS (sin cifras comerciales
// no verificadas). Solo describen la estructura y el alcance del servicio.
// ============================================================================

export const FALLBACK_METRICS: MetricDisplay[] = [
  {
    id: 'metric-1',
    value: 3,
    label: 'Frentes de protección',
    unit: 'personas · patrimonio · empresas',
    icon: 'ShieldCheck',
  },
  {
    id: 'metric-2',
    value: 4,
    label: 'Etapas de acompañamiento',
    unit: 'etapas',
    icon: 'Route',
  },
  {
    id: 'metric-3',
    value: 360,
    label: 'Visión integral del riesgo',
    unit: '°',
    icon: 'CircleDot',
  },
  {
    id: 'metric-4',
    value: 100,
    label: 'Enfoque en acompañamiento',
    unit: '%',
    icon: 'Handshake',
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

// Los tres grandes frentes de protección de ASGRO (propuesta de valor).
export const PILLARS_DATA: PillarData[] = [
  {
    id: 'pillar-personas',
    icon: 'Users',
    title: 'Personas',
    description:
      'Protección para usted, su familia y su bienestar frente a los imprevistos de la vida.',
  },
  {
    id: 'pillar-patrimonio',
    icon: 'Home',
    title: 'Patrimonio',
    description:
      'Protección para su vivienda, vehículos y bienes: lo que ha construido con esfuerzo.',
  },
  {
    id: 'pillar-empresas',
    icon: 'Building2',
    title: 'Empresas',
    description:
      'Soluciones para proteger operación, talento, contratos y continuidad del negocio.',
  },
];

// ============================================================================
// INSURANCE_PORTFOLIO - Portafolio de Seguros (NÚCLEO de la propuesta ASGRO)
// Organizado en tres grupos: Personas, Patrimonio y Empresas.
// Cada producto: nombre + descripción de 1 línea. Sin cifras ni promesas.
// ============================================================================

export interface InsuranceProduct {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export interface InsuranceGroup {
  id: string;
  groupIcon: string;
  groupTitle: string;
  groupDescription: string;
  products: InsuranceProduct[];
}

export const INSURANCE_PORTFOLIO: InsuranceGroup[] = [
  {
    id: 'group-personas',
    groupIcon: 'Users',
    groupTitle: 'Personas',
    groupDescription: 'Protección para usted y su familia.',
    products: [
      {
        id: 'ins-vida',
        icon: 'HeartPulse',
        name: 'Vida',
        description: 'Respaldo económico para quienes dependen de usted.',
      },
      {
        id: 'ins-salud',
        icon: 'Stethoscope',
        name: 'Salud',
        description: 'Acceso a atención y coberturas complementarias en salud.',
      },
      {
        id: 'ins-accidentes',
        icon: 'ShieldPlus',
        name: 'Accidentes personales',
        description: 'Protección ante imprevistos que afectan su integridad.',
      },
    ],
  },
  {
    id: 'group-patrimonio',
    groupIcon: 'Home',
    groupTitle: 'Patrimonio',
    groupDescription: 'Protección para sus bienes.',
    products: [
      {
        id: 'ins-hogar',
        icon: 'House',
        name: 'Hogar',
        description: 'Cobertura para su vivienda y su contenido.',
      },
      {
        id: 'ins-auto',
        icon: 'Car',
        name: 'Automóviles',
        description: 'Protección para su vehículo ante daños y terceros.',
      },
      {
        id: 'ins-arrendamiento',
        icon: 'KeyRound',
        name: 'Arrendamiento',
        description: 'Respaldo en la relación entre arrendador y arrendatario.',
      },
    ],
  },
  {
    id: 'group-empresas',
    groupIcon: 'Building2',
    groupTitle: 'Empresas',
    groupDescription: 'Protección para su operación y continuidad.',
    products: [
      {
        id: 'ins-multirriesgo',
        icon: 'Factory',
        name: 'Multirriesgo empresarial / PYME',
        description: 'Cobertura integral para activos y operación del negocio.',
      },
      {
        id: 'ins-rc',
        icon: 'Scale',
        name: 'Responsabilidad civil',
        description: 'Protección frente a reclamaciones de terceros.',
      },
      {
        id: 'ins-cumplimiento',
        icon: 'FileCheck',
        name: 'Cumplimiento',
        description: 'Respaldo del cumplimiento de contratos y obligaciones.',
      },
      {
        id: 'ins-manejo',
        icon: 'Lock',
        name: 'Manejo',
        description: 'Protección ante riesgos derivados del manejo de recursos.',
      },
      {
        id: 'ins-vida-grupo',
        icon: 'UsersRound',
        name: 'Vida grupo',
        description: 'Cobertura de vida para los colaboradores de la empresa.',
      },
      {
        id: 'ins-otros',
        icon: 'LayoutGrid',
        name: 'Otros riesgos empresariales',
        description: 'Soluciones adicionales según la exposición de su operación.',
      },
    ],
  },
];

// ============================================================================
// SERVICES_DATA - 4 categorías de servicios
// ARL, SST, seguros empresariales a la medida, bienestar laboral
// ============================================================================

// Orden intencional: SEGUROS primero (eje principal), luego ARL, luego SST.
export const SERVICES_DATA: ServiceData[] = [
  {
    id: 'service-seguros',
    title: 'Soluciones de Seguros',
    icon: 'Shield',
    description:
      'Analizamos su necesidad y buscamos alternativas de protección para personas, patrimonio y empresas, acordes con su perfil y exposición al riesgo.',
    subServices: [
      'Seguros de vida, salud y accidentes personales',
      'Hogar, automóviles y arrendamiento',
      'Multirriesgo empresarial y PYME',
      'Responsabilidad civil, cumplimiento y manejo',
      'Vida grupo para colaboradores',
      'Otros riesgos empresariales a la medida',
    ],
  },
  {
    id: 'service-arl',
    title: 'ARL y Riesgos Laborales',
    icon: 'ClipboardCheck',
    description:
      'Acompañamiento preventivo y gestión de riesgos laborales para complementar la protección de su empresa y su equipo humano.',
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
      'Diseño e implementación del SG-SST y acompañamiento en cumplimiento, como capacidad complementaria a la protección aseguradora.',
    subServices: [
      'Diseño del SG-SST según estándares mínimos',
      'Auditorías internas y de cumplimiento',
      'Investigación de accidentes de trabajo',
      'Capacitación y prevención',
      'Plan de emergencias y simulacros',
      'Inspecciones de seguridad',
    ],
  },
  {
    id: 'service-bienestar',
    title: 'Bienestar y Prevención',
    icon: 'Heart',
    description:
      'Programas de bienestar que fortalecen la cultura organizacional y promueven hábitos saludables entre los colaboradores.',
    subServices: [
      'Programas de promoción y prevención en salud',
      'Pausas activas y ergonomía',
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

// Modelo de acompañamiento ASGRO — 4 etapas claras (Entender → Analizar →
// Gestionar → Acompañar). Enfocado en asesoría de seguros, no en consultoría SST.
export const METHODOLOGY_STEPS: MethodologyStep[] = [
  {
    id: 'step-1',
    step: 1,
    title: 'Entender',
    description:
      'Comprendemos su necesidad y su exposición al riesgo para partir de lo que realmente importa proteger.',
  },
  {
    id: 'step-2',
    step: 2,
    title: 'Analizar',
    description:
      'Identificamos alternativas de protección disponibles y las comparamos según su perfil.',
  },
  {
    id: 'step-3',
    step: 3,
    title: 'Gestionar',
    description:
      'Acompañamos la cotización, la contratación y la emisión de su solución de manera clara.',
  },
  {
    id: 'step-4',
    step: 4,
    title: 'Acompañar',
    description:
      'Apoyamos novedades, renovaciones y siniestros: estamos antes, durante y después.',
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

// "Valor que generamos" — beneficios CUALITATIVOS, sin cifras no verificadas.
export const BENEFITS_DATA: BenefitData[] = [
  {
    id: 'benefit-1',
    icon: 'ShieldCheck',
    title: 'Mayor prevención',
    description:
      'Comprendemos el riesgo antes de asegurar, para anticipar lo que puede afectar lo que importa.',
  },
  {
    id: 'benefit-2',
    icon: 'Eye',
    title: 'Mayor claridad',
    description:
      'Explicamos coberturas y alcances en un lenguaje sencillo, para que decida con confianza.',
  },
  {
    id: 'benefit-3',
    icon: 'Handshake',
    title: 'Mejor acompañamiento',
    description:
      'Un aliado cercano en cada etapa: contratación, renovaciones, novedades y siniestros.',
  },
  {
    id: 'benefit-4',
    icon: 'ShieldAlert',
    title: 'Menor exposición al riesgo',
    description:
      'Ayudamos a identificar y cerrar brechas de protección en personas, patrimonio y operación.',
  },
  {
    id: 'benefit-5',
    icon: 'Activity',
    title: 'Mayor continuidad',
    description:
      'Protección pensada para que su vida y su negocio sigan adelante ante imprevistos.',
  },
  {
    id: 'benefit-6',
    icon: 'Heart',
    title: 'Mayor tranquilidad',
    description:
      'Saber que cuenta con respaldo y con alguien que responde cuando lo necesita.',
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

// 5 razones para elegir ASGRO — argumentos cualitativos, sin cifras ni promesas.
export const DIFFERENTIATORS_DATA: DifferentiatorData[] = [
  {
    id: 'diff-1',
    icon: 'Handshake',
    title: 'Acompañamiento cercano',
    description:
      'Estamos presentes antes, durante y después de la contratación de su solución.',
  },
  {
    id: 'diff-2',
    icon: 'ShieldCheck',
    title: 'Enfoque preventivo',
    description:
      'No buscamos únicamente asegurar; buscamos comprender el riesgo para proteger mejor.',
  },
  {
    id: 'diff-3',
    icon: 'Target',
    title: 'Soluciones a la medida',
    description:
      'Cada persona, empresa y operación tiene necesidades diferentes, y así las abordamos.',
  },
  {
    id: 'diff-4',
    icon: 'Zap',
    title: 'Respuesta ágil',
    description:
      'Procesos claros, comunicación cercana y seguimiento en cada etapa.',
  },
  {
    id: 'diff-5',
    icon: 'Layers',
    title: 'Visión integral',
    description:
      'Conectamos seguros, personas, riesgos y operación empresarial en una sola mirada.',
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

// Navegación seguros-first. Las etiquetas ARL y SST apuntan a los micrositios
// de servicios existentes; "Seguros" y "Empresas" al hub de servicios y a la home.
export const NAV_LINKS: NavLink[] = [
  { id: 'nav-inicio', label: 'Inicio', href: '/' },
  { id: 'nav-nosotros', label: 'Nosotros', href: '/nosotros' },
  { id: 'nav-seguros', label: 'Seguros', href: '/servicios/seguros-empresariales' },
  { id: 'nav-empresas', label: 'Empresas', href: '/#empresas' },
  { id: 'nav-arl', label: 'ARL y Riesgos Laborales', href: '/servicios/riesgos-laborales' },
  { id: 'nav-sst', label: 'SST', href: '/servicios/seguridad-salud-trabajo' },
  { id: 'nav-contacto', label: 'Contacto', href: '/contacto' },
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
  /** Nombre de la empresa — marca ÚNICA */
  companyName: 'ASGRO Agencia de Seguros',

  /** Nombre corto */
  companyShortName: 'ASGRO',

  /** Descriptor de marca (bajo el logo) */
  brandDescriptor: 'Agencia de Seguros',

  /** Slogan / tagline principal */
  tagline: 'Protegemos personas, patrimonio y empresas.',

  /** Titular del hero — seguros primero, alto impacto */
  heroHeadline: 'Protegemos lo que mueve su futuro.',

  /** Subtítulo del hero */
  heroSubtitle:
    'Soluciones de seguros para personas y empresas, con acompañamiento cercano, técnico y estratégico.',

  /** Badges del hero — jerarquía: seguros primero */
  heroBadges: [
    'Personas',
    'Patrimonio',
    'Empresas',
    'Gestión del riesgo',
  ],

  /** Descripción de la sección "Nosotros" — sin cifras ni trayectoria inventada */
  aboutDescription:
    'ASGRO es una agencia de seguros y aliado integral en gestión del riesgo. Acompañamos a personas y empresas en la protección de lo que realmente importa, aplicando conocimiento técnico y trayectoria profesional del equipo a cada cliente.',

  /** Propuesta de valor destacada */
  aboutValueProposition:
    'Más que una póliza, acompañamos la protección de personas, patrimonio y empresas con cercanía, claridad y visión integral del riesgo.',

  /** Misión */
  mission:
    'Acompañar a personas y empresas en la protección de lo que valoran, ofreciendo soluciones de seguros y gestión del riesgo con asesoría cercana, clara y estratégica.',

  /** Visión */
  vision:
    'Ser reconocidos como una agencia de seguros cercana y confiable, aliada integral en la gestión del riesgo de personas y empresas en Colombia.',

  /** Especialidades listadas en "Nosotros" — seguros primero */
  specializations: [
    'Seguros para personas, patrimonio y empresas',
    'Gestión de Riesgos Laborales (ARL)',
    'Seguridad y Salud en el Trabajo (SST)',
    'Gestión preventiva del riesgo y acompañamiento',
  ],

  /** Texto del CTA principal */
  ctaPrimary: 'Solicitar asesoría',

  /** Texto del CTA secundario del hero */
  ctaSecondary: 'Conocer soluciones',

  /** Texto del CTA de cotización */
  ctaQuote: 'Solicitar una cotización',

  /** Texto del CTA WhatsApp */
  ctaWhatsApp: 'Hablar por WhatsApp',

  /** Texto del CTA Agente IA */
  ctaAIAgent: 'Consultar Agente IA',

  /** Mensaje pre-llenado de WhatsApp (general) */
  whatsappDefaultMessage:
    'Hola, soy visitante del sitio web de ASGRO LTDA y me gustaría recibir información sobre sus servicios.',

  /** Texto del copyright */
  copyrightText: `© ${new Date().getFullYear()} ASGRO Agencia de Seguros. Todos los derechos reservados.`,

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

  /** Título de la sección de valor (antes "impacto en cifras") */
  metricsTitle: 'Valor que generamos',

  /** Título de la sección de FAQ */
  faqTitle: 'Preguntas frecuentes',

  /** Título de la sección de beneficios */
  benefitsTitle: 'Impacto que buscamos generar',

  /** Título del modelo de acompañamiento */
  methodologyTitle: 'Así acompañamos su protección',
  methodologySubtitle:
    'Un modelo cercano de cuatro etapas para entender, analizar, gestionar y acompañar su protección.',

  /** Título del portafolio de seguros */
  servicesTitle: 'Soluciones de seguros',
  servicesSubtitle:
    'Analizamos su necesidad y buscamos alternativas de protección acordes con su perfil y exposición al riesgo.',

  /** Título de la sección de diferenciadores */
  whyChooseTitle: '¿Por qué elegir ASGRO?',
  whyChooseSubtitle:
    'Cinco razones que reflejan nuestra forma de acompañar la protección de personas y empresas.',

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
  title: 'ASGRO Agencia de Seguros | Protegemos personas, patrimonio y empresas',
  description:
    'Agencia de seguros y aliado integral en gestión del riesgo en Colombia. Seguros para personas, patrimonio y empresas, con acompañamiento cercano. Complementamos con ARL y SST.',
  keywords: [
    'agencia de seguros Colombia',
    'seguros para personas',
    'seguros empresariales',
    'seguro de vida',
    'seguro de hogar',
    'seguro de vehículos',
    'gestión del riesgo',
    'ARL',
    'SST',
  ],
  locale: 'es_CO',
  type: 'website',
} as const;
