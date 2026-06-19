import type { Metadata } from 'next';
import { Layers, ListChecks, CircleDot, Handshake, Clock } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import PremiumCard from '@/components/shared/PremiumCard';
import EqualHeightGrid from '@/components/shared/EqualHeightGrid';
import AnimatedSection from '@/components/shared/AnimatedSection';

export const metadata: Metadata = {
  title: 'Resultados - ASGRO LTDA',
  description:
    'Impacto y resultados de ASGRO LTDA: 4 líneas estratégicas, 5 fases metodológicas, visión 360°, acompañamiento 100% y orientación digital 24/7.',
};

const metrics = [
  {
    icon: <Layers className="h-[28px] w-[28px] text-brand-green" />,
    value: '4',
    label: 'Líneas Estratégicas',
    description:
      'Cuatro líneas de servicio que cubren integralmente las necesidades de protección empresarial: riesgos laborales, SST, bienestar y seguros empresariales.',
  },
  {
    icon: <ListChecks className="h-[28px] w-[28px] text-brand-green" />,
    value: '5',
    label: 'Fases Metodológicas',
    description:
      'Cinco fases estructuradas (diagnóstico, planeación, implementación, seguimiento y mejora continua) que garantizan resultados sostenibles en cada gestión.',
  },
  {
    icon: <CircleDot className="h-[28px] w-[28px] text-brand-green" />,
    value: '360°',
    label: 'Visión Integral',
    description:
      'Enfoque completo que abarca todas las dimensiones de la gestión de riesgos y protección empresarial, integrando cumplimiento normativo con bienestar organizacional.',
  },
  {
    icon: <Handshake className="h-[28px] w-[28px] text-brand-green" />,
    value: '100%',
    label: 'Acompañamiento',
    description:
      'Compromiso total con cada cliente: acompañamiento personalizado desde el diagnóstico hasta la mejora continua, sin delegar ni subcontratar la relación.',
  },
  {
    icon: <Clock className="h-[28px] w-[28px] text-brand-green" />,
    value: '24/7',
    label: 'Orientación Digital',
    description:
      'Canal digital activo las 24 horas para orientación inicial, resolución de dudas frecuentes y direccionamiento de solicitudes a través de nuestro asistente virtual.',
  },
];

export default function ResultadosPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Resultados', href: '/resultados' }]}
      />
      <PageHero
        title="Impacto y Resultados"
        subtitle="Indicadores institucionales que reflejan nuestro modelo de gestión integral y compromiso con cada organización que acompañamos."
        eyebrow="Nuestro impacto"
      />

      {/* Metrics section */}
      <section className="py-10 md:py-14 bg-white">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-[700px] mx-auto text-center mb-6">
              <h2 className="text-h2 text-brand-dark-blue mb-2">
                Indicadores de gestión
              </h2>
              <p className="text-body-lg text-gray-600">
                Estos indicadores reflejan la estructura y alcance de nuestro
                modelo de acompañamiento, no promesas comerciales.
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-4 max-w-[900px] mx-auto">
            {metrics.map((metric) => (
              <AnimatedSection key={metric.label}>
                <div className="flex items-start gap-3 bg-brand-light-gray rounded-card p-3 md:p-4 border border-gray-100">
                  <div className="flex-shrink-0 flex h-[64px] w-[64px] items-center justify-center rounded-full bg-gradient-to-br from-brand-green/20 to-brand-blue/10">
                    {metric.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-2xl md:text-3xl font-bold text-brand-dark-blue">
                        {metric.value}
                      </span>
                      <span className="text-lg font-semibold text-brand-green">
                        {metric.label}
                      </span>
                    </div>
                    <p className="text-body text-gray-600">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* What each metric means */}
      <section className="py-10 md:py-12 bg-brand-light-gray">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-[700px] mx-auto text-center mb-5">
              <h2 className="text-h2 text-brand-dark-blue mb-2">
                ¿Qué significa cada indicador?
              </h2>
              <p className="text-body-lg text-gray-600">
                Nuestros indicadores reflejan la estructura del servicio, no
                promesas de resultados específicos. Cada empresa es única.
              </p>
            </div>
          </AnimatedSection>
          <EqualHeightGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <PremiumCard
              title="Líneas estratégicas"
              description="Cada línea cubre un ámbito de protección: riesgos laborales (ARL), SST, bienestar/protección personal y seguros empresariales."
              bullets={['Cobertura integral', 'Sin vacíos de protección', 'Sinergia entre líneas']}
            />
            <PremiumCard
              title="Fases metodológicas"
              description="El ciclo PHVA aplicado a la gestión: aseguramos que cada acción tenga diagnóstico previo, plan, ejecución, medición y ajuste."
              bullets={['Diagnóstico → Planeación', 'Implementación → Seguimiento', 'Mejora continua']}
            />
            <PremiumCard
              title="Visión 360° y acompañamiento"
              description="Abordamos la gestión desde todas las perspectivas necesarias y acompañamos al cliente de forma directa en cada etapa del proceso."
              bullets={['Sin intermediarios', 'Atención personalizada', 'Canal digital permanente']}
            />
          </EqualHeightGrid>
        </div>
      </section>

      <SectionCTA
        title="Conozca cómo podemos apoyar su empresa"
        subtitle="Solicite un diagnóstico inicial sin costo y descubra el estado de su gestión."
        primaryAction={{ label: 'Solicitar diagnóstico', href: '/cotizar' }}
        secondaryAction={{ label: 'Ver metodología', href: '/metodologia' }}
        whatsappAction
      />
    </>
  );
}
