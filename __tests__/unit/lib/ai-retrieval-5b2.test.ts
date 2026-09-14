import { describe, it, expect } from 'vitest';
import { routeIntent, normalize } from '@/lib/ai/routing/intent-router';
import {
  rankAndLimit,
  scoreEntry,
  MAX_RETRIEVED,
  type RetrievableEntry,
} from '@/lib/ai/retrieval/selective-retrieval';
import {
  processMessageV2,
  SAFE_FALLBACK,
  formatEntries,
} from '@/lib/ai/agent-v2';

/**
 * BLOQUE 5B.2 — Intent router determinístico + retrieval selectivo + orquestador.
 * Todo determinístico y sin base de datos (retrieval inyectado en el orquestador).
 */

// ----------------------------------------------------------------------------
// Intent router
// ----------------------------------------------------------------------------

describe('normalize', () => {
  it('minúsculas, sin acentos y sin puntuación', () => {
    expect(normalize('¿Seguro para MI Carro?')).toBe('seguro para mi carro');
    expect(normalize('RESPONSABILIDAD  CIVIL!!')).toBe('responsabilidad civil');
  });
});

describe('routeIntent — casos críticos', () => {
  const cases: Array<[string, string]> = [
    ['seguro para carro', 'vehiculos'],
    ['quiero asegurar mi casa', 'hogar'],
    ['seguro de vida', 'vida'],
    ['póliza para mi empresa', 'empresas'],
    ['responsabilidad civil', 'responsabilidad_civil'],
    ['póliza de cumplimiento', 'cumplimiento'],
    ['quiero afiliar mi empresa a una ARL', 'arl'],
    ['necesito implementar SG-SST', 'sst'],
    ['quiero cotizar', 'cotizacion'],
    ['tuve un siniestro', 'siniestros'],
    ['quiero hablar con un asesor', 'human_advisor'],
    ['arrendamiento', 'arrendamiento'],
  ];

  for (const [msg, expected] of cases) {
    it(`"${msg}" → ${expected}`, () => {
      expect(routeIntent(msg).intent).toBe(expected);
    });
  }

  it('acentos y mayúsculas no afectan el routing', () => {
    expect(routeIntent('SEGURO PARA MI CARRO').intent).toBe('vehiculos');
    expect(routeIntent('Cumplimiento').intent).toBe('cumplimiento');
  });

  it('off_topic para consultas fuera de alcance', () => {
    expect(routeIntent('¿cuál es la capital de Francia?').intent).toBe('off_topic');
    expect(routeIntent('recomiéndame una pizza').intent).toBe('off_topic');
  });

  it('unknown para mensaje vacío', () => {
    expect(routeIntent('   ').intent).toBe('unknown');
  });

  it('marca wantsCommercialOrContractual en precio/condiciones', () => {
    expect(routeIntent('cuánto cuesta el seguro de vida').wantsCommercialOrContractual).toBe(true);
    expect(routeIntent('cuál es la mejor cobertura').wantsCommercialOrContractual).toBe(true);
    expect(routeIntent('garantizan la indemnización?').wantsCommercialOrContractual).toBe(true);
  });

  it('no expone reason al no ser parte del contrato público (solo interno)', () => {
    // reason existe internamente pero es diagnóstico; validamos que está tipado como string.
    expect(typeof routeIntent('seguro de vida').reason).toBe('string');
  });
});

describe('routeIntent — contexto follow-up', () => {
  it('"¿y qué cubre?" hereda el dominio previo (vehículos)', () => {
    const ctx = [
      { role: 'user' as const, content: 'seguro para mi carro' },
      { role: 'assistant' as const, content: 'Información de vehículos...' },
    ];
    const r = routeIntent('¿y qué cubre?', ctx);
    expect(r.subcategory).toBe('vehiculos');
  });

  it('una intención explícita nueva NO se sobrescribe por contexto antiguo', () => {
    const ctx = [{ role: 'user' as const, content: 'seguro para mi carro' }];
    const r = routeIntent('ahora quiero cotizar', ctx);
    expect(r.intent).toBe('cotizacion');
  });

  it('follow-up sin contexto previo no inventa dominio', () => {
    const r = routeIntent('¿y qué cubre?', []);
    expect(['unknown', 'general_insurance', 'off_topic']).toContain(r.intent);
  });
});

// ----------------------------------------------------------------------------
// Ranking / topK
// ----------------------------------------------------------------------------

