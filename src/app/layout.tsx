import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import HeaderWithMobileNav from '@/components/layout/HeaderWithMobileNav';
import Footer from '@/components/layout/Footer';
import SkipNav from '@/components/layout/SkipNav';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import FloatingChatButton from '@/components/shared/FloatingChatButton';
import HelpDock from '@/components/shared/HelpDock';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.asgro.com.co';

export const metadata: Metadata = {
  title: 'ASGRO LTDA - Seguros y Riesgos Laborales',
  description:
    'Agencia de seguros especializada en ARL, SST, seguros empresariales a la medida y bienestar laboral en Colombia.',
  keywords: [
    'seguros empresariales',
    'ARL Colombia',
    'SST',
    'riesgos laborales',
    'seguridad y salud en el trabajo',
    'seguros corporativos',
  ],
  authors: [{ name: 'ASGRO LTDA' }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'ASGRO LTDA - Seguros y Riesgos Laborales',
    description:
      'Agencia de seguros especializada en ARL, SST, seguros empresariales a la medida y bienestar laboral en Colombia.',
    url: siteUrl,
    siteName: 'ASGRO LTDA',
    images: [
      {
        url: '/brand/asgro-og-image.png',
        width: 1200,
        height: 630,
        alt: 'ASGRO LTDA - Seguros y Riesgos Laborales',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASGRO LTDA - Seguros y Riesgos Laborales',
    description:
      'Agencia de seguros especializada en ARL, SST, seguros empresariales a la medida y bienestar laboral en Colombia.',
    images: ['/brand/asgro-og-image.png'],
  },
};

/**
 * JSON-LD Structured Data — THREE schemas: InsuranceAgency, LocalBusiness, Organization
 */
function JsonLdSchemas() {
  const companyName = 'ASGRO LTDA';
  const companyUrl = siteUrl;
  const companyLogo = `${siteUrl}/brand/asgro-logo.png`;
  const companyDescription =
    'Agencia de seguros especializada en ARL, SST, seguros empresariales a la medida y bienestar laboral en Colombia.';
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

        {/* Global floating elements — visible on ALL pages */}
        {whatsappNumber && (
          <WhatsAppButton phoneNumber={whatsappNumber} variant="floating" />
        )}
        <FloatingChatButton />
        <HelpDock />
      </body>
    </html>
  );
}
