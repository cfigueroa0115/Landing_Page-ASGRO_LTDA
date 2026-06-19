'use client';

/**
 * Header Component — Sticky glassmorphism navigation bar
 *
 * Features:
 * - Fixed top position with glassmorphism effect (backdrop blur, 70-90% bg opacity)
 * - Scroll detection for z-index layering and enhanced visual state
 * - ASGRO logo from /public/brand/asgro-logo.png with SVG fallback
 * - Full navigation links in Spanish with smooth scroll (~800ms)
 * - "Cotizar ahora" CTA button → links to #cotizar
 * - "WhatsApp" button → functional, opens WhatsApp (hidden if env var not set)
 * - Navigation links hidden on mobile (lg:flex); hamburger handled by MobileNav
 * - All nav items and buttons are fully functional — no empty links or placeholder hrefs
 *
 * @see Requirements 3.1, 3.2, 3.3, 3.4, 3.6, 3.7
 */

import { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { BrandLogo } from '@/lib/utils/brand-assets-components';
import { NAV_LINKS } from '@/lib/utils/constants';
import { generateWhatsAppUrl, getDefaultWhatsAppMessage } from '@/lib/utils/whatsapp';

interface HeaderProps {
  /** Callback to open mobile navigation */
  onMobileMenuOpen?: () => void;
}

/**
 * Custom smooth scroll with ~800ms duration using requestAnimationFrame.
 * Uses easeInOutCubic easing for natural deceleration.
 */
function smoothScrollTo(targetY: number, duration = 800): void {
  const startY = window.scrollY;
  const difference = targetY - startY;
  const startTime = performance.now();

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + difference * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

export default function Header({ onMobileMenuOpen }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // WhatsApp configuration
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const whatsappMessage = getDefaultWhatsAppMessage();
  const whatsappUrl = generateWhatsAppUrl(whatsappNumber, whatsappMessage);

  // ─── Scroll Detection for z-index layering ──────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Smooth Scroll Handler (~800ms) ─────────────────────────────────────────
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();

      const targetId = href.replace('#', '');
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerOffset = 80; // Account for fixed header height
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        smoothScrollTo(offsetPosition, 800);
      }
    },
    []
  );

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
        <a
          href="#inicio"
          onClick={(e) => handleNavClick(e, '#inicio')}
          className="flex-shrink-0"
          aria-label="ASGRO LTDA - Ir al inicio"
        >
          <BrandLogo
            width={140}
            height={42}
            className="h-10 w-auto"
            priority
          />
        </a>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-0 lg:flex"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="inline-flex min-h-[44px] items-center rounded-md px-2 py-1 text-sm font-medium text-brand-dark-blue/80 transition-colors hover:text-brand-blue hover:bg-brand-blue/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              {link.label}
            </a>
          ))}
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
              className="hidden items-center gap-1 min-h-[44px] rounded-btn bg-[#25D366] px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-[#1fb855] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:inline-flex"
            >
              <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          )}

          {/* Cotizar ahora CTA */}
          <a
            href="#cotizar"
            onClick={(e) => handleNavClick(e, '#cotizar')}
            className="hidden min-h-[44px] items-center rounded-btn bg-brand-green px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-brand-green/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green sm:inline-flex"
          >
            Cotizar ahora
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onMobileMenuOpen}
            className="inline-flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-brand-dark-blue transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:hidden"
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
