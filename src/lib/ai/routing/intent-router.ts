// ============================================================================
// ASGRO — Intent Router determinístico (Bloque 5B.2)
// ============================================================================
//
// Capa PURA y testeable que clasifica el mensaje del usuario en una intención,
// SIN usar LLM. Routing por normalización + sinónimos + scoring + prioridades,
// con soporte de contexto conversacional mínimo para follow-ups ambiguos.
//
// Cada intención mapea a category/subcategory de la KB V2 (cuando aplica),
// una confianza y una razón interna. `reason`, scores y claves internas NUNCA
// deben enviarse al cliente.
// ============================================================================

import type { KbCategory, KbSubcategory } from '@/lib/ai/knowledge/taxonomy';

export type Intent =
  | 'general_insurance'
  | 'personas'
  | 'vida'
  | 'salud'
  | 'accidentes_personales'
  | 'hogar'
  | 'vehiculos'
  | 'arrendamiento'
  | 'empresas'
  | 'multirriesgo'
  | 'responsabilidad_civil'
  | 'cumplimiento'
  | 'manejo'
  | 'vida_grupo'
  | 'arl'
  | 'sst'
  | 'siniestros'
  | 'cotizacion'
  | 'contacto'
  | 'institucional'
  | 'human_advisor'
  | 'whatsapp'
  | 'off_topic'
  | 'unknown';

export interface IntentResult {
  intent: Intent;
  category: KbCategory | null;
  subcategory: KbSubcategory | null;
  confidence: number; // 0..1
  /** Razón interna de diagnóstico. NUNCA exponer al cliente. */
  reason: string;
  /** True si la intención pide precio/condición contractual/decisión aseguradora. */
  wantsCommercialOrContractual: boolean;
}

/** Mensaje mínimo de contexto para follow-ups. */
export interface RouterContextMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ----------------------------------------------------------------------------
// Normalización
// ----------------------------------------------------------------------------

/** Minúsculas, sin acentos/diacríticos, puntuación → espacio, colapsa espacios. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita diacríticos
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

// ----------------------------------------------------------------------------
// Definición de intents (orden = prioridad de desempate ante empate de score)
// ----------------------------------------------------------------------------

interface IntentRule {
  intent: Intent;
  category: KbCategory | null;
  subcategory: KbSubcategory | null;
  /** Términos normalizados (sin acentos). */
  terms: string[];
  /** Peso base del match (permite priorizar señales fuertes). */
  weight: number;
}

