'use client';

/**
 * HeroSection — Portada premium seguros-first de ASGRO (Bloque 5A.2).
 *
 * Dirección de arte: el Hero comunica PRIMERO agencia de seguros y protección
 * integral. La columna derecha es una composición editorial aseguradora
 * (personas/familia, hogar, vehículo, empresa) con capa tecnológica sutil —NO
 * la asesora IA, que vive solo en el launcher/panel del asistente—. Layout
 * rebalanceado above-the-fold con tipografía por clamp() y ritmo vertical
 * medido para que no se sienta cortado a 100% de zoom. Preserva titular,
 * subtítulo, CTAs, eyebrow, chips y accesos reales. Respeta reduced-motion.
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
import type { LucideIcon } from 'lucide-react';
import { SITE_CONTENT } from '@/lib/utils/constants';
import HeroInsuranceVisual from '@/components/sections/HeroInsuranceVisual';

/** Frentes de protección → accesos funcionales reales (rutas existentes). */
interface HeroAccess {
  icon: LucideIcon;
  label: string;
  href: string;
}

const HERO_ACCESS: HeroAccess[] = [
  { icon: Users, label: 'Personas', href: '/servicios' },
  { icon: Home, label: 'Hogar', href: '/servicios' },
  { icon: Car, label: 'Vehículo', href: '/servicios' },
  { icon: Building2, label: 'Empresas', href: '/servicios/seguros-empresariales' },
  { icon: HardHat, label: 'ARL', href: '/servicios/riesgos-laborales' },
  { icon: HeartPulse, label: 'SST', href: '/servicios/seguridad-salud-trabajo' },
];

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
      className="relative flex min-h-[calc(100svh-76px)] items-center overflow-hidden bg-hero-gradient pt-[76px]"
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
          Padding vertical acotado con clamp para no exceder el above-the-fold
          en pantallas de menor altura (1366×768) y respirar en 1920×1080. */}
      <div
        className="relative z-10 section-container w-full"
        style={{ paddingTop: 'clamp(24px, 4vh, 56px)', paddingBottom: 'clamp(40px, 6vh, 72px)' }}
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
              className="mb-3 inline-flex items-center gap-[6px] rounded-full border border-brand-green/30 bg-white/[0.06] px-[14px] py-[6px] text-small font-semibold text-brand-neon-green backdrop-blur-sm"
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
              className="mt-4 max-w-xl text-pretty text-white/85"
              style={{ fontSize: 'clamp(1rem, 1.4vw, 1.125rem)' }}
            >
              {SITE_CONTENT.heroSubtitle}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-6 flex w-full flex-col items-stretch gap-[10px] sm:w-auto sm:flex-row sm:items-center"
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

            {/* Chips de los frentes de protección (indicadores) */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-[8px] gap-y-[8px] lg:justify-start"
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

          {/* Columna visual — composición editorial aseguradora (NO la asesora).
              Se oculta en pantallas muy pequeñas para no empujar el fold; en
              móvil ≥ sm y desktop aporta narrativa visual de seguros. */}
          <motion.div
            className="relative w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <HeroInsuranceVisual />
            </motion.div>

            {/* Accesos funcionales reales a los frentes (no pseudo-interactivos) */}
            <motion.nav
              variants={itemVariants}
              aria-label="Frentes de protección"
              className="mt-4 grid grid-cols-3 gap-2"
            >
              {HERO_ACCESS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex flex-col items-center justify-center gap-[6px] rounded-card border border-white/10 bg-white/[0.05] px-2 py-[10px] text-center transition-colors duration-300 hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-neon-green"
                  >
                    <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-brand-blue/25 ring-1 ring-white/10 transition-colors duration-300 group-hover:bg-brand-blue/40">
                      <Icon className="h-[20px] w-[20px] text-white" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-caption font-medium text-white/85">{item.label}</span>
                  </Link>
                );
              })}
            </motion.nav>
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
