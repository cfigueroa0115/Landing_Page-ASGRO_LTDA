import type { Metadata } from 'next';
import { Shield, UserPlus, ArrowRightLeft, AlertTriangle, Stethoscope, FileCheck, Users, ClipboardList } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import PremiumCard from '@/components/shared/PremiumCard';
import EqualHeightGrid from '@/components/shared/EqualHeightGrid';
import AnimatedSection from '@/components/shared/AnimatedSection';

export const metadata: Metadata = {
  title: 'Gestión de Riesgos Laborales - ASGRO LTDA',
  description:
    'Gestión integral de riesgos laborales: afiliación ARL, traslado, clasificación de riesgo, gestión de accidentes laborales, enfermedad laboral y acompañamiento en casos.',
};

const serviceAreas = [
  {
    icon: <UserPlus className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Afiliación ARL',
    description:
      'Gestión completa del proceso de afiliación a la Administradora de Riesgos Laborales, asegurando la cobertura de todos sus trabajadores.',
    bullets: ['Asesoría en selección de ARL', 'Trámite de afiliación', 'Documentación requerida'],
  },
  {
    icon: <ArrowRightLeft className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Traslado de ARL',
    description:
      'Acompañamiento en el proceso de traslado entre administradoras de riesgos laborales, garantizando continuidad en la cobertura.',
    bullets: ['Evaluación de conveniencia', 'Gestión del trámite', 'Seguimiento post-traslado'],
  },
  {
    icon: <Shield className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Clasificación de Riesgo',
    description:
      'Análisis y acompañamiento en la correcta clasificación del nivel de riesgo de su actividad económica según la normatividad vigente.',
    bullets: ['Análisis de actividad económica', 'Verificación de clase de riesgo', 'Gestión ante la ARL'],
  },
  {
    icon: <AlertTriangle className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Gestión de Accidentes Laborales',
    description:
      'Acompañamiento integral ante la ocurrencia de accidentes de trabajo: reporte, investigación y seguimiento del caso.',
    bullets: ['Reporte oportuno', 'Investigación del evento', 'Seguimiento de prestaciones'],
  },
  {
    icon: <Stethoscope className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Enfermedad Laboral',
    description:
      'Gestión de casos de enfermedad laboral: identificación, calificación de origen, seguimiento y rehabilitación.',
    bullets: ['Identificación temprana', 'Calificación de origen', 'Plan de rehabilitación'],
  },
  {
    icon: <Users className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Acompañamiento Integral',
    description:
      'Asesoría continua en la relación empresa-ARL para optimizar los servicios de prevención y atención.',
    bullets: ['Relación empresa-ARL', 'Optimización de servicios', 'Prevención activa'],
  },
  {
    icon: <ClipboardList className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Gestión de Casos',
    description:
      'Seguimiento personalizado de cada caso laboral abierto, asegurando el cumplimiento de plazos y la correcta atención al trabajador.',
    bullets: ['Seguimiento personalizado', 'Cumplimiento de plazos', 'Atención al trabajador'],
  },
  {
    icon: <FileCheck className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Cumplimiento Normativo',
    description:
      'Verificación del cumplimiento de obligaciones legales en materia de riesgos laborales según la legislación colombiana.',
    bullets: ['Obligaciones del empleador', 'Reportes obligatorios', 'Actualización normativa'],
  },
];

export default function RiesgosLaboralesPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Servicios', href: '/servicios' },
          { label: 'Riesgos Laborales', href: '/servicios/riesgos-laborales' },
        ]}
      />
      <PageHero
        title="Gestión de Riesgos Laborales"
        subtitle="Acompañamiento integral en la administración de riesgos laborales para proteger a sus trabajadores y cumplir con la normatividad colombiana."
        eyebrow="ARL y Riesgos Laborales"
      />

      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-[700px] mx-auto text-center mb-5">
              <h2 className="text-h2 text-brand-dark-blue mb-2">
                Áreas de gestión
              </h2>
              <p className="text-body-lg text-gray-600">
                Cubrimos todo el ciclo de gestión de riesgos laborales: desde la afiliación hasta
                el seguimiento de casos y el cumplimiento normativo.
              </p>
            </div>
          </AnimatedSection>
          <EqualHeightGrid columns={{ sm: 1, md: 2, lg: 4 }}>
            {serviceAreas.map((area) => (
              <PremiumCard
                key={area.title}
                icon={area.icon}
                title={area.title}
                description={area.description}
                bullets={area.bullets}
              />
            ))}
          </EqualHeightGrid>
        </div>
      </section>

      <SectionCTA
        title="Solicite su cotización en gestión de riesgos laborales"
        subtitle="Nuestro equipo le brindará una propuesta adaptada a las necesidades de su empresa."
        primaryAction={{ label: 'Solicitar cotización', href: '/cotizar' }}
        secondaryAction={{ label: 'Contáctenos', href: '/contacto' }}
        whatsappAction
      />
    </>
  );
}
