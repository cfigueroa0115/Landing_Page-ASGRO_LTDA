import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

/**
 * Tests del BLOQUE 4G — respeto de prefers-reduced-motion.
 *
 * Verifica que Hero y PremiumButton renderizan y muestran su contenido bajo
 * prefers-reduced-motion: reduce (sin depender de animación para ser visibles).
 */

// framer-motion: pasar props de animación pero renderizar el elemento tal cual.
// Preservamos useReducedMotion real (lee matchMedia mockeado).
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  const passthrough = (tag: string) =>
    ({ children, ...props }: any) => {
      // Descartar props exclusivas de motion que no van al DOM.
      const {
        whileHover: _wh,
        whileTap: _wt,
        variants: _v,
        initial: _i,
        animate: _a,
        transition: _t,
        ...rest
      } = props;
      return React.createElement(tag, rest, children);
    };
  return {
    ...actual,
    motion: new Proxy({}, { get: (_t, tag: string) => passthrough(tag) }),
  };
});

// next/link mock que emula legacyBehavior: cuando legacyBehavior está activo,
// NO renderiza su propio <a> y en su lugar clona el hijo pasándole el href
// (igual que el Next real). Sin legacyBehavior, envuelve en <a>.
vi.mock('next/link', () => ({
  default: ({ children, href, legacyBehavior, passHref, ...props }: any) => {
    if (legacyBehavior) {
      return React.cloneElement(React.Children.only(children), { href });
    }
    return React.createElement('a', { href, ...props }, children);
  },
}));

vi.mock('lucide-react', () => {
  const Icon = (props: any) => <span data-testid="icon" aria-hidden="true" {...props} />;
  return {
    ShieldCheck: Icon,
    Loader2: Icon,
    Shield: Icon,
    ArrowRight: Icon,
    MessageCircle: Icon,
    // CorporateSection
    Users: Icon,
    Home: Icon,
    Cog: Icon,
    Activity: Icon,
    // ProcessStep / methodology
    Search: Icon,
    ClipboardList: Icon,
    Handshake: Icon,
    LifeBuoy: Icon,
  };
});

// next/navigation (por si algún componente usa usePathname indirectamente)
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

