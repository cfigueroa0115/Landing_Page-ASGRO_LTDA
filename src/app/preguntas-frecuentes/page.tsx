import type { Metadata } from 'next';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import FAQClientSection from './FAQClientSection';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes - ASGRO LTDA',
  description:
    'Resolvemos sus dudas sobre gestión de riesgos laborales, SG-SST, seguros empresariales, cotizaciones y proceso de acompañamiento de ASGRO LTDA.',
};

export default function PreguntasFrecuentesPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Preguntas Frecuentes', href: '/preguntas-frecuentes' }]}
      />
      <PageHero
        title="Preguntas Frecuentes"
        subtitle="Encuentre respuestas a las consultas más comunes sobre nuestros servicios, procesos y acompañamiento."
        eyebrow="FAQ"
      />

      <FAQClientSection />

      <SectionCTA
        title="¿No encontró su respuesta?"
        subtitle="Nuestro equipo está disponible para resolver cualquier consulta adicional."
        primaryAction={{ label: 'Contáctenos', href: '/contacto' }}
        whatsappAction
      />
    </>
  );
}
