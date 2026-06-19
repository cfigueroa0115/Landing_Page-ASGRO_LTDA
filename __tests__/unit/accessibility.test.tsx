import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// ─────────────────────────────────────────────────────────────────
// jsdom polyfills
// ─────────────────────────────────────────────────────────────────

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// IntersectionObserver polyfill (needed by MetricsSection and Counter)
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() {
      // Immediately trigger with isIntersecting: true
      this.callback(
        [{ isIntersecting: true, target: document.body } as any],
        this as any
      );
    }
    unobserve() {}
    disconnect() {}
  } as any;
}

// ─────────────────────────────────────────────────────────────────
// Environment variables
// ─────────────────────────────────────────────────────────────────

process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '573001234567';
process.env.NEXT_PUBLIC_COMPANY_PHONE = '+57 300 123 4567';
process.env.NEXT_PUBLIC_COMPANY_EMAIL = 'contacto@asgro.co';
process.env.NEXT_PUBLIC_COMPANY_ADDRESS = 'Bogotá, Colombia';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
// NODE_ENV is read-only in TypeScript; it's already set to 'test' by vitest

// ─────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────

// Mock framer-motion as pass-through divs
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    section: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <section ref={ref} {...props}>{children}</section>
    )),
    span: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <span ref={ref} {...props}>{children}</span>
    )),
    p: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <p ref={ref} {...props}>{children}</p>
    )),
    nav: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <nav ref={ref} {...props}>{children}</nav>
    )),
    button: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <button ref={ref} {...props}>{children}</button>
    )),
    a: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <a ref={ref} {...props}>{children}</a>
    )),
    li: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <li ref={ref} {...props}>{children}</li>
    )),
    ul: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <ul ref={ref} {...props}>{children}</ul>
    )),
    h1: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <h1 ref={ref} {...props}>{children}</h1>
    )),
    h2: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <h2 ref={ref} {...props}>{children}</h2>
    )),
    h3: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <h3 ref={ref} {...props}>{children}</h3>
    )),
    article: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <article ref={ref} {...props}>{children}</article>
    )),
    aside: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <aside ref={ref} {...props}>{children}</aside>
    )),
    header: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <header ref={ref} {...props}>{children}</header>
    )),
    footer: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <footer ref={ref} {...props}>{children}</footer>
    )),
    main: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <main ref={ref} {...props}>{children}</main>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
  useAnimation: () => ({ start: vi.fn(), set: vi.fn() }),
}));

// Mock AnimatedSection as pass-through
vi.mock('@/components/shared/AnimatedSection', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock next/image as plain img
vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', props),
}));

// Mock lucide-react icons as span elements
vi.mock('lucide-react', () => {
  const Icon = (props: any) => <span data-testid="icon" aria-hidden="true" {...props} />;
  return {
    // layout/Header
    Menu: Icon,
    // layout/Footer
    Phone: Icon,
    Mail: Icon,
    MapPin: Icon,
    // layout/MobileNav, dialog, AIAgent, ServiceModal
    X: Icon,
    // ui/select, ui/accordion
    Check: Icon,
    ChevronDown: Icon,
    ChevronUp: Icon,
    // HeroSection, ServicesSection, ServiceModal, AboutSection, SSTARLSection
    Shield: Icon,
    HardHat: Icon,
    Heart: Icon,
    FileCheck: Icon,
    // ContactSection
    Send: Icon,
    CheckCircle: Icon,
    AlertCircle: Icon,
    Loader2: Icon,
    // AboutSection
    Sparkles: Icon,
    Building2: Icon,
    CheckCircle2: Icon,
    AlertTriangle: Icon,
    // MissionVision
    Target: Icon,
    Rocket: Icon,
    // WhyChooseSection
    BookOpen: Icon,
    Headphones: Icon,
    BarChart3: Icon,
    Award: Icon,
    // PillarsSection
    ShieldCheck: Icon,
    ClipboardCheck: Icon,
    HeartPulse: Icon,
    TrendingUp: Icon,
    // MetricsSection
    Users: Icon,
    TrendingDown: Icon,
    // BenefitsSection
    DollarSign: Icon,
    Clock: Icon,
    GraduationCap: Icon,
    // SSTARLSection
    FileText: Icon,
    Scale: Icon,
    // AIAgent / Chat
    Bot: Icon,
    MessageCircle: Icon,
    User: Icon,
  };
});

