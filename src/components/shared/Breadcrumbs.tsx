import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
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
 */
export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
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
    </nav>
  );
}
