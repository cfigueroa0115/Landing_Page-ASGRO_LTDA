'use client';

/**
 * ValueGeneratedSection — "Valor que generamos".
 *
 * Reemplaza cualquier bloque de "resultados en cifras". Comunica beneficios
 * CUALITATIVOS (mayor prevención, claridad, acompañamiento, menor exposición,
 * continuidad, tranquilidad). Sin indicadores numéricos no verificados.
 */

import {
  ShieldCheck,
  Eye,
  Handshake,
  ShieldAlert,
  Activity,
  Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import SectionHeader from '@/components/shared/SectionHeader';
import { BENEFITS_DATA, SITE_CONTENT } from '@/lib/utils/constants';

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Eye,
  Handshake,
  ShieldAlert,
  Activity,
  Heart,
};

export default function ValueGeneratedSection() {
  return (
    <section
      id="valor"
      aria-labelledby="value-generated-heading"
      className="brand-surface py-12 md:py-16"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Impacto que buscamos generar"
          title={SITE_CONTENT.metricsTitle}
          subtitle="Beneficios reales del acompañamiento cercano en la protección de lo que importa."
          titleId="value-generated-heading"
        />

        <AnimatedSection delay={120}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS_DATA.map((benefit) => {
              const Icon = ICON_MAP[benefit.icon] ?? ShieldCheck;
              return (
                <div
                  key={benefit.id}
                  className="flex items-start gap-2 rounded-card border border-gray-100 bg-white p-4 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-green/10">
                    <Icon className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-brand-dark-blue">
                      {benefit.title}
                    </h3>
                    <p className="mt-0.5 text-small text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
