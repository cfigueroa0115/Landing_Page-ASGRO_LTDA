'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import EqualHeightGrid from '@/components/shared/EqualHeightGrid';
import ServiceQuickCard from '@/components/shared/ServiceQuickCard';
import ServiceDetailDrawer from '@/components/shared/ServiceDetailDrawer';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { SERVICES_DATA, SITE_CONTENT } from '@/lib/utils/constants';
import type { ServiceData } from '@/types';

/**
 * HomeServicesSection — Client component for the home page services grid.
 * Renders 4 ServiceQuickCards in an EqualHeightGrid and manages
 * the ServiceDetailDrawer open/close state.
 */
export default function HomeServicesSection() {
  const router = useRouter();
  const [drawerService, setDrawerService] = useState<ServiceData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewDetail = useCallback((service: ServiceData) => {
    setDrawerService(service);
    setIsDrawerOpen(true);
  }, []);

  const handleQuote = useCallback(
    (service: ServiceData) => {
      router.push(`/cotizar?servicio=${service.id}`);
    },
    [router]
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDrawerService(null);
  }, []);

  return (
    <section
      className="py-10 md:py-12 lg:py-14 bg-white"
      aria-labelledby="home-services-heading"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-3">
        <AnimatedSection className="text-center mb-6 md:mb-8">
          <h2
            id="home-services-heading"
            className="text-h2 text-brand-dark-blue mb-2"
          >
            {SITE_CONTENT.servicesTitle}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-[640px] mx-auto">
            {SITE_CONTENT.servicesSubtitle}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <EqualHeightGrid columns={{ sm: 1, md: 2, lg: 4 }} gap="gap-3">
            {SERVICES_DATA.map((service) => (
              <ServiceQuickCard
                key={service.id}
                service={service}
                onViewDetail={handleViewDetail}
                onQuote={handleQuote}
              />
            ))}
          </EqualHeightGrid>
        </AnimatedSection>

        {/* Ver todos los servicios link */}
        <AnimatedSection delay={400} className="text-center mt-6">
          <Link
            href="/servicios"
            className="inline-flex items-center gap-1 text-brand-blue font-semibold hover:text-brand-blue/80 transition-colors min-h-[44px]"
          >
            Ver todos los servicios
            <ArrowRight className="h-4 w-4" />
          </Link>
        </AnimatedSection>
      </div>

      {/* Service Detail Drawer */}
      <ServiceDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        service={drawerService}
      />
    </section>
  );
}
