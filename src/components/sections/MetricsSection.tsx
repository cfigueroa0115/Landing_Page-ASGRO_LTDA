'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Layers,
  ListChecks,
  CircleDot,
  Handshake,
} from 'lucide-react';
import Counter from '@/components/shared/Counter';
import AnimatedSection from '@/components/shared/AnimatedSection';

/**
 * Métricas institucionales seguras — NO cifras comerciales no confirmadas.
 * Solo se muestran indicadores de estructura del servicio.
 */
const SAFE_INSTITUTIONAL_METRICS = [
  { id: 'safe-1', value: 4, label: 'Líneas estratégicas', unit: 'líneas', icon: 'Layers' },
  { id: 'safe-2', value: 5, label: 'Fases metodológicas', unit: 'fases', icon: 'ListChecks' },
  { id: 'safe-3', value: 360, label: 'Visión integral', unit: '°', icon: 'CircleDot' },
  { id: 'safe-4', value: 100, label: 'Enfoque en acompañamiento', unit: '%', icon: 'Handshake' },
];

// Map icon string names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  ListChecks,
  CircleDot,
  Handshake,
};

/**
 * MetricsSection — Métricas institucionales seguras con contadores animados.
 *
 * Muestra SOLO indicadores institucionales confirmados, no cifras comerciales.
 * Las métricas comerciales están disponibles en /resultados vía /api/metrics.
 */
export default function MetricsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasTriggered = useRef(false);

  // Intersection Observer to trigger animation at 25% visibility (once per page load)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  function renderIcon(iconName?: string) {
    const IconComponent = iconName ? ICON_MAP[iconName] : null;
    if (IconComponent) {
      return <IconComponent className="h-7 w-7 text-brand-green" />;
    }
    return <Layers className="h-7 w-7 text-brand-green" />;
  }

  function getCounterSuffix(unit: string): string {
    if (unit === '%') return '%';
    if (unit === '°') return '°';
    return '';
  }

  return (
    <section
      id="resultados"
      ref={sectionRef}
      className="py-10 md:py-12 lg:py-14 bg-brand-light-gray"
      aria-label="Indicadores institucionales de ASGRO"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-3">
        <AnimatedSection className="text-center mb-6 md:mb-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-green mb-1 block">
            Indicadores institucionales
          </span>
          <h2 className="text-h2 text-brand-dark-blue mb-2">
            Nuestro modelo de gestión
          </h2>
          <p className="text-body-lg text-gray-600 max-w-[640px] mx-auto">
            Indicadores que reflejan la estructura y alcance de nuestro acompañamiento integral.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {SAFE_INSTITUTIONAL_METRICS.map((metric, index) => (
            <AnimatedSection
              key={metric.id}
              delay={index * 150}
              direction="up"
              threshold={0.2}
            >
              <div className="bg-white rounded-card p-4 md:p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 text-center flex flex-col items-center gap-2 h-full">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-green/20 to-brand-blue/10 flex items-center justify-center">
                  {renderIcon(metric.icon)}
                </div>

                <div className="flex flex-col items-center gap-1">
                  {isVisible ? (
                    <Counter
                      target={metric.value}
                      duration={2000}
                      suffix={getCounterSuffix(metric.unit)}
                      className="text-3xl md:text-4xl font-bold text-brand-blue"
                    />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-brand-blue">
                      0
                    </span>
                  )}

                  <span className="text-sm text-gray-600 font-medium">
                    {metric.label}
                  </span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
