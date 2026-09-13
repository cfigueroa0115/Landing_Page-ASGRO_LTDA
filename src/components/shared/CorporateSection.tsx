'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Users, Home, Cog, Activity } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import PremiumButton from '@/components/shared/PremiumButton';
import PremiumIconBadge from '@/components/shared/PremiumIconBadge';

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
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="empresas"
      aria-labelledby="corporate-heading"
      className="scroll-mt-[84px] bg-gradient-to-br from-brand-dark-blue via-brand-navy to-brand-dark-blue py-[48px] md:py-[72px]"
    >
      <div className="section-container">
        <div className="grid items-center gap-[40px] lg:grid-cols-2">
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
              {/* legacyBehavior + passHref: Link NO renderiza su propio <a>;
                  delega el href al <a> que produce PremiumButton. Un solo
                  elemento interactivo, con navegación client-side. */}
              <Link href="/contacto" passHref legacyBehavior>
                <PremiumButton variant="primary" size="lg">
                  Hablar con un asesor
                </PremiumButton>
              </Link>
              <Link href="/servicios/seguros-empresariales" passHref legacyBehavior>
                <PremiumButton variant="outline" size="lg" className="border-white/60 text-white hover:bg-white/10">
                  Ver soluciones para empresas
                </PremiumButton>
              </Link>
            </div>
          </AnimatedSection>

          {/* Imagen editorial B2B + dimensiones de protección */}
          <div>
            {/* Banner editorial de empresas (below-the-fold → sin priority) */}
            <div className="relative mb-3 overflow-hidden rounded-modal border border-white/12 shadow-premium-hover">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src="/images/SegurosEmpresas.webp"
                  alt="Protección integral para empresas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  style={{ objectPosition: 'center' }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/80 via-brand-dark-blue/20 to-transparent"
                />
                <span className="absolute bottom-[14px] left-[14px] inline-flex items-center rounded-full bg-brand-green/90 px-[12px] py-[6px] text-caption font-bold text-brand-dark-blue">
                  Continuidad y patrimonio empresarial
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
            {CORPORATE_PILLARS.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.label}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.4, delay: index * 0.1, ease: 'easeOut' }
                  }
                  className="rounded-card border border-white/10 bg-white/5 p-[20px] backdrop-blur-sm transition-colors duration-300 hover:bg-white/10"
                >
                  <PremiumIconBadge icon={Icon} size="md" tone="light" className="mb-2" />
                  <p className="text-base font-semibold text-white">{pillar.label}</p>
                  <p className="mt-0.5 text-small text-white/70">{pillar.description}</p>
                </motion.div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
