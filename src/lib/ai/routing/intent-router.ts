// ============================================================================
// ASGRO — Intent Router determinístico (Bloque 5B.2 · endurecido en 5B.2.1)
// ============================================================================
//
// Capa PURA y testeable que clasifica el mensaje del usuario en una intención,
// SIN usar LLM. Routing por normalización + matching por límites de palabra/
// frase (sin colisiones por substring) + scoring + prioridades, con contexto
// conversacional mínimo para follow-ups y dominio comercial secundario.
//
// 5B.2.1:
// - Matching por PALABRA COMPLETA (términos de 1 palabra) o FRASE COMPLETA
//   (multi-palabra), no `includes()`. Evita falsos positivos ("automático" →
//   vehiculos, "asesoría" → human_advisor, "actividad" → algo irrelevante).
// - human_advisor exige señales explícitas.
// - Intents transaccionales (cotizacion, siniestros) conservan dominio/producto
//   secundario (domainIntent + category/subcategory).
// - general_insurance NO se fuerza a personas: se marca sin category para que
//   el retrieval devuelva un panorama balanceado.
// - confidence con umbrales documentados.
//
// `reason`, scores y claves internas NUNCA deben enviarse al cliente.
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

/** Umbrales de confianza (0..1). Documentados en el doc de retrieval. */
export const CONFIDENCE_HIGH = 0.7;
export const CONFIDENCE_MEDIUM = 0.45;

export interface IntentResult {
  /** Intención efectiva (compatibilidad 5B.2). Para transaccionales = primaryIntent. */
  intent: Intent;
  /** Intención transaccional principal (cotizacion/siniestros/handoff/...). */
  primaryIntent: Intent;
  /** Dominio de producto secundario cuando aplica (p. ej. vehiculos en "cotizar carro"). */
  domainIntent: Intent | null;
  category: KbCategory | null;
  subcategory: KbSubcategory | null;
  confidence: number; // 0..1
  /** Razón interna de diagnóstico. NUNCA exponer al cliente. */
  reason: string;
  /** True si pide precio/condición contractual/decisión aseguradora. */
  wantsCommercialOrContractual: boolean;
}

/** Mensaje mínimo de contexto para follow-ups. */
export interface RouterContextMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ----------------------------------------------------------------------------
// Normalización y matching por límites
// ----------------------------------------------------------------------------

/** Minúsculas, sin acentos/diacríticos, puntuación → espacio, colapsa espacios. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * ¿El texto normalizado contiene el término como PALABRA/FRASE completa?
 * - término de 1 palabra → debe aparecer como token completo (límites de palabra).
 * - término multi-palabra → debe aparecer como subsecuencia contigua de tokens.
 * Evita colisiones por substring (p. ej. "auto" no matchea "automatico").
 */
