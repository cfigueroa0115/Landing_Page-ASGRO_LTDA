import type { NextConfig } from 'next';

// ============================================================================
// Content-Security-Policy (Bloque 7A — hardening del release candidate)
// ----------------------------------------------------------------------------
// CSP compatible con la app real (Next.js App Router). Objetivo: reducir la
// superficie de ataque sin romper hydration, next/font, next/image, formularios,
// fetch a APIs internas, la Asesora ni la voz.
//
// Decisiones justificadas:
// - `script-src 'self' 'unsafe-inline'`: Next.js inyecta el bootstrap de
//   hydration inline y el sitio usa JSON-LD vía dangerouslySetInnerHTML (SEO).
//   Sin un pipeline de nonce por request (middleware) no es posible eliminar
//   'unsafe-inline' sin romper el runtime. Se EVITA 'unsafe-eval'.
// - `style-src 'self' 'unsafe-inline'`: next/font y estilos en línea requeridos
//   por el runtime de Next. 'unsafe-eval' NO se incluye.
// - `img-src 'self' data: blob:`: next/image (blur placeholders y data URIs).
// - `connect-src 'self'`: la app solo hace fetch a sus propias APIs internas.
// - `frame-ancestors 'self'`: refuerza X-Frame-Options contra clickjacking.
// - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`,
//   `upgrade-insecure-requests`: endurecimiento estándar sin impacto funcional.
//
// Nota: si en el futuro se requiere una CSP con nonces (sin 'unsafe-inline'),
// deberá implementarse vía middleware con nonce por request. Fuera de 7A.
// ============================================================================
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  // Aislamiento de origen. same-origin no rompe navegación ni APIs internas.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No exponer la cabecera X-Powered-By (reduce fingerprinting del framework).
  poweredByHeader: false,
  // No publicar browser source maps en producción (evita reconstruir el TS/TSX
  // del cliente a partir del bundle).
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
