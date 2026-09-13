import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

/**
 * BLOQUE 5A — asistente IA premium + widget de WhatsApp.
 *
 * Verifica apertura/cierre de ambos widgets flotantes, la construcción del
 * enlace de WhatsApp, la ausencia de solapamiento (posiciones opuestas) y la
 * accesibilidad básica (roles, aria-expanded, foco, Escape).
 */

// Polyfill de scrollIntoView (jsdom no lo trae; el chat lo usa al abrir).
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// next/link como <a> simple.
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}));

// next/image como <img> simple (el avatar de la asesora usa next/image).
vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }: any) =>
    React.createElement('img', props),
}));

// lucide-react como spans accesibles.
vi.mock('lucide-react', () => {
  const Icon = (props: any) => <span data-testid="icon" aria-hidden="true" {...props} />;
  return {
    ChevronDown: Icon,
    X: Icon,
    Send: Icon,
    Loader2: Icon,
    MessagesSquare: Icon,
  };
});

// react-icons/fa (WhatsApp).
vi.mock('react-icons/fa', () => ({
  FaWhatsapp: (props: any) => <span data-testid="wa-icon" aria-hidden="true" {...props} />,
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

import FloatingChatButton from '@/components/shared/FloatingChatButton';
import FloatingWhatsApp from '@/components/shared/FloatingWhatsApp';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  mockMatchMedia(false);
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════
// Asistente IA premium
// ═══════════════════════════════════════════════════════════════════

describe('5A — Asesora Virtual ASGRO (asistente premium)', () => {
  it('abre el panel y muestra el nombre visible de la asesora', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText(/asesora virtual asgro/i).length).toBeGreaterThan(0);
  });

  it('muestra acciones rápidas al abrir (antes de escribir)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );

    expect(
      screen.getByRole('button', { name: /seguros para personas/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /póliza de cumplimiento/i })
    ).toBeInTheDocument();
  });

  it('conserva el CTA "Hablar con un asesor" hacia /contacto', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );

    expect(
      screen.getByRole('link', { name: /hablar con un asesor/i })
    ).toHaveAttribute('href', '/contacto');
  });

  it('cierra con Escape y devuelve el foco al trigger', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    const trigger = screen.getByRole('button', {
      name: /abrir asistente de orientación/i,
    });
    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    ).toHaveFocus();
  });
});

// ═══════════════════════════════════════════════════════════════════
// Widget de WhatsApp premium
// ═══════════════════════════════════════════════════════════════════

const PHONE = '573001234567';

describe('5A — Widget flotante de WhatsApp', () => {
  it('no se renderiza si no hay número configurado', () => {
    const { container } = render(<FloatingWhatsApp phoneNumber="" />);
    expect(container.firstChild).toBeNull();
  });

  it('inicia cerrado (solo el botón visible)', () => {
    render(<FloatingWhatsApp phoneNumber={PHONE} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /abrir whatsapp de asgro/i })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('abre el mini-panel al hacer clic (aria-expanded=true)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingWhatsApp phoneNumber={PHONE} />);

    await user.click(screen.getByRole('button', { name: /abrir whatsapp de asgro/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // El trigger (estado abierto) refleja aria-expanded=true.
    expect(
      screen.getByRole('button', { name: /cerrar whatsapp de asgro/i })
    ).toHaveAttribute('aria-expanded', 'true');
    // El botón de cierre del panel existe y es distinto del trigger.
    expect(
      screen.getByRole('button', { name: /^cerrar whatsapp$/i })
    ).toBeInTheDocument();
  });

  it('el botón enviar construye un enlace wa.me con el número y el mensaje', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingWhatsApp phoneNumber={PHONE} />);
    await user.click(screen.getByRole('button', { name: /abrir whatsapp de asgro/i }));

    const sendLink = screen.getByRole('link', { name: /enviar mensaje por whatsapp/i });
    const href = sendLink.getAttribute('href') || '';
    expect(href).toContain('https://wa.me/573001234567');
    expect(href).toContain('?text=');
  });

  it('cierra con Escape y devuelve el foco al trigger', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingWhatsApp phoneNumber={PHONE} />);
    const trigger = screen.getByRole('button', { name: /abrir whatsapp de asgro/i });
    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /abrir whatsapp de asgro/i })
    ).toHaveFocus();
  });
});

// ═══════════════════════════════════════════════════════════════════
// No solapamiento (posiciones opuestas)
// ═══════════════════════════════════════════════════════════════════

describe('5A — Widgets no se solapan', () => {
  it('el asistente ancla a la izquierda y el WhatsApp a la derecha', () => {
    const { container: chat } = render(<FloatingChatButton />);
    const { container: wa } = render(<FloatingWhatsApp phoneNumber={PHONE} />);

    // El contenedor raíz del asistente usa left-*; el de WhatsApp usa right-*.
    const chatRoot = chat.querySelector('div.fixed');
    const waRoot = wa.querySelector('div.fixed');

    expect(chatRoot?.className).toMatch(/left-\[/);
    expect(chatRoot?.className).not.toMatch(/right-\[/);
    expect(waRoot?.className).toMatch(/right-\[/);
    expect(waRoot?.className).not.toMatch(/left-\[/);
  });
});
