'use client';

import { motion } from 'framer-motion';
import {
  Target,
  Award,
  BookOpen,
  Headphones,
  BarChart3,
} from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { DIFFERENTIATORS_DATA, SITE_CONTENT } from '@/lib/utils/constants';

/**
 * Mapa de nombre de ícono Lucide a componente React.
 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Award,
  BookOpen,
  Headphones,
  BarChart3,
};

/**
 * Colores alternados para los contenedores circulares de íconos.
 * Alternan entre green (#7AC146) y blue (#024EA3) de la paleta de marca.
 */
const ICON_COLORS = [
  'bg-brand-green',
  'bg-brand-blue',
  'bg-brand-green',
  'bg-brand-blue',
  'bg-brand-green',
];

/**
 * WhyChooseSection — Sección "¿Por qué ASGRO?"
 *
 * Muestra 5 diferenciadores competitivos con:
 * - Ícono dentro de un contenedor circular verde/azul
 * - Título (máx 40 chars) y descripción (máx 150 chars)
 * - Grid responsivo: 1col < 640px, 2col 640-1024px, 3col > 1024px
 * - Animación de entrada escalonada con Framer Motion
 * - Premium hover: scale, glow, elevation
 *
 * Requisitos: 8.1, 8.2, 8.3, 8.4
 */
export default function WhyChooseSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
      id="por-que-asgro"
      aria-labelledby="why-choose-heading"
      className="py-10 md:py-12 lg:py-14 bg-white"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-3">
        {/* Encabezado de la sección */}
        <AnimatedSection className="text-center mb-6 md:mb-8">
          <h2
            id="why-choose-heading"
            className="text-h2 text-brand-dark-blue mb-2"
          >
            {SITE_CONTENT.whyChooseTitle}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-[640px] mx-auto">
            {SITE_CONTENT.whyChooseSubtitle}
          </p>
        </AnimatedSection>

        {/* Grid de diferenciadores con animación escalonada */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {DIFFERENTIATORS_DATA.map((differentiator, index) => {
            const IconComponent = ICON_MAP[differentiator.icon];

            return (
              <motion.article
                key={differentiator.id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.03,
                  y: -4,
                  boxShadow: '0 12px 32px rgba(2, 78, 163, 0.15)',
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="group flex flex-col items-center text-center p-5 rounded-card bg-brand-light-gray shadow-card transition-all duration-300 cursor-default h-full relative overflow-hidden"
              >
                {/* Subtle gradient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-card" />

                {/* Contenedor circular del ícono — larger */}
                <div
                  className={`relative flex items-center justify-center w-14 h-14 rounded-full ${ICON_COLORS[index]} mb-4 shadow-md group-hover:shadow-lg transition-shadow duration-300`}
                >
                  {IconComponent && (
                    <IconComponent className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Título — bolder */}
                <h3 className="relative text-lg font-bold text-brand-dark-blue mb-2">
                  {differentiator.title}
                </h3>

                {/* Descripción — lighter weight */}
                <p className="relative text-body text-gray-500 leading-relaxed">
                  {differentiator.description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
