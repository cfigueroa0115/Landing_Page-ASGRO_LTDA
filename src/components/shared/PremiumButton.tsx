'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode, Ref } from 'react';

export type PremiumButtonVariant =
  | 'primary'
  | 'secondary'
  | 'whatsapp'
  | 'ai'
  | 'ghost'
  | 'dark'
  | 'outline';

export type PremiumButtonSize = 'sm' | 'md' | 'lg';

interface PremiumButtonBaseProps {
  variant?: PremiumButtonVariant;
  size?: PremiumButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * PremiumButton polimórfico:
 * - Sin `href` → renderiza <button> (motion.button).
 * - Con `href` → renderiza <a> (motion.a), un ÚNICO elemento interactivo.
 *   Esto evita el anti-patrón <a><button> y mantiene un solo tab stop.
 */
export type PremiumButtonProps =
  | (PremiumButtonBaseProps &
      Omit<HTMLMotionProps<'button'>, 'children'> & { href?: undefined })
  | (PremiumButtonBaseProps &
      Omit<HTMLMotionProps<'a'>, 'children'> & { href: string });

const variantStyles: Record<PremiumButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-brand-green to-brand-green-alt text-brand-dark-blue font-bold shadow-btn hover:shadow-elevated',
  secondary:
    'border-2 border-brand-blue bg-transparent text-brand-blue hover:bg-brand-blue hover:text-white',
  whatsapp:
    'bg-[#25D366] text-brand-dark-blue font-semibold hover:bg-[#20bd5a] shadow-btn hover:shadow-elevated',
  ai: 'bg-gradient-to-r from-brand-blue to-[#0366d6] text-white shadow-btn hover:shadow-elevated',
  ghost:
    'bg-transparent text-brand-dark-blue hover:bg-brand-light-gray',
  dark: 'bg-brand-dark-blue text-white hover:bg-brand-navy shadow-btn hover:shadow-elevated',
  outline:
    'border-2 border-brand-blue bg-transparent text-brand-blue hover:bg-brand-blue/5',
};

const sizeStyles: Record<PremiumButtonSize, string> = {
  sm: 'min-h-[44px] px-2 py-0.5 text-sm',
  md: 'min-h-[44px] px-3 py-1 text-sm',
  lg: 'min-h-[48px] px-4 py-1 text-base',
};

const PremiumButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  PremiumButtonProps
>((props, ref) => {
  const {
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    children,
    className,
  } = props;

  const prefersReducedMotion = useReducedMotion();

  const classes = cn(
    // Base styles
    'group relative inline-flex items-center justify-center gap-1 font-semibold',
    'rounded-btn transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'overflow-hidden',
    // Variant & size
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  // Sin escalas hover/tap cuando el usuario pide reducir movimiento.
  const hoverAnim = prefersReducedMotion ? undefined : { scale: 1.02 };
  const tapAnim = prefersReducedMotion ? undefined : { scale: 0.98 };

  // Contenido interno compartido entre <a> y <button>.
  const inner = (
    <>
      {/* Shine sutil real (solo con movimiento permitido y al hover) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:translate-x-full"
      />

      {/* Loading spinner — feedback visible; gira solo con movimiento permitido */}
      {loading && (
        <Loader2 className="h-[18px] w-[18px] motion-safe:animate-spin" aria-hidden="true" />
      )}

      {/* Icon */}
      {!loading && icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Label */}
      <span>{children}</span>
    </>
  );

  // Enlace: renderiza un ÚNICO <a> (evita <a><button> anidado).
  if (typeof props.href === 'string') {
    const {
      variant: _v,
      size: _s,
      icon: _i,
      loading: _l,
      children: _c,
      className: _cn,
      ...anchorProps
    } = props;

    return (
      <motion.a
        ref={ref as Ref<HTMLAnchorElement>}
        whileHover={hoverAnim}
        whileTap={tapAnim}
        className={classes}
        {...anchorProps}
      >
        {inner}
      </motion.a>
    );
  }

  // Botón (comportamiento previo intacto).
  const {
    variant: _v,
    size: _s,
    icon: _i,
    loading: _l,
    children: _c,
    className: _cn,
    href: _h,
    disabled,
    ...buttonProps
  } = props;

  return (
    <motion.button
      ref={ref as Ref<HTMLButtonElement>}
      whileHover={hoverAnim}
      whileTap={tapAnim}
      disabled={disabled || loading}
      className={classes}
      {...buttonProps}
    >
      {inner}
    </motion.button>
  );
});

PremiumButton.displayName = 'PremiumButton';

export default PremiumButton;
