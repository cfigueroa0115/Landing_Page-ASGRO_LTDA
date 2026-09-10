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
    MessagesSquare: Icon,
  };
});

import FloatingChatButton from '@/components/shared/FloatingChatButton';

/**
 * Configura window.matchMedia. `reduce` = true simula
 * prefers-reduced-motion: reduce.
 */
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

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  // Por defecto, sin reduced motion.
  mockMatchMedia(false);
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

  it('estructura robusta: orientación + CTA + conversación en una región scrollable (role=log)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );

    // La región log contiene tanto el bloque de orientación (CTA) como la conversación.
    const log = screen.getByRole('log');
    const cta = screen.getByRole('link', { name: /hablar con un asesor/i });
    expect(log).toContainElement(cta);

    // El input de escritura permanece disponible (fuera del log, siempre visible).
    expect(
      screen.getByLabelText(/mensaje para el asistente/i)
    ).toBeInTheDocument();
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

  it('con prefers-reduced-motion: reduce, scrollIntoView NO usa behavior smooth', async () => {
    mockMatchMedia(true);
    const scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {});

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    // Ignorar cualquier llamada del render inicial; medimos solo tras abrir.
    scrollSpy.mockClear();
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );

    expect(scrollSpy).toHaveBeenCalled();
    // Ninguna llamada debe incluir { behavior: 'smooth' } bajo reduced-motion.
    for (const call of scrollSpy.mock.calls) {
      const arg = call[0];
      if (arg && typeof arg === 'object') {
        expect((arg as ScrollIntoViewOptions).behavior).not.toBe('smooth');
      }
    }
  });

  it('sin reduced-motion, scrollIntoView usa behavior smooth', async () => {
    mockMatchMedia(false);
    const scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {});

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);

    scrollSpy.mockClear();
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );

    expect(scrollSpy).toHaveBeenCalled();
    const usedSmooth = scrollSpy.mock.calls.some((call) => {
      const arg = call[0];
      return !!arg && typeof arg === 'object' &&
        (arg as ScrollIntoViewOptions).behavior === 'smooth';
    });
    expect(usedSmooth).toBe(true);
  });
});
