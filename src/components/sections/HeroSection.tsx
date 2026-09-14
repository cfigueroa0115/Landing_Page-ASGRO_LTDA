'use client';

/**
 * HeroSection — Portada premium seguros-first de ASGRO (Bloque 5A.6).
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
import HeroMedia from '@/components/sections/HeroMedia';

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
        {/* Textura aseguradora premium (reemplaza la antigua cuadrícula): red
            hexagonal de protección con "chips" semi-3D (degradado + borde de luz
            + sombra suave) y glifos de alta definición: familia, hogar, auto,
            salud, ARL, SST y documento con check. Tintada en azul-verde
            translúcido para fundirse con el fondo azul. Muy tenue y decorativa. */}
        {/* Textura de transformación digital (reemplaza los antiguos iconos):
            líneas tenues, curvas fluidas y una red de conexión con nodos que
            sugieren innovación, conectividad y alta calidad. Sin iconos.
            Tintada en azul-verde translúcido para fundirse con el fondo azul. */}
        <div
          className="absolute inset-0 opacity-[0.6] mix-blend-screen"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='520' viewBox='0 0 600 520'>
  <defs>
    <linearGradient id='flow' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='rgba(150,195,245,0)'/>
      <stop offset='0.5' stop-color='rgba(150,195,245,0.16)'/>
      <stop offset='1' stop-color='rgba(150,195,245,0)'/>
    </linearGradient>
    <linearGradient id='flowG' x1='0' y1='0' x2='1' y2='0'>
      <stop offset='0' stop-color='rgba(150,225,160,0)'/>
      <stop offset='0.5' stop-color='rgba(150,225,160,0.14)'/>
      <stop offset='1' stop-color='rgba(150,225,160,0)'/>
    </linearGradient>
    <radialGradient id='node' cx='0.5' cy='0.5' r='0.5'>
      <stop offset='0' stop-color='rgba(190,220,255,0.55)'/>
      <stop offset='1' stop-color='rgba(190,220,255,0)'/>
    </radialGradient>
    <radialGradient id='nodeG' cx='0.5' cy='0.5' r='0.5'>
      <stop offset='0' stop-color='rgba(175,235,180,0.55)'/>
      <stop offset='1' stop-color='rgba(175,235,180,0)'/>
    </radialGradient>
  </defs>

  <!-- Curvas fluidas tenues (movimiento / innovación) -->
  <g fill='none' stroke='url(#flow)' stroke-width='1.1'>
    <path d='M-20 120 C 140 60, 300 200, 480 110 S 760 160, 900 90'/>
    <path d='M-20 250 C 160 300, 320 160, 500 260 S 780 300, 900 220'/>
    <path d='M-20 400 C 150 360, 320 470, 500 380 S 780 430, 900 360'/>
  </g>
  <g fill='none' stroke='url(#flowG)' stroke-width='1'>
    <path d='M-20 190 C 180 150, 340 300, 540 200'/>
    <path d='M-20 330 C 170 380, 360 250, 560 330'/>
  </g>

  <!-- Red de conexión: líneas rectas finas entre nodos (conectividad / datos) -->
  <g stroke='rgba(140,185,240,0.14)' stroke-width='0.9' fill='none'>
    <path d='M80 90 L210 150 L150 260 L300 300 L250 420'/>
    <path d='M210 150 L360 120 L470 220 L560 180'/>
    <path d='M300 300 L440 350 L520 300 L560 380'/>
    <path d='M150 260 L60 350'/>
    <path d='M470 220 L440 350'/>
    <path d='M360 120 L300 300'/>
  </g>

  <!-- Nodos (puntos de conexión) con halo suave -->
  <g>
    <circle cx='80' cy='90' r='9' fill='url(#node)'/>
    <circle cx='210' cy='150' r='10' fill='url(#node)'/>
    <circle cx='360' cy='120' r='9' fill='url(#nodeG)'/>
    <circle cx='470' cy='220' r='10' fill='url(#node)'/>
    <circle cx='560' cy='180' r='8' fill='url(#node)'/>
    <circle cx='150' cy='260' r='9' fill='url(#nodeG)'/>
    <circle cx='300' cy='300' r='11' fill='url(#node)'/>
    <circle cx='440' cy='350' r='9' fill='url(#node)'/>
    <circle cx='520' cy='300' r='8' fill='url(#nodeG)'/>
    <circle cx='250' cy='420' r='9' fill='url(#node)'/>
    <circle cx='60' cy='350' r='8' fill='url(#node)'/>
    <circle cx='560' cy='380' r='8' fill='url(#nodeG)'/>
  </g>
  <g fill='rgba(210,230,255,0.6)'>
    <circle cx='80' cy='90' r='1.6'/><circle cx='210' cy='150' r='1.8'/>
    <circle cx='470' cy='220' r='1.8'/><circle cx='300' cy='300' r='2'/>
    <circle cx='440' cy='350' r='1.6'/><circle cx='250' cy='420' r='1.6'/>
    <circle cx='560' cy='180' r='1.4'/><circle cx='60' cy='350' r='1.4'/>
  </g>
  <g fill='rgba(185,240,190,0.6)'>
    <circle cx='360' cy='120' r='1.6'/><circle cx='150' cy='260' r='1.6'/>
    <circle cx='520' cy='300' r='1.4'/><circle cx='560' cy='380' r='1.4'/>
  </g>
</svg>`
            )}")`,
            backgroundSize: '820px 710px',
            backgroundRepeat: 'repeat',
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

          {/* Columna visual — imagen editorial de protección integral (NO la
              asesora). Fotografía protagonista + overlay azul + glow sutil +
              capa tecnológica secundaria + 1 microcard. Compacta en móvil. */}
          <motion.div
            className="relative w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="relative mx-auto w-full max-w-[560px]"
            >
              {/* Glow ambiental de marca detrás de la imagen */}
              <div
                aria-hidden="true"
                className="glow-blue pointer-events-none absolute -right-6 -top-8 h-[220px] w-[220px] rounded-full"
              />
              <div
                aria-hidden="true"
                className="glow-green pointer-events-none absolute -bottom-8 -left-6 h-[180px] w-[180px] rounded-full"
              />

              {/* Media del Hero (imagen editorial con fallback real) */}
              <HeroMedia />
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
