import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// ─────────────────────────────────────────────────────────────────
// jsdom polyfills required by Radix UI and ChatWindow
// ─────────────────────────────────────────────────────────────────

// ResizeObserver polyfill (needed by Radix Select internally)
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}

// scrollIntoView polyfill (needed by ChatWindow)
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// ─────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────

// Mock framer-motion as pass-through
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
  useAnimation: () => ({ start: vi.fn(), set: vi.fn() }),
}));

// Mock AnimatedSection as pass-through
vi.mock('@/components/shared/AnimatedSection', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Send: (props: any) => <span data-testid="send-icon" {...props} />,
  CheckCircle: (props: any) => <span data-testid="check-icon" {...props} />,
  AlertCircle: (props: any) => <span data-testid="alert-icon" {...props} />,
  Loader2: (props: any) => <span data-testid="loader-icon" {...props} />,
  Check: (props: any) => <span {...props} />,
  ChevronDown: (props: any) => <span {...props} />,
  ChevronUp: (props: any) => <span {...props} />,
  Bot: (props: any) => <span data-testid="bot-icon" {...props} />,
  User: (props: any) => <span data-testid="user-icon" {...props} />,
  MessageCircle: (props: any) => <span data-testid="message-circle-icon" {...props} />,
  X: (props: any) => <span data-testid="x-icon" {...props} />,
}));

// Mock Radix Select with a testable native select so we can programmatically
// change values during integration tests (Radix portals don't work in jsdom)
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => {
    // We wrap children but also provide a hidden native select for test interaction
    const [localValue, setLocalValue] = React.useState(value || '');

    React.useEffect(() => {
      setLocalValue(value || '');
    }, [value]);

    return (
      <span data-testid="mock-select-wrapper">
        <select
          data-testid="mock-select-native"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onValueChange?.(e.target.value);
          }}
        >
          <option value="">Seleccione</option>
          <option value="arl">ARL</option>
          <option value="sst">SST</option>
          <option value="seguros">Seguros empresariales a la medida</option>
          <option value="bienestar">Bienestar</option>
        </select>
        {children}
      </span>
    );
  },
  SelectTrigger: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <span ref={ref} {...props}>{children}</span>
  )),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <span style={{ display: 'none' }}>{children}</span>,
  SelectItem: ({ children, value }: any) => <span data-value={value}>{children}</span>,
}));

import ContactSection from '@/components/sections/ContactSection';
import QuoteSection from '@/components/sections/QuoteSection';
import AIAgentSection from '@/components/sections/AIAgentSection';

// ─────────────────────────────────────────────────────────────────
// Fetch mock setup
// ─────────────────────────────────────────────────────────────────

const mockFetch = vi.fn();

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────
// Helper: Fill contact form fields
// ─────────────────────────────────────────────────────────────────

async function fillContactForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nombre completo/i), 'Carlos Martínez');
  await user.type(screen.getByLabelText(/^empresa/i), 'Constructora XYZ');
  await user.type(screen.getByLabelText(/^cargo/i), 'Director de Operaciones');
  await user.type(screen.getByLabelText(/teléfono/i), '3109876543');
  await user.type(screen.getByLabelText(/correo electrónico/i), 'carlos@xyz.com');
  await user.type(screen.getByLabelText(/ciudad/i), 'Cali');

  // Select service via mocked native select
  const selectElements = screen.getAllByTestId('mock-select-native');
  await user.selectOptions(selectElements[0]!, 'arl');

  await user.type(
    screen.getByLabelText(/mensaje/i),
    'Necesitamos información sobre servicios de ARL para nuestra empresa'
  );
  await user.click(screen.getByLabelText(/acepto el tratamiento de datos personales/i));
}

// ─────────────────────────────────────────────────────────────────
// Helper: Fill quote form fields
// ─────────────────────────────────────────────────────────────────

async function fillQuoteForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nombre de empresa/i), 'Industrias ABC S.A.S');
  await user.type(screen.getByLabelText(/^nit/i), '900456789-1');
  await user.type(screen.getByLabelText(/nombre de contacto/i), 'Laura Rodríguez');
  await user.type(screen.getByLabelText(/^cargo/i), 'Gerente de RRHH');
  await user.type(screen.getByLabelText(/teléfono/i), '+573201234567');
  await user.type(screen.getByLabelText(/correo electrónico/i), 'laura@industriasabc.com');
  await user.type(screen.getByLabelText(/^ciudad/i), 'Barranquilla');
  await user.type(screen.getByLabelText(/actividad económica/i), 'Manufactura industrial');
  await user.type(screen.getByLabelText(/número aproximado de trabajadores/i), '150');

  // Select service via mocked native select
  const selectElements = screen.getAllByTestId('mock-select-native');
  await user.selectOptions(selectElements[0]!, 'sst');

  await user.type(screen.getByLabelText(/arl actual/i), 'Sura');
  await user.type(screen.getByLabelText(/comentarios adicionales/i), 'Requerimos cotización urgente');
  await user.click(screen.getByLabelText(/acepto el tratamiento de datos personales/i));
}

// ═══════════════════════════════════════════════════════════════════
// Integration Tests: Contact Form Flow
// ═══════════════════════════════════════════════════════════════════

