import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import HeaderWithMobileNav from '@/components/layout/HeaderWithMobileNav';
import Footer from '@/components/layout/Footer';
import SkipNav from '@/components/layout/SkipNav';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import FloatingChatButton from '@/components/shared/FloatingChatButton';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.asgroseguros.com.co';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'ASGRO Agencia de Seguros | Protegemos personas, patrimonio y empresas',
  description:
    'Agencia de seguros y aliado integral en gestión del riesgo en Colombia. Seguros para personas, patrimonio y empresas, con acompañamiento cercano. Complementamos con ARL y SST.',
  keywords: [
    'agencia de seguros',
    'seguros para personas',
    'seguros empresariales',
    'seguro de vida',
    'seguro de hogar',
    'gestión del riesgo',
    'ARL',
    'SST',
  ],
  authors: [{ name: 'ASGRO Agencia de Seguros' }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'ASGRO Agencia de Seguros',
    description:
      'Protegemos personas, patrimonio y empresas. Seguros y gestión integral del riesgo con acompañamiento cercano y estratégico.',
    url: siteUrl,
    siteName: 'ASGRO Agencia de Seguros',
    images: [
      {
        url: '/brand/asgro-og-image.png',
        width: 1200,
        height: 630,
        alt: 'ASGRO Agencia de Seguros',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASGRO Agencia de Seguros',
    description:
      'Protegemos personas, patrimonio y empresas. Seguros y gestión integral del riesgo con acompañamiento cercano.',
    images: ['/brand/asgro-og-image.png'],
  },
};

/**
 * JSON-LD Structured Data — THREE schemas: InsuranceAgency, LocalBusiness, Organization
 */
function JsonLdSchemas() {
  const companyName = 'ASGRO Agencia de Seguros';
  const companyUrl = siteUrl;
  const companyLogo = `${siteUrl}/brand/asgro-logo.png`;
  const companyDescription =
    'Agencia de seguros y aliado integral en gestión del riesgo. Protegemos personas, patrimonio y empresas, y complementamos con ARL y SST.';
  const companyPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || '';
  const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || '';
  const companyAddress = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '';

  const insuranceAgencySchema = {
    '@context': 'https://schema.org',
    '@type': 'InsuranceAgency',
    name: companyName,
    url: companyUrl,
    logo: companyLogo,
    description: companyDescription,
    telephone: companyPhone,
    address: companyAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: companyAddress,
          addressLocality: 'Bogotá',
          addressCountry: 'CO',
        }
      : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: companyPhone,
      email: companyEmail,
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: companyName,
    url: companyUrl,
    logo: companyLogo,
    description: companyDescription,
    telephone: companyPhone,
    address: companyAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: companyAddress,
          addressLocality: 'Bogotá',
          addressCountry: 'CO',
        }
      : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: companyPhone,
      email: companyEmail,
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyName,
    url: companyUrl,
    logo: companyLogo,
    description: companyDescription,
    telephone: companyPhone,
    address: companyAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: companyAddress,
          addressLocality: 'Bogotá',
          addressCountry: 'CO',
        }
      : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: companyPhone,
      email: companyEmail,
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(insuranceAgencySchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

  return (
    <html lang="es" className={inter.variable}>
      <head>
        <JsonLdSchemas />
      </head>
      <body className={inter.className}>
        <SkipNav />
        <HeaderWithMobileNav />
        {children}
        <Footer />

        {/* Global floating elements — visible on ALL pages: solo WhatsApp + Chat IA */}
        {whatsappNumber && (
          <WhatsAppButton phoneNumber={whatsappNumber} variant="floating" />
        )}
        <FloatingChatButton />
      </body>
    </html>
  );
}
