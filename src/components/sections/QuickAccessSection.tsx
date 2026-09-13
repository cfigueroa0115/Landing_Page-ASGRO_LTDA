'use client';

/**
 * QuickAccessSection — Accesos rápidos premium (Bloque 5A).
 *
 * Banda de navegación ejecutiva hacia los frentes clave: Personas, Empresas,
 * ARL, SST, Cumplimiento y Contacto. Tarjetas sobrias con icono, título y
 * descripción breve; enlazan a rutas existentes ya validadas. Cada tarjeta es
 * un único elemento interactivo (<a>). Respeta reduced-motion.
 */

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Users,
  Building2,
  HardHat,
  HeartPulse,
  FileCheck,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SectionHeader from '@/components/shared/SectionHeader';
import { QUICK_ACCESS_ITEMS } from '@/lib/utils/constants';

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Building2,
  HardHat,
  HeartPulse,
  FileCheck,
  MessageCircle,
};

export default function QuickAccessSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="accesos-rapidos"
      aria-labelledby="quick-access-heading"
      className="scroll-mt-[84px] bg-white py-12 md:py-16"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Accesos rápidos"
          title="¿Qué necesita proteger hoy?"
          subtitle="Vaya directo al frente que le interesa. Le orientamos en cada uno."
          titleId="quick-access-heading"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACCESS_ITEMS.map((item, index) => {
            const Icon = ICON_MAP[item.icon] ?? Users;
            return (
              <motion.div
                key={item.label}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.35, delay: index * 0.05, ease: 'easeOut' }
                }
              >
                <Link
                  href={item.href}
                  className="card-quick group flex h-full flex-col items-start p-[18px] hover:-translate-y-[2px] hover:border-brand-blue/30 hover:shadow-premium-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue motion-reduce:transform-none"
                >
                  {/* Acento superior sutil */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[18px] top-0 h-[3px] rounded-b-full bg-brand-green/0 transition-colors duration-300 group-hover:bg-brand-green/70"
                  />
                  <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/15 transition-colors duration-300 group-hover:bg-brand-blue group-hover:text-white">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="mt-3 text-base font-semibold text-brand-dark-blue">
                    {item.label}
                  </span>
                  <span className="mt-[4px] text-small leading-snug text-gray-600">
                    {item.description}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-[6px] text-caption font-semibold text-brand-blue">
                    Ver más
                    <ArrowRight
                      className="h-[14px] w-[14px] transition-transform duration-300 motion-safe:group-hover:translate-x-[3px]"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
