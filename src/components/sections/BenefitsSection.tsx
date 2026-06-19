'use client';

import { motion } from 'framer-motion';
import {
  TrendingDown,
  ShieldCheck,
  DollarSign,
  Users,
  Clock,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { BENEFITS_DATA, SITE_CONTENT } from '@/lib/utils/constants';

/**
 * Mapa de nombre de ícono Lucide a componente React.
 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingDown,
  ShieldCheck,
  DollarSign,
  Users,
  Clock,
  BarChart3,
  GraduationCap,
};

/**
 * BenefitsSection — Sección de beneficios tangibles de trabajar con ASGRO.
 *
 * Muestra mínimo 6 beneficios con:
 * - Ícono (Lucide React) + título + descripción (máx 120 chars con resultados específicos)
 * - Grid responsivo: 1col < 768px, 2col 768-1024px, 3col > 1024px
 * - Animación de entrada escalonada al entrar al viewport
 * - Cards con token `rounded-card` y colores de marca
 *
 * Requisitos: 13.1, 13.2, 13.3, 13.4
 */
export default function BenefitsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  } as const;

  const cardVariants = {
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
      id="beneficios"
      aria-labelledby="benefits-heading"
      className="py-10 md:py-12 lg:py-14 bg-brand-light-gray"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-3">
        {/* Encabezado de la sección */}
        <AnimatedSection className="text-center mb-6 md:mb-8">
          <h2
            id="benefits-heading"
            className="text-h2 text-brand-dark-blue mb-2"
          >
            {SITE_CONTENT.benefitsTitle}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-[640px] mx-auto">
            Beneficios concretos y medibles que obtienen nuestros clientes al
            confiar en ASGRO LTDA.
          </p>
        </AnimatedSection>

        {/* Grid de beneficios con animación escalonada */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {BENEFITS_DATA.map((benefit) => {
            const IconComponent = ICON_MAP[benefit.icon];

            return (
              <motion.article
                key={benefit.id}
                variants={cardVariants}
                className="flex flex-col items-start p-4 rounded-card bg-white shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full"
              >
                {/* Contenedor del ícono */}
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-green/10 mb-2">
                  {IconComponent && (
                    <IconComponent className="w-3 h-3 text-brand-green" />
                  )}
                </div>

                {/* Título */}
                <h3 className="text-h4 text-brand-dark-blue mb-1">
                  {benefit.title}
                </h3>

                {/* Descripción con resultado específico */}
                <p className="text-body text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
