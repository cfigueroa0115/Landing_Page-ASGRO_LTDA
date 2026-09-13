import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * BLOQUE 5A.8 — sistema de iconos editorial unificado, ritmo vertical y a11y.
 */

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get:
        (_t, tag: string) =>
        ({ children, ...props }: any) => {
          const { whileHover: _wh, whileInView: _w, initial: _i, animate: _a, transition: _tr, viewport: _vp, ...rest } = props;
          return React.createElement(tag, rest, children);
        },
    }
  ),
  useReducedMotion: () => false,
}));

vi.mock('lucide-react', () => {
  const Icon = (props: any) => <span data-testid="icon" aria-hidden="true" {...props} />;
  return { Check: Icon, Search: Icon };
});

import PremiumIconBadge from '@/components/shared/PremiumIconBadge';
import ProcessStep from '@/components/shared/ProcessStep';
import { Search } from 'lucide-react';

// ─── PremiumIconBadge como sistema único ────────────────────────────────────
describe('5A.8 — PremiumIconBadge sizes', () => {
  it('size sm renderiza el contenedor 40px y es aria-hidden', () => {
    const { container } = render(<PremiumIconBadge icon={Search} size="sm" />);
    const badge = container.querySelector('span[aria-hidden="true"]');
    expect(badge?.className).toContain('h-[40px]');
  });
});

