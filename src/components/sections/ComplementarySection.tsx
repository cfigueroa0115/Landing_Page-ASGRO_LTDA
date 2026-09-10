'use client';

/**
 * ComplementarySection — Capacidades complementarias a los seguros.
 *
 * Presenta ARL/Riesgos Laborales y SST como capacidades SECUNDARias, claramente
 * diferenciadas del portafolio de seguros y sin ocupar más espacio que este.
 * Dos bloques compactos lado a lado.
 */

import Link from 'next/link';
import { ClipboardCheck, HardHat, ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import SectionHeader from '@/components/shared/SectionHeader';

interface CapabilityBlock {
  id: string;
  icon: typeof ClipboardCheck;
  title: string;
  description: string;
  items: string[];
  href: string;
  cta: string;
}

const CAPABILITIES: CapabilityBlock[] = [
  {
    id: 'cap-arl',
    icon: ClipboardCheck,
    title: 'Gestión de Riesgos Laborales y ARL',
    description:
      'Complementamos la protección empresarial con acompañamiento preventivo y gestión de riesgos laborales.',
    items: [
      'Clasificación y afiliaciones',
      'Investigación de accidentes',
      'Indicadores de accidentalidad',
      'Acompañamiento en reclamaciones',
    ],
    href: '/servicios/riesgos-laborales',
    cta: 'Conocer ARL',
  },
  {
    id: 'cap-sst',
    icon: HardHat,
    title: 'Seguridad y Salud en el Trabajo',
    description:
      'Capacidad complementaria para el diseño y cumplimiento del SG-SST de su organización.',
    items: [
      'SG-SST',
      'Auditorías',
      'Investigación de accidentes',
      'Capacitación y prevención',
    ],
    href: '/servicios/seguridad-salud-trabajo',
    cta: 'Conocer servicios SST',
  },
];

export default function ComplementarySection() {
  return (
    <section
      id="capacidades"
      aria-labelledby="complementary-heading"
      className="scroll-mt-[84px] bg-white py-12 md:py-16"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Capacidades complementarias"
          title="Más allá del seguro: gestión integral del riesgo"
          subtitle="Complementamos la protección aseguradora con acompañamiento en riesgos laborales y seguridad y salud en el trabajo."
          titleId="complementary-heading"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CAPABILITIES.map((cap, index) => {
            const Icon = cap.icon;
            return (
              <AnimatedSection key={cap.id} delay={index * 120}>
                <article className="flex h-full flex-col rounded-card border border-gray-100 bg-brand-light-gray/60 p-[24px] transition-shadow duration-300 hover:shadow-card">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-brand-blue/10">
                      <Icon className="h-[22px] w-[22px] text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <h3 className="text-h4 font-bold text-brand-dark-blue">{cap.title}</h3>
                  </div>

                  <p className="text-body text-gray-600">{cap.description}</p>

                  <ul className="mt-3 flex flex-wrap gap-[6px]">
                    {cap.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-white px-[10px] py-1 text-small text-gray-700 ring-1 ring-gray-200"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    <Link
                      href={cap.href}
                      className="inline-flex min-h-[44px] items-center gap-1 text-brand-blue font-semibold transition-colors hover:text-brand-blue/80"
                    >
                      {cap.cta}
                      <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