// Mock react-icons
vi.mock('react-icons/fa', () => {
  const Icon = (props: any) => <span data-testid="react-icon" aria-hidden="true" {...props} />;
  return {
    FaWhatsapp: Icon,
    FaFacebook: Icon,
    FaInstagram: Icon,
    FaLinkedin: Icon,
  };
});

// Mock brand-assets-components (simple img tags)
vi.mock('@/lib/utils/brand-assets-components', () => ({
  BrandLogo: (props: any) => (
    <img src="/brand/asgro-logo.png" alt="ASGRO LTDA" {...props} />
  ),
  ServicesBanner: (props: any) => (
    <img src="/brand/asgro-services-banner.png" alt="" aria-hidden="true" {...props} />
  ),
}));

// Mock brand-assets
vi.mock('@/lib/utils/brand-assets', () => ({
  LOGO_PATH: '/brand/asgro-logo.png',
  SERVICES_BANNER_PATH: '/brand/asgro-services-banner.png',
  getLogoFallbackDataUri: () => 'data:image/svg+xml,logo',
  getBannerFallbackDataUri: () => 'data:image/svg+xml,banner',
}));

// Mock Counter component (renders simple span with value)
vi.mock('@/components/shared/Counter', () => ({
  default: ({ target, suffix }: any) => (
    <span aria-label={`${target}${suffix || ''}`}>{target}{suffix || ''}</span>
  ),
}));

// Mock fetch to return empty arrays for API-dependent components
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => [],
});

beforeEach(() => {
  global.fetch = mockFetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────
// Import components after mocks
// ─────────────────────────────────────────────────────────────────

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import MissionVision from '@/components/sections/MissionVision';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import ServicesSection from '@/components/sections/ServicesSection';
import MethodologySection from '@/components/sections/MethodologySection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import MetricsSection from '@/components/sections/MetricsSection';
import FAQSection from '@/components/sections/FAQSection';
import ContactSection from '@/components/sections/ContactSection';
import QuoteSection from '@/components/sections/QuoteSection';
import AIAgentSection from '@/components/sections/AIAgentSection';

// ═══════════════════════════════════════════════════════════════════
// Accessibility Tests (jest-axe)
// ═══════════════════════════════════════════════════════════════════

describe('Accessibility: jest-axe automated a11y compliance', () => {
  it('Header has no accessibility violations', async () => {
    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Footer has no accessibility violations', async () => {
    const { container } = render(<Footer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('HeroSection has no accessibility violations', async () => {
    const { container } = render(<HeroSection />);
    // heading-order is disabled because sections are tested in isolation
    // without the full page heading hierarchy
    const results = await axe(container, {
      rules: { 'heading-order': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('AboutSection has no accessibility violations', async () => {
    const { container } = render(<AboutSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('MissionVision has no accessibility violations', async () => {
    const { container } = render(<MissionVision />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('WhyChooseSection has no accessibility violations', async () => {
    const { container } = render(<WhyChooseSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ServicesSection has no accessibility violations', async () => {
    const { container } = render(<ServicesSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('MethodologySection has no accessibility violations', async () => {
    const { container } = render(<MethodologySection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('BenefitsSection has no accessibility violations', async () => {
    const { container } = render(<BenefitsSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('MetricsSection has no accessibility violations', async () => {
    const { container } = render(<MetricsSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FAQSection has no accessibility violations', async () => {
    const { container } = render(<FAQSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ContactSection has no accessibility violations', async () => {
    const { container } = render(<ContactSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('QuoteSection has no accessibility violations', async () => {
    const { container } = render(<QuoteSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AIAgentSection has no accessibility violations', async () => {
    const { container } = render(<AIAgentSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
