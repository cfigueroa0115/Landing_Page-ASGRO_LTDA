import type { MetadataRoute } from 'next';

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.asgroseguros.com.co';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
