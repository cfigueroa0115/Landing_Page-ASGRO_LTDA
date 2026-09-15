import { describe, it, expect } from 'vitest';
import { routeIntent } from '@/lib/ai/routing/intent-router';
import {
  decideHandoffKind,
  decideCommercialHandoff,
  buildWhatsAppMessage,
  sanitizeActions,
  isSafeQuoteHref,
  type ChatAction,
} from '@/lib/ai/handoff/commercial-handoff';
import { processMessageV2, formatEntries } from '@/lib/ai/agent-v2';
import type { RetrievableEntry } from '@/lib/ai/retrieval/selective-retrieval';

/**
 * BLOQUE 5B.3 — Handoff comercial contextual. Determinístico, sin DB.
 */

const WA = '573001234567';
const ctx = { fallback: false, whatsappNumber: WA };
const ctxFallback = { fallback: true, whatsappNumber: WA };

// ----------------------------------------------------------------------------
// decideHandoffKind — reglas
// ----------------------------------------------------------------------------

describe('decideHandoffKind', () => {
  const kind = (q: string, c = ctx) => decideHandoffKind(routeIntent(q), c);

  it('cotizacion empresarial → QUOTE', () => {
    expect(kind('cotizar cumplimiento')).toBe('QUOTE');
  });
  it('cotizacion de personas (carro) → ADVISORY (no formulario empresarial)', () => {
    expect(kind('quiero cotizar seguro para mi carro')).toBe('ADVISORY');
  });
  it('precio de personas (vida) → ADVISORY', () => {
    expect(kind('cuanto cuesta un seguro de vida')).toBe('ADVISORY');
  });
  it('human_advisor → ADVISORY', () => {
    expect(kind('quiero hablar con un asesor')).toBe('ADVISORY');
  });
  it('whatsapp → WHATSAPP', () => {
    expect(kind('quiero escribir por whatsapp')).toBe('WHATSAPP');
  });
  it('siniestros → ADVISORY', () => {
    expect(kind('tuve un accidente con mi carro')).toBe('ADVISORY');
  });
  it('arrendamiento → ADVISORY', () => {
    expect(kind('arrendamiento')).toBe('ADVISORY');
  });
  it('informativo (hogar) → NONE', () => {
    expect(kind('seguro de hogar')).toBe('NONE');
  });
  it('general (que seguros manejan) → NONE', () => {
    expect(kind('que seguros manejan')).toBe('NONE');
  });
  it('off_topic → NONE', () => {
    expect(kind('capital de francia')).toBe('NONE');
  });
  it('garantía/indemnización → ADVISORY (evaluación humana, no cotización)', () => {
    expect(kind('me garantizan que me indemnizan')).toBe('ADVISORY');
  });
});

// ----------------------------------------------------------------------------
// decideCommercialHandoff — acciones públicas
// ----------------------------------------------------------------------------

describe('decideCommercialHandoff — acciones', () => {
  it('QUOTE empresarial devuelve cotización + asesoría (máx 2)', () => {
    const acts = decideCommercialHandoff(routeIntent('cotizar cumplimiento'), ctx);
    expect(acts.length).toBeLessThanOrEqual(2);
    expect(acts[0]!.type).toBe('quote');
    expect(acts.map((a) => a.type)).toContain('advisory');
  });

  it('cotización de personas (carro) → asesoría + WhatsApp, sin quote', () => {
    const acts = decideCommercialHandoff(routeIntent('quiero cotizar seguro para mi carro'), ctx);
    expect(acts.some((a) => a.type === 'quote')).toBe(false);
    expect(acts.some((a) => a.type === 'advisory')).toBe(true);
    expect(acts.some((a) => a.type === 'whatsapp')).toBe(true);
  });

  it('WHATSAPP devuelve whatsapp primero', () => {
    const acts = decideCommercialHandoff(routeIntent('quiero escribir por whatsapp'), ctx);
    expect(acts[0]!.type).toBe('whatsapp');
    expect(acts.length).toBeLessThanOrEqual(2);
  });

  it('ADVISORY (asesor) devuelve advisory primero', () => {
    const acts = decideCommercialHandoff(routeIntent('quiero hablar con un asesor'), ctx);
    expect(acts[0]!.type).toBe('advisory');
  });

  it('arrendamiento → advisory, sin cotizar', () => {
    const acts = decideCommercialHandoff(routeIntent('arrendamiento'), ctxFallback);
    expect(acts.some((a) => a.type === 'advisory')).toBe(true);
    expect(acts.some((a) => a.type === 'quote')).toBe(false);
  });

  it('off_topic → sin acciones', () => {
    expect(decideCommercialHandoff(routeIntent('capital de francia'), ctx)).toEqual([]);
  });

  it('informativo → sin acciones', () => {
    expect(decideCommercialHandoff(routeIntent('seguro de hogar'), ctx)).toEqual([]);
  });

  it('sin número WhatsApp: no ofrece whatsapp', () => {
    const acts = decideCommercialHandoff(routeIntent('quiero escribir por whatsapp'), {
      fallback: false,
      whatsappNumber: '',
    });
    expect(acts.some((a) => a.type === 'whatsapp')).toBe(false);
  });

  it('href de asesoría es exacto (/contacto)', () => {
    const acts = decideCommercialHandoff(routeIntent('quiero hablar con un asesor'), ctx);
    const advisory = acts.find((a) => a.type === 'advisory');
    expect(advisory?.href).toBe('/contacto');
  });

  it('QUOTE empresarial lleva contexto allowlisted en el href', () => {
    const acts = decideCommercialHandoff(routeIntent('cotizar cumplimiento'), ctx);
    const quote = acts.find((a) => a.type === 'quote');
    expect(quote?.href).toBe('/cotizar?service=seguros&interest=cumplimiento');
  });

  it('QUOTE de ARL/SST usa service allowlisted', () => {
    const arl = decideCommercialHandoff(routeIntent('quiero cotizar arl'), ctx).find((a) => a.type === 'quote');
    const sst = decideCommercialHandoff(routeIntent('quiero cotizar sg sst'), ctx).find((a) => a.type === 'quote');
    expect(arl?.href).toMatch(/^\/cotizar\?service=arl/);
    expect(sst?.href).toMatch(/^\/cotizar\?service=sst/);
    // Solo params allowlisted.
    expect(isSafeQuoteHref(arl!.href)).toBe(true);
    expect(isSafeQuoteHref(sst!.href)).toBe(true);
  });
});

