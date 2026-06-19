import type { Metadata } from 'next';
import { Building2, Flame, Scale, FileCheck, Lock, Truck, Landmark, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import PremiumCard from '@/components/shared/PremiumCard';
import EqualHeightGrid from '@/components/shared/EqualHeightGrid';
import AnimatedSection from '@/components/shared/AnimatedSection';

export const metadata: Metadata = {
  title: 'Seguros Empresariales a la Medida - ASGRO LTDA',
  description:
    'Seguros empresariales adaptados a su operación: multirriesgo, responsabilidad civil, cumplimiento, manejo, transporte y protección de daños patrimoniales.',
};

const insuranceServices = [
  {
    icon: <Flame className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Multirriesgo Empresarial',
    description:
      'Póliza integral que protege los activos de su empresa contra incendio, explosión, fenómenos naturales, hurto y otros riesgos en una sola cobertura.',
    bullets: ['Incendio y explosión', 'Fenómenos naturales', 'Hurto calificado'],
  },
  {
    icon: <Scale className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Responsabilidad Civil',
    description:
      'Cobertura ante reclamaciones de terceros por daños materiales o lesiones personales derivadas de la operación de su empresa.',
    bullets: ['Extracontractual', 'Patronal', 'Productos y servicios'],
  },
  {
    icon: <FileCheck className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Cumplimiento',
    description:
      'Pólizas de cumplimiento para respaldar obligaciones contractuales con entidades públicas y privadas conforme a la normatividad colombiana.',
    bullets: ['Contratos públicos', 'Contratos privados', 'Estabilidad de obra'],
  },
  {
    icon: <Lock className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Manejo',
    description:
      'Seguro de manejo que protege su patrimonio ante actos deshonestos, abuso de confianza o fraude por parte de empleados con manejo de bienes o recursos.',
    bullets: ['Infidelidad y riesgos financieros', 'Manejo de valores', 'Protección patrimonial'],
  },
  {
    icon: <Truck className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Transporte',
    description:
      'Cobertura para mercancías en tránsito nacional, protegiendo su operación logística ante pérdidas o daños durante el transporte.',
    bullets: ['Transporte nacional', 'Mercancías en tránsito', 'Carga terrestre'],
  },
  {
    icon: <Landmark className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Daños Patrimoniales',
    description:
      'Protección del patrimonio empresarial ante eventos que puedan afectar su infraestructura, equipos y maquinaria.',
    bullets: ['Rotura de maquinaria', 'Equipo electrónico', 'Lucro cesante'],
  },
  {
    icon: <Building2 className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Todo Riesgo Constructor',
    description:
      'Póliza diseñada para proyectos de construcción que cubre daños a la obra, materiales, maquinaria y responsabilidad civil durante la ejecución.',
    bullets: ['Daños a la obra', 'Maquinaria y equipos', 'Responsabilidad civil cruzada'],
  },
  {
    icon: <ShieldAlert className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Asesoría en Siniestros',
    description:
      'Acompañamiento en la gestión de siniestros: reporte, documentación, seguimiento y negociación con la aseguradora para una pronta indemnización.',
    bullets: ['Reporte de siniestros', 'Documentación del caso', 'Seguimiento hasta indemnización'],
  },
];

export default function SegurosEmpresarialesPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Servicios', href: '/servicios' },
          { label: 'Seguros Empresariales', href: '/servicios/seguros-empresariales' },
        ]}
      />
      <PageHero
        title="Seguros Empresariales a la Medida"
        subtitle="Pólizas diseñadas para su operación: protegemos los activos, el patrimonio y la continuidad de su negocio con coberturas adaptadas a su realidad."
        eyebrow="Protección patrimonial"
      />

      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-[700px] mx-auto text-center mb-5">
              <h2 className="text-h2 text-brand-dark-blue mb-2">
                Nuestras coberturas empresariales
              </h2>
              <p className="text-body-lg text-gray-600">
                Cada póliza se estructura según el perfil de riesgo, la actividad económica y las
                necesidades particulares de su empresa.
              </p>
            </div>
          </AnimatedSection>
          <EqualHeightGrid columns={{ sm: 1, md: 2, lg: 4 }}>
            {insuranceServices.map((service) => (
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
        title="Cotice sus seguros empresariales"
        subtitle="Analizamos su operación y le presentamos la mejor estructura de coberturas."
        primaryAction={{ label: 'Solicitar cotización', href: '/cotizar' }}
        secondaryAction={{ label: 'Contáctenos', href: '/contacto' }}
        whatsappAction
      />
    </>
  );
}
