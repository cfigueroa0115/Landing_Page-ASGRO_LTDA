import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock next/image to render a plain <img> in jsdom
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    return React.createElement('img', props);
  },
}));

// Mock next/navigation (Header/MobileNav use usePathname)
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock framer-motion to avoid SSR/animation issues in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement('div', props, children),
    nav: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement('nav', props, children),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) =>
    React.createElement(React.Fragment, null, children),
}));

// Mock brand-assets module
vi.mock('@/lib/utils/brand-assets', () => ({
  LOGO_PATH: '/brand/asgro-logo.png',
  SERVICES_BANNER_PATH: '/brand/asgro-services-banner.png',
  getLogoFallbackDataUri: () => 'data:image/svg+xml,logo',
  getBannerFallbackDataUri: () => 'data:image/svg+xml,banner',
}));

// ─── Environment variable helpers ─────────────────────────────────────────────

const ENV_DEFAULTS = {
  NEXT_PUBLIC_WHATSAPP_NUMBER: '573001234567',
  NEXT_PUBLIC_COMPANY_PHONE: '+57 300 123 4567',
  NEXT_PUBLIC_COMPANY_EMAIL: 'contacto@asgro.co',
  NEXT_PUBLIC_COMPANY_ADDRESS: 'Bogotá, Colombia',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  NODE_ENV: 'test',
};

