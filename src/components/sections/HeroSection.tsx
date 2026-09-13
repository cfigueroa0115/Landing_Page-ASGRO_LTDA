'use client';

/**
 * HeroSection — Portada premium seguros-first de ASGRO (Bloque 5A).
 *
 * Fondo oscuro premium con composición temática de seguros: una "constelación
 * de protección" de fichas de vidrio (familia, hogar, vehículo, empresa, ARL,
 * SST) integradas con capas, glows y gradientes sobrios. Layout de dos columnas
 * en desktop que aprovecha el espacio: mensaje + CTA a la izquierda, composición
 * visual a la derecha. Titular, subtítulo, CTAs y chips se conservan tal cual.
 * Responsive, accesible y respetuoso de prefers-reduced-motion.
 */

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  Home,
  Car,
  Building2,
  HardHat,
  HeartPulse,
} from 'lucide-react';
import { SITE_CONTENT } from '@/lib/utils/constants';

/** Frentes de protección para la composición visual (temática de seguros). */
const PROTECTION_TILES = [
  { icon: Users, label: 'Personas' },
  { icon: Home, label: 'Hogar' },
  { icon: Car, label: 'Vehículo' },
  { icon: Building2, label: 'Empresa' },
  { icon: HardHat, label: 'ARL' },
  { icon: HeartPulse, label: 'SST' },
] as const;

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  // Con reduced-motion: sin stagger ni desplazamientos; el contenido aparece
  // de inmediato (transición mínima de opacidad, sin movimiento).
  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  } as const;

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  } as const;

  const tileVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  } as const;

  return (
    <section
      id="inicio"
      className="relative flex min-h-[82vh] items-center overflow-hidden bg-hero-gradient pt-[76px]"
      aria-label="Sección principal - ASGRO Agencia de Seguros"
    >
      {/* ─── Capas de fondo (profundidad, 100% CSS/geometría) ─────────────── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* Overlay base direccional para legibilidad impecable del texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark-blue/90 via-brand-navy/85 to-brand-navy/95" />
        {/* Luz ambiental superior (glow azul) que aporta profundidad */}
        <div className="absolute -top-1/3 left-1/2 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-brand-blue/25 blur-3xl" />
        {/* Glow azul de acompañamiento en la zona de la composición (derecha) */}
        <div className="absolute right-[-8%] top-1/4 h-[440px] w-[440px] rounded-full bg-brand-blue/20 blur-3xl" />
        {/* Acento verde de marca (glow inferior izquierdo, muy sutil) */}
        <div className="absolute bottom-0 left-[-10%] h-[380px] w-[380px] rounded-full bg-brand-green/10 blur-3xl" />
        {/* Malla/grid sutil para textura premium */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Arco de marca — sello visual propio */}
        <div className="absolute -top-40 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-[50%] border-t border-brand-green/25" />
      </div>

      {/* ─── Contenido ─────────────────────────────────────────────────────── */}
      {/* py-8=64px móvil / py-10=80px desktop (escala custom: 8=64px, 10=80px) */}
      <div className="relative z-10 section-container py-8 md:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Columna de mensaje */}
          <motion.div
            className="flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow institucional (padding explícito: ~14px H / 6px V) */}
            <motion.span
              variants={itemVariants}
              className="mb-3 inline-flex items-center gap-[6px] rounded-full border border-brand-green/30 bg-white/[0.06] px-[14px] py-[6px] text-small font-semibold text-brand-neon-green backdrop-blur-sm"
            >
              <ShieldCheck className="h-[16px] w-[16px]" aria-hidden="true" />
              ASGRO · Agencia de Seguros
            </motion.span>

            {/* Titular de alto impacto */}
            <motion.h1
              variants={itemVariants}
              className="text-balance text-h1 font-extrabold leading-[1.1] tracking-tight text-white md:text-[2.75rem] lg:text-[3.5rem]"
            >
              {SITE_CONTENT.heroHeadline}
            </motion.h1>

            {/* Texto de apoyo */}
            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-2xl text-pretty text-body-lg text-white/85"
            >
              {SITE_CONTENT.heroSubtitle}
            </motion.p>

            {/* CTAs con jerarquía clara (separación ~10px; ancho contenido) */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex w-full flex-col items-stretch gap-[10px] sm:w-auto sm:flex-row sm:items-center"
            >
              {/* Primario: verde con texto oscuro (contraste AA ~8:1) */}
              <Link
                href="/contacto"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-brand-green px-[22px] text-[0.95rem] font-bold text-brand-dark-blue shadow-btn transition-all duration-200 hover:bg-brand-green-alt hover:shadow-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-neon-green"
              >
                {SITE_CONTENT.ctaPrimary}
              </Link>

              {/* Secundario: outline claro */}
              <a
                href="#portafolio"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn border border-white/60 px-[22px] text-[0.95rem] font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {SITE_CONTENT.ctaSecondary}
              </a>
            </motion.div>

            {/* Chips de los frentes de protección (mt-8=64px; gap explícito 8px) */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-[8px] gap-y-[8px] lg:justify-start"
            >
              {SITE_CONTENT.heroBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1 text-small font-medium text-white/85 ring-1 ring-white/15"
                >
                  {badge}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Columna visual — composición temática de seguros (decorativa) */}
          <motion.div
            className="relative hidden lg:block"
            aria-hidden="true"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Tarjeta de vidrio contenedora */}
            <div className="relative mx-auto max-w-[440px] rounded-modal border border-white/12 bg-white/[0.04] p-6 backdrop-blur-md">
              {/* Glow interior sutil */}
              <div className="glow-blue pointer-events-none absolute -right-6 -top-6 h-[180px] w-[180px] rounded-full" />
              <div className="glow-green pointer-events-none absolute -bottom-6 -left-6 h-[160px] w-[160px] rounded-full" />

              {/* Encabezado de la ficha */}
              <div className="relative mb-4 flex items-center gap-2">
                <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-brand-green/15 ring-1 ring-brand-green/30">
                  <ShieldCheck className="h-[22px] w-[22px] text-brand-neon-green" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-small font-semibold text-white">Protección integral</p>
                  <p className="text-caption text-white/60">Personas · Patrimonio · Empresas</p>
                </div>
              </div>

              {/* Grilla de frentes de protección */}
              <div className="relative grid grid-cols-3 gap-3">
                {PROTECTION_TILES.map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <motion.div
                      key={tile.label}
                      variants={tileVariants}
                      className="flex flex-col items-center justify-center gap-[6px] rounded-card border border-white/10 bg-white/[0.05] px-2 py-3 text-center transition-colors duration-300 hover:bg-white/[0.09]"
                    >
                      <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-brand-blue/25 ring-1 ring-white/10">
                        <Icon className="h-[22px] w-[22px] text-white" strokeWidth={1.75} />
                      </span>
                      <span className="text-caption font-medium text-white/80">
                        {tile.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Transición inferior hacia el contenido blanco (onda suave) ────── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 leading-none" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="h-[32px] w-full md:h-[40px]">
          <path d="M0,60 C480,10 960,10 1440,60 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
