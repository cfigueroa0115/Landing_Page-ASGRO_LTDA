'use client';

import { Target, Rocket } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';

/**
 * MissionVision — Sección de Misión y Visión de ASGRO LTDA.
 *
 * Presenta las declaraciones de misión y visión en tarjetas diferenciadas
 * con iconos y acentos de color distintos (azul para misión, verde para visión).
 * Layout side-by-side en viewports ≥768px, apilado en móvil.
 */
export default function MissionVision() {
  return (
    <section
      className="w-full bg-brand-light-gray py-10 md:py-12"
      aria-labelledby="mision-vision-heading"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-4">
        <AnimatedSection direction="up" threshold={0.2}>
          <h2
            id="mision-vision-heading"
            className="mb-6 text-center text-h2 text-brand-dark-blue"
          >
            Nuestra Razón de Ser
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Tarjeta de Misión — acento azul */}
          <AnimatedSection direction="left" delay={100} threshold={0.2}>
            <div className="flex h-full flex-col rounded-card border border-brand-blue/20 bg-white p-4 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                  <Target
                    className="h-4 w-4 text-brand-blue"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-h3 text-brand-blue">Misión</h3>
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
          </AnimatedSection>

          {/* Tarjeta de Visión — acento verde */}
          <AnimatedSection direction="right" delay={200} threshold={0.2}>
            <div className="flex h-full flex-col rounded-card border border-brand-green/30 bg-white p-4 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green/10">
                  <Rocket
                    className="h-4 w-4 text-brand-green"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-h3 text-brand-green-alt">Visión</h3>
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
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
