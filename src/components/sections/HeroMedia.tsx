'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import HeroInsuranceVisual from '@/components/sections/HeroInsuranceVisual';

/**
 * HeroMedia — Imagen editorial del Hero con fallback real y edge blending (5A.7).
 *
 * Primera opción: fotografía editorial `SeguroIntegral.avif` (imagen LCP con
 * priority). Si ocurre un error real de carga, se renderiza en su lugar
 * `HeroInsuranceVisual` (composición SVG/CSS). Nunca se muestran ambos a la vez.
 * El fallback no afecta el LCP normal: la imagen se intenta primero y solo se
 * sustituye ante `onError`.
 */
export default function HeroMedia() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Fallback accesible: composición visual de protección (sin la fotografía).
    return <HeroInsuranceVisual />;
  }

  return (
    <div className="relative">
      {/* Glow ASGRO exterior muy tenue para fundir la imagen con el fondo
          (sin borde blanco duro). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-[28px] bg-brand-blue/20 blur-2xl"
      />

      {/* Marco de la fotografía: sin borde blanco. Se integra con sombra azul
          profunda + edge vignette hacia el fondo (nitidez intacta, sin blur). */}
      <div
        className="relative overflow-hidden rounded-modal"
        style={{ boxShadow: '0 24px 70px rgba(1, 25, 48, 0.55), 0 4px 16px rgba(1, 25, 48, 0.35)' }}
      >
        {/* Capa tecnológica secundaria (muy sutil, no invade la fotografía) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] opacity-20"
          style={{
            backgroundImage: 'url(/images/risk-network.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Imagen editorial principal (LCP) — nitidez intacta */}
        <div className="relative h-[240px] w-full sm:h-[320px] lg:h-[420px]">
          <Image
            src="/images/SeguroIntegral.avif"
            alt="Protección integral para personas, patrimonio y empresas"
            fill
            priority
            sizes="(max-width: 1024px) 92vw, 560px"
            className="object-cover"
            style={{ objectPosition: 'center' }}
            onError={() => setFailed(true)}
          />
          {/* Edge vignette: más oscuro abajo/izquierda, transparente en la zona
              protagonista, para transición tonal hacia el fondo azul. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-tr from-brand-dark-blue/70 via-brand-dark-blue/12 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              boxShadow: 'inset 0 -40px 60px -20px rgba(1,25,48,0.5), inset 0 40px 60px -30px rgba(1,25,48,0.25)',
            }}
          />
        </div>

        {/* Microcard informativa (una sola) — glass integrado, contraste AA */}
        <div className="absolute bottom-[16px] left-[16px] z-[2] flex items-center gap-2 rounded-card border border-white/10 bg-brand-dark-blue/75 px-[12px] py-[8px] shadow-lg backdrop-blur-md">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-green/20 ring-1 ring-brand-green/30">
            <ShieldCheck className="h-[18px] w-[18px] text-brand-neon-green" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-caption font-semibold text-white">Protección integral</span>
            <span className="block text-[0.7rem] text-white/70">Personas · Patrimonio · Empresas</span>
          </span>
        </div>
      </div>
    </div>
  );
}
