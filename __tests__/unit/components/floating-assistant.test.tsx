import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

/**
 * Tests del BLOQUE 4B — Asistente flotante de orientación.
 *
 * Verifica el comportamiento no invasivo requerido:
 * - Panel cerrado inicialmente.
 * - Sin autoapertura por temporizador.
 * - Clic abre el panel; cierre y Escape funcionan.
 * - aria-expanded refleja el estado.
 * - No reaparece automáticamente tras cerrar.
 * - Accesibilidad básica (aria-controls, role dialog, foco al botón).
 */

// Polyfill de scrollIntoView (no existe en jsdom; usado al abrir el panel)
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// next/link como <a> simple
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}));

// lucide-react como spans
vi.mock('lucide-react', () => {
  const Icon = (props: any) => <span data-testid="icon" aria-hidden="true" {...props} />;
  return {
    ChevronDown: Icon,
    X: Icon,
    Send: Icon,
    Loader2: Icon,
    Headset: Icon,
  };
});

import FloatingChatButton from '@/components/shared/FloatingChatButton';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('FloatingChatButton — asistente de orientación', () => {
  it('inicia con el panel cerrado (solo el botón visible)', () => {
    render(<FloatingChatButton />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const trigger = screen.getByRole('button', {
      name: /abrir asistente de orientación/i,
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('NO se autoabre por temporizador (avanzar 30s no muestra panel/tooltip)', () => {
    render(<FloatingChatButton />);
    // Avanzar el tiempo bien más allá de cualquier antiguo timeout de 10s.
    vi.advanceTimersByTime(30000);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Tampoco debe existir el texto de orientación hasta abrir.
    expect(screen.queryByText(/¿Necesita orientación\?/i)).not.toBeInTheDocument();
  });

  it('abre el panel al hacer clic y refleja aria-expanded=true', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/¿Necesita orientación\?/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cerrar asistente de orientación/i })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('muestra el CTA "Hablar con un asesor" que enlaza a /contacto', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );

    const cta = screen.getByRole('link', { name: /hablar con un asesor/i });
    expect(cta).toHaveAttribute('href', '/contacto');
  });

  it('cierra el panel con el botón de cierre y vuelve aria-expanded=false', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    await user.click(screen.getByRole('button', { name: /cerrar asistente$/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('cierra el panel con la tecla Escape', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('no reaparece automáticamente tras cerrar (avanzar el tiempo)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    await user.keyboard('{Escape}');
    vi.advanceTimersByTime(30000);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el botón expone aria-controls apuntando al panel', () => {
    render(<FloatingChatButton />);
    const trigger = screen.getByRole('button', {
      name: /abrir asistente de orientación/i,
    });
    expect(trigger).toHaveAttribute('aria-controls');
  });

  it('al abrir, el foco entra al panel (botón Cerrar)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );

    const closeBtn = screen.getByRole('button', { name: /cerrar asistente$/i });
    expect(closeBtn).toHaveFocus();
  });

  it('al cerrar con Escape, el foco vuelve al trigger', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    const trigger = screen.getByRole('button', {
      name: /abrir asistente de orientación/i,
    });
    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    ).toHaveFocus();
  });

  it('el botón Cerrar conserva su nombre accesible', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    expect(
      screen.getByRole('button', { name: /cerrar asistente$/i })
    ).toBeInTheDocument();
  });

  it('el estado (abierto/cerrado) se comunica sin depender de animación', async () => {
    // reduced-motion: aunque no haya animación, el estado es observable por
    // la presencia del dialog y por aria-expanded.
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    const trigger = screen.getByRole('button', {
      name: /abrir asistente de orientación/i,
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    // Estado abierto: dialog presente + aria-expanded true (sin depender de motion).
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cerrar asistente de orientación/i })
    ).toHaveAttribute('aria-expanded', 'true');
  });
});
