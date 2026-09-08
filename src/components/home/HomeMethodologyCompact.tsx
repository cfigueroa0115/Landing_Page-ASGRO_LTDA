'use client';

/**
 * HomeMethodologyCompact — Modelo de acompañamiento ASGRO como journey visual.
 *
 * Cuatro etapas: Entender → Analizar → Gestionar → Acompañar.
 * Usa el componente reutilizable ProcessStep con conectores en desktop.
 */

import { Search, ClipboardList, Handshake, LifeBuoy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SectionHeader from '@/components/shared/SectionHeader';
import ProcessStep from '@/components/shared/ProcessStep';
import { METHODOLOGY_STEPS, SITE_CONTENT } from '@/lib/utils/constants';

/** Íconos por número de etapa (1-4). */
const STEP_ICONS: Record<number, LucideIcon> = {
  1: Search,
  2: ClipboardList,
  3: Handshake,
  4: LifeBuoy,
};

export default function HomeMethodologyCompact() {
  return (
    <section
      id="acompanamiento"
      className="brand-surface scroll-mt-20 py-12 md:py-16"
      aria-labelledby="home-methodology-heading"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Modelo de acompañamiento"
          title={SITE_CONTENT.methodologyTitle}
          subtitle={SITE_CONTENT.methodologySubtitle}
          titleId="home-methodology-heading"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METHODOLOGY_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[step.step] ?? Search;
            return (
              <ProcessStep
                key={step.id}
                step={step.step}
                icon={Icon}
                title={step.title}
                description={step.description}
                index={index}
                showConnector={index < METHODOLOGY_STEPS.length - 1}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
