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
import PremiumIconBadge from '@/components/shared/PremiumIconBadge';
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
      className="brand-surface scroll-mt-[84px] py-12 md:py-16"
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
          <div className="grid grid-cols-1 gap-x-[24px] gap-y-[40px] sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = ICON_MAP[pillar.icon] ?? Layers;
              return (
                <div
                  key={pillar.id}
                  className="flex flex-col items-center px-2 text-center"
                >
                  {/* Badge de icono premium (feature) */}
                  <PremiumIconBadge icon={Icon} size="feature" tone="blue" className="mb-3" />
                  <h3 className="text-base font-semibold text-brand-dark-blue">
                    {pillar.title}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="mt-2 mb-2 block h-[2px] w-[32px] rounded-full bg-brand-green/60"
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
