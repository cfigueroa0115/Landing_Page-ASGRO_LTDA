'use client';

import { cn } from '@/lib/utils';
import AnimatedSection from '@/components/shared/AnimatedSection';

export interface SectionHeaderProps {
  /** Etiqueta pequeña sobre el título (opcional) */
  eyebrow?: string;
  /** Título de la sección */
  title: string;
  /** Subtítulo / bajada (opcional) */
  subtitle?: string;
  /** id del título para aria-labelledby */
  titleId?: string;
  /** Alineación del contenido */
  align?: 'center' | 'left';
  /** Color del título (para fondos claros u oscuros) */
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * SectionHeader — Encabezado de sección reutilizable con el sello de marca ASGRO.
 *
 * Estructura: eyebrow (verde, mayúsculas) → título → subtítulo.
 * Mantiene jerarquía tipográfica consistente y regla "una idea por bloque".
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  titleId,
  align = 'center',
  tone = 'dark',
  className,
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <AnimatedSection
      className={cn(
        'mb-6 md:mb-8',
        isCenter ? 'text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <span className="brand-eyebrow mb-1.5 block">{eyebrow}</span>
      )}

      <h2
        id={titleId}
        className={cn(
          'text-h2',
          tone === 'light' ? 'text-white' : 'text-brand-dark-blue'
        )}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={cn(
            'text-body-lg mt-2 max-w-[640px]',
            isCenter ? 'mx-auto' : '',
            tone === 'light' ? 'text-white/80' : 'text-gray-600'
          )}
        >
          {subtitle}
        </p>
      )}
    </AnimatedSection>
  );
}
