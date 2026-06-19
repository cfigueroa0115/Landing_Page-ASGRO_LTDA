import HeroSection from '@/components/sections/HeroSection';
import HomeServicesSection from '@/components/home/HomeServicesSection';
import MetricsSection from '@/components/sections/MetricsSection';
import HomeMethodologyCompact from '@/components/home/HomeMethodologyCompact';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import SectionCTA from '@/components/shared/SectionCTA';

/**
 * Main page — Short premium home with route-based navigation.
 *
 * Structure:
 * 1. HeroSection — value proposition + CTA buttons (route-based)
 * 2. HomeServicesSection — 4 service cards with drawer
 * 3. MetricsSection — animated counters (fetches from /api/metrics)
 * 4. HomeMethodologyCompact — 5 step indicators (compact)
 * 5. WhyChooseSection — 5 differentiators with hover effects
 * 6. SectionCTA — final CTA section
 *
 * Floating elements (WhatsApp, AI Chat, HelpDock) are rendered in layout.tsx
 * so they appear on ALL pages.
 */
export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Inicio */}
      <HeroSection />

      {/* Servicios — quick cards with drawer */}
      <HomeServicesSection />

      {/* Resultados — metrics with animated counters */}
      <MetricsSection />

      {/* Metodología — compact 5 steps */}
      <HomeMethodologyCompact />

      {/* ¿Por qué ASGRO? — differentiators */}
      <WhyChooseSection />

      {/* CTA Final */}
      <SectionCTA
        title="¿Listo para proteger su empresa?"
        subtitle="Contáctenos hoy y reciba asesoría personalizada sin compromiso."
        primaryAction={{ label: 'Contactar asesor', href: '/contacto' }}
        secondaryAction={{ label: 'Cotizar ahora', href: '/cotizar' }}
        whatsappAction
      />
    </main>
  );
}
