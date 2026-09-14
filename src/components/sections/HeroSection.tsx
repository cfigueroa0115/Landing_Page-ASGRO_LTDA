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
        <div
          className="absolute inset-0 opacity-[0.32] mix-blend-screen"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='364' viewBox='0 0 420 364'>
  <defs>
    <linearGradient id='chip' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='rgba(150,195,245,0.20)'/>
      <stop offset='0.5' stop-color='rgba(110,160,225,0.07)'/>
      <stop offset='1' stop-color='rgba(60,100,170,0.03)'/>
    </linearGradient>
    <linearGradient id='chipEdge' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='rgba(190,220,255,0.42)'/>
      <stop offset='1' stop-color='rgba(90,140,210,0.10)'/>
    </linearGradient>
    <linearGradient id='ink' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='rgba(205,225,255,0.55)'/>
      <stop offset='1' stop-color='rgba(120,165,230,0.30)'/>
    </linearGradient>
    <linearGradient id='inkG' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='rgba(190,240,190,0.55)'/>
      <stop offset='1' stop-color='rgba(120,205,130,0.30)'/>
    </linearGradient>
    <!-- Chip hexagonal semi-3D: relleno con degradado, sombra baja y borde de luz superior -->
    <g id='chip'>
      <polygon points='46,3 88,26 88,72 46,95 4,72 4,26' fill='url(#chip)'/>
      <polygon points='46,7 84,28 84,70 46,91 8,70 8,28' fill='none' stroke='rgba(20,40,80,0.28)' stroke-width='2'/>
      <polygon points='46,3 88,26 88,72 46,95 4,72 4,26' fill='none' stroke='url(#chipEdge)' stroke-width='1.3'/>
      <path d='M12 30 L46 10 L80 30' fill='none' stroke='rgba(220,238,255,0.30)' stroke-width='1' stroke-linecap='round'/>
    </g>
  </defs>

  <!-- conectores tenues entre chips (red) -->
  <g fill='none' stroke='rgba(120,170,235,0.10)' stroke-width='1'>
    <line x1='46' y1='95' x2='46' y2='138'/>
    <line x1='210' y1='49' x2='168' y2='72'/>
    <line x1='252' y1='72' x2='294' y2='95'/>
    <line x1='168' y1='260' x2='210' y2='283'/>
    <line x1='294' y1='233' x2='336' y2='210'/>
    <line x1='88' y1='49' x2='126' y2='26'/>
  </g>

  <!-- chips (hexágonos 3D) -->
  <use href='#chip' x='164' y='0'/>
  <use href='#chip' x='0' y='115'/>
  <use href='#chip' x='290' y='72'/>
  <use href='#chip' x='164' y='188'/>
  <use href='#chip' x='0' y='246'/>
  <use href='#chip' x='290' y='246'/>

  <!-- glifos de alta definición (trazo con degradado + luz) -->
  <g fill='none' stroke='url(#ink)' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'>
    <!-- FAMILIA (chip 164,0) -->
    <g transform='translate(210,47)'>
      <circle cx='-8' cy='-9' r='4'/><path d='M-14 4 v-5 a6 6 0 0 1 12 0 v5'/>
      <circle cx='9' cy='-9' r='4'/><path d='M3 4 v-5 a6 6 0 0 1 12 0 v5'/>
      <circle cx='1' cy='-1' r='3' stroke='url(#inkG)'/><path d='M-4 9 v-4 a5 5 0 0 1 10 0 v4' stroke='url(#inkG)'/>
    </g>
    <!-- HOGAR (chip 290,72) -->
    <g transform='translate(336,119)'>
      <path d='M-13 2 L0 -11 L13 2'/><path d='M-9 0 v11 h18 v-11'/>
      <path d='M15 -4 v14' stroke='url(#inkG)'/><circle cx='15' cy='-7' r='4' stroke='url(#inkG)'/>
    </g>
    <!-- AUTO (chip 0,115) -->
    <g transform='translate(46,162)'>
      <path d='M-15 3 l3 -8 a3 3 0 0 1 3 -2 h12 a3 3 0 0 1 3 2 l3 8'/>
      <path d='M-16 3 h32 v6 h-32 z'/>
      <circle cx='-9' cy='11' r='3'/><circle cx='9' cy='11' r='3'/>
    </g>
    <!-- SALUD (chip 164,188) -->
    <g transform='translate(210,235)' stroke='url(#inkG)'>
      <path d='M-13 0 h6 l3 -7 l6 15 l3 -8 h5'/>
    </g>
    <!-- ARL: trabajador con casco (chip 0,246) -->
    <g transform='translate(46,293)'>
      <path d='M-8 -6 a8 8 0 0 1 16 0'/><path d='M-10 -6 h20'/><path d='M0 -14 v3'/>
      <circle cx='0' cy='2' r='4'/><path d='M-7 13 v-4 a7 7 0 0 1 14 0 v4'/>
    </g>
    <!-- SST: escudo con check (chip 290,246) -->
    <g transform='translate(336,293)'>
      <path d='M0 -13 l13 5 v8 c0 9 -7 13 -13 16 c-6 -3 -13 -7 -13 -16 v-8 z'/>
      <path d='M-6 0 l4 4 l8 -9' stroke='url(#inkG)'/>
    </g>
  </g>

  <!-- nodos de conexión luminosos -->
  <g fill='rgba(190,240,190,0.42)'>
    <circle cx='126' cy='72' r='2.4'/><circle cx='294' cy='210' r='2.4'/><circle cx='210' cy='283' r='2.4'/>
  </g>
  <g fill='rgba(170,205,255,0.42)'>
    <circle cx='46' cy='138' r='2.2'/><circle cx='252' cy='72' r='2.2'/><circle cx='336' cy='150' r='2.2'/>
  </g>
</svg>`
            )}")`,
            backgroundSize: '560px 485px',
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
