'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, HardHat, FileCheck, Heart } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import ServiceModal from '@/components/shared/ServiceModal';
import { Button } from '@/components/ui/button';
import { SERVICES_DATA, SITE_CONTENT } from '@/lib/utils/constants';
import type { ServiceData } from '@/types';

/**
 * Mapa de nombres de iconos a componentes de Lucide React para servicios.
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  HardHat,
  FileCheck,
  Heart,
};

/**
 * ServicesSection — Sección principal de servicios de ASGRO.
 *
 * Muestra 4 categorías de servicios en tarjetas con grid responsivo:
 * - ARL y Riesgos Laborales
 * - Seguridad y Salud en el Trabajo
 * - Seguros empresariales a la medida
 * - Bienestar Laboral
 *
 * Cada tarjeta tiene icono, título, descripción (máx 120 chars) y botón
 * "Ver más" que abre el ServiceModal con los detalles del servicio.
 *
 * Es un Client Component porque gestiona el estado del modal.
 */
export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (service: ServiceData) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <section
      id="servicios"
      aria-label="Nuestros servicios"
      className="w-full bg-white py-10 lg:py-12"
    >
      <div className="mx-auto max-w-[1280px] px-2 sm:px-3 lg:px-4">
        {/* Encabezado de la sección */}
        <AnimatedSection direction="up" threshold={0.2}>
          <h2 className="text-h2 text-center text-brand-dark-blue mb-1">
            {SITE_CONTENT.servicesTitle}
          </h2>
          <p className="text-body-lg text-center text-gray-600 mb-6 max-w-[640px] mx-auto">
            {SITE_CONTENT.servicesSubtitle}
          </p>
        </AnimatedSection>

        {/* Grid de tarjetas de servicios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SERVICES_DATA.map((service, index) => {
            const IconComponent = iconMap[service.icon];

            return (
              <AnimatedSection
                key={service.id}
                direction="up"
                delay={index * 150}
                threshold={0.1}
              >
                <motion.div
                  className="flex flex-col items-center text-center bg-brand-light-gray rounded-card p-4 shadow-card h-full"
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ willChange: 'transform' }}
                >
                  {/* Icono del servicio */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue/10 mb-2">
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 text-brand-blue" />
                    )}
                  </div>

                  {/* Título del servicio */}
                  <h3 className="text-h4 text-brand-dark-blue mb-1">
                    {service.title}
                  </h3>

                  {/* Descripción (máx 120 chars visibles en la tarjeta) */}
                  <p className="text-small text-gray-600 leading-relaxed mb-2 flex-1">
                    {service.description.length > 120
                      ? `${service.description.slice(0, 117)}...`
                      : service.description}
                  </p>

                  {/* Botón "Ver más" */}
                  <Button
                    onClick={() => handleOpenModal(service)}
                    variant="outline"
                    className="mt-auto border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white rounded-btn transition-colors"
                    aria-label={`Ver más sobre ${service.title}`}
                  >
                    Ver más
                  </Button>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>

      {/* Modal de detalle de servicio */}
      {selectedService && (
        <ServiceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          service={selectedService}
        />
      )}
    </section>
  );
}