// Orden importante: intents más específicos/accionables primero.
const INTENT_RULES: IntentRule[] = [
  // Handoff / canales — señales muy explícitas
  {
    intent: 'human_advisor',
    category: 'transversal',
    subcategory: 'contacto',
    terms: [
      'hablar con una persona',
      'hablar con un asesor',
      'hablar con alguien',
      'asesor humano',
      'una persona',
      'un humano',
      'atencion personalizada',
      'agente humano',
      'asesor',
    ],
    weight: 3,
  },
  {
    intent: 'whatsapp',
    category: 'transversal',
    subcategory: 'contacto',
    terms: ['whatsapp', 'wasap', 'wpp', 'escribir por whatsapp'],
    weight: 3,
  },
  // Transversales accionables
  {
    intent: 'siniestros',
    category: 'transversal',
    subcategory: 'siniestros',
    terms: ['siniestro', 'siniestros', 'reclamacion', 'reclamar', 'choque', 'me robaron', 'tuve un accidente', 'reportar un evento'],
    weight: 2.5,
  },
  {
    intent: 'cotizacion',
    category: 'transversal',
    subcategory: 'cotizacion',
    terms: ['cotizar', 'cotizacion', 'quiero una cotizacion', 'presupuesto', 'quiero cotizar'],
    weight: 2.5,
  },
  {
    intent: 'contacto',
    category: 'transversal',
    subcategory: 'contacto',
    terms: ['contacto', 'contactar', 'como los contacto', 'telefono', 'correo', 'email'],
    weight: 1.5,
  },
  // Capacidades
  {
    intent: 'arl',
    category: 'capacidades',
    subcategory: 'arl',
    terms: ['arl', 'riesgos laborales', 'afiliar mi empresa a una arl', 'afiliacion arl', 'administradora de riesgos laborales', 'accidente laboral', 'enfermedad laboral'],
    weight: 2.2,
  },
  {
    intent: 'sst',
    category: 'capacidades',
    subcategory: 'sst',
    terms: ['sst', 'sg sst', 'sgsst', 'seguridad y salud en el trabajo', 'sistema de gestion', 'matriz de peligros', 'estandares minimos'],
    weight: 2.2,
  },
  // Empresas — subdominios específicos
  {
    intent: 'responsabilidad_civil',
    category: 'empresas',
    subcategory: 'responsabilidad_civil',
    terms: ['responsabilidad civil', 'rc extracontractual', 'dano a terceros', 'danos a terceros'],
    weight: 2.2,
  },
  {
    intent: 'cumplimiento',
    category: 'empresas',
    subcategory: 'cumplimiento',
    terms: ['cumplimiento', 'poliza de cumplimiento', 'garantia contractual', 'contrato publico', 'estabilidad de obra'],
    weight: 2.2,
  },
  {
    intent: 'manejo',
    category: 'empresas',
    subcategory: 'manejo',
    terms: ['seguro de manejo', 'infidelidad', 'abuso de confianza', 'fraude de empleados'],
    weight: 2.2,
  },
  {
    intent: 'multirriesgo',
    category: 'empresas',
    subcategory: 'multirriesgo',
    terms: ['multirriesgo', 'multi riesgo', 'incendio', 'proteger los activos', 'activos de la empresa'],
    weight: 2,
  },
  {
    intent: 'vida_grupo',
    category: 'empresas',
    subcategory: 'vida_grupo',
    terms: ['vida grupo', 'vida grupal', 'poliza colectiva de vida', 'seguro colectivo'],
    weight: 2,
  },
  // Personas — subdominios específicos
  {
    intent: 'vehiculos',
    category: 'personas',
    subcategory: 'vehiculos',
    terms: ['carro', 'auto', 'automovil', 'vehiculo', 'moto', 'motocicleta', 'todo riesgo para el carro'],
    weight: 2,
  },
  {
    intent: 'hogar',
    category: 'personas',
    subcategory: 'hogar',
    terms: ['hogar', 'casa', 'vivienda', 'apartamento', 'mi casa'],
    weight: 2,
  },
  {
    intent: 'vida',
    category: 'personas',
    subcategory: 'vida',
    terms: ['seguro de vida', 'seguro de vida individual', 'fallecimiento', 'beneficiarios'],
    weight: 2,
  },
  {
    intent: 'salud',
    category: 'personas',
    subcategory: 'salud',
    terms: ['salud', 'medicina prepagada', 'plan de salud', 'plan complementario'],
    weight: 1.8,
  },
  {
    intent: 'accidentes_personales',
    category: 'personas',
    subcategory: 'accidentes_personales',
    terms: ['accidentes personales', 'accidente personal'],
    weight: 1.8,
  },
  {
    intent: 'arrendamiento',
    category: 'personas',
    subcategory: 'arrendamiento',
    terms: ['arrendamiento', 'arriendo', 'seguro de arriendo', 'seguro para arrendar', 'fianza de arrendamiento'],
    weight: 1.8,
  },
  // Empresas genérico
  {
    intent: 'empresas',
    category: 'empresas',
    subcategory: null,
    terms: ['empresa', 'empresas', 'empresarial', 'para mi negocio', 'para mi empresa', 'pyme', 'compania', 'corporativo'],
    weight: 1.5,
  },
  // Personas genérico
  {
    intent: 'personas',
    category: 'personas',
    subcategory: null,
    terms: ['personas', 'para mi familia', 'proteger a mi familia', 'seguro personal', 'para mi'],
    weight: 1.2,
  },
  // Institucional
  {
    intent: 'institucional',
    category: 'transversal',
    subcategory: 'institucional_asgro',
    terms: ['que hace asgro', 'quienes son', 'quienes somos', 'que es asgro', 'sobre asgro', 'valores'],
    weight: 1.5,
  },
  // Seguros en general
  {
    intent: 'general_insurance',
    category: 'personas',
    subcategory: null,
    terms: ['seguro', 'seguros', 'poliza', 'polizas', 'asegurar', 'cobertura', 'coberturas'],
    weight: 1,
  },
];

// Señales de tema válido (dominio ASGRO). Si no hay señal alguna → off_topic.
const ON_TOPIC_TERMS: string[] = [
  'seguro', 'seguros', 'poliza', 'asegurar', 'aseguradora', 'cobertura',
  'arl', 'sst', 'riesgo', 'riesgos', 'siniestro', 'cotizar', 'cotizacion',
  'asesor', 'whatsapp', 'contacto', 'empresa', 'vida', 'salud', 'hogar',
  'carro', 'auto', 'vehiculo', 'moto', 'arriendo', 'arrendamiento',
  'cumplimiento', 'manejo', 'multirriesgo', 'asgro', 'responsabilidad civil',
  'accidente', 'accidentes',
];

// Señales de precio / condición contractual / decisión aseguradora (guardrail).
const COMMERCIAL_CONTRACTUAL_TERMS: string[] = [
  'cuanto cuesta', 'cuanto vale', 'precio', 'valor', 'costo', 'tarifa', 'prima',
  'mejor cobertura', 'mejor precio', 'mejor relacion',
  'me aprueban', 'aprobacion', 'garantizan', 'garantia de indemnizacion',
  'que cubre exactamente', 'esta cubierto', 'me indemnizan', 'indemnizacion',
];

