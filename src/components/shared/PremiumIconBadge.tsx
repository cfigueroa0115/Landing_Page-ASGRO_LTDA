import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PremiumIconBadgeSize = 'sm' | 'md' | 'feature';
export type PremiumIconBadgeTone = 'blue' | 'light' | 'dark';

export interface PremiumIconBadgeProps {
  /** Icono lucide a mostrar. */
  icon: LucideIcon;
  /** Tamaño del badge. sm≈40 / md≈48 / feature≈54px. */
  size?: PremiumIconBadgeSize;
  /**
   * tone:
   * - 'blue'  → badge claro azul sobre superficies blancas (default).
   * - 'light' → badge translúcido para superficies oscuras (azul profundo).
   * - 'dark'  → badge oscuro con acento neón para fondos claros de alto contraste.
   */
  tone?: PremiumIconBadgeTone;
  /** Número opcional (badge de paso/orden), esquina superior derecha. */
  number?: number;
  className?: string;
}

/**
 * PremiumIconBadge — Contenedor de icono premium reutilizable (Bloque 5A.7).
 *
 * Eleva la iconografía Lucide con: halo verde muy tenue (segundo nivel), borde
 * fino semitransparente, inner ring, sombra pequeña y nítida, icono azul ASGRO
 * y acento verde controlado. Ejecutivo y refinado; sin 3D, neón, gradients
 * saturados ni animación permanente. Decorativo (aria-hidden): el nombre
 * accesible debe vivir en el control/heading padre.
 */

const SIZE = {
  sm: { box: 'h-[40px] w-[40px]', icon: 'h-[18px] w-[18px]', ring: 'inset-[3px]' },
  md: { box: 'h-[48px] w-[48px]', icon: 'h-[22px] w-[22px]', ring: 'inset-[3px]' },
  feature: { box: 'h-[54px] w-[54px]', icon: 'h-[24px] w-[24px]', ring: 'inset-[4px]' },
} as const;

const TONE = {
  blue: {
    box: 'bg-brand-blue/10 ring-1 ring-brand-blue/15',
    inner: 'ring-1 ring-inset ring-white/60',
    icon: 'text-brand-blue',
    halo: 'bg-brand-green/15',
  },
  light: {
    box: 'bg-white/10 ring-1 ring-white/15',
    inner: 'ring-1 ring-inset ring-white/10',
    icon: 'text-brand-neon-green',
    halo: 'bg-brand-green/20',
  },
  dark: {
    box: 'bg-brand-dark-blue ring-1 ring-white/10',
    inner: 'ring-1 ring-inset ring-white/10',
    icon: 'text-brand-neon-green',
    halo: 'bg-brand-green/25',
  },
} as const;

export default function PremiumIconBadge({
  icon: Icon,
  size = 'md',
  tone = 'blue',
  number,
  className,
}: PremiumIconBadgeProps) {
  const s = SIZE[size];
  const t = TONE[tone];

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex flex-shrink-0 items-center justify-center rounded-full shadow-sm',
        s.box,
        t.box,
        className
      )}
    >
      {/* Halo verde muy tenue (segundo nivel) */}
      <span className={cn('pointer-events-none absolute -inset-[3px] rounded-full blur-[6px]', t.halo)} />
      {/* Inner ring */}
      <span className={cn('pointer-events-none absolute rounded-full', s.ring, t.inner)} />
      {/* Icono */}
      <Icon className={cn('relative', s.icon, t.icon)} strokeWidth={1.75} />
      {/* Número opcional (paso/orden) */}
      {typeof number === 'number' && (
        <span className="absolute -right-[4px] -top-[4px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-brand-green text-[11px] font-bold text-brand-dark-blue ring-2 ring-white">
          {number}
        </span>
      )}
    </span>
  );
}
