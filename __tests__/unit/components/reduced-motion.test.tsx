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

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('lucide-react', () => {
  const Icon = (props: any) => <span data-testid="icon" aria-hidden="true" {...props} />;
  return { ShieldCheck: Icon, Loader2: Icon };
});

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
