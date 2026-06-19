import type { Metadata } from 'next';
import { HardHat, Search, FileWarning, ClipboardCheck, AlertOctagon, TrendingUp, BookOpen, ShieldCheck } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import PremiumCard from '@/components/shared/PremiumCard';
import EqualHeightGrid from '@/components/shared/EqualHeightGrid';
import AnimatedSection from '@/components/shared/AnimatedSection';

export const metadata: Metadata = {
  title: 'Seguridad y Salud en el Trabajo - ASGRO LTDA',
  description:
    'Diseño, implementación y seguimiento del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST): diagnóstico, matriz de peligros, auditorías, investigación de accidentes y mejora continua.',
};

const sstServices = [
  {
    icon: <Search className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Diagnóstico Inicial',
    description:
      'Evaluación del estado actual de su empresa frente a los requisitos del SG-SST según la normatividad colombiana vigente.',
    bullets: ['Evaluación de estándares mínimos', 'Identificación de brechas', 'Informe de hallazgos'],
  },
  {
    icon: <FileWarning className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Matriz de Peligros y Riesgos',
    description:
      'Identificación, valoración y priorización de peligros y riesgos en cada proceso de su organización.',
    bullets: ['Identificación de peligros', 'Valoración del riesgo', 'Controles existentes y propuestos'],
  },
  {
    icon: <BookOpen className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Diseño del SG-SST',
    description:
      'Estructuración del Sistema de Gestión de Seguridad y Salud en el Trabajo adaptado a la realidad operativa de su empresa.',
    bullets: ['Política y objetivos', 'Documentación del sistema', 'Programas y procedimientos'],
  },
  {
    icon: <HardHat className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Implementación',
    description:
      'Puesta en marcha del SG-SST: capacitaciones, conformación de comités, y ejecución del plan de trabajo anual.',
    bullets: ['Plan de trabajo anual', 'Capacitaciones obligatorias', 'Conformación de COPASST y CCL'],
  },
  {
    icon: <ClipboardCheck className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Auditorías',
    description:
      'Auditorías internas y acompañamiento en auditorías externas para verificar el cumplimiento y eficacia del sistema.',
    bullets: ['Auditoría interna', 'Revisión por la dirección', 'Plan de acciones correctivas'],
  },
  {
    icon: <AlertOctagon className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Investigación de Accidentes',
    description:
      'Investigación técnica de accidentes e incidentes laborales para identificar causas raíz y definir medidas preventivas.',
    bullets: ['Metodología de investigación', 'Análisis de causalidad', 'Medidas correctivas y preventivas'],
  },
  {
    icon: <TrendingUp className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Mejora Continua',
    description:
      'Seguimiento a indicadores, gestión de no conformidades y actualización permanente del sistema según cambios normativos.',
    bullets: ['Indicadores de gestión', 'Gestión de hallazgos', 'Actualización normativa'],
  },
  {
    icon: <ShieldCheck className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Cumplimiento de Estándares Mínimos',
    description:
      'Verificación y acompañamiento en el cumplimiento de los estándares mínimos del SG-SST establecidos por la resolución vigente.',
    bullets: ['Autoevaluación', 'Plan de mejoramiento', 'Reporte ante entidades'],
  },
];

export default function SeguridadSaludTrabajoPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Servicios', href: '/servicios' },
          { label: 'Seguridad y Salud en el Trabajo', href: '/servicios/seguridad-salud-trabajo' },
        ]}
      />
      <PageHero
        title="Seguridad y Salud en el Trabajo"
        subtitle="Diseñamos, implementamos y acompañamos su Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) para proteger a su equipo y cumplir con la normatividad."
        eyebrow="SG-SST"
      />

      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-[700px] mx-auto text-center mb-5">
              <h2 className="text-h2 text-brand-dark-blue mb-2">
                Componentes del servicio
              </h2>
              <p className="text-body-lg text-gray-600">
                Abordamos cada etapa del ciclo PHVA (Planear, Hacer, Verificar, Actuar) para
                garantizar un sistema robusto y en cumplimiento.
              </p>
            </div>
          </AnimatedSection>
          <EqualHeightGrid columns={{ sm: 1, md: 2, lg: 4 }}>
            {sstServices.map((service) => (
              <PremiumCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
                bullets={service.bullets}
              />
            ))}
          </EqualHeightGrid>
        </div>
      </section>

      <SectionCTA
        title="Solicite su diagnóstico de SG-SST"
        subtitle="Evaluamos el estado actual de su sistema y le presentamos un plan de acción claro."
        primaryAction={{ label: 'Solicitar cotización', href: '/cotizar' }}
        secondaryAction={{ label: 'Contáctenos', href: '/contacto' }}
        whatsappAction
      />
    </>
  );
}