function mockMatchMedia(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduce : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

import HeroSection from '@/components/sections/HeroSection';
import PremiumButton from '@/components/shared/PremiumButton';
import SectionHeader from '@/components/shared/SectionHeader';
import ProcessStep from '@/components/shared/ProcessStep';
import AnimatedSection from '@/components/shared/AnimatedSection';
import CorporateSection from '@/components/shared/CorporateSection';
import SectionCTA from '@/components/shared/SectionCTA';
import { ShieldCheck } from 'lucide-react';

beforeEach(() => {
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '573001234567';
  mockMatchMedia(true); // reduced motion activo
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Reduced motion', () => {
  it('Hero: el contenido (H1 y CTAs) es visible con reduced-motion', () => {
    render(<HeroSection />);
    // El titular y los CTAs deben estar presentes (aparición inmediata).
    expect(
      screen.getByRole('heading', { level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /solicitar asesoría/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /conocer soluciones/i })
    ).toBeInTheDocument();
  });

  it('PremiumButton: renderiza y muestra su contenido con reduced-motion', () => {
    render(<PremiumButton variant="primary">Enviar</PremiumButton>);
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('PremiumButton: en loading muestra feedback (spinner con clase motion-safe)', () => {
    const { container } = render(
      <PremiumButton variant="primary" loading>
        Enviar
      </PremiumButton>
    );
    // El spinner usa motion-safe:animate-spin (no animate-spin incondicional).
    const spinner = container.querySelector('.motion-safe\\:animate-spin');
    expect(spinner).not.toBeNull();
    // No debe existir animate-spin incondicional.
    expect(container.querySelector('.animate-spin')).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════
// BLOQUE 4J — hardening a11y, semántica y contraste
// ═══════════════════════════════════════════════════════════════════

describe('4J — semántica: sin nesting interactivo <a><button>', () => {
  beforeEach(() => {
    mockMatchMedia(false); // motion normal, no afecta la semántica
  });

  it('SectionCTA (CTA primario, secundario y WhatsApp) no anida <button> dentro de <a>', () => {
    const { container } = render(
      <SectionCTA
        title="Conversemos"
        subtitle="Sub"
        primaryAction={{ label: 'Hablar con un asesor', href: '/contacto' }}
        secondaryAction={{ label: 'Cotizar', href: '/cotizar' }}
        whatsappAction
      />
    );
    // Requisito 4J: no debe existir un <button> dentro de un <a>.
    expect(container.querySelectorAll('a button').length).toBe(0);
    // Los CTA de navegación (primario + secundario) son enlaces <a>.
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThanOrEqual(2);
    // Y no debe quedar ningún <button> (todos son <a> polimórficos).
    expect(container.querySelector('button')).toBeNull();
  });

  it('CorporateSection no anida <button> dentro de <a>', () => {
    const { container } = render(<CorporateSection />);
    expect(container.querySelectorAll('a button').length).toBe(0);
  });

  it('PremiumButton con href renderiza un <a> (no <button>)', () => {
    const { container } = render(
      <PremiumButton href="/contacto" variant="primary">
        Ir
      </PremiumButton>
    );
    expect(container.querySelector('a')).not.toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });

  it('PremiumButton sin href sigue renderizando un <button>', () => {
    const { container } = render(
      <PremiumButton variant="primary">Enviar</PremiumButton>
    );
    expect(container.querySelector('button')).not.toBeNull();
  });
});

describe('4J — contraste: eyebrow y badge', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it('SectionHeader en superficie clara usa text-brand-blue (AA), no verde', () => {
    const { container } = render(
      <SectionHeader eyebrow="Propuesta de valor" title="Título" />
    );
    const eyebrow = container.querySelector('.brand-eyebrow');
    expect(eyebrow).not.toBeNull();
    // No debe forzar neon-green (eso es solo para fondos oscuros).
    expect(eyebrow?.className).not.toContain('text-brand-neon-green');
  });

  it('SectionHeader tone="light" usa neon-green para contraste sobre oscuro', () => {
    const { container } = render(
      <SectionHeader eyebrow="Empresas" title="Título" tone="light" />
    );
    const eyebrow = container.querySelector('.brand-eyebrow');
    expect(eyebrow?.className).toContain('text-brand-neon-green');
  });

  it('ProcessStep: el número del badge usa text-brand-dark-blue (no blanco)', () => {
    const { container } = render(
      <ProcessStep step={1} icon={ShieldCheck} title="Entender" description="Desc" />
    );
    // El badge es el span con bg-brand-green que contiene el número.
    const badge = Array.from(container.querySelectorAll('span')).find(
      (el) => el.className.includes('bg-brand-green') && el.textContent === '1'
    );
    expect(badge).toBeDefined();
    expect(badge?.className).toContain('text-brand-dark-blue');
    expect(badge?.className).not.toContain('text-white');
  });
});

describe('4J — reduced-motion en secciones de la home', () => {
  beforeEach(() => {
    mockMatchMedia(true); // reduced motion activo
  });

  it('AnimatedSection: renderiza el contenido de inmediato (sin props de motion)', () => {
    const { getByText } = render(
      <AnimatedSection>
        <p>Contenido visible</p>
      </AnimatedSection>
    );
    expect(getByText('Contenido visible')).toBeInTheDocument();
  });

  it('ProcessStep: el contenido es visible con reduced-motion', () => {
    const { getByText } = render(
      <ProcessStep step={2} icon={ShieldCheck} title="Analizar" description="Desc paso" />
    );
    expect(getByText('Analizar')).toBeInTheDocument();
    expect(getByText('Desc paso')).toBeInTheDocument();
  });
});
