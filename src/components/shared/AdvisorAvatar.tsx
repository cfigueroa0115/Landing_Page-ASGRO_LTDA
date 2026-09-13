import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface AdvisorAvatarProps {
  /** Clases para dimensionar el avatar (p. ej. h-[40px] w-[40px]). */
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

/** Ruta del retrato de la asesora virtual (asset del proyecto). */
const ADVISOR_IMAGE = '/images/Agente_IA.png';

/**
 * AdvisorAvatar — Avatar de la Asesora Virtual ASGRO.
 *
 * Usa el retrato real del proyecto (`public/images/Agente_IA.png`) vía
 * next/image. Estética cálida, corporativa y profesional (asesora con headset).
 * Escalable: el tamaño se define por className (alto/ancho). Decorativo por
 * defecto (aria-hidden); cuando NO es decorativo expone un texto alternativo
 * para lectores de pantalla.
 */
export default function AdvisorAvatar({
  className,
  'aria-hidden': ariaHidden,
}: AdvisorAvatarProps) {
  const decorative = ariaHidden === true || ariaHidden === 'true';

  return (
    <span
      aria-hidden={decorative ? true : undefined}
      className={cn(
        'relative inline-block flex-shrink-0 overflow-hidden rounded-full bg-brand-dark-blue ring-2 ring-white/70',
        className
      )}
    >
      <Image
        src={ADVISOR_IMAGE}
        alt={decorative ? '' : 'Asesora Virtual ASGRO'}
        fill
        sizes="54px"
        className="object-cover object-top"
        priority={false}
      />
    </span>
  );
}
