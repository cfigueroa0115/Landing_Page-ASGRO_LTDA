'use client';

import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  AlertTriangle,
  GraduationCap,
  HeartPulse,
  Shield,
  BarChart3,
  CheckCircle2,
  TrendingDown,
  Award,
  FileText,
  Users,
  Scale,
} from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';

// ============================================================================
// Datos SST — Temas regulatorios del SG-SST
// Referencia: Decreto 1072 de 2015 y Resolución 0312 de 2019
// ============================================================================

interface SSTTopic {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const SST_TOPICS: SSTTopic[] = [
  {
    id: 'sst-1',
    icon: ClipboardCheck,
    title: 'Sistema de Gestión SG-SST',
    description:
      'Diseño, implementación y mantenimiento del Sistema de Gestión de Seguridad y Salud en el Trabajo conforme a los estándares mínimos de la normatividad colombiana vigente.',
  },
  {
    id: 'sst-2',
    icon: AlertTriangle,
    title: 'Identificación de peligros y valoración de riesgos',
    description:
      'Elaboración de matrices IPEVR para identificar, evaluar y priorizar peligros en el entorno laboral, definiendo controles efectivos según la jerarquía de intervención.',
  },
  {
    id: 'sst-3',
    icon: GraduationCap,
    title: 'Capacitación y formación en SST',
    description:
      'Programas de formación continua para trabajadores y empleadores sobre prevención de riesgos, uso de elementos de protección personal y procedimientos seguros de trabajo.',
  },
  {
    id: 'sst-4',
    icon: HeartPulse,
    title: 'Vigilancia epidemiológica',
    description:
      'Sistemas de vigilancia para monitorear la salud de los trabajadores, prevenir enfermedades laborales y garantizar condiciones de trabajo seguras y saludables.',
  },
];

// ============================================================================
// Datos ARL — Servicios de Administración de Riesgos Laborales
// ============================================================================

interface ARLTopic {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const ARL_TOPICS: ARLTopic[] = [
  {
    id: 'arl-1',
    icon: Scale,
    title: 'Clasificación y reclasificación de riesgos',
    description:
      'Asesoría en la correcta clasificación del nivel de riesgo (I a V) según la actividad económica, y gestión de reclasificaciones ante cambios en los procesos productivos.',
  },
  {
    id: 'arl-2',
    icon: Shield,
    title: 'Asesoría en prevención y cobertura',
    description:
      'Orientación integral sobre las coberturas de la ARL, gestión de prestaciones económicas y asistenciales, y estrategias de prevención de accidentes de trabajo.',
  },
  {
    id: 'arl-3',
    icon: FileText,
    title: 'Investigación de accidentes y enfermedades laborales',
    description:
      'Acompañamiento técnico en la investigación de incidentes, determinación de causas raíz y formulación de planes de acción correctiva según la normatividad vigente.',
  },
  {
    id: 'arl-4',
    icon: Users,
    title: 'Gestión de afiliaciones y novedades',
    description:
      'Administración de procesos de afiliación, reporte de novedades, gestión de incapacidades y trámites ante la Administradora de Riesgos Laborales.',
  },
];

// ============================================================================
// Beneficios de cumplimiento — Resultados de reducción de riesgos
// ============================================================================

interface ComplianceBenefit {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const COMPLIANCE_BENEFITS: ComplianceBenefit[] = [
  {
    id: 'benefit-1',
    icon: TrendingDown,
    title: 'Reducción de la accidentalidad',
    description:
      'Disminución significativa de incidentes y accidentes laborales mediante controles preventivos y cultura de seguridad.',
  },
  {
    id: 'benefit-2',
    icon: Award,
    title: 'Evitar sanciones y multas',
    description:
      'Cumplimiento de los estándares mínimos exigidos por la legislación colombiana, previniendo sanciones de hasta 500 SMMLV.',
  },
  {
    id: 'benefit-3',
    icon: BarChart3,
    title: 'Optimización de la tasa de cotización',
    description:
      'Gestión efectiva que puede generar descuentos en la tasa de cotización a la ARL por buenos resultados en prevención.',
  },
  {
    id: 'benefit-4',
    icon: CheckCircle2,
    title: 'Protección jurídica empresarial',
    description:
      'Documentación y trazabilidad que respaldan a la empresa ante investigaciones, auditorías y procesos legales laborales.',
  },
];

// ============================================================================
// Variantes de animación para el grid de tarjetas
// ============================================================================

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
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

/**
 * SSTARLSection — Sección de detalle de SST y ARL
 *
 * Presenta información técnica sobre los servicios de Seguridad y Salud en el
 * Trabajo (SST) y Administración de Riesgos Laborales (ARL) de ASGRO LTDA.
 *
 * Incluye:
 * - Subsección SST con 4 temas regulatorios (Decreto 1072, Resolución 0312)
 * - Subsección ARL con 4 temas de servicio incluyendo clasificación de riesgos
 * - 4 beneficios de cumplimiento con énfasis visual
 * - Animación de entrada al viewport mediante AnimatedSection
 * - Tarjetas con border-radius `rounded-card` (22px)
 * - Colores de marca: azul para ARL, verde para beneficios
 *
 * Requisitos: 10.1, 10.2, 10.3, 10.4
 */
export default function SSTARLSection() {
  return (
    <section
      id="sst-arl"
      aria-labelledby="sst-arl-heading"
      className="py-10 md:py-12 lg:py-14 bg-white"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-3">
        {/* Encabezado principal de la sección */}
        <AnimatedSection className="text-center mb-8 md:mb-10">
          <h2
            id="sst-arl-heading"
            className="text-h2 text-brand-dark-blue mb-2"
          >
            SST y ARL en detalle
          </h2>
          <p className="text-body-lg text-gray-600 max-w-[720px] mx-auto">
            Conozca nuestra gestión especializada en Seguridad y Salud en el
            Trabajo y Administración de Riesgos Laborales, conforme al Decreto
            1072 de 2015 y la Resolución 0312 de 2019.
          </p>
        </AnimatedSection>

        {/* ================================================================
            Subsección SST — Seguridad y Salud en el Trabajo
        ================================================================ */}
        <div className="mb-8 md:mb-10">
          <AnimatedSection className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <div className="w-1 h-5 bg-brand-green rounded-full" />
              <h3 className="text-h3 text-brand-dark-blue">
                Seguridad y Salud en el Trabajo (SST)
              </h3>
            </div>
            <p className="text-body text-gray-600 max-w-[640px]">
              Implementamos el Sistema de Gestión SG-SST bajo los lineamientos
              de la normatividad colombiana, asegurando ambientes de trabajo
              seguros y saludables para todos los colaboradores.
            </p>
          </AnimatedSection>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {SST_TOPICS.map((topic) => {
              const IconComponent = topic.icon;
              return (
                <motion.article
                  key={topic.id}
                  variants={cardVariants}
                  className="flex gap-2 p-3 rounded-card bg-brand-light-gray shadow-card hover:shadow-card-hover transition-shadow duration-300"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand-green/15">
                    <IconComponent className="w-3 h-3 text-brand-green" />
                  </div>
                  <div>
                    <h4 className="text-h4 text-brand-dark-blue mb-0.5">
                      {topic.title}
                    </h4>
                    <p className="text-body text-gray-600">
                      {topic.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* ================================================================
            Subsección ARL — Administración de Riesgos Laborales
        ================================================================ */}
        <div className="mb-8 md:mb-10">
          <AnimatedSection className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <div className="w-1 h-5 bg-brand-blue rounded-full" />
              <h3 className="text-h3 text-brand-dark-blue">
                Administración de Riesgos Laborales (ARL)
              </h3>
            </div>
            <p className="text-body text-gray-600 max-w-[640px]">
              Gestionamos de forma integral los servicios asociados a la ARL,
              desde la clasificación del nivel de riesgo hasta el
              acompañamiento en investigación de incidentes y reclamaciones.
            </p>
          </AnimatedSection>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {ARL_TOPICS.map((topic) => {
              const IconComponent = topic.icon;
              return (
                <motion.article
                  key={topic.id}
                  variants={cardVariants}
                  className="flex gap-2 p-3 rounded-card bg-blue-50/70 shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-brand-blue/10"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/15">
                    <IconComponent className="w-3 h-3 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="text-h4 text-brand-dark-blue mb-0.5">
                      {topic.title}
                    </h4>
                    <p className="text-body text-gray-600">
                      {topic.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* ================================================================
            Beneficios de cumplimiento — Reducción de riesgos
        ================================================================ */}
        <AnimatedSection className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-1 h-5 bg-brand-neon-green rounded-full" />
            <h3 className="text-h3 text-brand-dark-blue">
              Beneficios del cumplimiento
            </h3>
          </div>
          <p className="text-body text-gray-600 max-w-[640px]">
            El cumplimiento efectivo de la normatividad en SST y ARL genera
            beneficios tangibles para su organización.
          </p>
        </AnimatedSection>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {COMPLIANCE_BENEFITS.map((benefit) => {
            const IconComponent = benefit.icon;
            return (
              <motion.article
                key={benefit.id}
                variants={cardVariants}
                className="flex flex-col items-center text-center p-3 rounded-card bg-white border-2 border-brand-green/20 shadow-card hover:shadow-card-hover hover:border-brand-green/40 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-green/10 mb-2">
                  <IconComponent className="w-4 h-4 text-brand-green" />
                </div>
                <h4 className="text-h4 text-brand-dark-blue mb-1 font-bold">
                  {benefit.title}
                </h4>
                <p className="text-small text-gray-600">
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
