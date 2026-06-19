'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import { getWhatsAppNumber } from '@/lib/utils/constants';
import PremiumButton from '@/components/shared/PremiumButton';
import type { FAQItem } from '@/types';

/** Fallback FAQs in case the API is unavailable */
const fallbackFAQs: FAQItem[] = [
  {
    id: '1',
    question: '¿Qué servicios ofrece ASGRO LTDA?',
    answer:
      'Ofrecemos cuatro líneas estratégicas: gestión de riesgos laborales (ARL), seguridad y salud en el trabajo (SG-SST), bienestar y protección, y seguros empresariales a la medida.',
    category: 'servicios',
    orderIndex: 1,
  },
  {
    id: '2',
    question: '¿Cómo solicito una cotización?',
    answer:
      'Puede solicitar una cotización a través de nuestro formulario en línea en la sección "Cotizar", o contactarnos directamente por WhatsApp o correo electrónico.',
    category: 'cotización',
    orderIndex: 2,
  },
  {
    id: '3',
    question: '¿Cuál es el proceso para iniciar el acompañamiento?',
    answer:
      'Iniciamos con un diagnóstico para evaluar el estado actual de su empresa. Luego diseñamos un plan personalizado, lo implementamos y realizamos seguimiento continuo.',
    category: 'proceso',
    orderIndex: 3,
  },
  {
    id: '4',
    question: '¿ASGRO cumple con la normatividad colombiana vigente?',
    answer:
      'Sí. Todos nuestros servicios se diseñan e implementan conforme a la legislación colombiana vigente en materia laboral, SST y seguros.',
    category: 'cumplimiento',
    orderIndex: 4,
  },
  {
    id: '5',
    question: '¿Qué incluye el servicio de SG-SST?',
    answer:
      'Incluye diagnóstico, diseño del sistema, implementación, capacitaciones, auditorías internas, investigación de accidentes y mejora continua conforme a los estándares mínimos.',
    category: 'servicios',
    orderIndex: 5,
  },
  {
    id: '6',
    question: '¿Cuánto tiempo toma implementar el SG-SST?',
    answer:
      'El tiempo varía según el tamaño y complejidad de la empresa. Después del diagnóstico inicial, presentamos un cronograma adaptado a su realidad organizacional.',
    category: 'proceso',
    orderIndex: 6,
  },
  {
    id: '7',
    question: '¿Ofrecen asesoría para el traslado de ARL?',
    answer:
      'Sí. Acompañamos todo el proceso de traslado entre administradoras de riesgos laborales, asegurando continuidad en la cobertura y los servicios de prevención.',
    category: 'servicios',
    orderIndex: 7,
  },
  {
    id: '8',
    question: '¿La cotización tiene algún costo?',
    answer:
      'No. La cotización y el diagnóstico inicial son sin costo ni compromiso. Evaluamos su situación y le presentamos una propuesta personalizada.',
    category: 'cotización',
    orderIndex: 8,
  },
];

const categories = [
  { id: 'todos', label: 'Todos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'cotización', label: 'Cotización' },
  { id: 'proceso', label: 'Proceso' },
  { id: 'cumplimiento', label: 'Cumplimiento' },
];

export default function FAQClientSection() {
  const [faqs, setFaqs] = useState<FAQItem[]>(fallbackFAQs);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch('/api/faqs');
        if (res.ok) {
          const data: FAQItem[] = await res.json();
          if (data.length > 0) {
            setFaqs(data);
          }
        }
      } catch {
        // Use fallback FAQs on failure — already set as default
      }
    }
    fetchFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === 'todos' || faq.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const whatsappNumber = getWhatsAppNumber();
  const whatsappUrl = whatsappNumber
    ? generateWhatsAppUrl(whatsappNumber, 'Hola, tengo una consulta sobre los servicios de ASGRO.')
    : '';

  return (
    <section className="py-10 md:py-12 bg-white">
      <div className="section-container">
        <div className="max-w-[800px] mx-auto">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
            <input
              type="search"
              placeholder="Buscar preguntas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-input border border-gray-300 bg-white pl-5 pr-2 py-1.5 text-body placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue transition-colors duration-200"
              aria-label="Buscar preguntas frecuentes"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-1 mb-4" role="tablist" aria-label="Categorías">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={cn(
                  'px-2 py-0.5 rounded-full text-sm font-medium transition-colors duration-200',
                  activeCategory === cat.id
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-1" role="region" aria-label="Preguntas frecuentes">
            {filteredFaqs.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No se encontraron preguntas que coincidan con su búsqueda.
              </p>
            ) : (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-card overflow-hidden"
                >
                  <button
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-2 md:p-3 text-left hover:bg-gray-50 transition-colors"
                    aria-expanded={openId === faq.id}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <span className="font-semibold text-brand-dark-blue pr-2">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-[20px] w-[20px] flex-shrink-0 text-gray-400 transition-transform duration-200',
                        openId === faq.id && 'rotate-180'
                      )}
                    />
                  </button>
                  {openId === faq.id && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      className="px-2 md:px-3 pb-2 md:pb-3 text-body text-gray-600"
                      role="region"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* CTA cards */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-brand-light-gray rounded-card p-3 border border-gray-100 text-center">
              <MessageCircle className="h-[24px] w-[24px] text-brand-blue mx-auto mb-1" />
              <h3 className="font-bold text-brand-dark-blue mb-0.5">
                Asistente virtual
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Nuestro agente de IA puede resolver sus dudas en tiempo real.
              </p>
              <p className="text-xs text-gray-500">
                Disponible en el botón de chat de la esquina inferior.
              </p>
            </div>

            {whatsappUrl && (
              <div className="bg-brand-light-gray rounded-card p-3 border border-gray-100 text-center">
                <MessageCircle className="h-[24px] w-[24px] text-green-600 mx-auto mb-1" />
                <h3 className="font-bold text-brand-dark-blue mb-0.5">
                  WhatsApp
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Escríbanos por WhatsApp y le responderemos a la brevedad.
                </p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <PremiumButton variant="whatsapp" size="sm">
                    Escribir por WhatsApp
                  </PremiumButton>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
