'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface MicroStatCardProps {
  value: string;
  label: string;
  icon?: ReactNode;
  tooltip?: string;
  className?: string;
}

/**
 * Compact stat/metric card for the home metrics section.
 * Displays icon + value + label stacked vertically with tooltip on hover.
 */
export default function MicroStatCard({
  value,
  label,
  icon,
  tooltip = 'Métrica institucional editable',
  className,
}: MicroStatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col items-center justify-center rounded-card bg-white p-3 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        className
      )}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="group"
      aria-label={`${value} ${label}`}
    >
      {/* Tooltip */}
      {showTooltip && tooltip && (
        <span
          role="tooltip"
          className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-btn bg-brand-dark-blue px-1 py-0.5 text-xs text-white shadow-elevated"
        >
          {tooltip}
        </span>
      )}

      {/* Icon */}
      {icon && (
        <div className="mb-1 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gradient-to-br from-brand-green/20 to-brand-blue/10 text-brand-blue">
          {icon}
        </div>
      )}

      {/* Value */}
      <span className="text-h2 font-extrabold text-brand-dark-blue">
        {value}
      </span>

      {/* Label */}
      <span className="mt-0.5 text-sm text-gray-600">{label}</span>
    </div>
  );
}
