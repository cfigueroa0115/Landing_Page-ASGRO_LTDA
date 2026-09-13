import { cn } from '@/lib/utils';

export interface AdvisorAvatarProps {
  /** Clases para dimensionar el avatar (p. ej. h-[40px] w-[40px]). */
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * AdvisorAvatar — Avatar femenino profesional de la Asesora Virtual ASGRO.
 *
 * Ilustración SVG inline (sin assets externos ni dependencias). Estética cálida,
 * corporativa y sobria, con headset de atención. Escalable: el tamaño se define
 * por className (alto/ancho). Decorativo por defecto (aria-hidden), con etiqueta
 * de respaldo para lectores de pantalla cuando no se marca como oculto.
 */
export default function AdvisorAvatar({
  className,
  'aria-hidden': ariaHidden,
}: AdvisorAvatarProps) {
  const decorative = ariaHidden === true || ariaHidden === 'true';

  return (
    <span
      className={cn(
        'inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/70',
        className
      )}
    >
      <svg
        viewBox="0 0 64 64"
        className="h-full w-full"
        role={decorative ? undefined : 'img'}
        aria-hidden={decorative ? true : undefined}
        aria-label={decorative ? undefined : 'Asesora Virtual ASGRO'}
      >
        {/* Fondo circular con gradiente de marca */}
        <defs>
          <linearGradient id="advisor-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#024EA3" />
            <stop offset="100%" stopColor="#011930" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#advisor-bg)" />

        {/* Hombros / blazer */}
        <path
          d="M14 60c0-9.5 8-16 18-16s18 6.5 18 16v4H14v-4z"
          fill="#F4F6F9"
        />
        <path
          d="M32 44c-3.4 0-6.6.8-9.3 2.3L32 56l9.3-9.7C38.6 44.8 35.4 44 32 44z"
          fill="#9BE564"
          opacity="0.9"
        />

        {/* Cuello */}
        <path d="M27 39h10v7l-5 3-5-3v-7z" fill="#E8B79A" />

        {/* Rostro */}
        <circle cx="32" cy="28" r="12" fill="#F1C9A8" />

        {/* Cabello (recogido profesional) */}
        <path
          d="M20 28c0-8 5.4-13 12-13s12 5 12 13c0 2-.5 3.6-1.2 4.8-.3-3.2-1.6-5.3-3.1-5.9-2.2-.9-4.6.8-7.7.8s-5.5-1.7-7.7-.8c-1.5.6-2.8 2.7-3.1 5.9C20.5 31.6 20 30 20 28z"
          fill="#3A2E2A"
        />

        {/* Ojos */}
        <circle cx="27.5" cy="28" r="1.4" fill="#2B2320" />
        <circle cx="36.5" cy="28" r="1.4" fill="#2B2320" />
        {/* Sonrisa cálida */}
        <path
          d="M28.5 32.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"
          fill="none"
          stroke="#B5745A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Headset — arco + auricular + micrófono (atención al cliente) */}
        <path
          d="M20 29a12 12 0 0 1 24 0"
          fill="none"
          stroke="#024EA3"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="17.5" y="28" width="4.5" height="7" rx="2.2" fill="#024EA3" />
        <rect x="42" y="28" width="4.5" height="7" rx="2.2" fill="#024EA3" />
        <path
          d="M18 35c-1.5 3-1.2 6 2 7.5"
          fill="none"
          stroke="#024EA3"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="20.5" cy="43" r="1.8" fill="#9BE564" />
      </svg>
    </span>
  );
}
