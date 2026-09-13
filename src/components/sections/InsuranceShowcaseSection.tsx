'use client';

/**
 * InsuranceShowcaseSection — Vitrina editorial de protección (Bloque 5A.6).
 *
 * Bento editorial premium: Personas como pieza principal (dos imágenes
 * superpuestas) junto a Hogar y Vehículo como piezas complementarias. Las dos
 * columnas terminan aproximadamente alineadas en desktop; en móvil se apilan
 * Personas → Hogar → Vehículo. Complementa —no reemplaza— el portafolio técnico.
 * Enlaces reales, sin interactive nesting, reduced-motion.
 *
 * Spacing con valores explícitos (la escala custom hace py-12=96px, gap-6=48px):
 * sección ~64/80px, gaps 24-28px, separación imagen/texto ~20px.
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
      className="scroll-mt-[84px] bg-white py-[48px] md:py-[72px]"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="Protección en cada frente"
          title="Cuidamos lo que da sentido a su día a día"
          subtitle="Personas, hogar, patrimonio y movilidad: acompañamos la protección de lo que más importa."
          titleId="showcase-heading"
        />

        {/* Bento: Personas (principal) + Hogar/Vehículo (complementarias) */}
        <div className="grid gap-[24px] lg:grid-cols-[1.1fr_0.9fr]">
          {/* Personas — composición editorial con dos imágenes */}
          <AnimatedSection className="flex flex-col">
            <div className="relative flex-1">
              {/* Imagen principal — 4:3 móvil, algo más alto en desktop */}
              <div className="relative h-full overflow-hidden rounded-modal border border-gray-200/80 shadow-premium">
                <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full">
                  <Image
                    src="/images/SegurosPersonas3.webp"
                    alt="Familia protegida por un seguro de personas de ASGRO"
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/55 via-brand-dark-blue/10 to-transparent"
                  />
                </div>
                {/* Tag */}
                <span className="absolute left-[16px] top-[16px] inline-flex items-center rounded-full bg-brand-dark-blue/75 px-[12px] py-[6px] text-caption font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm">
                  Protección para personas
                </span>
                {/* Texto sobre la parte inferior (no tapa la foto) */}
                <div className="absolute inset-x-0 bottom-0 p-[18px]">
                  <h3 className="text-h4 font-bold text-white">
                    Su bienestar y el de su familia
                  </h3>
                  <p className="mt-[6px] max-w-md text-small leading-snug text-white/85">
                    Vida, salud y protección personal para cada etapa, con
                    acompañamiento cercano.
                  </p>
                </div>
              </div>

              {/* Imagen secundaria superpuesta (editorial, desktop).
                  Valores explícitos: -bottom-[20px] (no -bottom-5=-40px) y
                  right-[16px] (no right-4=32px). Máx 170px, borde blanco. */}
              <div className="absolute -bottom-[20px] right-[16px] hidden w-[34%] max-w-[170px] overflow-hidden rounded-card border-4 border-white shadow-premium-hover sm:block">
                <div className="relative aspect-square w-full">
                  <Image
                    src="/images/SegurosPersonas2.jpg"
                    alt="Asesoría cercana para la protección de la salud y la vida"
                    fill
                    sizes="170px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Hogar y Vehículo — media cards complementarias.
              Móvil 4:3; desktop 16:9 para que las dos + gap terminen alineadas
              con Personas (Bento ~520-620px, no ~800px). */}
          <AnimatedSection delay={120} className="grid gap-[24px]">
            <InsuranceMediaCard
              image="/images/Hogar-protegido.webp"
              alt="Protección de hogar y patrimonio"
              eyebrow="Hogar y patrimonio"
              title="Su hogar y su patrimonio, resguardados"
              description="Hogar, copropiedades y arrendamiento con coberturas a la medida."
              href="/servicios"
              ctaLabel="Ver soluciones"
              objectPosition="center"
              aspectClassName="aspect-[4/3] lg:aspect-[16/9]"
              sizes="(max-width: 1024px) 100vw, 40vw"
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
              aspectClassName="aspect-[4/3] lg:aspect-[16/9]"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
