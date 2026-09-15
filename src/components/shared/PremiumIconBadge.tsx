import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PremiumIconBadgeSize = 'sm' | 'md' | 'feature';
export type PremiumIconBadgeVariant = 'navigation' | 'feature' | 'metric' | 'process';
export type PremiumIconBadgeTone = 'blue' | 'light' | 'dark';

export interface PremiumIconBadgeProps {
  /** Icono lucide a mostrar. */
  icon: LucideIcon;
  /**
   * Variante semántica (firma visual ASGRO). Define profundidad, tamaño base y
   * grosor de trazo:
   * - navigation → compacto y limpio (QuickAccess / accesos pequeños).
   * - feature    → variante principal (cards, grupos, capacidades).
   * - metric     → ejecutiva/analítica (indicadores; el número es protagonista).
   * - process    → pasos/timeline (admite `number`).
   */
  variant?: PremiumIconBadgeVariant;
  /** Anula el tamaño derivado de la variante. */
  size?: PremiumIconBadgeSize;
  /**
   * tone (superficie):
   * - 'blue'  → superficie clara azulada (default, sobre fondos claros).
   * - 'light' → traslúcido para fondos oscuros (azul profundo).
   * - 'dark'  → superficie azul profunda semitransparente para fondos oscuros.
   */
  tone?: PremiumIconBadgeTone;
  /** Número (paso/orden) en la esquina superior derecha (variante process). */
  number?: number;
  className?: string;
}

/**
 * PremiumIconBadge — Firma iconográfica editorial ASGRO (Bloque 6B).
 *
 * Sistema ÚNICO de iconos editoriales. Composición semi-3D corporativa muy
 * sutil por capas: halo exterior verde tenue, anillo intermedio, superficie con
 * gradiente premium, highlight superior, inner ring y sombra baja difusa
 * azul/verde. Identidad azul/verde ASGRO; sin neón, 3D pesado, cartoon ni
 * gamer. Decorativo (aria-hidden): el nombre accesible vive en el heading/control
 * padre. No anima de forma permanente; el hover (elevación ≤1px) lo aporta el
 * contenedor padre respetando prefers-reduced-motion.
 */

/** Tamaño base por variante (px de caja / icono). Override con `size`. */
const VARIANT_SIZE: Record<PremiumIconBadgeVariant, PremiumIconBadgeSize> = {
  navigation: 'sm',
  feature: 'feature',
  metric: 'feature',
  process: 'feature',
};

const SIZE = {
  sm: { box: 'h-[40px] w-[40px]', icon: 'h-[19px] w-[19px]', ring: 'inset-[3px]' },
  md: { box: 'h-[48px] w-[48px]', icon: 'h-[22px] w-[22px]', ring: 'inset-[3px]' },
  feature: { box: 'h-[54px] w-[54px]', icon: 'h-[24px] w-[24px]', ring: 'inset-[4px]' },
} as const;

/** Grosor de trazo por variante (presencia sin peso excesivo). */
const VARIANT_STROKE: Record<PremiumIconBadgeVariant, number> = {
  navigation: 1.9,
  feature: 2.0,
  metric: 2.0,
  process: 2.1,
};

/** Halo exterior por variante (metric = mínimo; navigation = leve). */
const VARIANT_HALO: Record<PremiumIconBadgeVariant, string> = {
  navigation: '-inset-[2px] opacity-70',
  feature: '-inset-[3px] opacity-100',
  metric: '-inset-[2px] opacity-60',
  process: '-inset-[3px] opacity-100',
};

/** Superficie + sombra semi-3D según tono. */
const TONE = {
  blue: {
    surface:
      'bg-[radial-gradient(120%_120%_at_50%_0%,#ffffff_0%,#eef4fb_55%,#e3edf8_100%)] ring-1 ring-brand-blue/[0.12]',
    shadow:
      'shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_18px_rgba(2,78,163,0.14),0_0_0_1px_rgba(2,78,163,0.05)]',
    innerRing: 'ring-1 ring-inset ring-white/70',
    highlight: 'from-white/80',
    icon: 'text-brand-blue',
    halo: 'bg-brand-green/[0.18]',
  },
  light: {
    surface: 'bg-white/10 ring-1 ring-white/15',
    shadow:
      'shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_18px_rgba(1,25,48,0.35)]',
    innerRing: 'ring-1 ring-inset ring-white/[0.12]',
    highlight: 'from-white/15',
    icon: 'text-brand-neon-green',
    halo: 'bg-brand-green/[0.22]',
  },
  dark: {
    surface:
      'bg-[radial-gradient(120%_120%_at_50%_0%,rgba(2,78,163,0.35)_0%,rgba(1,25,48,0.85)_100%)] ring-1 ring-white/[0.12]',
    shadow:
      'shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_18px_rgba(1,25,48,0.5)]',
    innerRing: 'ring-1 ring-inset ring-white/10',
    highlight: 'from-white/[0.12]',
    icon: 'text-brand-neon-green',
    halo: 'bg-brand-green/25',
  },
} as const;

export default function PremiumIconBadge({
  icon: Icon,
  variant = 'feature',
  size,
  tone = 'blue',
  number,
  className,
}: PremiumIconBadgeProps) {
  const s = SIZE[size ?? VARIANT_SIZE[variant]];
  const t = TONE[tone];
  const stroke = VARIANT_STROKE[variant];
  const halo = VARIANT_HALO[variant];

  return (
    <span
      aria-hidden="true"
      data-variant={variant}
      className={cn(
        'relative inline-flex flex-shrink-0 items-center justify-center rounded-full',
        s.box,
        t.surface,
        t.shadow,
        className
      )}
    >
      {/* Capa exterior: halo verde muy tenue */}
      <span className={cn('pointer-events-none absolute rounded-full blur-[6px]', halo, t.halo)} />
      {/* Highlight superior (reflejo premium sutil) */}
      <span
        className={cn(
          'pointer-events-none absolute inset-x-[6px] top-[3px] h-1/2 rounded-full bg-gradient-to-b to-transparent',
          t.highlight
        )}
      />
      {/* Inner ring (profundidad interna) */}
      <span className={cn('pointer-events-none absolute rounded-full', s.ring, t.innerRing)} />
      {/* Icono */}
      <Icon className={cn('relative', s.icon, t.icon)} strokeWidth={stroke} />
      {/* Número (paso/orden) — refinado: verde + azul oscuro, borde blanco, sombra */}
      {typeof number === 'number' && (
        <span className="absolute -right-[5px] -top-[5px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-brand-green text-[11px] font-bold leading-none text-brand-dark-blue shadow-[0_1px_3px_rgba(1,25,48,0.3)] ring-2 ring-white">
          {number}
        </span>
      )}
    </span>
  );
}
