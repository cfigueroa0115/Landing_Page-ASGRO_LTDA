'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ClipboardCheck,
  HeartPulse,
  TrendingUp,
} from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { PILLARS_DATA } from '@/lib/utils/constants';

/**
 * Mapa de nombres de iconos a componentes de Lucide React.
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  ClipboardCheck,
  HeartPulse,
  TrendingUp,
};

/**
 * PillarsSection — Sección de los 4 pilares estratégicos de ASGRO.
 *
 * Muestra tarjetas con iconos, título y descripción en un grid responsivo:
 * - 1 columna en viewports < 640px
 * - 2 columnas entre 640px y 1024px
 * - 4 columnas en viewports > 1024px
 *
 * Incluye animación de entrada al viewport y elevación al hacer hover
 * en dispositivos con puntero.
 */
export default function PillarsSection() {
  return (
    <section
      aria-label="Pilares estratégicos"
      className="w-full bg-brand-light-gray py-10 lg:py-12"
    >
      <div className="mx-auto max-w-[1280px] px-2 sm:px-3 lg:px-4">
        <AnimatedSection direction="up" threshold={0.2}>
          <h2 className="text-h2 text-center text-brand-dark-blue mb-4">
            Pilares estratégicos
          </h2>
          <p className="text-body-lg text-center text-gray-600 mb-6 max-w-[640px] mx-auto">
            Cuatro ejes fundamentales que guían nuestra gestión integral de
            riesgos laborales y seguros.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PILLARS_DATA.map((pillar, index) => {
            const IconComponent = iconMap[pillar.icon];

            return (
              <AnimatedSection
                key={pillar.id}
                direction="up"
                delay={index * 150}
                threshold={0.1}
              >
                <motion.div
                  className="flex flex-col items-center text-center bg-white rounded-card p-4 shadow-card
                    cursor-default h-full"
                  whileHover={{
                    y: -6,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ willChange: 'transform' }}
                >
                  {/* Icono con acento de color */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue/10 mb-2">
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 text-brand-blue" />
                    )}
                  </div>

                  {/* Título del pilar */}
                  <h3 className="text-h4 text-brand-dark-blue mb-1">
                    {pillar.title}
                  </h3>

                  {/* Descripción del pilar */}
                  <p className="text-body text-gray-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
