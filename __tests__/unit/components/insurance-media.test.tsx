import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

/**
 * BLOQUE 5A.4 — integración de imágenes reales de seguros.
 *
 * Verifica que cada sección usa su asset, que la asesora (Agente_IA) NO aparece
 * en el Hero, que las imágenes below-the-fold no usan priority y tienen sizes,
 * y que no hay interactive nesting en las media cards.
 */

// next/image → <img> capturando fill/priority/sizes como atributos legibles.
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, sizes, style, ...props }: any) =>
    React.createElement('img', {
      src,
      alt,
      'data-fill': fill ? 'true' : undefined,
      'data-priority': priority ? 'true' : 'false',
      'data-sizes': sizes,
      ...props,
    }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, legacyBehavior, passHref, ...props }: any) => {
    if (legacyBehavior) {
      return React.cloneElement(React.Children.only(children), { href });
    }
    return React.createElement('a', { href, ...props }, children);
  },
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get:
        (_t, tag: string) =>
        ({ children, ...props }: any) => {
          const {
            initial: _i,
            animate: _a,
            whileInView: _w,
            whileHover: _wh,
            whileTap: _wt,
            variants: _v,
            transition: _tr,
            viewport: _vp,
            ...rest
          } = props;
          return React.createElement(tag, rest, children);
        },
    }
  ),
  useReducedMotion: () => false,
}));

vi.mock('lucide-react', () => {
  const Icon = (props: any) => <span data-testid="icon" aria-hidden="true" {...props} />;
  return {
    ShieldCheck: Icon,
    ArrowRight: Icon,
    Users: Icon,
    Home: Icon,
    Cog: Icon,
    Activity: Icon,
    Loader2: Icon,
    Car: Icon,
    Building2: Icon,
  };
});

import HeroSection from '@/components/sections/HeroSection';
import HeroMedia from '@/components/sections/HeroMedia';
import InsuranceShowcaseSection from '@/components/sections/InsuranceShowcaseSection';
import CorporateSection from '@/components/shared/CorporateSection';
import { fireEvent } from '@testing-library/react';

function imgs(container: HTMLElement) {
  return Array.from(container.querySelectorAll('img'));
}

describe('5A.4 — Hero usa SeguroIntegral (no la asesora)', () => {
  it('el Hero incluye SeguroIntegral.png como imagen principal con priority y sizes', () => {
    const { container } = render(<HeroSection />);
    const hero = imgs(container).find((i) => (i.getAttribute('src') || '').includes('SeguroIntegral'));
    expect(hero).toBeDefined();
    expect(hero?.getAttribute('data-priority')).toBe('true');
    expect(hero?.getAttribute('data-sizes')).toBeTruthy();
  });

  it('la asesora (Agente_IA) NO aparece en el Hero', () => {
    const { container } = render(<HeroSection />);
    const advisor = imgs(container).find((i) => (i.getAttribute('src') || '').includes('Agente_IA'));
    expect(advisor).toBeUndefined();
  });

  it('el Hero conserva solo los 2 CTA (sin bloque de accesos)', () => {
    const { container } = render(<HeroSection />);
    expect(container.querySelectorAll('a').length).toBe(2);
  });
});

describe('5A.4 — Showcase (Personas, Hogar, Vehículo)', () => {
  it('Personas usa las dos imágenes suministradas', () => {
    const { container } = render(<InsuranceShowcaseSection />);
    const srcs = imgs(container).map((i) => i.getAttribute('src') || '');
    expect(srcs.some((s) => s.includes('SegurosPersonas3'))).toBe(true);
    expect(srcs.some((s) => s.includes('SegurosPersonas2'))).toBe(true);
  });

  it('Hogar usa Hogar-protegido y Vehículo usa Vehiculo', () => {
    const { container } = render(<InsuranceShowcaseSection />);
    const srcs = imgs(container).map((i) => i.getAttribute('src') || '');
    expect(srcs.some((s) => s.includes('Hogar-protegido'))).toBe(true);
    expect(srcs.some((s) => s.includes('Vehiculo'))).toBe(true);
  });

  it('las imágenes del showcase (below-the-fold) NO usan priority', () => {
    const { container } = render(<InsuranceShowcaseSection />);
    imgs(container).forEach((i) => {
      expect(i.getAttribute('data-priority')).toBe('false');
    });
  });

  it('todas las imágenes del showcase definen sizes', () => {
    const { container } = render(<InsuranceShowcaseSection />);
    imgs(container).forEach((i) => {
      expect(i.getAttribute('data-sizes')).toBeTruthy();
    });
  });

  it('las media cards enlazadas no anidan <button> dentro de <a>', () => {
    const { container } = render(<InsuranceShowcaseSection />);
    expect(container.querySelectorAll('a button').length).toBe(0);
    // Y existen enlaces reales (Hogar → /servicios, Vehículo → /contacto).
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/servicios');
    expect(hrefs).toContain('/contacto');
  });

  it('las media cards usan aspect responsive (4:3 móvil → 16:9 desktop)', () => {
    const { container } = render(<InsuranceShowcaseSection />);
    const html = container.innerHTML;
    expect(html).toContain('aspect-[4/3]');
    expect(html).toContain('lg:aspect-[16/9]');
  });
});

describe('5A.6 — Hero fallback real', () => {
  it('muestra SeguroIntegral por defecto (sin fallback visible)', () => {
    const { container } = render(<HeroMedia />);
    const hero = imgs(container).find((i) => (i.getAttribute('src') || '').includes('SeguroIntegral'));
    expect(hero).toBeDefined();
  });

  it('ante error de carga, sustituye por el fallback y ya no muestra la imagen', () => {
    const { container } = render(<HeroMedia />);
    const hero = imgs(container).find((i) => (i.getAttribute('src') || '').includes('SeguroIntegral'));
    expect(hero).toBeDefined();
    // Disparar el error real de carga de la imagen.
    fireEvent.error(hero!);
    // La imagen SeguroIntegral ya no está (se muestra el fallback en su lugar).
    const heroAfter = imgs(container).find((i) => (i.getAttribute('src') || '').includes('SeguroIntegral'));
    expect(heroAfter).toBeUndefined();
  });
});

describe('5A.4 — Empresas usa SegurosEmpresas', () => {
  it('CorporateSection incluye SegurosEmpresas y sin priority', () => {
    const { container } = render(<CorporateSection />);
    const emp = imgs(container).find((i) => (i.getAttribute('src') || '').includes('SegurosEmpresas'));
    expect(emp).toBeDefined();
    expect(emp?.getAttribute('data-priority')).toBe('false');
    expect(emp?.getAttribute('data-sizes')).toBeTruthy();
  });
});
