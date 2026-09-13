'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Users, Home, Car, Building2, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * HeroInsuranceVisual — Composición editorial premium de seguros (5A.2).
 *
 * Sustituye a la asesora como protagonista visual del Hero. Comunica los
 * frentes de protección (personas/familia, hogar/patrimonio, vehículo, empresa)
 * conectados por una capa tecnológica sutil (red de riesgo), con un escudo
 * central de "protección integral". 100% SVG/CSS + iconografía ligera: sin
 * fotografías pesadas, decorativo (aria-hidden). Respeta reduced-motion.
 */

interface Domain {
  icon: LucideIcon;
  label: string;
  sub: string;
  /** posición en la órbita (clases utilitarias absolutas) */
  pos: string;
  accent: 'green' | 'blue';
}

const DOMAINS: Domain[] = [
  { icon: Users, label: 'Personas', sub: 'Familia y vida', pos: 'left-0 top-[8%]', accent: 'green' },
  { icon: Home, label: 'Hogar', sub: 'Patrimonio', pos: 'right-0 top-[4%]', accent: 'blue' },
  { icon: Car, label: 'Vehículo', sub: 'Movilidad', pos: 'left-0 bottom-[10%]', accent: 'blue' },
  { icon: Building2, label: 'Empresa', sub: 'Continuidad', pos: 'right-0 bottom-[6%]', accent: 'green' },
];

export default function HeroInsuranceVisual() {
  const prefersReducedMotion = useReducedMotion();

  const float = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          animate: { y: [0, -6, 0] },
          transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay },
        };

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[440px]"
      aria-hidden="true"
    >
      {/* Capa tecnológica de red de riesgo (conectividad/protección) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'url(/images/risk-network.svg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />

      {/* Anillos orbitales sutiles */}
      <div className="absolute inset-[8%] rounded-full border border-white/10" />
      <div className="absolute inset-[22%] rounded-full border border-brand-green/15" />

      {/* Escudo central — protección integral */}
      <motion.div
        {...float(0)}
        className="absolute left-1/2 top-1/2 flex h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/15 bg-brand-dark-blue/70 text-center shadow-premium-hover backdrop-blur-md"
      >
        <span className="glow-green pointer-events-none absolute inset-0 rounded-full opacity-60" />
        <ShieldCheck className="relative h-[40px] w-[40px] text-brand-neon-green" strokeWidth={1.75} />
        <span className="relative mt-1 max-w-[92px] text-caption font-semibold leading-tight text-white">
          Protección integral
        </span>
      </motion.div>

      {/* Dominios de protección en órbita */}
      {DOMAINS.map((d, i) => {
        const Icon = d.icon;
        return (
          <motion.div
            key={d.label}
            {...float(0.6 + i * 0.4)}
            className={`absolute ${d.pos} flex items-center gap-2 rounded-card border border-white/15 bg-brand-dark-blue/70 px-3 py-2 shadow-premium backdrop-blur-md`}
          >
            <span
              className={`flex h-[36px] w-[36px] items-center justify-center rounded-full ring-1 ring-white/10 ${
                d.accent === 'green' ? 'bg-brand-green/20' : 'bg-brand-blue/30'
              }`}
            >
              <Icon
                className={`h-[20px] w-[20px] ${
                  d.accent === 'green' ? 'text-brand-neon-green' : 'text-white'
                }`}
                strokeWidth={1.75}
              />
            </span>
            <span className="leading-tight">
              <span className="block text-caption font-semibold text-white">{d.label}</span>
              <span className="block text-[0.7rem] text-white/60">{d.sub}</span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