// Follow-ups ambiguos que dependen del contexto previo.
const FOLLOWUP_TERMS: string[] = [
  'y cuanto cuesta', 'y que cubre', 'me interesa ese', 'ese', 'esa', 'y eso',
  'cuentame mas', 'mas informacion', 'y que incluye', 'como funciona',
];

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

function scoreRule(normalized: string, rule: IntentRule): number {
  let score = 0;
  for (const term of rule.terms) {
    if (normalized.includes(term)) {
      // Términos multi-palabra son señales más fuertes.
      const strength = term.includes(' ') ? 1.6 : 1;
      score += rule.weight * strength;
    }
  }
  return score;
}

function isFollowup(normalized: string): boolean {
  if (normalized.split(' ').length <= 5 && includesAny(normalized, FOLLOWUP_TERMS)) {
    return true;
  }
  return false;
}

/**
 * Busca la última intención de dominio (no transversal/handoff) en el contexto
 * para resolver follow-ups ambiguos. Devuelve null si no hay.
 */
function lastDomainIntent(
  context: RouterContextMessage[]
): IntentResult | null {
  for (let i = context.length - 1; i >= 0; i--) {
    const msg = context[i];
    if (!msg || msg.role !== 'user') continue;
    const r = classifyOnce(msg.content);
    if (
      r.category &&
      r.intent !== 'off_topic' &&
      r.intent !== 'unknown' &&
      r.intent !== 'human_advisor' &&
      r.intent !== 'whatsapp'
    ) {
      return r;
    }
  }
  return null;
}

/** Clasificación sin contexto (una sola pasada). */
function classifyOnce(message: string): IntentResult {
  const normalized = normalize(message);
  const wantsCommercialOrContractual = includesAny(normalized, COMMERCIAL_CONTRACTUAL_TERMS);

  if (normalized.length === 0) {
    return {
      intent: 'unknown',
      category: null,
      subcategory: null,
      confidence: 0,
      reason: 'empty',
      wantsCommercialOrContractual,
    };
  }

  let best: IntentRule | null = null;
  let bestScore = 0;
  for (const rule of INTENT_RULES) {
    const s = scoreRule(normalized, rule);
    if (s > bestScore) {
      bestScore = s;
      best = rule;
    }
  }

  if (best && bestScore > 0) {
    // Confianza acotada por el score (normalización simple a 0..1).
    const confidence = Math.max(0.4, Math.min(1, bestScore / 4));
    return {
      intent: best.intent,
      category: best.category,
      subcategory: best.subcategory,
      confidence,
      reason: `matched:${best.intent}:score=${bestScore.toFixed(2)}`,
      wantsCommercialOrContractual,
    };
  }

  // Sin match de reglas: ¿es al menos sobre el dominio?
  if (includesAny(normalized, ON_TOPIC_TERMS)) {
    return {
      intent: 'general_insurance',
      category: 'personas',
      subcategory: null,
      confidence: 0.4,
      reason: 'on-topic-no-rule',
      wantsCommercialOrContractual,
    };
  }

  return {
    intent: 'off_topic',
    category: null,
    subcategory: null,
    confidence: 0,
    reason: 'no-topic-signal',
    wantsCommercialOrContractual,
  };
}

/**
 * Clasifica el mensaje, usando contexto conversacional mínimo para follow-ups.
 *
 * Reglas de contexto:
 * - Una intención explícita nueva NUNCA se sobrescribe por contexto antiguo.
 * - Solo follow-ups ambiguos ("¿y cuánto cuesta?", "me interesa ese") heredan
 *   el dominio/subdominio de la última intención de dominio del contexto.
 *
 * @param message mensaje actual del usuario
 * @param context últimos mensajes de la sesión (orden cronológico)
 */
export function routeIntent(
  message: string,
  context: RouterContextMessage[] = []
): IntentResult {
  const direct = classifyOnce(message);

  // Intención explícita y accionable: se respeta tal cual.
  const explicit =
    direct.intent !== 'off_topic' &&
    direct.intent !== 'unknown' &&
    direct.intent !== 'general_insurance';

  if (explicit) return direct;

  // Follow-up ambiguo: intentar heredar dominio del contexto.
  if (isFollowup(normalize(message))) {
    const prior = lastDomainIntent(context);
    if (prior) {
      return {
        ...prior,
        confidence: Math.min(1, prior.confidence),
        reason: `followup-inherited:${prior.intent}`,
        wantsCommercialOrContractual: direct.wantsCommercialOrContractual,
      };
    }
  }

  return direct;
}
