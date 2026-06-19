'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedSection from '@/components/shared/AnimatedSection';
import PremiumButton from '@/components/shared/PremiumButton';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';
import { getWhatsAppNumber } from '@/lib/utils/constants';

export interface SectionCTAProps {
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  whatsappAction?: boolean;
  className?: string;
}

/**
 * CTA section for the home page and microsites.
 * Centered layout with gradient background and premium buttons.
 */
export default function SectionCTA({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  whatsappAction = false,
  className,
}: SectionCTAProps) {
  const whatsappNumber = getWhatsAppNumber();
  const whatsappUrl = whatsappNumber
    ? generateWhatsAppUrl(whatsappNumber, getDefaultWhatsAppMessage())
    : '';

  return (
    <section
      className={cn(
        'py-12 md:py-16 bg-gradient-to-br from-brand-dark-blue via-brand-navy to-brand-dark-blue',
        className
      )}
    >
      <AnimatedSection className="section-container text-center">
        <h2 className="text-h2 md:text-[2rem] lg:text-[2.5rem] text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mx-auto mt-2 max-w-[560px] text-body-lg text-gray-300">
            {subtitle}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {primaryAction && (
            <Link href={primaryAction.href}>
              <PremiumButton variant="primary" size="lg">
                {primaryAction.label}
              </PremiumButton>
            </Link>
          )}

          {secondaryAction && (
            <Link href={secondaryAction.href}>
              <PremiumButton variant="outline" size="lg">
                {secondaryAction.label}
              </PremiumButton>
            </Link>
          )}

          {whatsappAction && whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
            >
              <PremiumButton
                variant="whatsapp"
                size="lg"
                icon={<MessageCircle className="h-[18px] w-[18px]" />}
              >
                WhatsApp
              </PremiumButton>
            </a>
          )}
        </div>
      </AnimatedSection>
    </section>
  );
}
