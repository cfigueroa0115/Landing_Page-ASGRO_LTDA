import HeroSection from '@/components/sections/HeroSection';
import ValuePropositionSection from '@/components/sections/ValuePropositionSection';
import InsurancePortfolioSection from '@/components/sections/InsurancePortfolioSection';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import HomeMethodologyCompact from '@/components/home/HomeMethodologyCompact';
import ComplementarySection from '@/components/sections/ComplementarySection';
import CorporateSection from '@/components/shared/CorporateSection';
import ValueGeneratedSection from '@/components/sections/ValueGeneratedSection';
import SectionCTA from '@/components/shared/SectionCTA';

/**
 * Home — ASGRO Agencia de Seguros.
 *
 * Arquitectura seguros-first:
 * 1. Hero — "Protegemos lo que mueve su futuro." (seguros ante todo)
 * 2. Propuesta de valor — Personas · Patrimonio · Empresas
 * 3. Portafolio de Seguros — sección núcleo
 * 4. ¿Por qué elegir ASGRO? — 5 diferenciadores cualitativos
 * 5. Modelo de acompañamiento — 4 etapas
 * 6. Capacidades complementarias — ARL y SST (secundarias)
 * 7. Protección para empresas — bloque B2B (ancla #empresas)
 * 8. Valor que generamos — beneficios cualitativos (sin cifras)
 * 9. CTA final
 *
 * Elementos flotantes (WhatsApp, chat IA) viven en layout.tsx.
 */
export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      <HeroSection />
      <ValuePropositionSection />
      <InsurancePortfolioSection />
      <WhyChooseSection />
      <HomeMethodologyCompact />
      <ComplementarySection />
      <CorporateSection />
      <ValueGeneratedSection />

      <SectionCTA
        title="Conversemos sobre lo que necesita proteger."
        subtitle="Permítanos conocer su necesidad y acompañarlo en la búsqueda de una solución adecuada."
        primaryAction={{ label: 'Hablar con un asesor', href: '/contacto' }}
        secondaryAction={{ label: 'Solicitar una cotización', href: '/cotizar' }}
        whatsappAction
      />
    </main>
  );
}
