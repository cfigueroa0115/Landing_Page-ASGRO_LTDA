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
// Redes sociales — se muestran ÚNICAMENTE si la URL real está configurada vía
// variables de entorno. No se enlazan perfiles inventados. [PLACEHOLDER]:
// suministrar NEXT_PUBLIC_SOCIAL_* con las URLs reales de ASGRO.
const SOCIAL_LINKS = [
  {
    id: 'social-facebook',
    label: 'Visitar Facebook de ASGRO',
    href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? '',
    icon: FaFacebook,
  },
  {
    id: 'social-instagram',
    label: 'Visitar Instagram de ASGRO',
    href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? '',
    icon: FaInstagram,
  },
  {
    id: 'social-linkedin',
    label: 'Visitar LinkedIn de ASGRO',
    href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? '',
    icon: FaLinkedin,
  },
].filter((social) => social.href.length > 0);

/**
 * Accesos del footer — jerarquía seguros-first.
 */
const SERVICE_LINKS = [
  { label: 'Seguros', href: '/servicios/seguros-empresariales' },
  { label: 'Empresas', href: '/#empresas' },
  { label: 'ARL y Riesgos Laborales', href: '/servicios/riesgos-laborales' },
  { label: 'SST', href: '/servicios/seguridad-salud-trabajo' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Contacto', href: '/contacto' },
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
          {/* Column 1: Company info — marca ÚNICA */}
          <div className="flex flex-col gap-2">
            <h3 className="text-h4 text-white">ASGRO</h3>
            <p className="text-small font-medium text-brand-neon-green">
              {SITE_CONTENT.brandDescriptor}
            </p>
            <p className="text-small text-white/70">
              {SITE_CONTENT.tagline}
            </p>

            {/* Social media links — solo si hay URLs reales configuradas */}
            {SOCIAL_LINKS.length > 0 && (
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
            )}
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

          {/* Column 3: Accesos + Contact */}
          <div className="flex flex-col gap-1">
            <h4 className="text-h4 text-white">Accesos</h4>
            <nav aria-label="Accesos principales">
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
                  Política de privacidad
                </Link>
              </li>
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
