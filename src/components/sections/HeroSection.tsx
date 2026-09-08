'use client';

/**
 * HeroSection — Portada seguros-first de ASGRO.
 *
 * Diseño limpio y de alto impacto: titular corto, subtítulo, dos CTA claros
 * (Solicitar asesoría / Conocer soluciones) y badges de los frentes de
 * protección. Comunica SEGUROS antes que SST. Fondo azul institucional con el
 * arco verde de marca como sello visual.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/utils/constants';
import { ServicesBanner } from '@/lib/utils/brand-assets-components';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[88vh] items-center overflow-hidden bg-hero-gradient"
      aria-label="Sección principal - ASGRO Agencia de Seguros"
    >
      {/* Imagen de fondo corporativa (decorativa) + degradado para legibilidad */}
      <div className="absolute inset-0 z-0">
        <ServicesBanner
          width={1920}
          height={1080}
          className="h-full w-full object-cover opacity-[0.12]"
          alt=""
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark-blue/85 via-brand-navy/75 to-brand-navy/95" />
      </div>

      {/* Arco de marca — sello visual propio, esquina superior */}
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-[50%] border-t-2 border-brand-green/25"
      />

      <div className="relative z-10 section-container py-14 md:py-16">
        <motion.div
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow institucional */}
          <motion.span
            variants={itemVariants}
            className="mb-3 inline-flex items-center gap-1 rounded-full border border-brand-green/30 bg-white/5 px-3 py-1 text-small font-semibold text-brand-neon-green backdrop-blur-sm"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            ASGRO · Agencia de Seguros
          </motion.span>

          {/* Titular de alto impacto */}
          <motion.h1
            variants={itemVariants}
            className="text-h1 leading-tight text-white md:text-[2.75rem] lg:text-[3.5rem]"
          >
            {SITE_CONTENT.heroHeadline}
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-2xl text-body-lg text-white/80"
          >
            {SITE_CONTENT.heroSubtitle}
          </motion.p>

          {/* CTAs principales */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-col items-center gap-2 sm:flex-row"
          >
            <Link
              href="/contacto"
              className="flex min-h-[48px] items-center justify-center rounded-btn bg-brand-green px-5 py-2 text-base font-semibold text-white shadow-btn transition-all duration-200 hover:bg-brand-green-alt hover:shadow-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-neon-green"
            >
              {SITE_CONTENT.ctaPrimary}
            </Link>

            <a
              href="#portafolio"
              className="flex min-h-[48px] items-center justify-center rounded-btn border-2 border-white/70 px-5 py-2 text-base font-semibold text-white transition-all duration-200 hover:bg-white hover:text-brand-dark-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {SITE_CONTENT.ctaSecondary}
            </a>
          </motion.div>

          {/* Badges de los frentes de protección */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
          >
            {SITE_CONTENT.heroBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-small font-medium text-white/80 ring-1 ring-white/10"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Onda inferior — transición limpia hacia el contenido blanco */}
      <div className="absolute bottom-0 left-0 right-0 z-10 leading-none" aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="h-10 w-full md:h-14">
          <path d="M0,90 C360,20 1080,20 1440,90 L1440,90 L0,90 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
