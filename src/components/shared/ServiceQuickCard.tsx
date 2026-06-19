'use client';

import { motion } from 'framer-motion';
import { Check, Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import PremiumButton from '@/components/shared/PremiumButton';
import type { ServiceData } from '@/types';

export interface ServiceQuickCardProps {
  service: ServiceData;
  onViewDetail?: (service: ServiceData) => void;
  onQuote?: (service: ServiceData) => void;
  className?: string;
}

/**
 * Quick service card for the home page with drawer trigger.
 * Equal height with h-full flex flex-col. Buttons aligned at bottom.
 */
export default function ServiceQuickCard({
  service,
  onViewDetail,
  onQuote,
  className,
}: ServiceQuickCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group relative flex h-full flex-col rounded-card border border-gray-100 bg-white p-3 shadow-card transition-shadow duration-300',
        'hover:shadow-card-hover hover:border-brand-green/40',
        className
      )}
    >
      {/* Icon & Title */}
      <div className="mb-2 flex items-start gap-1">
        <div className="flex h-[48px] w-[48px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-green/20 to-brand-blue/10 text-2xl">
          {service.icon}
        </div>
        <h3 className="text-lg font-bold text-brand-dark-blue line-clamp-2">
          {service.title}
        </h3>
      </div>

      {/* Description (2 lines max) */}
      <p className="text-sm text-gray-600 line-clamp-2">
        {service.description}
      </p>

      {/* Bullet points (max 3) */}
      {service.subServices.length > 0 && (
        <ul className="mt-2 flex-1 space-y-0.5">
          {service.subServices.slice(0, 3).map((sub) => (
            <li
              key={sub}
              className="flex items-start gap-0.5 text-sm text-gray-700"
            >
              <Check
                className="mt-[2px] h-[14px] w-[14px] flex-shrink-0 text-brand-green"
                aria-hidden="true"
              />
              <span className="line-clamp-1">{sub}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Actions (always at bottom) */}
      <div className="mt-auto flex flex-wrap gap-1 pt-3">
        <PremiumButton
          variant="secondary"
          size="sm"
          icon={<Eye className="h-[16px] w-[16px]" />}
          onClick={() => onViewDetail?.(service)}
        >
          Ver detalle
        </PremiumButton>

        <PremiumButton
          variant="primary"
          size="sm"
          icon={<FileText className="h-[16px] w-[16px]" />}
          onClick={() => onQuote?.(service)}
        >
          Cotizar
        </PremiumButton>
      </div>
    </motion.article>
  );
}
