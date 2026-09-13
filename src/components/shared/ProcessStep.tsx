'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import PremiumIconBadge from '@/components/shared/PremiumIconBadge';

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
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.1, ease: 'easeOut' }
      }
      className={cn('relative flex h-full flex-col items-center text-center', className)}
    >
      {/* Conector hacia el siguiente paso (solo desktop). top-[27px] = centro
          del badge de 54px. Degradado azul claro → verde. */}
      {showConnector && (
        <span
          aria-hidden="true"
          className="absolute left-[calc(50%+2rem)] top-[27px] hidden h-[2px] w-[calc(100%-4rem)] bg-gradient-to-r from-brand-blue/25 to-brand-green/55 lg:block"
        />
      )}

      {/* Badge premium con número integrado (círculo blanco premium + halo verde
          tenue + sombra + ring; badge numérico verde pequeño). */}
      {/* Número del paso para lectores de pantalla (el badge es aria-hidden). */}
      <span className="sr-only">Paso {step}</span>
      <PremiumIconBadge
        icon={Icon}
        variant="process"
        number={step}
        className="relative z-10 mb-3"
      />

      <h3 className="text-base font-bold text-brand-dark-blue md:text-lg">{title}</h3>
      <p className="mt-1 max-w-[240px] text-small text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
