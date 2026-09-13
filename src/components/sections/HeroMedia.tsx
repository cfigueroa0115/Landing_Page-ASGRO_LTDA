'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import HeroInsuranceVisual from '@/components/sections/HeroInsuranceVisual';

/**
 * HeroMedia — Imagen editorial del Hero con fallback real (5A.6).
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
    <div className="relative overflow-hidden rounded-modal border border-white/12 shadow-premium-hover">
      {/* Capa tecnológica secundaria (muy sutil) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] opacity-30"
        style={{
          backgroundImage: 'url(/images/risk-network.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Imagen editorial principal (LCP) */}
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
        {/* Overlay azul ASGRO discreto para integrar con la marca */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-brand-dark-blue/55 via-brand-dark-blue/10 to-transparent"
        />
      </div>

      {/* Microcard informativa (una sola) */}
      <div className="absolute bottom-[16px] left-[16px] z-[2] flex items-center gap-2 rounded-card border border-white/15 bg-brand-dark-blue/70 px-[12px] py-[8px] backdrop-blur-md">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-green/20 ring-1 ring-brand-green/30">
          <ShieldCheck className="h-[18px] w-[18px] text-brand-neon-green" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <span className="block text-caption font-semibold text-white">Protección integral</span>
          <span className="block text-[0.7rem] text-white/60">Personas · Patrimonio · Empresas</span>
        </span>
      </div>
    </div>
  );
}
