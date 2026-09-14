import { describe, it, expect } from 'vitest';
import { routeIntent } from '@/lib/ai/routing/intent-router';
import {
  decideHandoffKind,
  decideCommercialHandoff,
  buildWhatsAppMessage,
  sanitizeActions,
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

  it('cotizacion → QUOTE', () => {
    expect(kind('quiero cotizar seguro para mi carro')).toBe('QUOTE');
  });
  it('precio/prima/valor (wantsCommercial) → QUOTE', () => {
    expect(kind('cuanto cuesta un seguro de vida')).toBe('QUOTE');
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
  it('QUOTE devuelve cotización + asesoría (máx 2)', () => {
    const acts = decideCommercialHandoff(routeIntent('quiero cotizar seguro para mi carro'), ctx);
    expect(acts.length).toBeLessThanOrEqual(2);
    expect(acts[0]!.type).toBe('quote');
    expect(acts.map((a) => a.type)).toContain('advisory');
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

  it('href de acciones internas es exacto', () => {
    const acts = decideCommercialHandoff(routeIntent('quiero cotizar'), ctx);
    const quote = acts.find((a) => a.type === 'quote');
    const advisory = acts.find((a) => a.type === 'advisory');
    expect(quote?.href).toBe('/cotizar');
    expect(advisory?.href).toBe('/contacto');
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

  it('cotizar carro → incluye acción quote', async () => {
    const { actions } = await processMessageV2('quiero cotizar seguro para mi carro', [], {
      retrieve: async () => [carEntry],
      whatsappNumber: WA,
    });
    expect(actions.some((a) => a.type === 'quote')).toBe(true);
    expect(actions.length).toBeLessThanOrEqual(2);
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
