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
  className?: string;
}

/**
 * Breadcrumb navigation for microsites.
 * Home ("Inicio") is always the first item. Last item is current page (no link, bold).
 * Includes a "Volver" back button for easy navigation.
 */
export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const router = useRouter();

  // Prepend "Inicio" if not already present
  const allItems: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    ...items.filter((item) => item.href !== '/'),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('section-container py-1', className)}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-brand-blue hover:text-brand-blue/80 font-medium transition-colors min-h-[44px] mr-3"
          aria-label="Volver a la página anterior"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <ol className="flex flex-wrap items-center gap-0.5 text-sm">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isFirst = index === 0;

            return (
              <li key={item.href} className="flex items-center gap-0.5">
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
                    className="inline-flex items-center gap-0.5 text-gray-600 transition-colors hover:text-brand-blue"
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
