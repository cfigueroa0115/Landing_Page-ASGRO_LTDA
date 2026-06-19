/**
 * Brand Asset Utilities
 *
 * Provides constants for brand asset paths and React components
 * that render brand images with professional SVG/CSS fallbacks
 * when the actual image files are not available.
 *
 * Works with both Server and Client components.
 */

// ─── Brand Asset Path Constants ─────────────────────────────────────────────────

/** Path to the ASGRO logo image in public/brand/ */
export const LOGO_PATH = '/brand/asgro-logo.png';

/** Path to the services banner image in public/brand/ */
export const SERVICES_BANNER_PATH = '/brand/asgro-services-banner.png';

/** Path to the Open Graph image in public/brand/ */
export const OG_IMAGE_PATH = '/brand/asgro-og-image.png';

// ─── Brand Colors ───────────────────────────────────────────────────────────────

const BRAND_BLUE = '#024EA3';
const BRAND_DARK_BLUE = '#011930';
const BRAND_NAVY = '#001B33';
const BRAND_GREEN = '#7AC146';
const BRAND_NEON_GREEN = '#9BE564';

// ─── Utility Functions ──────────────────────────────────────────────────────────

/**
 * Returns the OG image URL for metadata usage.
 * Falls back to a default path if no custom URL is provided.
 */
export function getOgImageUrl(baseUrl?: string): string {
  if (baseUrl) {
    return `${baseUrl}${OG_IMAGE_PATH}`;
  }
  return OG_IMAGE_PATH;
}

// ─── SVG Fallback Generators ────────────────────────────────────────────────────

/**
 * Returns a data URI SVG for the ASGRO logo fallback.
 * Professional appearance with brand gradient text.
 */
export function getLogoFallbackDataUri(width = 160, height = 48): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${BRAND_BLUE};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${BRAND_GREEN};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="${BRAND_DARK_BLUE}" />
    <text x="${width / 2}" y="${height * 0.62}" font-family="Inter, system-ui, sans-serif" font-size="${height * 0.42}" font-weight="800" fill="url(#logoGrad)" text-anchor="middle" letter-spacing="2">ASGRO</text>
    <text x="${width / 2}" y="${height * 0.88}" font-family="Inter, system-ui, sans-serif" font-size="${height * 0.18}" font-weight="400" fill="${BRAND_GREEN}" text-anchor="middle" letter-spacing="1">LTDA</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Returns a data URI SVG for the services banner fallback.
 * Dark blue to navy gradient with subtle accent elements.
 */
export function getBannerFallbackDataUri(width = 1200, height = 400): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${BRAND_DARK_BLUE};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${BRAND_NAVY};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${BRAND_DARK_BLUE};stop-opacity:1" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${BRAND_GREEN};stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:${BRAND_NEON_GREEN};stop-opacity:0.1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bannerGrad)" />
    <rect x="0" y="${height * 0.7}" width="${width}" height="${height * 0.3}" fill="url(#accentGrad)" />
    <circle cx="${width * 0.85}" cy="${height * 0.3}" r="${height * 0.25}" fill="${BRAND_BLUE}" opacity="0.15" />
    <circle cx="${width * 0.15}" cy="${height * 0.7}" r="${height * 0.2}" fill="${BRAND_GREEN}" opacity="0.08" />
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Returns a pure SVG string for the ASGRO logo.
 * Useful for server-side rendering contexts where you need
 * an SVG string rather than a React component.
 */
export function getLogoFallbackSvg(width = 200, height = 60): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="logoGradStr" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${BRAND_BLUE};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${BRAND_GREEN};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="${BRAND_DARK_BLUE}" />
    <text x="${width / 2}" y="${height * 0.62}" font-family="Inter, system-ui, sans-serif" font-size="${height * 0.42}" font-weight="800" fill="url(#logoGradStr)" text-anchor="middle" letter-spacing="2">ASGRO</text>
    <text x="${width / 2}" y="${height * 0.88}" font-family="Inter, system-ui, sans-serif" font-size="${height * 0.18}" font-weight="400" fill="${BRAND_GREEN}" text-anchor="middle" letter-spacing="1">LTDA</text>
  </svg>`;
}

/**
 * Returns a pure SVG string for the services banner fallback.
 * Dark blue to navy gradient with subtle accent elements.
 */
export function getBannerFallbackSvg(width = 1200, height = 400): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bannerGradStr" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${BRAND_DARK_BLUE};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${BRAND_NAVY};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${BRAND_DARK_BLUE};stop-opacity:1" />
      </linearGradient>
      <linearGradient id="accentGradStr" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${BRAND_GREEN};stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:${BRAND_NEON_GREEN};stop-opacity:0.1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bannerGradStr)" />
    <rect x="0" y="${height * 0.7}" width="${width}" height="${height * 0.3}" fill="url(#accentGradStr)" />
    <circle cx="${width * 0.85}" cy="${height * 0.3}" r="${height * 0.25}" fill="${BRAND_BLUE}" opacity="0.15" />
    <circle cx="${width * 0.15}" cy="${height * 0.7}" r="${height * 0.2}" fill="${BRAND_GREEN}" opacity="0.08" />
  </svg>`;
}
