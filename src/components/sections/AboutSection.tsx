'use client';

/**
 * AboutSection — Sección "Nosotros" de ASGRO LTDA (includes Mission & Vision)
 *
 * Features:
 * - Section with id="nosotros"
 * - Company description paragraph (150-400 chars) in Spanish
 * - Highlighted value proposition callout in a visually distinct container
 * - Specialization list with Lucide React icons
 * - Integrated Mission & Vision cards (previously standalone MissionVision section)
 * - Two-column layout above 768px (text left, visual right); single column stacked below
 * - AnimatedSection wrapper for viewport entrance animations
 * - Cards use rounded-card token (22px)
 * - Brand colors, Lucide React icons
 * - All content in Spanish, no placeholder text
 *
 * @see Requirements 6.1, 6.2, 6.3, 6.4
 */

import {
  Shield,
  HardHat,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Building2,
  CheckCircle2,
  Target,
  Rocket,
} from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { SITE_CONTENT } from '@/lib/utils/constants';

/** Specialization item with icon and label */
interface Specialization {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const specializations: Specialization[] = [
  {
    id: 'spec-arl',
    icon: <Shield className="h-6 w-6 text-brand-blue" aria-hidden="true" />,
    label: 'Administración de Riesgos Laborales (ARL)',
  },
  {
    id: 'spec-sst',
    icon: <HardHat className="h-6 w-6 text-brand-blue" aria-hidden="true" />,
    label: 'Seguridad y Salud en el Trabajo (SST)',
  },
  {
    id: 'spec-riesgos',
    icon: <AlertTriangle className="h-6 w-6 text-brand-blue" aria-hidden="true" />,
    label: 'Riesgos laborales y prevención',
  },
  {
    id: 'spec-seguros',
    icon: <FileCheck className="h-6 w-6 text-brand-blue" aria-hidden="true" />,
    label: 'Seguros empresariales a la medida',
  },
];

export default function AboutSection() {
  return (
    <section
      id="nosotros"
      className="bg-white py-10 md:py-12 lg:py-15"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-3 lg:px-4">
        <AnimatedSection direction="up" threshold={0.2}>
          {/* Two-column layout: text left, visual right (stacked on mobile) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-10 items-start">
            {/* Left column: Heading + description + specializations */}
            <div className="flex flex-col gap-4">
              <h2
                id="about-heading"
                className="text-h2 text-brand-dark-blue"
              >
                Nosotros
              </h2>

              <p className="text-body-lg text-gray-700 leading-relaxed">
                {SITE_CONTENT.aboutDescription}
              </p>

              {/* Specializations list with icons */}
              <div className="mt-2">
                <h3 className="text-h4 text-brand-dark-blue mb-2">
                  Nuestras especialidades
                </h3>
                <ul className="space-y-2" role="list">
                  {specializations.map((spec) => (
                    <li
                      key={spec.id}
                      className="flex items-center gap-2 rounded-card bg-brand-light-gray p-2 shadow-card transition-shadow hover:shadow-card-hover"
                    >
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                        {spec.icon}
                      </span>
                      <span className="text-body font-medium text-brand-dark-blue">
                        {spec.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right column: Value proposition callout + visual elements */}
            <div className="flex flex-col gap-4">
              {/* Value proposition callout — visually distinct container */}
              <AnimatedSection direction="right" delay={200} threshold={0.2}>
                <div className="rounded-card border-2 border-brand-green/30 bg-gradient-to-br from-brand-green/5 to-brand-neon-green/10 p-4 shadow-card">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-green/20 mt-0.5">
                      <Sparkles className="h-5 w-5 text-brand-green" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-h4 text-brand-dark-blue mb-1">
                        Nuestra propuesta de valor
                      </h3>
                      <p className="text-body text-gray-700 leading-relaxed">
                        {SITE_CONTENT.aboutValueProposition}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Visual trust indicators */}
              <AnimatedSection direction="up" delay={400} threshold={0.2}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center rounded-card bg-brand-light-gray p-3 text-center shadow-card">
                    <Building2 className="h-8 w-8 text-brand-blue mb-1" aria-hidden="true" />
                    <span className="text-h3 font-bold text-brand-dark-blue">15+</span>
                    <span className="text-small text-gray-600">Años de experiencia</span>
                  </div>
                  <div className="flex flex-col items-center rounded-card bg-brand-light-gray p-3 text-center shadow-card">
                    <CheckCircle2 className="h-8 w-8 text-brand-green mb-1" aria-hidden="true" />
                    <span className="text-h3 font-bold text-brand-dark-blue">350+</span>
                    <span className="text-small text-gray-600">Empresas asesoradas</span>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </AnimatedSection>

        {/* Mission & Vision — integrated into About section */}
        <AnimatedSection direction="up" threshold={0.2} className="mt-8">
          <h3 className="mb-4 text-center text-h3 text-brand-dark-blue">
            Nuestra Razón de Ser
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Tarjeta de Misión — acento azul */}
            <div className="flex h-full flex-col rounded-card border border-brand-blue/20 bg-white p-4 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                  <Target
                    className="h-4 w-4 text-brand-blue"
                    aria-hidden="true"
                  />
                </div>
                <h4 className="text-h4 text-brand-blue font-bold">Misión</h4>
              </div>
              <p className="text-body leading-relaxed text-gray-700">
                Brindar soluciones integrales en gestión de riesgos laborales,
                seguridad y salud en el trabajo, y seguros empresariales a la
                medida, protegiendo a las organizaciones y sus colaboradores
                mediante asesoría especializada, acompañamiento permanente y un
                compromiso inquebrantable con el cumplimiento normativo y el
                bienestar laboral.
              </p>
            </div>

            {/* Tarjeta de Visión — acento verde */}
            <div className="flex h-full flex-col rounded-card border border-brand-green/30 bg-white p-4 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green/10">
                  <Rocket
                    className="h-4 w-4 text-brand-green"
                    aria-hidden="true"
                  />
                </div>
                <h4 className="text-h4 text-brand-green-alt font-bold">Visión</h4>
              </div>
              <p className="text-body leading-relaxed text-gray-700">
                Ser la agencia de seguros líder en Colombia en protección
                empresarial, reconocida por la excelencia en la prevención de
                riesgos, la innovación en programas de SST y la capacidad de
                ofrecer soluciones de seguros adaptadas a cada sector productivo,
                contribuyendo al desarrollo sostenible y la competitividad de
                nuestros clientes.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
