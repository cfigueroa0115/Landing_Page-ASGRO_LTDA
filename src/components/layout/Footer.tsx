'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import {
  NAV_LINKS,
  SITE_CONTENT,
  getCompanyPhone,
  getCompanyEmail,
  getCompanyAddress,
} from '@/lib/utils/constants';

/**
 * Social media links configuration.
 */
const SOCIAL_LINKS = [
  {
    id: 'social-facebook',
    label: 'Visitar Facebook de ASGRO',
    href: 'https://facebook.com',
    icon: FaFacebook,
  },
  {
    id: 'social-instagram',
    label: 'Visitar Instagram de ASGRO',
    href: 'https://instagram.com',
    icon: FaInstagram,
  },
  {
    id: 'social-linkedin',
    label: 'Visitar LinkedIn de ASGRO',
    href: 'https://linkedin.com',
    icon: FaLinkedin,
  },
];

/**
 * Microsite service links for the footer.
 */
const SERVICE_LINKS = [
  { label: 'Riesgos Laborales', href: '/servicios/riesgos-laborales' },
  { label: 'Seguridad y Salud', href: '/servicios/seguridad-salud-trabajo' },
  { label: 'Bienestar', href: '/servicios/bienestar-proteccion' },
  { label: 'Seguros Empresariales', href: '/servicios/seguros-empresariales' },
];

export default function Footer() {
  const phone = getCompanyPhone();
  const email = getCompanyEmail();
  const address = getCompanyAddress();

  const hasContactInfo = phone || email || address;

  return (
    <footer
      className="bg-footer-gradient text-white"
      role="contentinfo"
      aria-label="Pie de página"
    >
      <div className="section-container py-8 lg:py-10">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Company info */}
          <div className="flex flex-col gap-2">
            <h3 className="text-h4 text-white">{SITE_CONTENT.companyShortName}</h3>
            <p className="text-small text-white/70">
              {SITE_CONTENT.tagline}
            </p>

            {/* Social media links */}
            <div className="mt-2 flex items-center gap-1">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-brand-green hover:text-white"
                  >
                    <Icon className="h-[20px] w-[20px]" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick navigation links */}
          <div className="flex flex-col gap-1">
            <h4 className="text-h4 text-white">Navegación</h4>
            <nav aria-label="Enlaces rápidos del pie de página">
              <ul className="flex flex-col gap-0">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-[44px] items-center text-small text-white/70 transition-colors duration-200 hover:text-brand-green"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/cotizar"
                    className="inline-flex min-h-[44px] items-center text-small text-white/70 transition-colors duration-200 hover:text-brand-green"
                  >
                    Cotizar
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3: Services + Contact */}
          <div className="flex flex-col gap-1">
            <h4 className="text-h4 text-white">Servicios</h4>
            <nav aria-label="Enlaces de servicios">
              <ul className="flex flex-col gap-0">
                {SERVICE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-[44px] items-center text-small text-white/70 transition-colors duration-200 hover:text-brand-green"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact info */}
            {hasContactInfo && (
              <div className="mt-3">
                <h4 className="text-h4 text-white">Contacto</h4>
                <ul className="flex flex-col gap-0">
                  {address && (
                    <li className="flex items-start gap-1 min-h-[44px] py-1">
                      <MapPin className="mt-0.5 h-[20px] w-[20px] flex-shrink-0 text-brand-green" aria-hidden="true" />
                      <span className="text-small text-white/70">{address}</span>
                    </li>
                  )}
                  {phone && (
                    <li className="flex items-center gap-1">
                      <Phone className="h-[20px] w-[20px] flex-shrink-0 text-brand-green" aria-hidden="true" />
                      <a
                        href={`tel:${phone.replace(/\D/g, '')}`}
                        aria-label={`Llamar al teléfono ${phone}`}
                        className="inline-flex min-h-[44px] items-center text-small text-white/70 transition-colors duration-200 hover:text-brand-green"
                      >
                        {phone}
                      </a>
                    </li>
                  )}
                  {email && (
                    <li className="flex items-center gap-1">
                      <Mail className="h-[20px] w-[20px] flex-shrink-0 text-brand-green" aria-hidden="true" />
                      <a
                        href={`mailto:${email}`}
                        aria-label={`Enviar correo electrónico a ${email}`}
                        className="inline-flex min-h-[44px] items-center text-small text-white/70 transition-colors duration-200 hover:text-brand-green"
                      >
                        {email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col gap-1">
            <h4 className="text-h4 text-white">Legal</h4>
            <ul className="flex flex-col gap-0">
              <li>
                <Link
                  href="/contacto"
                  className="inline-flex min-h-[44px] items-center text-small text-white/70 transition-colors duration-200 hover:text-brand-green"
                >
                  {SITE_CONTENT.legalNotice}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar: copyright */}
        <div className="mt-6 border-t border-white/10 pt-3">
          <p className="text-center text-small text-white/50">
            {SITE_CONTENT.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
