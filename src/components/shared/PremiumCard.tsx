'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type PremiumCardVariant = 'default' | 'elevated' | 'glass';

export interface PremiumCardProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  bullets?: string[];
  actions?: ReactNode;
  className?: string;
  variant?: PremiumCardVariant;
}

const variantStyles: Record<PremiumCardVariant, string> = {
  default: 'bg-white shadow-card border border-gray-100',
  elevated: 'bg-white shadow-elevated border border-gray-100',
  glass: 'bg-white/80 backdrop-blur-md border border-white/40 shadow-card',
};

export default function PremiumCard({
  icon,
  title,
  description,
  bullets = [],
  actions,
  className,
  variant = 'default',
}: PremiumCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group relative flex h-full flex-col justify-between rounded-card p-3 transition-shadow duration-300',
        'hover:shadow-card-hover',
        variantStyles[variant],
        className
      )}
    >
      {/* Shimmer border on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-card border-2 border-transparent transition-colors duration-300 group-hover:border-brand-green/30"
      />

      {/* Content section */}
      <div className="flex flex-1 flex-col">
        {/* Icon */}
        {icon && (
          <div className="mb-2 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-gradient-to-br from-brand-green/20 to-brand-blue/10">
            {icon}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-brand-dark-blue line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-3">
            {description}
          </p>
        )}

        {/* Bullets (max 3) */}
        {bullets.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {bullets.slice(0, 3).map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-1 text-sm text-gray-700"
              >
                <Check
                  className="mt-[2px] h-[16px] w-[16px] flex-shrink-0 text-brand-green"
                  aria-hidden="true"
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions section (always at bottom) */}
      {actions && <div className="mt-auto pt-2">{actions}</div>}
    </motion.div>
  );
}
