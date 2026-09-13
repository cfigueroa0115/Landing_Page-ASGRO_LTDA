import { cn } from '@/lib/utils';
import AnimatedSection from '@/components/shared/AnimatedSection';

export type PageHeroVariant = 'dark' | 'light' | 'gradient';

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  backgroundVariant?: PageHeroVariant;
  className?: string;
}

const bgStyles: Record<PageHeroVariant, string> = {
  dark: 'bg-hero-gradient text-white',
  light: 'bg-white text-brand-dark-blue',
  gradient: 'bg-gradient-to-b from-brand-blue/5 to-transparent text-brand-dark-blue',
};

/**
 * Internal page hero for microsites. Compact layout con spacing explícito
 * (escala custom: py-12=96px, md:py-16=128px → py-[48px] md:py-[64px]).
 */
export default function PageHero({
  title,
  subtitle,
  eyebrow,
  backgroundVariant = 'dark',
  className,
}: PageHeroProps) {
  const isDark = backgroundVariant === 'dark';

  return (
    <section
      className={cn(
        'py-[48px] md:py-[64px]',
        bgStyles[backgroundVariant],
        className
      )}
    >
      <AnimatedSection className="section-container text-center">
        {eyebrow && (
          <span
            className={cn(
              'mb-1 inline-block text-sm font-semibold uppercase tracking-wider',
              isDark ? 'text-brand-neon-green' : 'text-brand-green'
            )}
          >
            {eyebrow}
          </span>
        )}

        <h1
          className={cn(
            'text-h1 md:text-[2.5rem] lg:text-[3.5rem]',
            isDark ? 'text-white' : 'text-brand-dark-blue'
          )}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={cn(
              'mx-auto mt-2 max-w-[640px] text-body-lg',
              isDark ? 'text-gray-300' : 'text-gray-600'
            )}
          >
            {subtitle}
          </p>
        )}
      </AnimatedSection>
    </section>
  );
}
