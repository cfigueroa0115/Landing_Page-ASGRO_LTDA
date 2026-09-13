'use client';

/**
 * InsuranceShowcaseSection — Vitrina editorial de protección (Bloque 5A.4).
 *
 * Aporta fotografía real a la home para equilibrar la iconografía: una
 * composición editorial de Personas (dos imágenes superpuestas) junto a media
 * cards premium de Hogar/Patrimonio y Vehículo. Complementa —no reemplaza— el
 * portafolio técnico. Enlaces reales; sin interactive nesting; reduced-motion.
 */

import Image from 'next/image';
import SectionHeader from '@/components/shared/SectionHeader';
import AnimatedSection from '@/components/shared/AnimatedSection';
import InsuranceMediaCard from '@/components/shared/InsuranceMediaCard';

export default function InsuranceShowcaseSection() {
  return (
    <section
      id="proteccion-visual"
      aria-labelledby="showcase-heading"
      className="scroll-mt-[84px] bg-white py-12 md:py-16"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Protección en cada frente"
          title="Cuidamos lo que da sentido a su día a día"
          subtitle="Personas, hogar, patrimonio y movilidad: acompañamos la protección de lo que más importa."
          titleId="showcase-heading"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personas — composición editorial con dos imágenes */}
          <AnimatedSection>
            <div className="relative">
              {/* Imagen principal */}
              <div className="relative overflow-hidden rounded-modal border border-gray-200/80 shadow-premium">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/SegurosPersonas3.webp"
                    alt="Familia protegida por un seguro de personas de ASGRO"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/45 to-transparent"
                  />
                </div>
                {/* Tag */}
                <span className="absolute left-[16px] top-[16px] inline-flex items-center rounded-full bg-brand-dark-blue/75 px-[12px] py-[6px] text-caption font-semibold text-white backdrop-blur-sm ring-1 ring-white/15">
                  Protección para personas
                </span>
              </div>

              {/* Imagen secundaria superpuesta (desplazada, editorial) */}
              <div className="absolute -bottom-6 right-4 hidden w-[38%] max-w-[190px] overflow-hidden rounded-card border-4 border-white shadow-premium-hover sm:block">
                <div className="relative aspect-square w-full">
                  <Image
                    src="/images/SegurosPersonas2.png"
                    alt="Asesoría cercana para la protección de la salud y la vida"
                    fill
                    sizes="190px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <p className="mt-8 max-w-md text-body text-gray-600 sm:mt-6">
              Soluciones de vida, salud y protección personal pensadas para cada
              etapa, con acompañamiento cercano.
            </p>
          </AnimatedSection>

          {/* Hogar y Vehículo — media cards apiladas */}
          <AnimatedSection delay={120}>
            <div className="grid gap-6">
              <InsuranceMediaCard
                image="/images/Hogar-protegido.webp"
                alt="Protección de hogar y patrimonio"
                eyebrow="Hogar y patrimonio"
                title="Su hogar y su patrimonio, resguardados"
                description="Hogar, copropiedades y arrendamiento con coberturas a la medida."
                href="/servicios"
                ctaLabel="Ver soluciones"
                objectPosition="center"
                aspect="16 / 9"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <InsuranceMediaCard
                image="/images/Vehiculo.webp"
                alt="Protección para vehículos y movilidad"
                eyebrow="Vehículo y movilidad"
                title="Movilidad protegida en cada trayecto"
                description="Automóviles y movilidad con respaldo y respuesta ágil."
                href="/contacto"
                ctaLabel="Cotizar mi vehículo"
                objectPosition="center"
                aspect="16 / 9"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
