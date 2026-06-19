'use client';

import { motion } from 'framer-motion';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { METHODOLOGY_STEPS, SITE_CONTENT } from '@/lib/utils/constants';

/**
 * MethodologySection — Sección "Nuestra metodología"
 *
 * Presenta la metodología de ASGRO en 5 pasos como timeline visual:
 * - Diagnóstico, Planeación, Implementación, Seguimiento, Mejora continua
 * - Timeline vertical en móvil, horizontal en desktop
 * - Numeración circular en brand-blue con línea conectora
 * - Animación secuencial escalonada (200ms entre elementos)
 * - Animación se ejecuta una sola vez (viewport once: true)
 *
 * Requisitos: 11.1, 11.2, 11.3, 11.4
 */
export default function MethodologySection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  } as const;

  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <section
      id="metodologia"
      aria-labelledby="methodology-heading"
      className="py-10 md:py-12 lg:py-14 bg-brand-light-gray"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-3">
        {/* Encabezado de la sección */}
        <AnimatedSection className="text-center mb-6 md:mb-8">
          <h2
            id="methodology-heading"
            className="text-h2 text-brand-dark-blue mb-2"
          >
            {SITE_CONTENT.methodologyTitle}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-[640px] mx-auto">
            {SITE_CONTENT.methodologySubtitle}
          </p>
        </AnimatedSection>

        {/* Timeline — vertical en móvil, horizontal en desktop */}
        <motion.div
          className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Línea conectora vertical (móvil) */}
          <div
            className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-brand-blue/20 lg:hidden"
            aria-hidden="true"
          />

          {/* Línea conectora horizontal (desktop) */}
          <div
            className="absolute top-[23px] left-[10%] right-[10%] h-[2px] bg-brand-blue/20 hidden lg:block"
            aria-hidden="true"
          />

          {METHODOLOGY_STEPS.map((step) => (
            <motion.article
              key={step.id}
              variants={stepVariants}
              className="relative flex flex-row lg:flex-col lg:items-center lg:text-center gap-2 lg:gap-1 lg:flex-1"
            >
              {/* Indicador numerado circular */}
              <div
                className="relative z-10 flex items-center justify-center w-6 h-6 min-w-[48px] min-h-[48px] rounded-full bg-brand-blue text-white font-bold text-h4 shadow-btn"
                aria-label={`Paso ${step.step}`}
              >
                {step.step}
              </div>

              {/* Contenido del paso */}
              <div className="flex-1 pb-3 lg:pb-0 lg:pt-2">
                <div className="rounded-card bg-white p-3 shadow-card">
                  <h3 className="text-h4 text-brand-dark-blue mb-1">
                    {step.title}
                  </h3>
                  <p className="text-body text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
