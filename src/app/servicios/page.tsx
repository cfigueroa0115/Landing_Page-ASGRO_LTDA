import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, HardHat, Heart, Building2 } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import PremiumCard from '@/components/shared/PremiumCard';
import EqualHeightGrid from '@/components/shared/EqualHeightGrid';
import PremiumButton from '@/components/shared/PremiumButton';

export const metadata: Metadata = {
  title: 'Servicios - ASGRO LTDA',
  description:
    'Servicios integrales de ASGRO LTDA: gestión de riesgos laborales, seguridad y salud en el trabajo, bienestar y protección, y seguros empresariales a la medida.',
};

const services = [
  {
    icon: <Shield className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Gestión de Riesgos Laborales',
    description:
      'Acompañamiento integral en ARL: afiliación, traslado, clasificación de riesgo, gestión de accidentes y enfermedad laboral.',
    bullets: ['Afiliación y traslado ARL', 'Gestión de accidentes laborales', 'Enfermedad laboral'],
    href: '/servicios/riesgos-laborales',
  },
  {
    icon: <HardHat className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Seguridad y Salud en el Trabajo',
    description:
      'Diseño, implementación y seguimiento del SG-SST conforme a la normatividad colombiana vigente.',
    bullets: ['Diagnóstico y planeación', 'Matriz de peligros', 'Auditorías y mejora continua'],
    href: '/servicios/seguridad-salud-trabajo',
  },
  {
    icon: <Heart className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Bienestar y Protección',
    description:
      'Seguros de vida grupo, accidentes personales, salud, exequiales y programas de bienestar laboral.',
    bullets: ['Vida grupo y accidentes', 'Salud y exequiales', 'Protección familiar'],
    href: '/servicios/bienestar-proteccion',
  },
  {
    icon: <Building2 className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Seguros Empresariales a la Medida',
    description:
      'Pólizas adaptadas a su operación: multirriesgo, responsabilidad civil, cumplimiento, manejo y transporte.',
    bullets: ['Multirriesgo empresarial', 'Responsabilidad civil', 'Cumplimiento y manejo'],
    href: '/servicios/seguros-empresariales',
  },
];

export default function ServiciosPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Servicios', href: '/servicios' }]}
      />
      <PageHero
        title="Servicios ASGRO para proteger su empresa"
        subtitle="Cuatro líneas estratégicas diseñadas para cubrir integralmente las necesidades de protección y cumplimiento normativo de su organización."
        eyebrow="Nuestros servicios"
      />

      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <EqualHeightGrid columns={{ sm: 1, md: 2, lg: 2 }}>
            {services.map((service) => (
              <PremiumCard
                key={service.href}
                icon={service.icon}
                title={service.title}
                description={service.description}
                bullets={service.bullets}
                variant="elevated"
                actions={
                  <Link href={service.href}>
                    <PremiumButton variant="outline" size="sm">
                      Conocer más
                    </PremiumButton>
                  </Link>
                }
              />
            ))}
          </EqualHeightGrid>
        </div>
      </section>

      <SectionCTA
        title="¿Necesita asesoría personalizada?"
        subtitle="Nuestro equipo está listo para diseñar la solución ideal para su empresa."
        primaryAction={{ label: 'Solicitar cotización', href: '/cotizar' }}
        secondaryAction={{ label: 'Contáctenos', href: '/contacto' }}
        whatsappAction
      />
    </>
  );
}
