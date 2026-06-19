'use client';

import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { FALLBACK_FAQS, SITE_CONTENT } from '@/lib/utils/constants';
import type { FAQItem } from '@/types';

/**
 * FAQSection — Sección de preguntas frecuentes con acordeón.
 *
 * - Client component que obtiene datos de GET /api/faqs
 * - Formato acordeón con múltiples ítems expandibles simultáneamente
 * - Indicador de carga mientras se obtienen datos
 * - Fallback a 8+ preguntas hardcodeadas en español si la API falla o excede timeout (5s)
 * - Categorías: servicios, cotización, proceso, cumplimiento
 */
export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    async function fetchFaqs() {
      try {
        const response = await fetch('/api/faqs', {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data: FAQItem[] = await response.json();

        if (data.length > 0) {
          setFaqs(data);
        } else {
          setFaqs(FALLBACK_FAQS);
        }
      } catch {
        // On failure or timeout, use fallback FAQs
        setFaqs(FALLBACK_FAQS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFaqs();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Group FAQs by category for visual organization
  const categories = [
    { key: 'servicios', label: 'Servicios' },
    { key: 'cotización', label: 'Cotización' },
    { key: 'proceso', label: 'Proceso' },
    { key: 'cumplimiento', label: 'Cumplimiento' },
  ];

  return (
    <section
      id="preguntas-frecuentes"
      className="py-10 md:py-12 lg:py-14 bg-brand-light-gray"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[900px] px-2 md:px-3">
        <AnimatedSection direction="up" threshold={0.1}>
          <div className="text-center mb-4">
            <h2
              id="faq-heading"
              className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-2"
            >
              {SITE_CONTENT.faqTitle}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentre respuestas a las consultas más frecuentes sobre nuestros
              servicios de gestión de riesgos laborales y seguros.
            </p>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center py-6"
            role="status"
            aria-label="Cargando preguntas frecuentes"
          >
            <div className="w-[40px] h-[40px] border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-gray-500 text-sm">
              Cargando preguntas frecuentes...
            </p>
          </div>
        ) : (
          <AnimatedSection direction="up" delay={200} threshold={0.1}>
            <div className="bg-white rounded-card shadow-sm border border-gray-100 p-3 md:p-4">
              <Accordion type="multiple" className="w-full">
                {categories.map((category) => {
                  const categoryFaqs = faqs.filter(
                    (faq) => faq.category === category.key
                  );

                  if (categoryFaqs.length === 0) return null;

                  return (
                    <div key={category.key} className="mb-3 last:mb-0">
                      <h3 className="text-sm font-semibold text-brand-blue uppercase tracking-wider mb-1.5">
                        {category.label}
                      </h3>
                      {categoryFaqs.map((faq) => (
                        <AccordionItem
                          key={faq.id}
                          value={faq.id}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          <AccordionTrigger className="text-left text-base font-medium text-brand-dark-blue hover:text-brand-blue hover:no-underline py-4">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 text-sm leading-relaxed pb-4">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </div>
                  );
                })}
              </Accordion>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
