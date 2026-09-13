'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Users, Home, Car, Building2, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * HeroInsuranceVisual — Composición editorial premium de seguros (5A.3).
 *
 * NOTA: es un FALLBACK temporal. No existe todavía una fotografía editorial de
 * seguros aprobada en public/images; cuando se suministre, se integrará aquí.
 *
 * Comunica los frentes de protección (personas/familia, hogar, vehículo,
 * empresa) alrededor de un escudo de "protección integral", sobre una capa
 * tecnológica sutil (red de riesgo). 100% SVG/CSS + iconografía ligera,
 * decorativa (aria-hidden). Movimiento ejecutivo: una sola capa ambiental muy
 * lenta y un desplazamiento mínimo (≤3px); nada de cinco elementos flotando.
 * Respeta prefers-reduced-motion. En móvil muestra una composición compacta.
 */

interface Domain {
  icon: LucideIcon;
  label: string;
  sub: string;
  /** posición (clases utilitarias absolutas) */
  pos: string;
  accent: 'green' | 'blue';
  /** visible en móvil (composición compacta) */
  mobile: boolean;
}

const DOMAINS: Domain[] = [
  { icon: Users, label: 'Personas', sub: 'Familia y vida', pos: 'left-0 top-[10%]', accent: 'green', mobile: true },
  { icon: Home, label: 'Hogar', sub: 'Patrimonio', pos: 'right-0 top-[6%]', accent: 'blue', mobile: false },
  { icon: Car, label: 'Vehículo', sub: 'Movilidad', pos: 'left-0 bottom-[12%]', accent: 'blue', mobile: false },
  { icon: Building2, label: 'Empresa', sub: 'Continuidad', pos: 'right-0 bottom-[8%]', accent: 'green', mobile: true },
];

export default function HeroInsuranceVisual() {
  const prefersReducedMotion = useReducedMotion();

  // Una sola capa ambiental lenta (desplazamiento mínimo). Nada si reduce.
  const ambient = prefersReducedMotion
    ? {}
    : {
        animate: { y: [0, -3, 0] },
        transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' as const },
      };

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[260px] sm:max-w-[380px] lg:max-w-[440px]"
      aria-hidden="true"
    >
      {/* Capa tecnológica de red de riesgo (conectividad/protección) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'url(/images/risk-network.svg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />

      {/* Anillos orbitales sutiles */}
      <div className="absolute inset-[8%] rounded-full border border-white/10" />
      <div className="absolute inset-[24%] rounded-full border border-brand-green/15" />

      {/* Núcleo: escudo de protección integral (única capa con micro-movimiento) */}
      <motion.div
        {...ambient}
        className="absolute left-1/2 top-1/2 flex h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/15 bg-brand-dark-blue/70 text-center shadow-premium-hover backdrop-blur-md sm:h-[120px] sm:w-[120px]"
      >
        <span className="glow-green pointer-events-none absolute inset-0 rounded-full opacity-60" />
        <ShieldCheck className="relative h-[34px] w-[34px] text-brand-neon-green sm:h-[40px] sm:w-[40px]" strokeWidth={1.75} />
        <span className="relative mt-[4px] max-w-[92px] text-caption font-semibold leading-tight text-white">
          Protección integral
        </span>
      </motion.div>

      {/* Dominios de protección en órbita. En móvil solo 2 (evita solapamiento);
          estáticos (sin flotar) para una lectura ejecutiva. */}
      {DOMAINS.map((d) => {
        const Icon = d.icon;
        return (
          <div
            key={d.label}
            className={`absolute ${d.pos} ${d.mobile ? 'flex' : 'hidden sm:flex'} items-center gap-[8px] rounded-card border border-white/15 bg-brand-dark-blue/70 px-[12px] py-[8px] shadow-premium backdrop-blur-md`}
          >
            <span
              className={`flex h-[34px] w-[34px] items-center justify-center rounded-full ring-1 ring-white/10 ${
                d.accent === 'green' ? 'bg-brand-green/20' : 'bg-brand-blue/30'
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${
                  d.accent === 'green' ? 'text-brand-neon-green' : 'text-white'
                }`}
                strokeWidth={1.75}
              />
            </span>
            <span className="leading-tight">
              <span className="block text-caption font-semibold text-white">{d.label}</span>
              <span className="block text-[0.7rem] text-white/60">{d.sub}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
