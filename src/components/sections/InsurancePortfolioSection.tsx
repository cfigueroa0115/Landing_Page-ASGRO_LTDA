'use client';

/**
 * InsurancePortfolioSection — "Soluciones de seguros".
 *
 * Sección NÚCLEO de la web. Organiza el portafolio en tres grupos
 * (Personas / Patrimonio / Empresas) con tarjetas limpias: icono + nombre +
 * descripción breve. No es un catálogo pesado. CTA "Consultar una solución".
 */

import Link from 'next/link';
import {
  Users,
  Home,
  Building2,
  HeartPulse,
  Stethoscope,
  ShieldPlus,
  House,
  Car,
  KeyRound,
  Factory,
  Scale,
  FileCheck,
  Lock,
  UsersRound,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import SectionHeader from '@/components/shared/SectionHeader';
import InsuranceCard from '@/components/shared/InsuranceCard';
import { INSURANCE_PORTFOLIO, SITE_CONTENT } from '@/lib/utils/constants';

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Home,
  Building2,
  HeartPulse,
  Stethoscope,
  ShieldPlus,
  House,
  Car,
  KeyRound,
  Factory,
  Scale,
  FileCheck,
  Lock,
  UsersRound,
  LayoutGrid,
};

export default function InsurancePortfolioSection() {
  return (
    <section
      id="portafolio"
      aria-labelledby="portfolio-heading"
      className="brand-surface scroll-mt-20 py-12 md:py-16"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Portafolio de Seguros"
          title={SITE_CONTENT.servicesTitle}
          subtitle={SITE_CONTENT.servicesSubtitle}
          titleId="portfolio-heading"
        />

        <div className="space-y-8">
          {INSURANCE_PORTFOLIO.map((group, groupIndex) => {
            const GroupIcon = ICON_MAP[group.groupIcon] ?? Users;
            return (
              <AnimatedSection key={group.id} delay={groupIndex * 100}>
                <div>
                  {/* Encabezado del grupo */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10">
                      <GroupIcon className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-h4 font-bold text-brand-dark-blue">
                        {group.groupTitle}
                      </h3>
                      <p className="text-small text-gray-500">{group.groupDescription}</p>
                    </div>
                  </div>

                  {/* Productos del grupo */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.products.map((product) => {
                      const Icon = ICON_MAP[product.icon] ?? FileCheck;
                      return (
                        <InsuranceCard
                          key={product.id}
                          icon={Icon}
                          name={product.name}
                          description={product.description}
                        />
                      );
                    })}
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* CTA "Consultar una solución" */}
        <AnimatedSection delay={200} className="mt-8 text-center">
          <Link
            href="/contacto"
            className="inline-flex min-h-[48px] items-center gap-1 rounded-btn bg-brand-green px-5 py-2 text-base font-semibold text-white shadow-btn transition-all duration-200 hover:bg-brand-green-alt hover:shadow-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
          >
            Consultar una solución
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
