'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InsuranceMediaCardProps {
  /** Ruta de la imagen (asset local). */
  image: string;
  /** Texto alternativo. Vacío ('') si es puramente decorativa. */
  alt: string;
  /** Etiqueta pequeña sobre el título. */
  eyebrow?: string;
  /** Título de la tarjeta. */
  title: string;
  /** Descripción breve. */
  description?: string;
  /** Destino: si se define, toda la tarjeta es un único <a>. */
  href?: string;
  /** Etiqueta del CTA (solo con href). */
  ctaLabel?: string;
  /** object-position para encuadrar la foto (evita cortar contenido clave). */
  objectPosition?: string;
  /** Carga prioritaria (solo para imágenes LCP; below-the-fold => false). */
  priority?: boolean;
  /**
   * Clases Tailwind para la relación de aspecto del media (evita CLS). Permite
   * aspect responsive, p. ej. 'aspect-[4/3] lg:aspect-[16/9]'. Por defecto
   * 'aspect-[16/10]'.
   */
  aspectClassName?: string;
  /** sizes de next/image. */
  sizes?: string;
  className?: string;
}

/**
 * InsuranceMediaCard — Tarjeta editorial con fotografía protagonista (5A.6).
 *
 * La foto ocupa el bloque; overlay azul discreto + gradiente inferior solo para
 * garantizar contraste del texto. Borde fino, sombra premium, radio consistente
 * y microinteracción hover ≤3px (respeta reduced-motion). Si recibe `href`,
 * renderiza un ÚNICO elemento interactivo <a> (sin nesting). La relación de
 * aspecto se controla con `aspectClassName` (permite aspect responsive).
 */
export default function InsuranceMediaCard({
  image,
  alt,
  eyebrow,
  title,
  description,
  href,
  ctaLabel,
  objectPosition = 'center',
  priority = false,
  aspectClassName = 'aspect-[16/10]',
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className,
}: InsuranceMediaCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const inner = (
    <>
      {/* Media */}
      <div className={cn('relative w-full overflow-hidden', aspectClassName)}>
        <Image
          src={image}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{ objectPosition }}
        />
        {/* Overlay azul discreto + gradiente inferior para legibilidad */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/85 via-brand-dark-blue/25 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-brand-blue/10 mix-blend-multiply"
        />
      </div>

      {/* Texto sobre la parte inferior del media */}
      <div className="absolute inset-x-0 bottom-0 p-[18px]">
        {eyebrow && (
          <span className="mb-[6px] inline-block text-caption font-semibold uppercase tracking-[0.1em] text-brand-neon-green">
            {eyebrow}
          </span>
        )}
        <h3 className="text-h4 font-bold text-white">{title}</h3>
        {description && (
          <p className="mt-[6px] text-small leading-snug text-white/85">{description}</p>
        )}
        {href && ctaLabel && (
          <span className="mt-[10px] inline-flex items-center gap-[6px] text-small font-semibold text-white">
            {ctaLabel}
            <ArrowRight
              className="h-[16px] w-[16px] transition-transform duration-300 motion-safe:group-hover:translate-x-[3px]"
              aria-hidden="true"
            />
          </span>
        )}
      </div>
    </>
  );

  const baseClass = cn(
    'group relative block overflow-hidden rounded-card border border-white/10 shadow-premium',
    className
  );

  if (href) {
    return (
      <motion.div
        whileHover={prefersReducedMotion ? undefined : { y: -3 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Link
          href={href}
          className={cn(
            baseClass,
            'transition-shadow duration-300 hover:shadow-premium-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue'
          )}
        >
          {inner}
        </Link>
      </motion.div>
    );
  }

  return <div className={baseClass}>{inner}</div>;
}
