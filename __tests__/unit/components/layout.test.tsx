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

// Reset the env module cache between tests to pick up new env vars
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
// HEADER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Header', () => {
  it('renders all Spanish navigation links', () => {
    render(<Header />);

    const expectedLabels = [
      'Inicio',
      'Nosotros',
      'Servicios',
      'Metodología',
      'Resultados',
      'Agente IA',
      'Preguntas frecuentes',
      'Contacto',
    ];

    expectedLabels.forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  it('renders "Cotizar ahora" button', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: 'Cotizar ahora' })).toBeInTheDocument();
  });

  it('renders WhatsApp button when env var is set', () => {
    render(<Header />);

    expect(
      screen.getByRole('link', { name: 'Contactar por WhatsApp' })
    ).toBeInTheDocument();
  });

  it('hides WhatsApp button when env var is empty', () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '';
    _resetEnvCache();

    render(<Header />);

    expect(
      screen.queryByRole('link', { name: 'Contactar por WhatsApp' })
    ).not.toBeInTheDocument();
  });

  it('logo link has proper aria-label', () => {
    render(<Header />);

    const logoLink = screen.getByRole('link', { name: /ASGRO LTDA.*Ir al inicio/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '#inicio');
  });

  it('mobile menu button has aria-label', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', {
      name: 'Abrir menú de navegación',
    });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Footer', () => {
  it('renders navigation quick links in Spanish', () => {
    render(<Footer />);

    const expectedLabels = [
      'Inicio',
      'Nosotros',
      'Servicios',
      'Metodología',
      'Resultados',
      'Agente IA',
      'Preguntas frecuentes',
      'Contacto',
    ];

    expectedLabels.forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  it('renders company contact info when env vars are set', () => {
    render(<Footer />);

    // Phone link
    expect(
      screen.getByRole('link', { name: /Llamar al teléfono/i })
    ).toBeInTheDocument();

    // Email link
    expect(
      screen.getByRole('link', { name: /Enviar correo electrónico/i })
    ).toBeInTheDocument();

    // Address text
    expect(screen.getByText('Bogotá, Colombia')).toBeInTheDocument();
  });

  it('hides contact info gracefully when env vars are empty', () => {
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

  it('phone link has proper tel: href', () => {
    render(<Footer />);

    const phoneLink = screen.getByRole('link', { name: /Llamar al teléfono/i });
    // Phone is "+57 300 123 4567", stripped non-digits = "573001234567"
    expect(phoneLink).toHaveAttribute('href', 'tel:573001234567');
  });

  it('email link has proper mailto: href', () => {
    render(<Footer />);

    const emailLink = screen.getByRole('link', { name: /Enviar correo electrónico/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:contacto@asgro.co');
  });

  it('social media links open in new tab', () => {
    render(<Footer />);

    const socialLinks = [
      screen.getByRole('link', { name: /Facebook/i }),
      screen.getByRole('link', { name: /Instagram/i }),
      screen.getByRole('link', { name: /LinkedIn/i }),
    ];

    socialLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
  });

  it('copyright includes current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILENAV TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('MobileNav', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onToggle: vi.fn(),
  };

  it('renders all Spanish navigation links when open', () => {
    render(<MobileNav {...defaultProps} />);

    const expectedLabels = [
      'Inicio',
      'Nosotros',
      'Servicios',
      'Metodología',
      'Resultados',
      'Agente IA',
      'Preguntas frecuentes',
      'Contacto',
    ];

    expectedLabels.forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('renders "Cotizar ahora" button when open', () => {
    render(<MobileNav {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Cotizar ahora' })).toBeInTheDocument();
  });

  it('renders WhatsApp link when env var is set', () => {
    render(<MobileNav {...defaultProps} />);

    expect(screen.getByRole('link', { name: /WhatsApp/i })).toBeInTheDocument();
  });

  it('hides WhatsApp link when env var is empty', () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '';
    _resetEnvCache();

    render(<MobileNav {...defaultProps} />);

    expect(screen.queryByRole('link', { name: /WhatsApp/i })).not.toBeInTheDocument();
  });

  it('toggle button has proper aria-label and aria-expanded', () => {
    render(<MobileNav {...defaultProps} isOpen={false} />);

    const toggleButton = screen.getByRole('button', {
      name: 'Abrir menú de navegación',
    });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggle button shows "Cerrar" label when open', () => {
    render(<MobileNav {...defaultProps} isOpen={true} />);

    const closeButtons = screen.getAllByRole('button', {
      name: 'Cerrar menú de navegación',
    });
    // The hamburger toggle button (with aria-expanded) and the close button inside the panel
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    const toggleButton = closeButtons.find(
      (btn) => btn.getAttribute('aria-expanded') === 'true'
    );
    expect(toggleButton).toBeDefined();
  });

  it('calls onToggle when hamburger button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<MobileNav {...defaultProps} isOpen={false} onToggle={onToggle} />);

    const toggleButton = screen.getByRole('button', {
      name: 'Abrir menú de navegación',
    });
    await user.click(toggleButton);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when a nav link is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<MobileNav {...defaultProps} onClose={onClose} />);

    const inicioButton = screen.getByRole('button', { name: 'Inicio' });
    await user.click(inicioButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('nav panel has proper aria attributes for accessibility', () => {
    render(<MobileNav {...defaultProps} />);

    const navPanel = screen.getByRole('dialog');
    expect(navPanel).toHaveAttribute('aria-modal', 'true');
    expect(navPanel).toHaveAttribute('aria-label', 'Menú de navegación');
  });
});
