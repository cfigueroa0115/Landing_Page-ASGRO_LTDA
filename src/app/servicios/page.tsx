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
  title: 'Servicios - ASGRO Agencia de Seguros',
  description:
    'Soluciones de ASGRO: seguros para personas, patrimonio y empresas, y capacidades complementarias en ARL, SST y bienestar.',
};

// Orden intencional: SEGUROS primero (eje principal), luego ARL, SST, bienestar.
const services = [
  {
    icon: <Building2 className="h-[24px] w-[24px] text-brand-green" />,
    title: 'Soluciones de Seguros',
    description:
      'Seguros para personas, patrimonio y empresas: vida, salud, hogar, automóviles, multirriesgo, responsabilidad civil, cumplimiento y más.',
    bullets: ['Personas y patrimonio', 'Multirriesgo empresarial', 'Responsabilidad civil y cumplimiento'],
    href: '/servicios/seguros-empresariales',
  },
  {
    icon: <Shield className="h-[24px] w-[24px] text-brand-green" />,
    title: 'ARL y Riesgos Laborales',
    description:
      'Acompañamiento en ARL: afiliación, traslado, clasificación de riesgo, gestión de accidentes y enfermedad laboral.',
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
    title: 'Bienestar y Prevención',
    description:
      'Programas de bienestar laboral y prevención que fortalecen la cultura organizacional y el cuidado de las personas.',
    bullets: ['Promoción y prevención', 'Riesgo psicosocial', 'Clima organizacional'],
    href: '/servicios/bienestar-proteccion',
  },
];

export default function ServiciosPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Servicios', href: '/servicios' }]}
      />
      <PageHero
        title="Soluciones para proteger lo que importa"
        subtitle="Seguros para personas, patrimonio y empresas, y capacidades complementarias en gestión del riesgo, ARL y SST."
        eyebrow="Nuestras soluciones"
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