// ----------------------------------------------------------------------------
// WhatsApp message — sin PII, contextual
// ----------------------------------------------------------------------------

describe('buildWhatsAppMessage', () => {
  it('incluye el producto cuando se conoce', () => {
    const msg = buildWhatsAppMessage(routeIntent('quiero cotizar seguro para mi carro'));
    expect(msg.toLowerCase()).toContain('seguro de veh');
  });

  it('no incluye sessionId, historial ni datos internos', () => {
    const msg = buildWhatsAppMessage(routeIntent('quiero hablar con un asesor'));
    expect(msg).not.toMatch(/session|uuid|confidence|intent|score|key/i);
  });

  it('el href de whatsapp apunta a wa.me con el número', () => {
    const acts = decideCommercialHandoff(routeIntent('quiero escribir por whatsapp'), ctx);
    const wa = acts.find((a) => a.type === 'whatsapp');
    expect(wa?.href.startsWith(`https://wa.me/${WA}`)).toBe(true);
  });
});

// ----------------------------------------------------------------------------
// sanitizeActions — allowlist
// ----------------------------------------------------------------------------

describe('sanitizeActions', () => {
  it('rechaza tipos no permitidos y hrefs arbitrarios', () => {
    const dirty = [
      { type: 'quote', label: 'Solicitar cotización', href: '/cotizar' },
      { type: 'advisory', label: 'Solicitar asesoría', href: 'https://evil.example' },
      { type: 'whatsapp', label: 'Escribir por WhatsApp', href: 'javascript:alert(1)' },
      { type: 'buy', label: 'Comprar', href: '/x' },
    ] as unknown as ChatAction[];
    const clean = sanitizeActions(dirty);
    expect(clean).toHaveLength(1);
    expect(clean[0]!.type).toBe('quote');
  });

  it('limita a 2 acciones', () => {
    const many: ChatAction[] = [
      { type: 'quote', label: 'Solicitar cotización', href: '/cotizar' },
      { type: 'advisory', label: 'Solicitar asesoría', href: '/contacto' },
      { type: 'whatsapp', label: 'Escribir por WhatsApp', href: 'https://wa.me/57300' },
    ];
    expect(sanitizeActions(many)).toHaveLength(2);
  });
});

// ----------------------------------------------------------------------------
// Formatter texto plano
// ----------------------------------------------------------------------------

describe('formatEntries — texto plano premium', () => {
  const e: RetrievableEntry = {
    key: 'k', topic: 'Seguro de vehículo', category: 'personas', subcategory: 'vehiculos',
    content: 'Orientación sobre protección de vehículos.', tags: 't', priority: 6,
  };
  it('no contiene sintaxis Markdown decorativa (** ## `)', () => {
    const out = formatEntries([e]);
    expect(out).not.toContain('**');
    expect(out).not.toContain('##');
    expect(out).not.toContain('`');
  });
  it('preserva topic y contenido en líneas separadas', () => {
    expect(formatEntries([e])).toBe('Seguro de vehículo\nOrientación sobre protección de vehículos.');
  });
});

