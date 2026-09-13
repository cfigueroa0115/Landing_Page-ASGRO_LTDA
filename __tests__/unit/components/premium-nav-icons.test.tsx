import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

/**
 * BLOQUE 5A.7 — navegación premium, visibilidad WhatsApp e iconografía.
 */

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, sizes, style, ...props }: any) =>
    React.createElement('img', {
      src,
      alt,
      'data-priority': priority ? 'true' : 'false',
      ...props,
    }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/servicios/riesgos-laborales',
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

vi.mock('react-icons/fa', () => ({
  FaWhatsapp: (props: any) => <span data-testid="wa-icon" aria-hidden="true" {...props} />,
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get:
        (_t, tag: string) =>
        ({ children, ...props }: any) => {
          const { whileHover: _wh, whileTap: _wt, initial: _i, animate: _a, transition: _tr, ...rest } = props;
          return React.createElement(tag, rest, children);
        },
    }
  ),
  useReducedMotion: () => false,
}));

vi.mock('lucide-react', () => {
  const Icon = (props: any) => <span data-testid="icon" aria-hidden="true" {...props} />;
  return {
    ChevronRight: Icon,
    Home: Icon,
    ArrowLeft: Icon,
    Shield: Icon,
    ShieldCheck: Icon,
  };
});

import PremiumIconBadge from '@/components/shared/PremiumIconBadge';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Shield } from 'lucide-react';

describe('5A.7 — PremiumIconBadge', () => {
  it('renderiza el icono y es decorativo (aria-hidden en el contenedor)', () => {
    const { container } = render(<PremiumIconBadge icon={Shield} size="feature" />);
    const badge = container.querySelector('span[aria-hidden="true"]');
    expect(badge).not.toBeNull();
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('renderiza el número opcional (paso)', () => {
    render(<PremiumIconBadge icon={Shield} number={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('5A.7 — Breadcrumbs backHref estable', () => {
  it('usa un enlace (no button) cuando se define backHref', () => {
    render(
      <Breadcrumbs
        backHref="/servicios"
        backLabel="Volver a Servicios"
        items={[
          { label: 'Servicios', href: '/servicios' },
          { label: 'Riesgos Laborales', href: '/servicios/riesgos-laborales' },
        ]}
      />
    );
    const back = screen.getByRole('link', { name: /volver a servicios/i });
    expect(back).toHaveAttribute('href', '/servicios');
  });

  it('cae a un botón (router.back) cuando NO hay backHref', () => {
    render(<Breadcrumbs items={[{ label: 'Contacto', href: '/contacto' }]} />);
    expect(
      screen.getByRole('button', { name: /volver a la página anterior/i })
    ).toBeInTheDocument();
  });

  it('incluye Inicio y la página actual', () => {
    render(
      <Breadcrumbs
        backHref="/"
        backLabel="Volver al inicio"
        items={[{ label: 'Nosotros', href: '/nosotros' }]}
      />
    );
    expect(screen.getByRole('link', { name: /^Inicio$/i })).toBeInTheDocument();
    expect(screen.getByText('Nosotros')).toBeInTheDocument();
  });
});
