'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Award,
  ShieldCheck,
  Users,
  TrendingDown,
} from 'lucide-react';
import Counter from '@/components/shared/Counter';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { FALLBACK_METRICS, SITE_CONTENT } from '@/lib/utils/constants';
import type { MetricDisplay } from '@/types';

// Map icon string names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Award,
  ShieldCheck,
  Users,
  TrendingDown,
};

/**
 * MetricsSection — Sección de métricas animadas con contadores.
 *
 * Client Component que:
 * - Obtiene métricas desde GET /api/metrics
 * - Muestra 4-8 contadores animados usando el componente Counter
 * - Activa la animación cuando el 25% de la sección es visible (una vez por carga)
 * - Si la API falla, usa los datos de respaldo de FALLBACK_METRICS
 * - Si la API retorna menos de 4 métricas, complementa con entradas de respaldo
 * - Todos los labels y unidades en español
 */
export default function MetricsSection() {
  const [metrics, setMetrics] = useState<MetricDisplay[]>(FALLBACK_METRICS);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasTriggered = useRef(false);

  // Fetch metrics from API
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/metrics');
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        const data: MetricDisplay[] = await response.json();

        if (data && Array.isArray(data) && data.length > 0) {
          let finalMetrics = data.slice(0, 8); // Cap at 8 max

          // Supplement with fallback entries if fewer than 4 returned
          if (finalMetrics.length < 4) {
            const existingIds = new Set(finalMetrics.map((m) => m.id));
            const supplements = FALLBACK_METRICS.filter(
              (m) => !existingIds.has(m.id)
            );
            finalMetrics = [
              ...finalMetrics,
              ...supplements.slice(0, 4 - finalMetrics.length),
            ];
          }

          setMetrics(finalMetrics);
        }
        // If empty array or no data, keep FALLBACK_METRICS
      } catch {
        // On API failure, fallback to hardcoded values (already set as initial state)
      }
    }

    fetchMetrics();
  }, []);

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

  /**
   * Renders the icon for a metric based on its icon name string.
   * Falls back to a generic shield icon if the name is not recognized.
   */
  function renderIcon(iconName?: string) {
    const IconComponent = iconName ? ICON_MAP[iconName] : null;
    if (IconComponent) {
      return <IconComponent className="h-8 w-8 text-brand-green" />;
    }
    return <ShieldCheck className="h-8 w-8 text-brand-green" />;
  }

  /**
   * Determines the suffix for the counter based on unit type.
   */
  function getCounterSuffix(unit: string): string {
    if (unit === '%') return '%';
    if (unit === '+') return '+';
    return '+';
  }

  return (
    <section
      id="resultados"
      ref={sectionRef}
      className="py-10 md:py-12 lg:py-14 bg-brand-light-gray"
      aria-label="Resultados e impacto de ASGRO en cifras"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-3">
        <AnimatedSection className="text-center mb-6 md:mb-8">
          <h2 className="text-h2 text-brand-dark-blue mb-2">
            {SITE_CONTENT.metricsTitle}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-[640px] mx-auto">
            Resultados concretos que respaldan nuestro compromiso con la
            seguridad y el bienestar laboral de las empresas colombianas.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {metrics.map((metric, index) => (
            <AnimatedSection
              key={metric.id}
              delay={index * 150}
              direction="up"
              threshold={0.2}
            >
              <div className="bg-white rounded-card p-3 md:p-4 shadow-card hover:shadow-card-hover transition-shadow duration-300 text-center flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
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

                  <span className="text-small text-gray-600 font-medium mt-1">
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
