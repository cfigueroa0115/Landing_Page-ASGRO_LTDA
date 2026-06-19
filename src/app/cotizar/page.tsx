import type { Metadata } from 'next';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import QuoteSection from '@/components/sections/QuoteSection';
import QuoteSidebar from './QuoteSidebar';

export const metadata: Metadata = {
  title: 'Solicitar Cotización - ASGRO LTDA',
  description:
    'Solicite una cotización personalizada para gestión de riesgos laborales, SG-SST, seguros empresariales o bienestar laboral. Sin costo ni compromiso.',
};

export default function CotizarPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Cotizar', href: '/cotizar' }]}
      />
      <PageHero
        title="Solicitar Cotización"
        subtitle="Complete el formulario con los datos de su empresa y le enviaremos una propuesta personalizada sin costo ni compromiso."
        eyebrow="Cotización"
      />

      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main form - takes 2 cols */}
            <div className="lg:col-span-2">
              <QuoteSection />
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <QuoteSidebar />
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        title="¿Tiene preguntas antes de cotizar?"
        subtitle="Consulte nuestras preguntas frecuentes o contáctenos directamente."
        primaryAction={{ label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' }}
        secondaryAction={{ label: 'Contáctenos', href: '/contacto' }}
        whatsappAction
      />
    </>
  );
}
