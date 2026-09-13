'use client';

/**
 * QuickAccessSection — Dock de accesos rápidos premium (Bloque 5A.1).
 *
 * Capa de navegación inteligente compacta hacia los frentes clave: Personas,
 * Empresas, ARL, SST, Cumplimiento y Contacto. Enlaza a rutas existentes. En
 * desktop muestra icono + label + microtexto; en móvil, grid 2×3 compacto (sin
 * scroll horizontal de página). Cada acceso es un único <a>. Reduced-motion.
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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import PremiumIconBadge from '@/components/shared/PremiumIconBadge';
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
      className="scroll-mt-[84px] bg-white"
    >
      <div className="section-container">
        {/* Dock elevado: se superpone ligeramente sobre la onda del hero. */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 -mt-[28px] rounded-modal border border-gray-200/80 bg-white p-[12px] shadow-premium md:-mt-[32px] md:p-[16px]"
        >
          <h2 id="quick-access-heading" className="sr-only">
            Accesos rápidos
          </h2>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-6">
            {QUICK_ACCESS_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.icon] ?? Users;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group flex h-full min-h-[76px] flex-col items-center justify-center gap-[6px] rounded-card border border-transparent p-2 text-center transition-colors duration-300 hover:border-brand-blue/20 hover:bg-brand-light-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:flex-row lg:justify-start lg:gap-3 lg:text-left"
                  >
                    <PremiumIconBadge icon={Icon} size="sm" tone="blue" />
                    <span className="flex flex-col">
                      <span className="text-small font-semibold text-brand-dark-blue">
                        {item.label}
                      </span>
                      {/* Microtexto solo en desktop */}
                      <span className="hidden text-caption leading-snug text-gray-500 lg:block">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
