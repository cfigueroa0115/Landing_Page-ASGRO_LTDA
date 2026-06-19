'use client';

/**
 * Brand Asset React Components
 *
 * Client components that render brand images using next/image for optimization.
 * Provides automatic fallback to professional SVG placeholders when image files
 * are missing. Uses onError to seamlessly swap to fallbacks — no broken images.
 *
 * @see Requirements 22.5, 22.6
 */

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  LOGO_PATH,
  SERVICES_BANNER_PATH,
  getLogoFallbackDataUri,
  getBannerFallbackDataUri,
} from './brand-assets';

// ─── BrandLogo Component ────────────────────────────────────────────────────────

interface BrandLogoProps {
  width?: number;
  height?: number;
  className?: string;
  /** Alt text for accessibility — in Spanish */
  alt?: string;
  /** Whether to prioritize loading (above the fold) */
  priority?: boolean;
}

/**
 * BrandLogo renders the ASGRO logo from /public/brand/asgro-logo.png
 * using next/image for automatic optimization (WebP/AVIF, responsive sizing).
 *
 * If the image fails to load, it seamlessly swaps to an elegant inline
 * SVG showing "ASGRO" with brand gradient colors.
 *
 * No broken image icons will ever be shown to the user.
 */
export function BrandLogo({
  width = 160,
  height = 48,
  className = '',
  alt = 'ASGRO LTDA - Gestión integral de riesgos laborales y seguros empresariales',
  priority = false,
}: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
    }
  }, [hasError]);

  if (hasError) {
    // Fallback: render an img with the SVG data URI when next/image source fails
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={getLogoFallbackDataUri(width, height)}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  return (
    <Image
      src={LOGO_PATH}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
    />
  );
}

// ─── ServicesBanner Component ───────────────────────────────────────────────────

interface ServicesBannerProps {
  width?: number;
  height?: number;
  className?: string;
  /** Alt text — empty string for decorative background images */
  alt?: string;
  /** Whether to prioritize loading (above the fold) */
  priority?: boolean;
}

/**
 * ServicesBanner renders the services banner from /public/brand/asgro-services-banner.png
 * using next/image for automatic format optimization and responsive sizing.
 *
 * Falls back to a professional dark blue to navy CSS gradient with subtle
 * accent elements. No broken image icons.
 *
 * Since this is used as a decorative background in the hero section,
 * alt defaults to empty string (decorative image).
 */
export function ServicesBanner({
  width = 1200,
  height = 400,
  className = '',
  alt = '',
  priority = false,
}: ServicesBannerProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
    }
  }, [hasError]);

  if (hasError) {
    // Fallback: render an img with the SVG data URI when next/image source fails
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={getBannerFallbackDataUri(width, height)}
        alt={alt}
        width={width}
        height={height}
        className={className}
        aria-hidden={alt === '' ? 'true' : undefined}
      />
    );
  }

  return (
    <Image
      src={SERVICES_BANNER_PATH}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
      aria-hidden={alt === '' ? 'true' : undefined}
    />
  );
}
