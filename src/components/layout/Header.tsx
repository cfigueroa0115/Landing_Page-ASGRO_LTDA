'use client';

/**
 * Header Component — Sticky glassmorphism navigation bar with route-based navigation.
 *
 * Features:
 * - Fixed top position with glassmorphism effect (backdrop blur, 70-90% bg opacity)
 * - Scroll detection for z-index layering and enhanced visual state
 * - Active route highlighting via usePathname()
 * - ASGRO logo from /public/brand/asgro-logo.png with SVG fallback
 * - Full navigation links in Spanish using next/link
 * - "Cotizar ahora" CTA button → links to /cotizar
 * - "WhatsApp" button → functional, opens WhatsApp (hidden if env var not set)
 * - Navigation links hidden on mobile (lg:flex); hamburger handled by MobileNav
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { BrandLogo } from '@/lib/utils/brand-assets-components';
import { NAV_LINKS } from '@/lib/utils/constants';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';

interface HeaderProps {
  /** Callback to open mobile navigation */
  onMobileMenuOpen?: () => void;
}

export default function Header({ onMobileMenuOpen }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // WhatsApp configuration
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const whatsappMessage = getDefaultWhatsAppMessage();
  const whatsappUrl = generateWhatsAppUrl(whatsappNumber, whatsappMessage);

  // ─── Scroll Detection for z-index layering ──────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Determines if a nav link is active based on the current pathname.
   * For "/" (home), only exact match. For others, starts-with matching.
   */
  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full transition-all duration-300 ${
        isScrolled
          ? 'z-[60] bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm'
          : 'z-50 bg-white/70 backdrop-blur-md border-b border-white/20'
      }`}
      role="banner"
    >
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-2 sm:px-3 lg:px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0"
          aria-label="ASGRO LTDA - Ir al inicio"
        >
          <BrandLogo
            width={160}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-0 lg:flex"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`inline-flex min-h-[44px] items-center rounded-md px-2 py-1 text-sm font-medium transition-colors hover:text-brand-blue hover:bg-brand-blue/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue relative ${
                  active
                    ? 'text-brand-blue font-semibold'
                    : 'text-brand-dark-blue/80'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-1 left-2 right-2 h-0.5 rounded-full bg-brand-blue" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* WhatsApp Button — hidden when env var not set */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="hidden items-center gap-1 min-h-[44px] rounded-btn bg-[#25D366] px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-[#1fb855] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:inline-flex active:scale-95"
            >
              <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          )}

          {/* Cotizar ahora CTA */}
          <Link
            href="/cotizar"
            className="hidden min-h-[44px] items-center rounded-btn bg-brand-green px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-brand-green/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green sm:inline-flex active:scale-95"
          >
            Cotizar ahora
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onMobileMenuOpen}
            className="inline-flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-brand-dark-blue transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:hidden active:scale-95"
            aria-label="Abrir menú de navegación"
            aria-expanded="false"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
