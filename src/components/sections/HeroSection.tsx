'use client';

/**
 * HeroSection — Portada premium seguros-first de ASGRO (Bloque 5A.1).
 *
 * Composición editorial: mensaje + CTA a la izquierda; a la derecha una
 * experiencia visual aseguradora con capa humana (asesora), capa tecnológica de
 * red de riesgo (SVG sutil), tarjetas de protección flotantes y accesos reales
 * a los frentes de seguros. En móvil se conserva narrativa visual con una
 * tarjeta compacta (no desaparece). Se preservan titular, subtítulo, CTAs y
 * eyebrow. Respeta prefers-reduced-motion.
 */

import Link from 'next/link';
import Image from 'next/image';
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

  return (
    <section
      id="inicio"
      className="relative flex min-h-[82vh] items-center overflow-hidden bg-hero-gradient pt-[76px]"
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

      {/* ─── Contenido ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 section-container py-8 md:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
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
              className="text-balance text-h1 font-extrabold leading-[1.1] tracking-tight text-white md:text-[2.75rem] lg:text-[3.5rem]"
            >
              {SITE_CONTENT.heroHeadline}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-2xl text-pretty text-body-lg text-white/85"
            >
              {SITE_CONTENT.heroSubtitle}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-6 flex w-full flex-col items-stretch gap-[10px] sm:w-auto sm:flex-row sm:items-center"
            >
              <Link
                href="/contacto"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-brand-green px-[22px] text-[0.95rem] font-bold text-brand-dark-blue shadow-btn transition-all duration-200 hover:bg-brand-green-alt hover:shadow-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-neon-green"
              >
                {SITE_CONTENT.ctaPrimary}
              </Link>

              <a
                href="#portafolio"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn border border-white/60 px-[22px] text-[0.95rem] font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {SITE_CONTENT.ctaSecondary}
              </a>
            </motion.div>

            {/* Chips de los frentes de protección (indicadores) */}
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

          {/* Columna visual — experiencia aseguradora editorial */}
          <motion.div
            className="relative mx-auto w-full max-w-[480px]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Capa tecnológica de red de riesgo (decorativa) */}
            <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
              <Image
                src="/images/risk-network.svg"
                alt=""
                fill
                aria-hidden="true"
                className="object-contain opacity-70"
              />
            </div>

            {/* Tarjeta editorial con imagen humana (asesora / acompañamiento) */}
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-modal border border-white/12 bg-white/[0.04] backdrop-blur-md"
            >
              {/* Glows internos */}
              <div className="glow-blue pointer-events-none absolute -right-6 -top-6 h-[180px] w-[180px] rounded-full" aria-hidden="true" />
              <div className="glow-green pointer-events-none absolute -bottom-6 -left-6 h-[160px] w-[160px] rounded-full" aria-hidden="true" />

              {/* Imagen: asesora ASGRO (acompañamiento humano). Decorativa en el
                  hero (el mensaje ya describe el contexto). object-contain para
                  mostrarla completa; fondo de marca. */}
              <div className="relative mx-auto h-[300px] w-full sm:h-[340px]">
                <Image
                  src="/images/Agente_IA.png"
                  alt=""
                  aria-hidden="true"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-contain object-bottom drop-shadow-2xl"
                />
              </div>

              {/* Tarjeta flotante: protección familiar */}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-card border border-white/15 bg-brand-dark-blue/70 px-3 py-2 backdrop-blur-md">
                <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-brand-green/20">
                  <Users className="h-[18px] w-[18px] text-brand-neon-green" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="text-caption font-semibold text-white">Protección familiar</p>
                  <p className="text-[0.7rem] text-white/60">Personas y patrimonio</p>
                </div>
              </div>

              {/* Tarjeta flotante: continuidad empresarial */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-card border border-white/15 bg-brand-dark-blue/70 px-3 py-2 backdrop-blur-md">
                <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-brand-blue/30">
                  <ShieldCheck className="h-[18px] w-[18px] text-white" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="text-caption font-semibold text-white">Gestión del riesgo</p>
                  <p className="text-[0.7rem] text-white/60">Continuidad empresarial</p>
                </div>
              </div>
            </motion.div>

            {/* Accesos funcionales reales a los frentes (no pseudo-interactivos) */}
            <motion.nav
              variants={itemVariants}
              aria-label="Frentes de protección"
              className="mt-3 grid grid-cols-3 gap-2"
            >
              {HERO_ACCESS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex flex-col items-center justify-center gap-[6px] rounded-card border border-white/10 bg-white/[0.05] px-2 py-3 text-center transition-colors duration-300 hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-neon-green"
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
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="h-[32px] w-full md:h-[40px]">
          <path d="M0,60 C480,10 960,10 1440,60 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
