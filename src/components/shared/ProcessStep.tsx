'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProcessStepProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Muestra el conector hacia el siguiente paso (oculto en el último y en mobile) */
  showConnector?: boolean;
  index?: number;
  className?: string;
}

/**
 * ProcessStep — Etapa del modelo de acompañamiento (journey visual simple).
 *
 * Número + ícono lineal + título + descripción breve. Un conector discreto une
 * las etapas en desktop. Diseño limpio, sin sobrecarga.
 */
export default function ProcessStep({
  step,
  icon: Icon,
  title,
  description,
  showConnector = false,
  index = 0,
  className,
}: ProcessStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      className={cn('relative flex h-full flex-col items-center text-center', className)}
    >
      {/* Conector hacia el siguiente paso (solo desktop). top-[24px] = centro
          del círculo de 48px. */}
      {showConnector && (
        <span
          aria-hidden="true"
          className="absolute left-[calc(50%+2rem)] top-[24px] hidden h-[2px] w-[calc(100%-4rem)] bg-gradient-to-r from-brand-green/50 to-brand-blue/20 lg:block"
        />
      )}

      {/* Número + ícono (círculo 48px, icono 24px, badge 20px) */}
      <div className="relative z-10 mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white shadow-card ring-2 ring-brand-green/30">
        <Icon className="h-[24px] w-[24px] text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
        <span className="absolute -right-1 -top-1 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-brand-green text-[11px] font-bold text-white">
          {step}
        </span>
      </div>

      <h3 className="text-base font-bold text-brand-dark-blue md:text-lg">{title}</h3>
      <p className="mt-1 max-w-[240px] text-small text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
