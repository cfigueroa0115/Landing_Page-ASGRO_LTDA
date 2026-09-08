'use client';

/**
 * WhyChooseSection — "¿Por qué elegir ASGRO?"
 *
 * Cinco argumentos cualitativos (sin cifras): acompañamiento cercano, enfoque
 * preventivo, soluciones a la medida, respuesta ágil y visión integral.
 * Reutiliza ValueCard para mantener un lenguaje visual consistente.
 */

import { Handshake, ShieldCheck, Target, Zap, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import SectionHeader from '@/components/shared/SectionHeader';
import ValueCard from '@/components/shared/ValueCard';
import { DIFFERENTIATORS_DATA, SITE_CONTENT } from '@/lib/utils/constants';

const ICON_MAP: Record<string, LucideIcon> = {
  Handshake,
  ShieldCheck,
  Target,
  Zap,
  Layers,
};

export default function WhyChooseSection() {
  return (
    <section
      id="por-que-asgro"
      aria-labelledby="why-choose-heading"
      className="bg-white py-12 md:py-16"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Por qué ASGRO"
          title={SITE_CONTENT.whyChooseTitle}
          subtitle={SITE_CONTENT.whyChooseSubtitle}
          titleId="why-choose-heading"
        />

        <AnimatedSection delay={120}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS_DATA.map((diff) => {
              const Icon = ICON_MAP[diff.icon] ?? ShieldCheck;
              return (
                <ValueCard
                  key={diff.id}
                  icon={Icon}
                  title={diff.title}
                  description={diff.description}
                />
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
