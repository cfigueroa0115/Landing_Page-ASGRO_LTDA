import type { Metadata } from 'next';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import FAQClientSection from './FAQClientSection';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes - ASGRO Agencia de Seguros',
  description:
    'Resolvemos sus dudas sobre seguros para personas y empresas, ARL, SST, cotizaciones y el acompañamiento de ASGRO.',
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
