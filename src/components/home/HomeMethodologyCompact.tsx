'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search, ClipboardList, Rocket, BarChart3, RefreshCw } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { METHODOLOGY_STEPS } from '@/lib/utils/constants';

/**
 * Icon map for the 5 methodology steps.
 */
const STEP_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Search,
  2: ClipboardList,
  3: Rocket,
  4: BarChart3,
  5: RefreshCw,
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
};

/**
 * HomeMethodologyCompact — Compact horizontal methodology steps for the home page.
 * Shows step number + title + icon, no long descriptions.
 * Links to /metodologia for full details.
 */
export default function HomeMethodologyCompact() {
  return (
    <section
      className="py-10 md:py-12 lg:py-14 bg-brand-light-gray"
      aria-labelledby="home-methodology-heading"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-3">
        <AnimatedSection className="text-center mb-6 md:mb-8">
          <h2
            id="home-methodology-heading"
            className="text-h2 text-brand-dark-blue mb-2"
          >
            Nuestra metodología
          </h2>
          <p className="text-body-lg text-gray-600 max-w-[640px] mx-auto">
            Un proceso estructurado de cinco etapas para resultados medibles.
          </p>
        </AnimatedSection>

        {/* 5 compact step cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {METHODOLOGY_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[step.step] ?? Search;
            return (
              <motion.div
                key={step.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="flex flex-col items-center text-center p-4 rounded-card bg-white shadow-card hover:shadow-card-hover transition-shadow duration-300"
              >
                {/* Step number badge */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-bold mb-2">
                  {step.step}
                </div>
                {/* Icon */}
                <Icon className="h-5 w-5 text-brand-green mb-1" />
                {/* Title */}
                <span className="text-sm font-semibold text-brand-dark-blue">
                  {step.title}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* CTA to full methodology */}
        <AnimatedSection delay={300} className="text-center mt-6">
          <Link
            href="/metodologia"
            className="inline-flex items-center gap-1 text-brand-blue font-semibold hover:text-brand-blue/80 transition-colors min-h-[44px]"
          >
            Ver metodología completa
            <ArrowRight className="h-4 w-4" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
