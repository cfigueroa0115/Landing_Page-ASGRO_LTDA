'use client';

/**
 * TrustSection — Confianza y respaldo (SUB-BLOQUE 1B).
 *
 * Comunica el ROL de ASGRO como agencia/intermediario y aliado de seguros:
 * identifica necesidades, estudia alternativas del mercado asegurador y
 * acompaña la vigencia de las pólizas.
 *
 * Diferenciación con "Por qué ASGRO": aquel usa tarjetas ValueCard (con caja,
 * borde y sombra) y describe atributos de carácter. Esta sección usa un estilo
 * LIGERO y aireado, SIN cajas pesadas, y describe acciones del intermediario.
 *
 * Sin cifras, sin logos de aseguradoras, sin afirmaciones regulatorias, sin
 * posicionar a ASGRO como aseguradora.
 */

import { UserCheck, SearchCheck, CalendarClock, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import SectionHeader from '@/components/shared/SectionHeader';
import { TRUST_PILLARS, SITE_CONTENT } from '@/lib/utils/constants';

const ICON_MAP: Record<string, LucideIcon> = {
  UserCheck,
  SearchCheck,
  CalendarClock,
  Layers,
};

export default function TrustSection() {
  return (
    <section
      id="confianza"
      aria-labelledby="trust-heading"
      className="brand-surface scroll-mt-20 py-12 md:py-16"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow={SITE_CONTENT.trustEyebrow}
          title={SITE_CONTENT.trustTitle}
          subtitle={SITE_CONTENT.trustSubtitle}
          titleId="trust-heading"
        />

        {/* Pilares ligeros — sin cajas pesadas, separados por espacio en blanco.
            Un filete verde discreto marca cada pilar sin encerrarlo en tarjeta. */}
        <AnimatedSection delay={120}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = ICON_MAP[pillar.icon] ?? Layers;
              return (
                <div
                  key={pillar.id}
                  className="flex flex-col items-center px-2 text-center"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/10 ring-1 ring-brand-green/20">
                    <Icon
                      className="h-6 w-6 text-brand-blue"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-brand-dark-blue">
                    {pillar.title}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="mt-2 mb-2 block h-[2px] w-8 rounded-full bg-brand-green/60"
                  />
                  <p className="text-small leading-relaxed text-gray-600">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