function setEnvVars(overrides: Partial<typeof ENV_DEFAULTS> = {}) {
  const vars = { ...ENV_DEFAULTS, ...overrides };
  Object.entries(vars).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

function clearEnvVars() {
  Object.keys(ENV_DEFAULTS).forEach((key) => {
    delete process.env[key];
  });
}

// ─── Import components after mocks ────────────────────────────────────────────

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import { _resetEnvCache } from '@/lib/config/env';

// Etiquetas de navegación reales (arquitectura seguros-first actual).
// En el Header, el enlace de ARL expone su nombre completo vía aria-label;
// en el MobileNav se muestra con la etiqueta corta "ARL".
const NAV_LABELS_HEADER = [
  'Inicio',
  'Nosotros',
  'Seguros',
  'Empresas',
  'ARL y Riesgos Laborales',
  'SST',
  'Contacto',
];

const NAV_LABELS_MOBILE = [
  'Inicio',
  'Nosotros',
  'Seguros',
  'Empresas',
  'ARL',
  'SST',
  'Contacto',
];

beforeEach(() => {
  setEnvVars();
  _resetEnvCache();
});

afterEach(() => {
  clearEnvVars();
  _resetEnvCache();
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// HEADER TESTS — arquitectura actual: nav + CTA "Solicitar asesoría" + hamburguesa
// ═══════════════════════════════════════════════════════════════════════════════

describe('Header', () => {
  it('renderiza los enlaces de navegación en español', () => {
    render(<Header />);

    NAV_LABELS_HEADER.forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  it('renderiza el CTA "Solicitar asesoría" hacia /contacto', () => {
    render(<Header />);

    const cta = screen.getByRole('link', { name: 'Solicitar asesoría' });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/contacto');
  });

  it('renderiza el botón de WhatsApp cuando la env var está configurada', () => {
    render(<Header />);

    expect(
      screen.getByRole('link', { name: 'Contactar por WhatsApp' })
    ).toBeInTheDocument();
  });

  it('oculta el botón de WhatsApp cuando la env var está vacía', () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '';
    _resetEnvCache();

    render(<Header />);

    expect(
      screen.queryByRole('link', { name: 'Contactar por WhatsApp' })
    ).not.toBeInTheDocument();
  });

  it('el logo enlaza al inicio (/) con aria-label de marca', () => {
    render(<Header />);

    const logoLink = screen.getByRole('link', { name: /ASGRO Agencia de Seguros.*Ir al inicio/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('el botón hamburguesa vive en el Header, con aria-label y aria-expanded', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', {
      name: 'Abrir menú de navegación',
    });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('el botón hamburguesa refleja aria-expanded=true cuando el menú está abierto', () => {
    render(<Header isMobileMenuOpen />);

    const menuButton = screen.getByRole('button', {
      name: 'Cerrar menú de navegación',
    });
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('llama a onMobileMenuOpen al hacer clic en la hamburguesa', async () => {
    const user = userEvent.setup();
    const onMobileMenuOpen = vi.fn();

    render(<Header onMobileMenuOpen={onMobileMenuOpen} />);

    await user.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    expect(onMobileMenuOpen).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Footer', () => {
  it('renderiza los enlaces de navegación (NAV_LINKS) en el pie de página', () => {
    render(<Footer />);

    // El footer incluye los NAV_LINKS; "ARL" se muestra con su etiqueta corta.
    ['Inicio', 'Nosotros', 'Empresas', 'SST', 'Contacto'].forEach((label) => {
      expect(
        screen.getAllByRole('link', { name: label }).length
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('renderiza la info de contacto cuando las env vars están configuradas', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: /Llamar al teléfono/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Enviar correo electrónico/i })).toBeInTheDocument();
    expect(screen.getByText('Bogotá, Colombia')).toBeInTheDocument();
  });

  it('oculta la info de contacto cuando las env vars están vacías', () => {
    process.env.NEXT_PUBLIC_COMPANY_PHONE = '';
    process.env.NEXT_PUBLIC_COMPANY_EMAIL = '';
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS = '';
    _resetEnvCache();

    render(<Footer />);

    expect(
      screen.queryByRole('link', { name: /Llamar al teléfono/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Enviar correo electrónico/i })
    ).not.toBeInTheDocument();
  });

  it('el enlace de teléfono tiene href tel: correcto', () => {
    render(<Footer />);

    const phoneLink = screen.getByRole('link', { name: /Llamar al teléfono/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:573001234567');
  });

  it('el enlace de email tiene href mailto: correcto', () => {
    render(<Footer />);

    const emailLink = screen.getByRole('link', { name: /Enviar correo electrónico/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:contacto@asgro.co');
  });

  it('el copyright incluye el año actual', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILENAV TESTS — arquitectura actual: enlaces (next/link), sin hamburguesa propia
// ═══════════════════════════════════════════════════════════════════════════════

describe('MobileNav', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onToggle: vi.fn(),
  };

  it('renderiza los enlaces de navegación como links cuando está abierto', () => {
    render(<MobileNav {...defaultProps} />);

    NAV_LABELS_MOBILE.forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  it('renderiza el CTA "Solicitar asesoría" cuando está abierto', () => {
    render(<MobileNav {...defaultProps} />);

    expect(
      screen.getByRole('link', { name: 'Solicitar asesoría' })
    ).toBeInTheDocument();
  });

  it('renderiza el enlace de WhatsApp cuando la env var está configurada', () => {
    render(<MobileNav {...defaultProps} />);

    expect(screen.getByRole('link', { name: /WhatsApp/i })).toBeInTheDocument();
  });

  it('oculta el enlace de WhatsApp cuando la env var está vacía', () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '';
    _resetEnvCache();

    render(<MobileNav {...defaultProps} />);

    expect(screen.queryByRole('link', { name: /WhatsApp/i })).not.toBeInTheDocument();
  });

  it('tiene un botón para cerrar el menú', () => {
    render(<MobileNav {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Cerrar menú de navegación' })
    ).toBeInTheDocument();
  });

  it('llama a onClose al hacer clic en un enlace de navegación', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<MobileNav {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('link', { name: 'Inicio' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('el panel tiene los atributos aria de accesibilidad correctos', () => {
    render(<MobileNav {...defaultProps} />);

    const navPanel = screen.getByRole('dialog');
    expect(navPanel).toHaveAttribute('aria-modal', 'true');
    expect(navPanel).toHaveAttribute('aria-label', 'Menú de navegación');
  });

  it('no renderiza el panel cuando isOpen es false', () => {
    render(<MobileNav {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
