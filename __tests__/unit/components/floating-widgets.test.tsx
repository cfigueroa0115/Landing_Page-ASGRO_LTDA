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
    Mic: Icon,
    MicOff: Icon,
    Volume2: Icon,
    VolumeX: Icon,
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
import { FloatingUIProvider } from '@/components/shared/FloatingUIProvider';

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

// ═══════════════════════════════════════════════════════════════════
// BLOQUE 5A.1 — Asesora Virtual, voz, coordinación
// ═══════════════════════════════════════════════════════════════════

describe('5A.1 — Asesora Virtual ASGRO (lenguaje + avatar + quick actions)', () => {
  it('el launcher cerrado muestra el avatar de la asesora (imagen), no un icono de chat', () => {
    const { container } = render(<FloatingChatButton />);
    // El avatar se renderiza como <img> (next/image mockeado).
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toContain('Agente_IA');
  });

  it('usa lenguaje femenino "Asesora Virtual ASGRO" en el header', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    expect(screen.getAllByText(/asesora virtual asgro/i).length).toBeGreaterThan(0);
  });

  it('el mensaje inicial usa "asesora virtual" (no "asistente virtual" masculino)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    expect(screen.getByText(/soy la asesora virtual de asgro/i)).toBeInTheDocument();
  });

  it('las quick actions tienen touch target >= 44px (min-h-[44px])', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    const chip = screen.getByRole('button', { name: /^seguros para personas$/i });
    expect(chip.className).toContain('min-h-[44px]');
    expect(chip.className).not.toContain('min-h-[36px]');
  });

  it('incluye las quick actions Automóvil y Hogar', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    expect(screen.getByRole('button', { name: /^automóvil$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^hogar$/i })).toBeInTheDocument();
  });
});

describe('5A.1 — Voz: fallback y sin autoactivación', () => {
  it('si el navegador no soporta SpeechRecognition, no aparece el botón de micrófono (chat sigue)', async () => {
    // jsdom no define SpeechRecognition → supported=false.
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    // No hay control de dictado por voz.
    expect(screen.queryByRole('button', { name: /dictar consulta por voz/i })).toBeNull();
    // El input de texto sigue disponible.
    expect(screen.getByLabelText(/mensaje para el asistente/i)).toBeInTheDocument();
  });
});

describe('5A.1 — Coordinación asistente ↔ WhatsApp (contexto compartido)', () => {
  function renderBoth() {
    return render(
      <FloatingUIProvider>
        <FloatingChatButton />
        <FloatingWhatsApp phoneNumber="573001234567" />
      </FloatingUIProvider>
    );
  }

  it('abrir el asistente cierra el WhatsApp', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderBoth();

    // Abrir WhatsApp primero.
    await user.click(screen.getByRole('button', { name: /abrir whatsapp de asgro/i }));
    expect(
      screen.getByRole('dialog', { name: /escribir mensaje de whatsapp/i })
    ).toBeInTheDocument();

    // Abrir el asistente → WhatsApp debe cerrarse.
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    expect(
      screen.getByRole('dialog', { name: /asistente de orientación de asgro/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: /escribir mensaje de whatsapp/i })
    ).not.toBeInTheDocument();
  });

  it('abrir el WhatsApp cierra el asistente', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderBoth();

    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    expect(
      screen.getByRole('dialog', { name: /asistente de orientación de asgro/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /abrir whatsapp de asgro/i }));
    expect(
      screen.getByRole('dialog', { name: /escribir mensaje de whatsapp/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: /asistente de orientación de asgro/i })
    ).not.toBeInTheDocument();
  });
});

describe('5A.1 — MobileNav oculta los widgets flotantes', () => {
  it('cuando el menú móvil está abierto, el asistente y el WhatsApp no se renderizan', async () => {
    // Harness que expone un botón para simular la apertura del menú móvil.
    const { useFloatingUI } = await import('@/components/shared/FloatingUIProvider');
    function NavToggler() {
      const { setMobileNavOpen } = useFloatingUI();
      return (
        <button type="button" onClick={() => setMobileNavOpen(true)}>
          simular-abrir-menu
        </button>
      );
    }

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <FloatingUIProvider>
        <NavToggler />
        <FloatingChatButton />
        <FloatingWhatsApp phoneNumber="573001234567" />
      </FloatingUIProvider>
    );

    // Ambos launchers visibles inicialmente.
    expect(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /abrir whatsapp de asgro/i })
    ).toBeInTheDocument();

    // Abrir el menú móvil → los widgets se ocultan.
    await user.click(screen.getByRole('button', { name: /simular-abrir-menu/i }));

    expect(
      screen.queryByRole('button', { name: /abrir asistente de orientación/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /abrir whatsapp de asgro/i })
    ).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════
// BLOQUE 5A.3 — contraste launcher WhatsApp + voz opt-in
// ═══════════════════════════════════════════════════════════════════

describe('5A.3 — WhatsApp launcher contraste', () => {
  it('el launcher usa text-brand-dark-blue (no text-white) sobre #25D366', () => {
    render(<FloatingWhatsApp phoneNumber="573001234567" />);
    const trigger = screen.getByRole('button', { name: /abrir whatsapp de asgro/i });
    expect(trigger.className).toContain('text-brand-dark-blue');
    expect(trigger.className).not.toContain('text-white');
  });
});

describe('5A.3 — Voz: control de lectura con touch target >=44px', () => {
  beforeEach(() => {
    // Simular soporte de speechSynthesis (jsdom no lo trae) para que el toggle
    // de lectura por voz se renderice. Sin SpeechRecognition → sin micrófono.
    (window as any).speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: () => [],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    (window as any).SpeechSynthesisUtterance = function () {
      return {};
    };
  });

  afterEach(() => {
    delete (window as any).speechSynthesis;
    delete (window as any).SpeechSynthesisUtterance;
  });

  it('el toggle de voz tiene min-h-[44px] (no min-h-[36px])', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    const toggle = screen.getByRole('button', { name: /activar lectura por voz/i });
    expect(toggle.className).toContain('min-h-[44px]');
    expect(toggle.className).not.toContain('min-h-[36px]');
  });

  it('la lectura por voz NO se activa automáticamente (aria-pressed=false al abrir)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FloatingChatButton />);
    await user.click(
      screen.getByRole('button', { name: /abrir asistente de orientación/i })
    );
    const toggle = screen.getByRole('button', { name: /activar lectura por voz/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });
});


