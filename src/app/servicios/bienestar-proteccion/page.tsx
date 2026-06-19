import type { Metadata } from 'next';
import { Heart, ShieldPlus, Stethoscope, Cross, Users, Smile, HeartHandshake, Flower2 } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import PremiumCard from '@/components/shared/PremiumCard';
import EqualHeightGrid from '@/components/shared/EqualHeightGrid';
import AnimatedSection from '@/components/shared/AnimatedSection';

export const metadata: Metadata = {
  title: 'Bienestar y Protección - ASGRO LTDA',
  description:
    'Seguros de vida grupo, accidentes personales, salud, exequiales, protección familiar y programas de bienestar laboral para empresas colombianas.',
};

const protectionServices = [
  {
    icon: <Heart className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Vida Grupo',
    description:
      'Seguros de vida grupal que brindan respaldo económico a los beneficiarios de sus trabajadores ante eventos de fallecimiento o incapacidad total y permanente.',
    bullets: ['Cobertura por fallecimiento', 'Incapacidad total y permanente', 'Beneficiarios protegidos'],
  },
  {
    icon: <ShieldPlus className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Accidentes Personales',
    description:
      'Pólizas de accidentes personales que cubren eventos inesperados dentro y fuera del ámbito laboral, complementando la cobertura de la ARL.',
    bullets: ['Cobertura 24 horas', 'Gastos médicos', 'Indemnización por evento'],
  },
  {
    icon: <Stethoscope className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Salud',
    description:
      'Planes de salud complementarios y medicina prepagada que amplían el acceso de sus trabajadores a servicios de salud de calidad.',
    bullets: ['Medicina prepagada', 'Planes complementarios', 'Red de especialistas'],
  },
  {
    icon: <Cross className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Exequiales',
    description:
      'Planes exequiales que brindan tranquilidad a sus trabajadores y sus familias ante la pérdida de un ser querido, cubriendo todos los servicios funerarios.',
    bullets: ['Cobertura familiar', 'Servicios integrales', 'Traslados a nivel nacional'],
  },
  {
    icon: <Users className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Protección Familiar',
    description:
      'Extensión de coberturas al grupo familiar de sus trabajadores, fortaleciendo el sentido de pertenencia y la tranquilidad del equipo.',
    bullets: ['Cónyuge e hijos', 'Padres del trabajador', 'Planes flexibles'],
  },
  {
    icon: <Smile className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Bienestar Laboral',
    description:
      'Programas diseñados para mejorar la calidad de vida de sus trabajadores: actividades de integración, salud mental y equilibrio vida-trabajo.',
    bullets: ['Programas de integración', 'Salud mental y emocional', 'Equilibrio vida-trabajo'],
  },
  {
    icon: <HeartHandshake className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Beneficios Corporativos',
    description:
      'Diseño de portafolios de beneficios que complementan la compensación salarial y fortalecen la propuesta de valor al empleado.',
    bullets: ['Portafolio de beneficios', 'Compensación flexible', 'Propuesta de valor al empleado'],
  },
  {
    icon: <Flower2 className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Calidad de Vida',
    description:
      'Acompañamiento en la implementación de estrategias que promuevan un ambiente laboral saludable y la prevención del estrés.',
    bullets: ['Ambiente laboral saludable', 'Prevención del estrés', 'Hábitos de vida saludables'],
  },
];

export default function BienestarProteccionPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Servicios', href: '/servicios' },
          { label: 'Bienestar y Protección', href: '/servicios/bienestar-proteccion' },
        ]}
      />
      <PageHero
        title="Bienestar y Protección"
        subtitle="Protegemos a sus trabajadores y sus familias con soluciones integrales que generan tranquilidad, sentido de pertenencia y bienestar."
        eyebrow="Protección integral"
      />

      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-[700px] mx-auto text-center mb-5">
              <h2 className="text-h2 text-brand-dark-blue mb-2">
                Soluciones de bienestar y protección
              </h2>
              <p className="text-body-lg text-gray-600">
                Un portafolio completo de seguros y programas de bienestar que cuidan a su equipo humano
                más allá del ámbito laboral.
              </p>
            </div>
          </AnimatedSection>
          <EqualHeightGrid columns={{ sm: 1, md: 2, lg: 4 }}>
            {protectionServices.map((service) => (
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
        title="Proteja a su equipo y sus familias"
        subtitle="Diseñamos un plan de bienestar y protección adaptado a su empresa."
        primaryAction={{ label: 'Solicitar cotización', href: '/cotizar' }}
        secondaryAction={{ label: 'Contáctenos', href: '/contacto' }}
        whatsappAction
      />
    </>
  );
}
