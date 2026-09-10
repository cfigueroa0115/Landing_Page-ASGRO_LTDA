'use client';

/**
 * ValuePropositionSection — "Protección integral para cada necesidad".
 *
 * Muestra los TRES grandes frentes de protección de ASGRO:
 * Personas · Patrimonio · Empresas. Diseño simple, tres elementos, no más.
 */

import { Users, Home, Building2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import SectionHeader from '@/components/shared/SectionHeader';
import ValueCard from '@/components/shared/ValueCard';
import { PILLARS_DATA } from '@/lib/utils/constants';

const PILLAR_ICONS: Record<string, LucideIcon> = {
  Users,
  Home,
  Building2,
};

export default function ValuePropositionSection() {
  return (
    <section
      id="propuesta-valor"
      aria-labelledby="value-heading"
      className="scroll-mt-[84px] bg-white py-12 md:py-16"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Propuesta de valor"
          title="Protección integral para cada necesidad"
          subtitle="Acompañamos la protección de lo que realmente importa, en tres grandes frentes."
          titleId="value-heading"
        />

        <AnimatedSection delay={150}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PILLARS_DATA.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.icon] ?? Users;
              return (
                <ValueCard
                  key={pillar.id}
                  icon={Icon}
                  title={pillar.title}
                  description={pillar.description}
                />
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