// ----------------------------------------------------------------------------
// processMessageV2 — actions integradas
// ----------------------------------------------------------------------------

describe('processMessageV2 — actions', () => {
  const carEntry: RetrievableEntry = {
    key: 'personas-vehiculos-orientacion-general', topic: 'Seguro de vehículo',
    category: 'personas', subcategory: 'vehiculos', content: 'Orientación.', tags: 'v', priority: 6,
  };

  it('cotizar carro (personas) → asesoría/WhatsApp, sin quote', async () => {
    const { actions } = await processMessageV2('quiero cotizar seguro para mi carro', [], {
      retrieve: async () => [carEntry],
      whatsappNumber: WA,
    });
    expect(actions.some((a) => a.type === 'quote')).toBe(false);
    expect(actions.some((a) => a.type === 'advisory')).toBe(true);
    expect(actions.length).toBeLessThanOrEqual(2);
  });

  it('cotizar cumplimiento (empresarial) → incluye acción quote con contexto', async () => {
    const cumpEntry: RetrievableEntry = {
      key: 'empresas-cumplimiento-orientacion-general', topic: 'Cumplimiento',
      category: 'empresas', subcategory: 'cumplimiento', content: 'Orientación.', tags: 'c', priority: 8,
    };
    const { actions } = await processMessageV2('cotizar cumplimiento', [], {
      retrieve: async () => [cumpEntry],
      whatsappNumber: WA,
    });
    const quote = actions.find((a) => a.type === 'quote');
    expect(quote?.href).toBe('/cotizar?service=seguros&interest=cumplimiento');
  });

  it('informativo (hogar) → sin acciones', async () => {
    const { actions } = await processMessageV2('seguro de hogar', [], {
      retrieve: async () => [{ ...carEntry, key: 'personas-hogar-orientacion-general', subcategory: 'hogar', topic: 'Hogar' }],
      whatsappNumber: WA,
    });
    expect(actions).toEqual([]);
  });

  it('off_topic → sin acciones', async () => {
    const { actions } = await processMessageV2('capital de francia', [], {
      retrieve: async () => [],
      whatsappNumber: WA,
    });
    expect(actions).toEqual([]);
  });

  it('arrendamiento (retrieval 0) → acción advisory, no quote', async () => {
    const { actions, meta } = await processMessageV2('arrendamiento', [], {
      retrieve: async () => [],
      whatsappNumber: WA,
    });
    expect(meta.fallback).toBe(true);
    expect(actions.some((a) => a.type === 'advisory')).toBe(true);
    expect(actions.some((a) => a.type === 'quote')).toBe(false);
  });
});

// ----------------------------------------------------------------------------
// 5B.3.1 — comparación, quote href allowlist, prefill
// ----------------------------------------------------------------------------

describe('comparación/recomendación → ADVISORY', () => {
  const kind = (q: string) => decideHandoffKind(routeIntent(q), ctx);
  it('"cual es la mejor cobertura" → ADVISORY', () => {
    expect(kind('cual es la mejor cobertura')).toBe('ADVISORY');
  });
  it('"que cobertura me conviene" → ADVISORY', () => {
    expect(kind('que cobertura me conviene')).toBe('ADVISORY');
  });
  it('"cual me recomiendan" → ADVISORY', () => {
    expect(kind('cual me recomiendan')).toBe('ADVISORY');
  });
});

describe('isSafeQuoteHref — allowlist de query', () => {
  it('acepta /cotizar y query allowlisted', () => {
    expect(isSafeQuoteHref('/cotizar')).toBe(true);
    expect(isSafeQuoteHref('/cotizar?service=seguros&interest=cumplimiento')).toBe(true);
    expect(isSafeQuoteHref('/cotizar?service=arl')).toBe(true);
  });
  it('rechaza service/interest fuera de allowlist', () => {
    expect(isSafeQuoteHref('/cotizar?service=hacking')).toBe(false);
    expect(isSafeQuoteHref('/cotizar?interest=cedula')).toBe(false);
  });
  it('rechaza parámetros no permitidos (posible PII/texto libre)', () => {
    expect(isSafeQuoteHref('/cotizar?email=juan@x.com')).toBe(false);
    expect(isSafeQuoteHref('/cotizar?nit=900123')).toBe(false);
    expect(isSafeQuoteHref('/cotizar?q=texto+libre')).toBe(false);
  });
});

describe('el href de QUOTE nunca contiene PII', () => {
  it('cotizar cumplimiento no incluye email/nit/telefono/nombre', () => {
    const acts = decideCommercialHandoff(routeIntent('cotizar cumplimiento'), ctx);
    const quote = acts.find((a) => a.type === 'quote');
    expect(quote?.href).not.toMatch(/email|nit|telefono|nombre|cedula|@/i);
  });
});
