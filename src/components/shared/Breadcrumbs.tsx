'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /**
   * Destino ESTABLE del botón "Volver". Si se define, el botón es un enlace a
   * esta ruta (predecible). Si no, cae a router.back() (historial).
   */
  backHref?: string;
  /** Etiqueta del botón "Volver". Por defecto "Volver". */
  backLabel?: string;
  className?: string;
}

/**
 * Breadcrumbs — Navegación premium de micrositios (Bloque 5A.7).
 *
 * Estructura: [← Volver] Inicio / … / Página actual.
 * "Inicio" siempre es el primer item; el último es la página actual (sin enlace).
 *
 * El control "Volver" prioriza un destino estable (`backHref`) en lugar de
 * depender solo de router.back() (que puede no tener historial o venir de un
 * sitio externo). Discreto, sin fondo pesado, touch target ≥44px, responsive.
 */
export default function Breadcrumbs({
  items,
  backHref,
  backLabel = 'Volver',
  className,
}: BreadcrumbsProps) {
  const router = useRouter();

  // Prepend "Inicio" if not already present
  const allItems: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    ...items.filter((item) => item.href !== '/'),
  ];

  const backClass =
    'inline-flex items-center gap-[6px] rounded-btn px-[10px] text-[0.9rem] font-semibold text-brand-blue transition-colors min-h-[44px] hover:text-brand-green-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue';

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        // Compensa el Header fijo (76px) para que la barra sea visible y no
        // quede oculta debajo. No se toca el padding-top del RootLayout.
        'mt-[76px] border-b border-gray-200/70 bg-white',
        className
      )}
    >
      {/* Barra contextual compacta dentro del contenedor de sección. En móvil,
          el control Volver va arriba y el breadcrumb debajo (sin overflow). */}
      <div className="section-container flex flex-col gap-[4px] py-[8px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-[12px]">
        {backHref ? (
          <Link href={backHref} className={backClass} aria-label={backLabel}>
            <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
            {backLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            className={backClass}
            aria-label="Volver a la página anterior"
          >
            <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
            {backLabel}
          </button>
        )}
        <ol className="flex flex-wrap items-center gap-[2px] text-sm">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isFirst = index === 0;

            return (
              <li key={item.href} className="flex items-center gap-[2px]">
                {/* Separator */}
                {index > 0 && (
                  <ChevronRight
                    className="h-[14px] w-[14px] flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                )}

                {isLast ? (
                  <span
                    className="font-bold text-brand-dark-blue"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-[4px] text-gray-600 transition-colors hover:text-brand-blue"
                  >
                    {isFirst && (
                      <Home
                        className="h-[14px] w-[14px]"
                        aria-hidden="true"
                      />
                    )}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