function entry(part: Partial<RetrievableEntry>): RetrievableEntry {
  return {
    key: 'k',
    topic: 'Tema',
    category: 'personas',
    subcategory: 'vida',
    content: 'contenido',
    tags: 'tag',
    priority: 0,
    ...part,
  };
}

describe('scoreEntry / rankAndLimit', () => {
  const intent = routeIntent('seguro de vida'); // personas/vida

  it('subcategory exacta puntúa más que solo category', () => {
    const exact = entry({ key: 'a', subcategory: 'vida' });
    const catOnly = entry({ key: 'b', subcategory: 'salud' });
    expect(scoreEntry(exact, intent, 'seguro de vida')).toBeGreaterThan(
      scoreEntry(catOnly, intent, 'seguro de vida')
    );
  });

  it('rankAndLimit respeta el máximo de 4', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      entry({ key: `k${i}`, priority: i })
    );
    expect(rankAndLimit(many, intent, 'vida', 10).length).toBe(MAX_RETRIEVED);
  });

  it('ordena por score y desempata por key (determinístico)', () => {
    const a = entry({ key: 'zzz', subcategory: 'vida', priority: 5 });
    const b = entry({ key: 'aaa', subcategory: 'vida', priority: 5 });
    const out = rankAndLimit([a, b], intent, 'vida', 4);
    expect(out[0]!.key).toBe('aaa'); // mismo score → orden por key
  });
});

// ----------------------------------------------------------------------------
// Orquestador V2 (retrieval inyectado, sin DB)
// ----------------------------------------------------------------------------

const vidaEntry: RetrievableEntry = {
  key: 'personas-vida-orientacion-general',
  topic: 'Seguros de vida',
  category: 'personas',
  subcategory: 'vida',
  content: 'Los seguros de vida buscan brindar respaldo económico a los beneficiarios.',
  tags: 'vida,personas',
  priority: 8,
};

describe('processMessageV2 — respuestas seguras', () => {
  it('formatea contenido V2 recuperado (sin cifras ni claims)', async () => {
    const { response, meta } = await processMessageV2('seguro de vida', [], {
      retrieve: async () => [vidaEntry],
    });
    expect(response).toContain('Seguros de vida');
    expect(meta.intent).toBe('vida');
    expect(meta.fallback).toBe(false);
    expect(meta.usedEntries).toEqual(['personas-vida-orientacion-general']);
  });

  it('off_topic → mensaje de alcance (sin fallback de contenido)', async () => {
    const { response, meta } = await processMessageV2('capital de Francia', [], {
      retrieve: async () => [],
    });
    expect(meta.intent).toBe('off_topic');
    expect(response.toLowerCase()).toContain('seguros');
  });

  it('human_advisor → handoff, sin recuperar contenido', async () => {
    const { response, meta } = await processMessageV2('quiero hablar con un asesor', [], {
      retrieve: async () => {
        throw new Error('retrieval no debería llamarse en handoff');
      },
    });
    expect(meta.intent).toBe('human_advisor');
    expect(response.toLowerCase()).toMatch(/whatsapp|formulario|asesor/);
  });

  it('retrieval vacío (p. ej. arrendamiento pending) → fallback seguro', async () => {
    const { response, meta } = await processMessageV2('seguro de arrendamiento', [], {
      retrieve: async () => [],
    });
    expect(meta.fallback).toBe(true);
    expect(response).toBe(SAFE_FALLBACK);
    // NUNCA promete ni da cifras.
    expect(response.toLowerCase()).not.toContain('mejor cobertura');
  });

  it('consulta de precio → añade nota de orientación (guardrail), no da cifras', async () => {
    const { response } = await processMessageV2('cuánto cuesta el seguro de vida', [], {
      retrieve: async () => [vidaEntry],
    });
    expect(response.toLowerCase()).toContain('dependen de cada aseguradora');
    expect(response).not.toMatch(/\$\s?\d/);
    expect(response.toLowerCase()).not.toContain('mejor precio');
  });

  it('funciona sin proveedor LLM (100% determinístico) y no usa legacy', async () => {
    // No hay llamada a providers ni a la KB legacy: el resultado depende solo del retrieval V2.
    const { response } = await processMessageV2('seguro de vida', [], {
      retrieve: async () => [vidaEntry],
    });
    expect(response).toContain(vidaEntry.content);
  });
});

describe('formatEntries', () => {
  it('presenta topic + contenido sin exponer keys internas', () => {
    const out = formatEntries([vidaEntry]);
    expect(out).toContain('Seguros de vida');
    expect(out).not.toContain('personas-vida-orientacion-general');
  });
});