describe('Integration: Contact Form Flow', () => {
  it('successful submission: fills all fields → submits → verifies fetch body → shows success → resets form', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'lead-123' }),
    });

    render(<ContactSection />);

    await fillContactForm(user);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i });
    await user.click(submitButton);

    // Verify fetch was called with the correct endpoint and body
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toBe('/api/contact');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body);
    expect(body).toMatchObject({
      fullName: 'Carlos Martínez',
      company: 'Constructora XYZ',
      position: 'Director de Operaciones',
      phone: '3109876543',
      email: 'carlos@xyz.com',
      city: 'Cali',
      serviceOfInterest: 'arl',
      message: 'Necesitamos información sobre servicios de ARL para nuestra empresa',
      dataAcceptance: true,
    });

    // Verify success message is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/mensaje enviado exitosamente/i)
      ).toBeInTheDocument();
    });

    // Verify form is reset (fields cleared)
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('');
    expect(screen.getByLabelText(/^empresa/i)).toHaveValue('');
    expect(screen.getByLabelText(/^cargo/i)).toHaveValue('');
    expect(screen.getByLabelText(/teléfono/i)).toHaveValue('');
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('');
    expect(screen.getByLabelText(/ciudad/i)).toHaveValue('');
    expect(screen.getByLabelText(/mensaje/i)).toHaveValue('');
  });

  it('error submission: fills fields → submits → server returns 500 → shows error → preserves data', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Error interno del servidor' }),
    });

    render(<ContactSection />);

    await fillContactForm(user);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i });
    await user.click(submitButton);

    // Verify fetch was called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error interno del servidor/i)).toBeInTheDocument();
    });

    // Verify form data is preserved (not reset)
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Carlos Martínez');
    expect(screen.getByLabelText(/^empresa/i)).toHaveValue('Constructora XYZ');
    expect(screen.getByLabelText(/^cargo/i)).toHaveValue('Director de Operaciones');
    expect(screen.getByLabelText(/teléfono/i)).toHaveValue('3109876543');
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('carlos@xyz.com');
    expect(screen.getByLabelText(/ciudad/i)).toHaveValue('Cali');
    expect(screen.getByLabelText(/mensaje/i)).toHaveValue(
      'Necesitamos información sobre servicios de ARL para nuestra empresa'
    );
  });
});

// ═══════════════════════════════════════════════════════════════════
// Integration Tests: Quote Form Flow
// ═══════════════════════════════════════════════════════════════════

describe('Integration: Quote Form Flow', () => {
  it('successful submission: fills all 13 fields → submits → verifies fetch body → shows success', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'quote-456' }),
    });

    render(<QuoteSection />);

    await fillQuoteForm(user);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /solicitar cotización/i });
    await user.click(submitButton);

    // Verify fetch was called with correct data
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toBe('/api/quote');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body);
    expect(body).toMatchObject({
      companyName: 'Industrias ABC S.A.S',
      nit: '900456789-1',
      contactName: 'Laura Rodríguez',
      position: 'Gerente de RRHH',
      phone: '+573201234567',
      email: 'laura@industriasabc.com',
      city: 'Barranquilla',
      economicActivity: 'Manufactura industrial',
      employeeCount: 150,
      serviceRequired: 'sst',
      currentArl: 'Sura',
      comments: 'Requerimos cotización urgente',
      dataAcceptance: true,
    });

    // Verify success message
    await waitFor(() => {
      expect(
        screen.getByText(/solicitud de cotización ha sido enviada exitosamente/i)
      ).toBeInTheDocument();
    });
  });

  it('validation: submitting empty form shows inline errors for required fields', async () => {
    const user = userEvent.setup();
    render(<QuoteSection />);

    // Submit empty form
    const submitButton = screen.getByRole('button', { name: /solicitar cotización/i });
    await user.click(submitButton);

    // Verify inline validation errors appear for required fields
    await waitFor(() => {
      expect(screen.getByText(/el nombre de la empresa es requerido/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/el nit es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/el nombre de contacto es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/el cargo es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/el teléfono es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/la ciudad es requerida/i)).toBeInTheDocument();
    expect(screen.getByText(/la actividad económica es requerida/i)).toBeInTheDocument();
    expect(screen.getByText(/debe aceptar el tratamiento de datos personales/i)).toBeInTheDocument();

    // Verify fetch was NOT called (validation blocked submission)
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════
// Integration Tests: Chat Flow
// ═══════════════════════════════════════════════════════════════════

describe('Integration: Chat Flow', () => {
  it('sends message → verifies fetch with message body → shows assistant response', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: 'session-abc-123',
        response: 'Las ARL cubren riesgos laborales incluyendo accidentes y enfermedades profesionales.',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<AIAgentSection />);

    // Open the chat by clicking "Iniciar conversación"
    const openButton = screen.getByRole('button', { name: /iniciar conversación/i });
    await user.click(openButton);

    // Verify chat is open and welcome message is visible (exists in bubble + aria region)
    const welcomeMessages = screen.getAllByText(/soy el asistente virtual de asgro/i);
    expect(welcomeMessages.length).toBeGreaterThanOrEqual(1);

    // Type a message in the chat input
    const chatInput = screen.getByLabelText(/mensaje para el agente ia/i);
    await user.type(chatInput, '¿Qué cubre una ARL?');

    // Submit the message
    const sendButton = screen.getByRole('button', { name: /enviar mensaje/i });
    await user.click(sendButton);

    // Verify fetch was called with the correct body
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toBe('/api/chat');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body);
    expect(body.message).toBe('¿Qué cubre una ARL?');

    // Verify the user message appears in the chat
    expect(screen.getByText('¿Qué cubre una ARL?')).toBeInTheDocument();

    // Verify the assistant response appears (appears in bubble + aria live region)
    await waitFor(() => {
      const responses = screen.getAllByText(/las arl cubren riesgos laborales/i);
      expect(responses.length).toBeGreaterThanOrEqual(1);
    });
  });
});
