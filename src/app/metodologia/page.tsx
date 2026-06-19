import type { Metadata } from 'next';
import { Search, CalendarCheck, Cog, LineChart, RefreshCw } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import AnimatedSection from '@/components/shared/AnimatedSection';

export const metadata: Metadata = {
  title: 'Metodología - ASGRO LTDA',
  description:
    'Nuestra metodología en 5 fases: diagnóstico, planeación, implementación, seguimiento y mejora continua para la gestión integral de riesgos y cumplimiento normativo.',
};

const phases = [
  {
    number: 1,
    icon: <Search className="h-[28px] w-[28px] text-white" />,
    title: 'Diagnóstico',
    description:
      'Evaluamos el estado actual de su empresa frente a los requisitos normativos y las necesidades de protección. Identificamos brechas, riesgos prioritarios y oportunidades de mejora.',
    benefits: [
      'Levantamiento de información actual',
      'Identificación de brechas y riesgos',
      'Evaluación de cumplimiento normativo',
      'Análisis de necesidades de protección',
    ],
    results: 'Informe diagnóstico con hallazgos, nivel de cumplimiento y hoja de ruta propuesta.',
  },
  {
    number: 2,
    icon: <CalendarCheck className="h-[28px] w-[28px] text-white" />,
    title: 'Planeación',
    description:
      'Con base en el diagnóstico, diseñamos un plan de acción priorizado con objetivos, responsables, cronograma y recursos necesarios para cerrar las brechas identificadas.',
    benefits: [
      'Plan de trabajo priorizado',
      'Definición de objetivos medibles',
      'Asignación de responsables',
      'Cronograma de ejecución',
    ],
    results: 'Plan de trabajo estructurado con metas, plazos y responsables definidos.',
  },
  {
    number: 3,
    icon: <Cog className="h-[28px] w-[28px] text-white" />,
    title: 'Implementación',
    description:
      'Ejecutamos las acciones definidas en el plan: documentación, capacitaciones, trámites, implementación de controles y puesta en marcha de programas.',
    benefits: [
      'Ejecución de acciones correctivas',
      'Capacitación y formación',
      'Implementación de controles',
      'Gestión documental',
    ],
    results: 'Sistema implementado, personal capacitado y controles operativos en funcionamiento.',
  },
  {
    number: 4,
    icon: <LineChart className="h-[28px] w-[28px] text-white" />,
    title: 'Seguimiento',
    description:
      'Monitoreamos indicadores de gestión, verificamos la eficacia de las acciones implementadas y realizamos auditorías periódicas para asegurar el mantenimiento del sistema.',
    benefits: [
      'Monitoreo de indicadores',
      'Auditorías de verificación',
      'Medición de eficacia',
      'Reportes periódicos',
    ],
    results: 'Tablero de indicadores actualizado y evidencia de cumplimiento sostenido.',
  },
  {
    number: 5,
    icon: <RefreshCw className="h-[28px] w-[28px] text-white" />,
    title: 'Mejora Continua',
    description:
      'Identificamos oportunidades de optimización, gestionamos las no conformidades y actualizamos el sistema ante cambios normativos o de la operación.',
    benefits: [
      'Gestión de no conformidades',
      'Actualización normativa permanente',
      'Optimización de procesos',
      'Innovación en controles',
    ],
    results: 'Sistema actualizado, adaptado a cambios y en constante evolución hacia la excelencia.',
  },
];

export default function MetodologiaPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Metodología', href: '/metodologia' }]}
      />
      <PageHero
        title="Nuestra Metodología"
        subtitle="Un enfoque estructurado en 5 fases que garantiza resultados medibles y sostenibles en la gestión de riesgos y cumplimiento normativo de su empresa."
        eyebrow="Cómo trabajamos"
      />

      {/* Timeline / Roadmap */}
      <section className="py-10 md:py-14 bg-white">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-[700px] mx-auto text-center mb-6">
              <h2 className="text-h2 text-brand-dark-blue mb-2">
                5 fases para resultados sostenibles
              </h2>
              <p className="text-body-lg text-gray-600">
                Cada fase está diseñada para construir sobre la anterior, generando un ciclo de
                mejora que fortalece progresivamente la gestión de su organización.
              </p>
            </div>
          </AnimatedSection>

          {/* Timeline items */}
          <div className="relative max-w-[800px] mx-auto">
            {/* Vertical line - hidden on mobile */}
            <div className="hidden md:block absolute left-[32px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-green via-brand-blue to-brand-dark-blue" />

            <div className="space-y-5 md:space-y-6">
              {phases.map((phase) => (
                <AnimatedSection key={phase.number} delay={phase.number * 100}>
                  <div className="relative flex gap-3 md:gap-4">
                    {/* Phase number circle */}
                    <div className="flex-shrink-0 flex items-start">
                      <div className="relative z-10 flex h-[64px] w-[64px] items-center justify-center rounded-full bg-gradient-to-br from-brand-green to-brand-blue shadow-lg">
                        {phase.icon}
                      </div>
                    </div>

                    {/* Phase content */}
                    <div className="flex-1 bg-brand-light-gray rounded-card p-3 md:p-4 border border-gray-100">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-bold text-brand-green uppercase tracking-wide">
                          Fase {phase.number}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-brand-dark-blue mb-1">
                        {phase.title}
                      </h3>
                      <p className="text-body text-gray-600 mb-2">
                        {phase.description}
                      </p>

                      {/* Benefits */}
                      <div className="mb-2">
                        <h4 className="text-sm font-semibold text-brand-dark-blue mb-0.5">
                          Actividades clave:
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                          {phase.benefits.map((benefit) => (
                            <li
                              key={benefit}
                              className="flex items-start gap-1 text-sm text-gray-700"
                            >
                              <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Expected results */}
                      <div className="bg-white rounded-input p-2 border border-gray-200">
                        <h4 className="text-sm font-semibold text-brand-dark-blue mb-0.5">
                          Resultado esperado:
                        </h4>
                        <p className="text-sm text-gray-600">{phase.results}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        title="Solicitar diagnóstico empresarial"
        subtitle="Iniciamos con un diagnóstico gratuito para identificar sus necesidades y diseñar un plan a la medida."
        primaryAction={{ label: 'Solicitar diagnóstico', href: '/cotizar' }}
        secondaryAction={{ label: 'Contáctenos', href: '/contacto' }}
        whatsappAction
      />
    </>
  );
}
