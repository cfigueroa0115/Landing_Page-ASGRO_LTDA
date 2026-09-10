'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Home, Cog, Activity } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import PremiumButton from '@/components/shared/PremiumButton';

/** Cuatro dimensiones de protección empresarial (cualitativas, sin cifras). */
const CORPORATE_PILLARS = [
  { icon: Users, label: 'Personas protegidas', description: 'Su talento humano respaldado.' },
  { icon: Home, label: 'Patrimonio protegido', description: 'Activos y bienes de la operación.' },
  { icon: Cog, label: 'Operación protegida', description: 'Riesgos propios del negocio.' },
  { icon: Activity, label: 'Continuidad empresarial', description: 'Que su organización siga adelante.' },
] as const;

/**
 * CorporateSection — Bloque ejecutivo B2B "Protección para empresas".
 *
 * Refuerza la capacidad empresarial de ASGRO conectando seguros, prevención y
 * gestión del riesgo. Fondo azul institucional profundo con acento verde.
 */
export default function CorporateSection() {
  return (
    <section
      id="empresas"
      aria-labelledby="corporate-heading"
      className="scroll-mt-[84px] bg-gradient-to-br from-brand-dark-blue via-brand-navy to-brand-dark-blue py-12 md:py-16"
    >
      <div className="section-container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* Texto */}
          <AnimatedSection direction="left">
            <span className="brand-eyebrow mb-2 block text-brand-neon-green">
              Protección para empresas
            </span>
            <h2 id="corporate-heading" className="text-h2 text-white">
              Conectamos seguros, prevención y gestión del riesgo
            </h2>
            <p className="mt-3 max-w-[520px] text-body-lg text-white/80">
              Fortalecemos la continuidad de su organización con una mirada
              integral: seguros a la medida, acompañamiento preventivo y gestión
              del riesgo alineados con su operación.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/contacto">
                <PremiumButton variant="primary" size="lg">
                  Hablar con un asesor
                </PremiumButton>
              </Link>
              <Link href="/servicios/seguros-empresariales">
                <PremiumButton variant="outline" size="lg" className="border-white/60 text-white hover:bg-white/10">
                  Ver soluciones para empresas
                </PremiumButton>
              </Link>
            </div>
          </AnimatedSection>

          {/* Dimensiones de protección */}
          <div className="grid grid-cols-2 gap-3">
            {CORPORATE_PILLARS.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                  className="rounded-card border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors duration-300 hover:bg-white/10"
                >
                  <div className="mb-2 flex h-[44px] w-[44px] items-center justify-center rounded-full bg-brand-green/20">
                    <Icon className="h-[22px] w-[22px] text-brand-neon-green" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <p className="text-base font-semibold text-white">{pillar.label}</p>
                  <p className="mt-0.5 text-small text-white/70">{pillar.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