// ─── 6B — variantes del sistema iconográfico ────────────────────────────────
describe('6B — PremiumIconBadge variantes', () => {
  function badge(el: HTMLElement) {
    return el.querySelector('span[aria-hidden="true"][data-variant]') as HTMLElement | null;
  }

  it('navigation → tamaño compacto (40px) y data-variant', () => {
    const { container } = render(<PremiumIconBadge icon={Search} variant="navigation" />);
    const b = badge(container);
    expect(b?.getAttribute('data-variant')).toBe('navigation');
    expect(b?.className).toContain('h-[40px]');
  });

  it('feature → tamaño feature (54px) por defecto', () => {
    const { container } = render(<PremiumIconBadge icon={Search} variant="feature" />);
    const b = badge(container);
    expect(b?.getAttribute('data-variant')).toBe('feature');
    expect(b?.className).toContain('h-[54px]');
  });

  it('metric → data-variant metric', () => {
    const { container } = render(<PremiumIconBadge icon={Search} variant="metric" />);
    expect(badge(container)?.getAttribute('data-variant')).toBe('metric');
  });

  it('process con number → data-variant process y muestra el número', () => {
    const { container, getByText } = render(
      <PremiumIconBadge icon={Search} variant="process" number={3} />
    );
    expect(badge(container)?.getAttribute('data-variant')).toBe('process');
    expect(getByText('3')).toBeInTheDocument();
  });

  it('tone dark aplica superficie oscura (para fondos oscuros)', () => {
    const { container } = render(
      <PremiumIconBadge icon={Search} variant="feature" tone="dark" />
    );
    // La superficie oscura usa un gradiente radial con el azul profundo.
    expect(badge(container)?.className).toMatch(/rgba\(1,25,48/);
  });

  it('es decorativo (aria-hidden) — el nombre accesible vive en el padre', () => {
    const { container } = render(<PremiumIconBadge icon={Search} variant="feature" />);
    expect(badge(container)).not.toBeNull();
  });
});

describe('6B — call sites usan la variante correcta', () => {
  function read(rel: string) {
    return fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
  }
  it('QuickAccess usa variant="navigation"', () => {
    expect(read('src/components/sections/QuickAccessSection.tsx')).toContain('variant="navigation"');
  });
  it('Portfolio grupo usa feature; InsuranceCard usa navigation', () => {
    expect(read('src/components/sections/InsurancePortfolioSection.tsx')).toContain('variant="feature"');
    expect(read('src/components/shared/InsuranceCard.tsx')).toContain('variant="navigation"');
  });
  it('ProcessStep y /metodologia usan variant="process"', () => {
    expect(read('src/components/shared/ProcessStep.tsx')).toContain('variant="process"');
    expect(read('src/app/metodologia/page.tsx')).toContain('variant="process"');
  });
  it('/resultados usa variant="metric"', () => {
    expect(read('src/app/resultados/page.tsx')).toContain('variant="metric"');
  });
  it('ComplementarySection usa variant="feature"', () => {
    expect(read('src/components/sections/ComplementarySection.tsx')).toContain('variant="feature"');
  });
});

describe('6B.1 — PremiumIconBadge sin modificadores de opacidad no estándar', () => {
  it('no usa /12, /18 ni /22 como modificador de opacidad de utility', () => {
    const src = read('src/components/shared/PremiumIconBadge.tsx');
    // Modificador de opacidad de Tailwind sobre color: -<color>/NN (fuera de []).
    // Los no estándar (12/18/22...) deben expresarse como /[0.NN].
    const nonStandard = /-(?:brand-blue|brand-green|white|black)\/(?:12|18|22|33|45|55|65|85)\b/;
    expect(nonStandard.test(src)).toBe(false);
    // Confirmar que se migraron a sintaxis arbitraria explícita.
    expect(src).toContain('/[0.12]');
    expect(src).toContain('/[0.18]');
    expect(src).toContain('/[0.22]');
  });
});

// ─── ProcessStep a11y "Paso N" ──────────────────────────────────────────────
describe('5A.8 — ProcessStep expone "Paso N" a lectores de pantalla', () => {
  it('incluye el texto sr-only "Paso 2"', () => {
    render(<ProcessStep step={2} icon={Search} title="Analizar" description="x" />);
    expect(screen.getByText('Paso 2')).toBeInTheDocument();
  });
});

// ─── Migración de iconografía (verificación por código fuente) ───────────────
function read(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
}

describe('5A.8 — componentes editoriales usan PremiumIconBadge', () => {
  const files = [
    'src/components/sections/QuickAccessSection.tsx',
    'src/components/sections/InsurancePortfolioSection.tsx',
    'src/components/sections/ComplementarySection.tsx',
    'src/components/shared/ValueCard.tsx',
    'src/components/shared/InsuranceCard.tsx',
    'src/components/sections/TrustSection.tsx',
    'src/components/sections/ValueGeneratedSection.tsx',
    'src/components/shared/CorporateSection.tsx',
  ];
  for (const f of files) {
    it(`${f} importa/usa PremiumIconBadge`, () => {
      expect(read(f)).toContain('PremiumIconBadge');
    });
  }
});

describe('5A.8 — PremiumCard: reduced-motion e icono sin doble contenedor', () => {
  it('usa useReducedMotion y no aplica el gradient container antiguo', () => {
    const src = read('src/components/shared/PremiumCard.tsx');
    expect(src).toContain('useReducedMotion');
    expect(src).not.toContain('from-brand-green/20 to-brand-blue/10');
  });
});

// ─── Ritmo vertical: sin py-12/md:py-16 problemáticos en las secciones home ──
describe('5A.8 — ritmo vertical normalizado (sin py-12/md:py-16)', () => {
  const sections = [
    'src/components/sections/ValuePropositionSection.tsx',
    'src/components/sections/InsurancePortfolioSection.tsx',
    'src/components/sections/WhyChooseSection.tsx',
    'src/components/sections/TrustSection.tsx',
    'src/components/sections/ValueGeneratedSection.tsx',
    'src/components/sections/ComplementarySection.tsx',
    'src/components/home/HomeMethodologyCompact.tsx',
  ];
  for (const f of sections) {
    it(`${f} no usa "py-12 md:py-16"`, () => {
      expect(read(f)).not.toContain('py-12 md:py-16');
    });
  }
});

// ─── 5A.8.1 — Cierre de consistencia de micrositios ─────────────────────────
describe('5A.8.1 — PageHero spacing explícito', () => {
  it('PageHero no usa "py-12 md:py-16" (usa py-[48px] md:py-[64px])', () => {
    const src = read('src/components/shared/PageHero.tsx');
    expect(src).not.toContain('py-12 md:py-16');
    expect(src).toContain('py-[48px] md:py-[64px]');
  });
});

describe('5A.8.1 — /metodologia sistema premium y spacing', () => {
  const src = () => read('src/app/metodologia/page.tsx');
  it('usa PremiumIconBadge y ya no el círculo gradient de 64px', () => {
    expect(src()).toContain('PremiumIconBadge');
    expect(src()).not.toContain('from-brand-green to-brand-blue shadow-lg');
  });
  it('conserva las 5 fases numeradas (number 1..5)', () => {
    const s = src();
    for (const n of [1, 2, 3, 4, 5]) expect(s).toContain(`number: ${n},`);
  });
  it('normaliza el spacing (sin py-10 md:py-14)', () => {
    expect(src()).not.toContain('py-10 md:py-14');
    expect(src()).toContain('py-[48px] md:py-[64px]');
  });
});

describe('5A.8.1 — /resultados sistema premium y spacing', () => {
  const src = () => read('src/app/resultados/page.tsx');
  it('usa PremiumIconBadge para las métricas', () => {
    expect(src()).toContain('PremiumIconBadge');
    expect(src()).not.toContain('from-brand-green/20 to-brand-blue/10');
  });
  it('conserva los valores de contenido 4/5/360°/100%/24/7', () => {
    const s = src();
    for (const v of ["'4'", "'5'", "'360°'", "'100%'", "'24/7'"]) expect(s).toContain(v);
  });
  it('normaliza el spacing (sin py-10 md:py-14 ni py-10 md:py-12)', () => {
    const s = src();
    expect(s).not.toContain('py-10 md:py-14');
    expect(s).not.toContain('py-10 md:py-12');
    expect(s).toContain('py-[48px] md:py-[64px]');
  });
});

// ─── WhatsApp panel: spacing interno explícito ──────────────────────────────
describe('5A.8 — WhatsApp panel usa spacing explícito', () => {
  it('el mini-panel no usa px-4/py-3/p-4/px-3 en su interior', () => {
    const src = read('src/components/shared/FloatingWhatsApp.tsx');
    expect(src).toContain('px-[16px] py-[12px]');
    expect(src).toContain('p-[16px]');
    // No deben quedar las utilities de escala custom en el panel.
    expect(src).not.toContain('bg-brand-light-gray/60 p-4');
    expect(src).not.toContain('bg-[#075E54] px-4 py-3');
  });
});
