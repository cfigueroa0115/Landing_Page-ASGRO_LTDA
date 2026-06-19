import HeroSection from '@/components/sections/HeroSection';
import PillarsSection from '@/components/sections/PillarsSection';
import AboutSection from '@/components/sections/AboutSection';
import MissionVision from '@/components/sections/MissionVision';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import ServicesSection from '@/components/sections/ServicesSection';
import SSTARLSection from '@/components/sections/SSTARLSection';
import MethodologySection from '@/components/sections/MethodologySection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import MetricsSection from '@/components/sections/MetricsSection';
import AIAgentSection from '@/components/sections/AIAgentSection';
import FAQSection from '@/components/sections/FAQSection';
import ContactSection from '@/components/sections/ContactSection';
import QuoteSection from '@/components/sections/QuoteSection';
import WhatsAppButton from '@/components/shared/WhatsAppButton';

/**
 * Main page — Server Component that assembles all sections in the correct order.
 *
 * Section flow matches the Spanish Header navigation:
 * Inicio → Nosotros → Servicios → Metodología → Resultados → Agente IA →
 * Preguntas frecuentes → Contacto → Cotizar
 *
 * Client Components (MetricsSection, AIAgentSection, FAQSection, ContactSection,
 * QuoteSection, WhatsAppButton) are naturally isolated by their "use client" boundaries.
 *
 * @see Requirement 22.7
 */
export default function Home() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

  return (
    <main id="main-content" className="min-h-screen">
      {/* Inicio */}
      <HeroSection />

      {/* Pilares estratégicos */}
      <PillarsSection />

      {/* Nosotros */}
      <AboutSection />

      {/* Misión y Visión */}
      <MissionVision />

      {/* Por qué elegirnos */}
      <WhyChooseSection />

      {/* Servicios */}
      <ServicesSection />

      {/* SST y ARL */}
      <SSTARLSection />

      {/* Metodología */}
      <MethodologySection />

      {/* Beneficios */}
      <BenefitsSection />

      {/* Resultados */}
      <MetricsSection />

      {/* Agente IA */}
      <AIAgentSection />

      {/* Preguntas frecuentes */}
      <FAQSection />

      {/* Contacto */}
      <ContactSection />

      {/* Cotizar */}
      <QuoteSection />

      {/* Floating WhatsApp button */}
      {whatsappNumber && (
        <WhatsAppButton phoneNumber={whatsappNumber} variant="floating" />
      )}
    </main>
  );
}
