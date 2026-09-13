import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * BLOQUE 6C — arquitectura de navegación, breadcrumb visible y deep-link.
 */

// pathname controlable por test.
let currentPath = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => currentPath,
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', props),
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get:
        (_t, tag: string) =>
        ({ children, ...props }: any) => {
          const { whileHover: _wh, initial: _i, animate: _a, exit: _e, transition: _tr, ...rest } = props;
          return React.createElement(tag, rest, children);
        },
    }
  ),
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  useReducedMotion: () => false,
}));

vi.mock('lucide-react', () => {
  const Icon = (props: any) => <span data-testid="icon" aria-hidden="true" {...props} />;
  return { Menu: Icon, ChevronRight: Icon, Home: Icon, ArrowLeft: Icon };
});

vi.mock('react-icons/fa', () => ({
  FaWhatsapp: (props: any) => <span data-testid="wa" aria-hidden="true" {...props} />,
}));

vi.mock('@/lib/utils/brand-assets-components', () => ({
  BrandLogo: (props: any) => <img alt="ASGRO" {...props} />,
}));

import Header from '@/components/layout/Header';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

beforeEach(() => {
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '573001234567';
  currentPath = '/';
});

// ─── Active state del Header (solo uno activo) ───────────────────────────────
function activeLabels(container: HTMLElement): string[] {
  // Un enlace activo tiene aria-current="page".
  return Array.from(container.querySelectorAll('a[aria-current="page"]')).map(
    (a) => (a.textContent || '').trim()
  );
}

describe('6C — Header active-state exacto (solo un principal activo)', () => {
  const cases: Array<[string, string]> = [
    ['/', 'Inicio'],
    ['/servicios', 'Seguros'],
    ['/servicios/seguros-empresariales', 'Empresas'],
    ['/servicios/riesgos-laborales', 'ARL'],
    ['/servicios/seguridad-salud-trabajo', 'SST'],
    ['/contacto', 'Contacto'],
  ];

  for (const [route, expected] of cases) {
    it(`${route} → activo solo "${expected}"`, () => {
      currentPath = route;
      const { container } = render(<Header />);
      const active = activeLabels(container);
      expect(active).toContain(expected);
      // Nunca más de un principal activo.
      expect(active.length).toBeLessThanOrEqual(1);
    });
  }

  it('/servicios NO marca Empresas/ARL/SST', () => {
    currentPath = '/servicios';
    const { container } = render(<Header />);
    const active = activeLabels(container);
    expect(active).not.toContain('Empresas');
    expect(active).not.toContain('ARL');
    expect(active).not.toContain('SST');
  });
});

// ─── NAV_LINKS: arquitectura Seguros/Empresas ───────────────────────────────
describe('6C — NAV_LINKS Seguros/Empresas', () => {
  it('Seguros → /servicios y Empresas → /servicios/seguros-empresariales', () => {
    currentPath = '/';
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Seguros' })).toHaveAttribute('href', '/servicios');
    expect(screen.getByRole('link', { name: 'Empresas' })).toHaveAttribute(
      'href',
      '/servicios/seguros-empresariales'
    );
  });
});

// ─── Breadcrumbs: visible bajo header + Volver estable ──────────────────────
describe('6C — Breadcrumbs visibles y control Volver', () => {
  it('compensa el header fijo (mt-[76px]) y muestra Volver como enlace estable', () => {
    const { container } = render(
      <Breadcrumbs
        backHref="/servicios"
        backLabel="Volver a Seguros"
        items={[
          { label: 'Seguros', href: '/servicios' },
          { label: 'Empresas', href: '/servicios/seguros-empresariales' },
        ]}
      />
    );
    const nav = container.querySelector('nav[aria-label="Breadcrumb"]');
    expect(nav?.className).toContain('mt-[76px]');
    const back = screen.getByRole('link', { name: /volver a seguros/i });
    expect(back).toHaveAttribute('href', '/servicios');
    // Touch target del control Volver.
    expect(back.className).toContain('min-h-[44px]');
  });
});

// ─── Deep-link Cumplimiento (source check) ──────────────────────────────────
describe('6C — deep-link Cumplimiento', () => {
  function read(rel: string) {
    return fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
  }
  it('QuickAccess apunta a #cumplimiento', () => {
    expect(read('src/lib/utils/constants.ts')).toContain(
      '/servicios/seguros-empresariales#cumplimiento'
    );
  });
  it('la tarjeta de Cumplimiento tiene id y scroll-mt', () => {
    const src = read('src/app/servicios/seguros-empresariales/page.tsx');
    expect(src).toContain("id={isCumplimiento ? 'cumplimiento' : undefined}");
    expect(src).toContain('scroll-mt-[96px]');
  });
  it('MobileNav usa NAV_LINKS (misma fuente que Header)', () => {
    expect(read('src/components/layout/MobileNav.tsx')).toContain('NAV_LINKS');
  });
});