export function matchesTerm(normalizedText: string, term: string): boolean {
  const textTokens = normalizedText.split(' ').filter(Boolean);
  const termTokens = term.split(' ').filter(Boolean);
  if (termTokens.length === 0) return false;

  for (let i = 0; i + termTokens.length <= textTokens.length; i++) {
    let ok = true;
    for (let j = 0; j < termTokens.length; j++) {
      if (textTokens[i + j] !== termTokens[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

function matchesAny(normalizedText: string, terms: string[]): boolean {
  return terms.some((t) => matchesTerm(normalizedText, t));
}

// ----------------------------------------------------------------------------
// Reglas de intención
// ----------------------------------------------------------------------------

interface IntentRule {
  intent: Intent;
  category: KbCategory | null;
  subcategory: KbSubcategory | null;
  terms: string[]; // normalizados
  weight: number;
  /** Intent transaccional que conserva dominio secundario. */
  transactional?: boolean;
}

// Orden = prioridad de desempate. Transaccionales y específicos primero.
const INTENT_RULES: IntentRule[] = [
  // Handoff explícito (frases completas; "asesor"/"asesoria" solo NO basta).
  {
    intent: 'human_advisor',
    category: 'transversal',
    subcategory: 'contacto',
    terms: [
      'hablar con un asesor',
      'hablar con una persona',
      'hablar con alguien',
      'hablar con un humano',
      'hablar con un agente',
      'quiero un asesor',
      'necesito un asesor',
      'asesor humano',
      'agente humano',
      'una persona real',
      'que me contacte un asesor',
      'que me llame un asesor',
      'atencion personalizada',
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
  // Transaccionales (conservan dominio secundario).
  {
    intent: 'siniestros',
    category: 'transversal',
    subcategory: 'siniestros',
    terms: ['siniestro', 'siniestros', 'reclamacion', 'reclamo', 'reclamar', 'tuve un accidente', 'me robaron', 'reportar un evento', 'reportar siniestro'],
    weight: 2.6,
    transactional: true,
  },
  {
    intent: 'cotizacion',
    category: 'transversal',
    subcategory: 'cotizacion',
    terms: ['cotizar', 'cotizacion', 'cotizacion formal', 'presupuesto', 'quiero cotizar', 'necesito cotizar'],
    weight: 2.6,
    transactional: true,
  },
  {
    intent: 'contacto',
    category: 'transversal',
    subcategory: 'contacto',
    terms: ['contacto', 'contactarlos', 'como los contacto', 'telefono', 'correo', 'email', 'como me comunico'],
    weight: 1.4,
  },
  // Capacidades.
  {
    intent: 'arl',
    category: 'capacidades',
    subcategory: 'arl',
    terms: ['arl', 'riesgos laborales', 'afiliacion arl', 'afiliar a una arl', 'administradora de riesgos laborales', 'accidente laboral', 'enfermedad laboral'],
    weight: 2.2,
  },
  {
    intent: 'sst',
    category: 'capacidades',
    subcategory: 'sst',
    terms: ['sst', 'sg sst', 'sgsst', 'seguridad y salud en el trabajo', 'sistema de gestion', 'matriz de peligros', 'estandares minimos'],
    weight: 2.2,
  },
  // Empresas — subdominios.
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
  // Personas — subdominios.
  {
    intent: 'vehiculos',
    category: 'personas',
    subcategory: 'vehiculos',
    terms: ['carro', 'auto', 'automovil', 'vehiculo', 'moto', 'motocicleta', 'seguro para el carro', 'todo riesgo'],
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
    terms: ['seguro de vida', 'vida individual', 'fallecimiento', 'beneficiarios'],
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
  // Empresas genérico + comercial natural.
  {
    intent: 'empresas',
    category: 'empresas',
    subcategory: null,
    terms: ['empresa', 'empresas', 'empresarial', 'para mi negocio', 'proteger mi negocio', 'proteger mi empresa', 'para mi empresa', 'pyme', 'compania', 'corporativo', 'para empresas'],
    weight: 1.5,
  },
  // Personas genérico + comercial natural.
  {
    intent: 'personas',
    category: 'personas',
    subcategory: null,
    terms: ['personas', 'para mi familia', 'proteger a mi familia', 'proteger mi familia', 'seguro personal', 'para personas', 'proteger mi patrimonio'],
    weight: 1.4,
  },
  // Institucional.
  {
    intent: 'institucional',
    category: 'transversal',
    subcategory: 'institucional_asgro',
    terms: ['que hace asgro', 'quienes son', 'quienes somos', 'que es asgro', 'sobre asgro', 'valores', 'actividad economica'],
    weight: 1.5,
  },
  // Seguros en general / consultas de portafolio (SIN forzar personas).
  {
    intent: 'general_insurance',
    category: null,
    subcategory: null,
    terms: [
      'seguro', 'seguros', 'poliza', 'polizas', 'asegurar', 'cobertura', 'coberturas',
      'que seguros manejan', 'que seguros tienen', 'que soluciones ofrecen',
      'que soluciones tienen', 'como pueden ayudarme', 'que tienen', 'portafolio',
    ],
    weight: 1,
  },
];

// Señales de tema válido (dominio ASGRO). Sin señal → off_topic.
const ON_TOPIC_TERMS: string[] = [
  'seguro', 'seguros', 'poliza', 'polizas', 'asegurar', 'aseguradora', 'cobertura', 'coberturas',
  'arl', 'sst', 'riesgo', 'riesgos', 'siniestro', 'cotizar', 'cotizacion',
  'asesor', 'asesoria', 'whatsapp', 'contacto', 'empresa', 'empresas', 'vida', 'salud', 'hogar',
  'carro', 'auto', 'vehiculo', 'moto', 'arriendo', 'arrendamiento',
  'cumplimiento', 'manejo', 'multirriesgo', 'asgro', 'responsabilidad civil',
  'accidente', 'accidentes', 'negocio', 'familia', 'patrimonio', 'proteger',
];

// Precio / condición contractual / decisión aseguradora (guardrail).
const COMMERCIAL_CONTRACTUAL_TERMS: string[] = [
  'cuanto cuesta', 'cuanto vale', 'precio', 'valor', 'costo', 'tarifa', 'prima',
  'mejor cobertura', 'mejor precio', 'mejor relacion',
  'me aprueban', 'aprobacion', 'garantizan', 'garantia de indemnizacion',
  'que cubre exactamente', 'esta cubierto', 'me indemnizan', 'indemnizacion',
];

// Follow-ups ambiguos que dependen del contexto previo.
const FOLLOWUP_TERMS: string[] = [
  'y cuanto cuesta', 'y que cubre', 'me interesa ese', 'ese', 'esa', 'eso',
  'cuentame mas', 'mas informacion', 'y que incluye', 'como funciona', 'y que',
];

// Reglas de dominio (personas/empresas subdominios) para extraer dominio
// secundario de una consulta transaccional.
const DOMAIN_RULES = INTENT_RULES.filter(
  (r) => r.category === 'personas' || r.category === 'empresas'
);

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

function scoreRule(normalized: string, rule: IntentRule): number {
  let score = 0;
  for (const term of rule.terms) {
    if (matchesTerm(normalized, term)) {
      const strength = term.includes(' ') ? 1.6 : 1;
      score += rule.weight * strength;
    }
  }
  return score;
}

/** Extrae el mejor dominio de producto (personas/empresas) presente en el texto. */
function detectDomain(normalized: string): IntentRule | null {
  let best: IntentRule | null = null;
  let bestScore = 0;
  for (const rule of DOMAIN_RULES) {
    const s = scoreRule(normalized, rule);
    if (s > bestScore) {
      bestScore = s;
      best = rule;
    }
  }
  return bestScore > 0 ? best : null;
}

function confidenceFromScore(score: number): number {
  return Math.max(0.4, Math.min(1, score / 4));
}

function isFollowup(normalized: string): boolean {
  return normalized.split(' ').length <= 5 && matchesAny(normalized, FOLLOWUP_TERMS);
}

/** Clasificación sin contexto (una sola pasada). */
function classifyOnce(message: string): IntentResult {
  const normalized = normalize(message);
  const wantsCommercialOrContractual = matchesAny(normalized, COMMERCIAL_CONTRACTUAL_TERMS);

  if (normalized.length === 0) {
    return base('unknown', 'unknown', null, null, 0, 'empty', wantsCommercialOrContractual);
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
    const confidence = confidenceFromScore(bestScore);

    // Transaccional (cotizacion/siniestros): conservar dominio secundario.
    if (best.transactional) {
      const domain = detectDomain(normalized);
      return {
        intent: best.intent,
        primaryIntent: best.intent,
        domainIntent: domain ? domain.intent : null,
        category: domain ? domain.category : best.category,
        subcategory: domain ? domain.subcategory : best.subcategory,
        confidence,
        reason: `matched:${best.intent}:score=${bestScore.toFixed(2)}${domain ? `+domain:${domain.intent}` : ''}`,
        wantsCommercialOrContractual,
      };
    }

    return base(
      best.intent,
      best.intent,
      best.category,
      best.subcategory,
      confidence,
      `matched:${best.intent}:score=${bestScore.toFixed(2)}`,
      wantsCommercialOrContractual,
      null
    );
  }

  if (matchesAny(normalized, ON_TOPIC_TERMS)) {
    // Panorama general: NO forzar personas (category null → retrieval balanceado).
    return base('general_insurance', 'general_insurance', null, null, 0.4, 'on-topic-no-rule', wantsCommercialOrContractual);
  }

  return base('off_topic', 'off_topic', null, null, 0, 'no-topic-signal', wantsCommercialOrContractual);
}

function base(
  intent: Intent,
  primaryIntent: Intent,
  category: KbCategory | null,
  subcategory: KbSubcategory | null,
  confidence: number,
  reason: string,
  wantsCommercialOrContractual: boolean,
  domainIntent: Intent | null = null
): IntentResult {
  return {
    intent,
    primaryIntent,
    domainIntent,
    category,
    subcategory,
    confidence,
    reason,
    wantsCommercialOrContractual,
  };
}

/** Última intención de dominio (no transversal/handoff) en el contexto. */
function lastDomainIntent(context: RouterContextMessage[]): IntentResult | null {
  for (let i = context.length - 1; i >= 0; i--) {
    const msg = context[i];
    if (!msg || msg.role !== 'user') continue;
    const r = classifyOnce(msg.content);
    if (
      r.category &&
      r.intent !== 'off_topic' &&
      r.intent !== 'unknown' &&
      r.intent !== 'human_advisor' &&
      r.intent !== 'whatsapp' &&
      r.intent !== 'general_insurance'
    ) {
      return r;
    }
  }
  return null;
}

/**
 * Clasifica el mensaje usando contexto conversacional mínimo.
 *
 * - Intención explícita nueva NUNCA se sobrescribe por contexto antiguo.
 * - Transaccional (cotizacion/siniestros) sin dominio propio hereda el dominio
 *   del contexto (p. ej. "seguro para mi carro" → "quiero cotizar" =
 *   cotizacion + personas/vehiculos).
 * - Follow-ups ambiguos heredan el dominio del contexto.
 */
export function routeIntent(
  message: string,
  context: RouterContextMessage[] = []
): IntentResult {
  const direct = classifyOnce(message);

  // Transaccional sin dominio propio: heredar dominio del contexto.
  if ((direct.primaryIntent === 'cotizacion' || direct.primaryIntent === 'siniestros') && !direct.domainIntent) {
    const prior = lastDomainIntent(context);
    if (prior) {
      return {
        ...direct,
        domainIntent: prior.intent,
        category: prior.category,
        subcategory: prior.subcategory,
        reason: `${direct.reason}+inherited-domain:${prior.intent}`,
      };
    }
  }

  const explicit =
    direct.intent !== 'off_topic' &&
    direct.intent !== 'unknown' &&
    direct.intent !== 'general_insurance';

  if (explicit) return direct;

  // Follow-up ambiguo: heredar dominio del contexto.
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
