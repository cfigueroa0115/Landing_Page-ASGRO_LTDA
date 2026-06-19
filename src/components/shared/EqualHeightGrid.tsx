import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface EqualHeightGridProps {
  children: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: string;
  className?: string;
}

/**
 * Grid wrapper that ensures equal-height children using CSS grid auto-rows-fr.
 * Responsive column counts default to 1 / 2 / 4.
 */
export default function EqualHeightGrid({
  children,
  columns = { sm: 2, md: 2, lg: 4 },
  gap = 'gap-3',
  className,
}: EqualHeightGridProps) {
  const { sm = 2, md = 2, lg = 4 } = columns;

  // Map column counts to Tailwind grid-cols classes
  const smCols: Record<number, string> = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };

  const mdCols: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  const lgCols: Record<number, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  };

  return (
    <div
      className={cn(
        'grid grid-cols-1 auto-rows-fr',
        smCols[sm] ?? 'sm:grid-cols-2',
        mdCols[md] ?? 'md:grid-cols-2',
        lgCols[lg] ?? 'lg:grid-cols-4',
        gap,
        className
      )}
    >
      {children}
    </div>
  );
}
