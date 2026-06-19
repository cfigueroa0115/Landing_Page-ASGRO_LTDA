import type { Metadata } from 'next';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import ContactSection from '@/components/sections/ContactSection';
import ContactSidebar from './ContactSidebar';

export const metadata: Metadata = {
  title: 'Contacto - ASGRO LTDA',
  description:
    'Contáctenos para solicitar asesoría en gestión de riesgos laborales, SG-SST, seguros empresariales y bienestar laboral. Formulario de contacto y WhatsApp.',
};

export default function ContactoPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Contacto', href: '/contacto' }]}
      />
      <PageHero
        title="Contáctenos"
        subtitle="Complete el formulario o escríbanos por WhatsApp. Nuestro equipo se comunicará con usted a la brevedad."
        eyebrow="Contacto"
      />

      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main form - takes 2 cols */}
            <div className="lg:col-span-2">
              <ContactSection />
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ContactSidebar />
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        title="¿Prefiere una cotización formal?"
        subtitle="Si ya tiene claro el servicio que necesita, solicite una cotización directamente."
        primaryAction={{ label: 'Solicitar cotización', href: '/cotizar' }}
        whatsappAction
      />
    </>
  );
}
