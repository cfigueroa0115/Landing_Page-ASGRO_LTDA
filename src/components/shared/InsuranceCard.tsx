'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InsuranceCardProps {
  icon: LucideIcon;
  name: string;
  description: string;
  className?: string;
}

/**
 * InsuranceCard — Tarjeta limpia y ligera para un producto del Portafolio de
 * Seguros. Icono lineal + nombre + descripción de 1-2 líneas. Sin catálogo pesado.
 */
export default function InsuranceCard({
  icon: Icon,
  name,
  description,
  className,
}: InsuranceCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group flex h-full items-start gap-2 rounded-card border border-gray-100 bg-white p-3 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-brand-green/40',
        className
      )}
    >
      <div className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full bg-brand-green/10 transition-colors duration-300 group-hover:bg-brand-green/20">
        <Icon className="h-[22px] w-[22px] text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <h4 className="text-base font-semibold text-brand-dark-blue">{name}</h4>
        <p className="mt-0.5 text-small text-gray-600 leading-snug">{description}</p>
      </div>
    </motion.div>
  );
}
