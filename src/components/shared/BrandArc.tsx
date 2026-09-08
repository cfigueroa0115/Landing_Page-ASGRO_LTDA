/**
 * BrandArc — Sello visual propio de ASGRO.
 *
 * Reinterpreta el ARCO VERDE del logo ASGRO como motivo gráfico reutilizable
 * que representa el concepto de "protección" (un arco que cubre / resguarda).
 * Es un elemento puramente decorativo (aria-hidden) y no reemplaza al logo.
 *
 * Variantes:
 * - 'top': arco que se apoya sobre el contenido (como en el logo).
 * - 'divider': separador curvo discreto entre secciones.
 *
 * Colores: verde de acento del logo con un sutil degradado hacia el azul
 * institucional. Se mantiene ligero para no saturar (paleta 80/15/5).
 */

interface BrandArcProps {
  /** Variante del arco */
  variant?: 'top' | 'divider';
  /** Clases adicionales para posicionamiento */
  className?: string;
  /** Grosor del trazo (para variante 'top') */
  strokeWidth?: number;
}

export default function BrandArc({
  variant = 'top',
  className = '',
  strokeWidth = 6,
}: BrandArcProps) {
  if (variant === 'divider') {
    // Separador curvo discreto: una banda con curva superior suave.
    return (
      <div className={`pointer-events-none w-full overflow-hidden leading-none ${className}`} aria-hidden="true">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="h-8 w-full md:h-12"
          role="presentation"
        >
          <path
            d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // Variante 'top' — arco protector sobre el wordmark (sello ASGRO).
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 240 60"
        fill="none"
        className="h-auto w-full"
        role="presentation"
      >
        <defs>
          <linearGradient id="asgro-arc-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#024EA3" />
            <stop offset="45%" stopColor="#7AC146" />
            <stop offset="100%" stopColor="#6FB639" />
          </linearGradient>
        </defs>
        <path
          d="M8,52 C60,8 180,8 232,52"
          stroke="url(#asgro-arc-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
