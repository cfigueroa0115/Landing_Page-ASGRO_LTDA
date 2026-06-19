'use client';

/**
 * HeroSection — Primary above-the-fold area with ASGRO's value proposition.
 *
 * Features:
 * - Dark gradient background (Dark Blue #011930 → Navy #001B33)
 * - Main headline in Spanish (max 80 chars)
 * - 4 descriptive badges: ARL, SST, bienestar, seguros empresariales a la medida
 * - 4 animated service cards with Lucide icons and titles
 * - 4 functional CTA buttons: Solicitar asesoría, Cotizar ahora, Hablar por WhatsApp, Consultar Agente IA
 * - Framer Motion entrance animations (within 1000ms)
 * - Background image from /public/brand/asgro-services-banner.png with CSS gradient fallback
 * - Uses AnimatedSection wrapper for viewport-triggered animations
 *
 * @see Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield as ShieldIcon,
  HardHat as HardHatIcon,
  Heart as HeartIcon,
  FileCheck as FileCheckIcon,
} from 'lucide-react';
import { FaWhatsapp as WhatsAppIcon } from 'react-icons/fa';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { SITE_CONTENT, SERVICES_DATA } from '@/lib/utils/constants';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';
import { ServicesBanner } from '@/lib/utils/brand-assets-components';

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield: ShieldIcon,
  HardHat: HardHatIcon,
  Heart: HeartIcon,
  FileCheck: FileCheckIcon,
};

// ─── Animation variants ──────────────────────────────────────────────────────

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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

// ─── Smooth scroll helper ────────────────────────────────────────────────────

function smoothScrollTo(targetY: number, duration = 800): void {
  const startY = window.scrollY;
  const difference = targetY - startY;
  const startTime = performance.now();

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    window.scrollTo(0, startY + difference * easedProgress);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// ─── HeroSection Component ───────────────────────────────────────────────────

export default function HeroSection() {
  // WhatsApp configuration
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const whatsappMessage = getDefaultWhatsAppMessage();
  const whatsappUrl = generateWhatsAppUrl(whatsappNumber, whatsappMessage);

  // Smooth scroll to section handler
  const handleScrollTo = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        smoothScrollTo(offsetPosition, 800);
      }
    },
    []
  );

  return (
    <section
      id="inicio"
      className="relative min-h-screen overflow-hidden bg-hero-gradient"
      aria-label="Sección principal - Propuesta de valor de ASGRO LTDA"
    >
      {/* Background image overlay — uses next/image via ServicesBanner with CSS gradient fallback */}
      <div className="absolute inset-0 z-0">
        <ServicesBanner
          width={1920}
          height={1080}
          className="h-full w-full object-cover opacity-10"
          alt=""
          priority
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark-blue/80 via-brand-navy/70 to-brand-navy/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-container flex flex-col items-center justify-center min-h-screen py-16 pt-12">
        <motion.div
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main headline (max 80 chars) */}
          <motion.h1
            variants={itemVariants}
            className="text-h1 md:text-[2.5rem] lg:text-[3.5rem] text-white mb-3 leading-tight"
          >
            {SITE_CONTENT.heroHeadline}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-body-lg text-white/80 mb-4 max-w-2xl"
          >
            {SITE_CONTENT.heroSubtitle}
          </motion.p>

          {/* 4 Descriptive Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-1 mb-5"
          >
            {SITE_CONTENT.heroBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-small font-medium text-brand-neon-green backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </motion.div>

          {/* 4 CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-2 mb-6"
          >
            {/* Solicitar asesoría → #contacto */}
            <a
              href="#contacto"
              onClick={(e) => handleScrollTo(e, '#contacto')}
              className="rounded-btn bg-brand-green px-4 py-1.5 text-sm font-semibold text-white shadow-btn transition-all duration-200 hover:bg-brand-green-alt hover:shadow-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green min-h-[44px] flex items-center"
            >
              {SITE_CONTENT.ctaPrimary}
            </a>

            {/* Cotizar ahora → #cotizar */}
            <a
              href="#cotizar"
              onClick={(e) => handleScrollTo(e, '#cotizar')}
              className="rounded-btn border-2 border-white px-4 py-1.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-brand-dark-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-h-[44px] flex items-center"
            >
              {SITE_CONTENT.ctaSecondary}
            </a>

            {/* Hablar por WhatsApp → opens WhatsApp */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-btn bg-[#25D366] px-4 py-1.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1fb855] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] min-h-[44px] flex items-center gap-1"
                aria-label="Hablar por WhatsApp - abre WhatsApp en una nueva pestaña"
              >
                <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                {SITE_CONTENT.ctaWhatsApp}
              </a>
            )}

            {/* Consultar Agente IA → #agente-ia */}
            <a
              href="#agente-ia"
              onClick={(e) => handleScrollTo(e, '#agente-ia')}
              className="rounded-btn border-2 border-brand-neon-green px-4 py-1.5 text-sm font-semibold text-brand-neon-green transition-all duration-200 hover:bg-brand-neon-green hover:text-brand-dark-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-neon-green min-h-[44px] flex items-center"
            >
              {SITE_CONTENT.ctaAIAgent}
            </a>
          </motion.div>

          {/* 4 Animated Service Cards — wrapped in AnimatedSection */}
          <AnimatedSection
            direction="up"
            delay={400}
            threshold={0.1}
            className="w-full max-w-4xl"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full"
            >
              {SERVICES_DATA.map((service) => {
                const IconComponent = SERVICE_ICONS[service.icon] ?? ShieldIcon;

                return (
                  <motion.div
                    key={service.id}
                    variants={cardVariants}
                    className="flex flex-col items-center rounded-card bg-white/5 border border-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-elevated"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green/20 mb-1.5">
                      <IconComponent className="h-4 w-4 text-brand-neon-green" />
                    </div>
                    <h3 className="text-small font-semibold text-white text-center">
                      {service.title}
                    </h3>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatedSection>
        </motion.div>
      </div>
    </section>
  );
}
