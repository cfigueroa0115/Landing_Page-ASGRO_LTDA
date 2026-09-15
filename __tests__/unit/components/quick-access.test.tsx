import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

/**
 * BLOQUE 5A.1 — Dock de accesos rápidos.
 *
 * Verifica que se conservan los 6 accesos con sus rutas existentes y que cada
 * acceso es un único enlace (<a>), sin nesting interactivo.
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
          const {
            initial: _i,
            whileInView: _w,
            viewport: _v,
            transition: _tr,
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
    Users: Icon,
    Building2: Icon,
    HardHat: Icon,
    HeartPulse: Icon,
    FileCheck: Icon,
    MessageCircle: Icon,
  };
});

import QuickAccessSection from '@/components/sections/QuickAccessSection';

describe('5A.1 — QuickAccessSection (dock)', () => {
  it('conserva los 6 accesos con sus rutas existentes', () => {
    const { container } = render(<QuickAccessSection />);

    const expected: Array<[RegExp, string]> = [
      [/personas/i, '/servicios'],
      [/empresas/i, '/servicios/seguros-empresariales'],
      [/arl/i, '/servicios/riesgos-laborales'],
      [/sst/i, '/servicios/seguridad-salud-trabajo'],
      // 6C: Cumplimiento hace deep-link a la cobertura dentro del micrositio B2B.
      [/cumplimiento/i, '/servicios/seguros-empresariales#cumplimiento'],
      [/contacto/i, '/contacto'],
    ];

    const links = Array.from(container.querySelectorAll('a'));
    expect(links.length).toBe(6);

    for (const [label, href] of expected) {
      const link = links.find(
        (a) => label.test(a.textContent || '') && a.getAttribute('href') === href
      );
      expect(link, `acceso ${label} → ${href}`).toBeDefined();
    }
  });

  it('no hay nesting interactivo <a><button>', () => {
    const { container } = render(<QuickAccessSection />);
    expect(container.querySelectorAll('a button').length).toBe(0);
  });
});
