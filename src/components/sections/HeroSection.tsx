'use client';

/**
 * HeroSection — Portada premium seguros-first de ASGRO (Bloque 5A.3).
 *
 * Dirección de arte: comunica PRIMERO agencia de seguros y protección integral.
 * La columna derecha es una composición editorial aseguradora (personas/familia,
 * hogar, vehículo, empresa) con capa tecnológica secundaria —NO la asesora IA,
 * que vive solo en el launcher/panel del asistente—.
 *
 * Hero editorial (no dashboard): eyebrow + H1 + subtítulo + 2 CTA + chips
 * discretos + visual. La navegación por frentes vive en el Quick Access dock
 * inmediatamente inferior (no se duplica aquí).
 *
 * Above-the-fold: el header es fixed; se usa min-h-svh + pt-[76px] para NO
 * descontar dos veces la altura del header. Tipografía y spacing con clamp()/
 * valores explícitos para verse equilibrado a 100% de zoom sin corte.
 */

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/utils/constants';
import HeroInsuranceVisual from '@/components/sections/HeroInsuranceVisual';

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { staggerChildren: 0.1, delayChildren: 0.08 },
    },
  } as const;

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  } as const;

  return (
    <section
      id="inicio"
      className="relative flex min-h-svh items-center overflow-hidden bg-hero-gradient pt-[76px]"
      aria-label="Sección principal - ASGRO Agencia de Seguros"
    >
      {/* ─── Capas de fondo (profundidad, 100% CSS/geometría) ─────────────── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark-blue/90 via-brand-navy/85 to-brand-navy/95" />
        <div className="absolute -top-1/3 left-1/2 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-brand-blue/25 blur-3xl" />
        <div className="absolute right-[-8%] top-1/4 h-[440px] w-[440px] rounded-full bg-brand-blue/20 blur-3xl" />
        <div className="absolute bottom-0 left-[-10%] h-[380px] w-[380px] rounded-full bg-brand-green/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-[50%] border-t border-brand-green/25" />
      </div>

      {/* ─── Contenido ─────────────────────────────────────────────────────
          Padding vertical con clamp para respirar en 1920×1080 sin cortar en
          1366×768. reserva espacio inferior para que el dock se insinúe. */}
      <div
        className="relative z-10 section-container w-full"
        style={{ paddingTop: 'clamp(16px, 3vh, 44px)', paddingBottom: 'clamp(48px, 7vh, 88px)' }}
      >
        <div className="grid items-center gap-[clamp(24px,4vw,56px)] lg:grid-cols-2">
          {/* Columna de mensaje */}
          <motion.div
            className="flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={itemVariants}
              className="mb-[12px] inline-flex items-center gap-[6px] rounded-full border border-brand-green/30 bg-white/[0.06] px-[14px] py-[6px] text-small font-semibold text-brand-neon-green backdrop-blur-sm"
            >
              <ShieldCheck className="h-[16px] w-[16px]" aria-hidden="true" />
              ASGRO · Agencia de Seguros
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-balance font-extrabold leading-[1.08] tracking-tight text-white"
              style={{ fontSize: 'clamp(2rem, 4.2vw, 3.25rem)' }}
            >
              {SITE_CONTENT.heroHeadline}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-[16px] max-w-xl text-pretty text-white/85"
              style={{ fontSize: 'clamp(1rem, 1.4vw, 1.125rem)' }}
            >
              {SITE_CONTENT.heroSubtitle}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-[24px] flex w-full flex-col items-stretch gap-[10px] sm:w-auto sm:flex-row sm:items-center"
            >
              <Link
                href="/contacto"
                className="inline-flex min-h-[46px] items-center justify-center rounded-btn bg-brand-green px-[20px] text-[0.9rem] font-bold text-brand-dark-blue shadow-btn transition-all duration-200 hover:bg-brand-green-alt hover:shadow-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-neon-green"
              >
                {SITE_CONTENT.ctaPrimary}
              </Link>

              <a
                href="#portafolio"
                className="inline-flex min-h-[46px] items-center justify-center rounded-btn border border-white/60 px-[20px] text-[0.9rem] font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {SITE_CONTENT.ctaSecondary}
              </a>
            </motion.div>

            {/* Chips discretos de los frentes de protección (indicadores). El dock
                inferior cubre la navegación; aquí solo son señales de contexto. */}
            <motion.div
              variants={itemVariants}
              className="mt-[24px] flex flex-wrap items-center justify-center gap-[8px] lg:justify-start"
            >
              {SITE_CONTENT.heroBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full bg-white/[0.06] px-[12px] py-[4px] text-small font-medium text-white/85 ring-1 ring-white/15"
                >
                  {badge}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Columna visual — composición editorial aseguradora (NO la asesora).
              Compacta en móvil, plena en desktop. Sin bloque de 6 accesos: la
              navegación por frentes vive en el Quick Access dock inferior. */}
          <motion.div
            className="relative w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <HeroInsuranceVisual />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ─── Transición inferior hacia el contenido blanco (onda suave) ────── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 leading-none" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="h-[28px] w-full md:h-[40px]">
          <path d="M0,60 C480,10 960,10 1440,60 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
