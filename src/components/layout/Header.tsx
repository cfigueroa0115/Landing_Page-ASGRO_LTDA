'use client';

/**
 * Header Component — Header BLANCO PREMIUM PERMANENTE con navegación por rutas.
 *
 * Diseño (Bloque 4C):
 * - Fondo blanco sólido en TODO estado (carga, scroll, sticky) → contraste AA
 *   garantizado; sin estados transparentes ni cambio dinámico de color de texto.
 * - Sombra/borde inferior sutil que se refuerza al hacer scroll (profundidad
 *   sin recargar). Filete de acento azul→verde como sello de marca.
 * - Links: azul oscuro (#011930) sobre blanco (AA holgado). Activo = color
 *   azul + peso semibold + filete verde (no depende solo del color).
 * - CTA "Solicitar asesoría": verde corporativo con texto azul oscuro (AA ~8:1).
 * - Nav completo desde min-[1120px]; por debajo, hamburguesa (MobileNav). Nunca
 *   coexisten. Botón WhatsApp del header desde min-[1120px]; el flotante siempre.
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
  /** Whether the mobile navigation is currently open (for aria-expanded) */
  isMobileMenuOpen?: boolean;
}

export default function Header({ onMobileMenuOpen, isMobileMenuOpen = false }: HeaderProps) {
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
      className={`fixed top-0 left-0 right-0 w-full bg-white transition-shadow duration-300 ${
        isScrolled
          ? 'z-[60] border-b border-gray-200/80 shadow-[0_2px_12px_rgba(1,25,48,0.08)]'
          : 'z-50 border-b border-gray-100 shadow-[0_1px_0_rgba(1,25,48,0.04)]'
      }`}
      role="banner"
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-2 sm:px-3 lg:px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0"
          aria-label="ASGRO Agencia de Seguros - Ir al inicio"
        >
          <BrandLogo
            width={160}
            height={44}
            className="h-[44px] w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation — aparece desde min-[1120px] (breakpoint intermedio
            seguro: en 1024px las 7 etiquetas + logo + CTA quedarían apretadas). */}
        <nav
          className="hidden items-center gap-0.5 min-[1120px]:flex"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            // Etiqueta corta "ARL" en el nav; nombre completo accesible vía aria-label/title.
            const isArl = link.id === 'nav-arl';
            return (
              <Link
                key={link.id}
                href={link.href}
                title={isArl ? 'ARL y Riesgos Laborales' : undefined}
                aria-label={isArl ? 'ARL y Riesgos Laborales' : undefined}
                className={`relative inline-flex min-h-[44px] items-center whitespace-nowrap rounded-md px-2 py-1 text-sm transition-colors hover:bg-brand-blue/5 hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                  active
                    ? 'font-semibold text-brand-blue'
                    : 'font-medium text-brand-dark-blue'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
                {/* Estado activo: color + peso + filete verde (no depende solo del color) */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-2 right-2 h-[3px] rounded-full bg-brand-green"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons — separados del nav con margen izquierdo para no acercar el CTA */}
        <div className="flex items-center gap-1 min-[1120px]:ml-2">
          {/* WhatsApp Button — aparece desde min-[1120px]; en 1024-1119px se usa el
              botón flotante. Oculto si la env var no está configurada. */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="hidden items-center gap-1 min-h-[44px] rounded-btn bg-[#25D366] px-3 py-1 text-sm font-semibold text-brand-dark-blue transition-colors hover:bg-[#1fb855] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue min-[1120px]:inline-flex active:scale-95"
            >
              <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Solicitar asesoría — CTA principal. Verde corporativo con texto
              azul oscuro para garantizar contraste AA (~8:1) sin cambiar el color. */}
          <Link
            href="/contacto"
            className="hidden min-h-[44px] items-center rounded-btn bg-brand-green px-3.5 py-1 text-sm font-bold text-brand-dark-blue shadow-btn transition-all hover:bg-brand-green-alt hover:shadow-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:inline-flex active:scale-95"
          >
            Solicitar asesoría
          </Link>

          {/* Mobile Menu Button — visible por debajo de min-[1120px]; el nav desktop
              aparece en min-[1120px]. Nunca coexisten. */}
          <button
            type="button"
            onClick={onMobileMenuOpen}
            className="inline-flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-brand-dark-blue transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue min-[1120px]:hidden active:scale-95"
            aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-panel"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
      {/* Filete de acento corporativo azul→verde (sello de marca, muy sutil) */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-blue via-brand-green to-brand-blue opacity-80"
      />
    </header>
  );
}
