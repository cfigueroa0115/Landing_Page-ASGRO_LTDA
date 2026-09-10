'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

/**
 * ValueCard — Tarjeta limpia para los frentes de valor (Personas / Patrimonio /
 * Empresas) y para diferenciadores cualitativos.
 *
 * Diseño: ícono lineal en círculo con acento verde/azul, título e idea breve.
 * Sombra ligera, hover discreto. Iconografía lineal minimalista corporativa.
 */
export default function ValueCard({
  icon: Icon,
  title,
  description,
  className,
}: ValueCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'group relative flex h-full flex-col items-center rounded-card border border-gray-100 bg-white p-[28px] text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        className
      )}
    >
      {/* Acento curvo superior (sello ASGRO): filete 3px, inset explícito */}
      <span
        aria-hidden="true"
        className="absolute inset-x-[48px] top-0 h-[3px] rounded-b-full bg-brand-green/70 motion-safe:transition-all motion-safe:duration-300 motion-safe:group-hover:inset-x-[36px]"
      />

      {/* Contenedor de icono 48px con icono 24px */}
      <div className="mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gradient-to-br from-brand-green/15 to-brand-blue/10 ring-1 ring-brand-green/20">
        <Icon className="h-[24px] w-[24px] text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <h3 className="text-lg font-bold text-brand-dark-blue">{title}</h3>

      <p className="mt-[6px] text-body text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.article>
  );
}
