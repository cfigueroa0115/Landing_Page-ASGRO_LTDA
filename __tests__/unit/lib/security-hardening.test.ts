import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import nextConfig from '../../../next.config';
import { isAiAssistantEnabled } from '@/lib/config/feature-flags';

/**
 * BLOQUE 7A — Production hardening. Verifica configuración de seguridad,
 * feature flag de la Asesora, dominio canónico y eliminación de diagnostics.
 */

const ROOT = path.resolve(__dirname, '../../../');

async function getRootHeaders(): Promise<Record<string, string>> {
  const groups = await nextConfig.headers!();
  const root = groups.find((g) => g.source === '/(.*)');
  expect(root, 'debe existir el grupo de headers para /(.*)').toBeDefined();
  const map: Record<string, string> = {};
  for (const h of root!.headers) map[h.key] = h.value;
  return map;
}

describe('next.config — hardening', () => {
  it('reactStrictMode habilitado', () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });

  it('poweredByHeader deshabilitado (no expone X-Powered-By)', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it('productionBrowserSourceMaps deshabilitado', () => {
    expect(nextConfig.productionBrowserSourceMaps).toBe(false);
  });

  it('formatos de imagen modernos configurados', () => {
    expect(nextConfig.images?.formats).toContain('image/avif');
    expect(nextConfig.images?.formats).toContain('image/webp');
  });
});

describe('next.config — security headers', () => {
  it('incluye los headers de seguridad base', async () => {
    const h = await getRootHeaders();
    expect(h['X-Content-Type-Options']).toBe('nosniff');
    expect(h['X-Frame-Options']).toBe('SAMEORIGIN');
    expect(h['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(h['Permissions-Policy']).toContain('geolocation=()');
    expect(h['Strict-Transport-Security']).toContain('max-age=');
  });

  it('Permissions-Policy: microphone=(self) para la voz de la Asesora, camera/geolocation bloqueadas', async () => {
    const h = await getRootHeaders();
    const pp = h['Permissions-Policy'] ?? '';
    // Micrófono permitido solo al propio origen (dictado por voz).
    expect(pp).toContain('microphone=(self)');
    // No debe estar completamente bloqueado ni abierto a cualquiera.
    expect(pp).not.toContain('microphone=()');
    expect(pp).not.toContain('microphone=*');
    // Cámara y geolocalización siguen bloqueadas.
    expect(pp).toContain('camera=()');
    expect(pp).toContain('geolocation=()');
  });

  it('incluye headers de aislamiento de origen', async () => {
    const h = await getRootHeaders();
    expect(h['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(h['Cross-Origin-Resource-Policy']).toBe('same-origin');
    expect(h['X-DNS-Prefetch-Control']).toBe('off');
  });
});

describe('next.config — Content-Security-Policy', () => {
  let csp: string;

  beforeEach(async () => {
    const h = await getRootHeaders();
    csp = h['Content-Security-Policy'] ?? '';
  });

  it('define una CSP no vacía', () => {
    expect(csp.length).toBeGreaterThan(0);
  });

  it('restringe default-src, object-src, base-uri, frame-ancestors, form-action', () => {
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('permite imágenes data:/blob: y fuentes data: (next/image, next/font)', () => {
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).toContain("font-src 'self' data:");
  });

  it('connect-src restringido a self (APIs internas)', () => {
    expect(csp).toContain("connect-src 'self'");
  });

  it('NO usa unsafe-eval (evita eval en el cliente)', () => {
    expect(csp).not.toContain('unsafe-eval');
  });

  it('fuerza upgrade-insecure-requests', () => {
    expect(csp).toContain('upgrade-insecure-requests');
  });
});

describe('Feature flag — Asesora (NEXT_PUBLIC_AI_ASSISTANT_ENABLED, fail-closed)', () => {
  it('undefined → habilitada (compatibilidad de preview)', () => {
    expect(isAiAssistantEnabled(undefined)).toBe(true);
  });

  it('"true" reconocido → habilitada (incl. case/espacios)', () => {
    expect(isAiAssistantEnabled('true')).toBe(true);
    expect(isAiAssistantEnabled('TRUE')).toBe(true);
    expect(isAiAssistantEnabled('  true  ')).toBe(true);
  });

  it('"false" → deshabilitada (incl. case/espacios)', () => {
    expect(isAiAssistantEnabled('false')).toBe(false);
    expect(isAiAssistantEnabled('FALSE')).toBe(false);
    expect(isAiAssistantEnabled('  false  ')).toBe(false);
  });

  it('valores inválidos → deshabilitada (fail-closed, no activa silenciosamente)', () => {
    expect(isAiAssistantEnabled('yes')).toBe(false);
    expect(isAiAssistantEnabled('1')).toBe(false);
    expect(isAiAssistantEnabled('enabled')).toBe(false);
    expect(isAiAssistantEnabled('abc')).toBe(false);
    expect(isAiAssistantEnabled('')).toBe(false);
  });
});

describe('Endpoint de diagnóstico eliminado', () => {
  it('no existe src/app/api/diagnostics/runtime/route.ts', () => {
    const p = path.join(ROOT, 'src/app/api/diagnostics/runtime/route.ts');
    expect(fs.existsSync(p)).toBe(false);
  });

  it('no existe el directorio src/app/api/diagnostics', () => {
    const p = path.join(ROOT, 'src/app/api/diagnostics');
    expect(fs.existsSync(p)).toBe(false);
  });
});

describe('SEO — dominio canónico', () => {
  it('sitemap.ts usa el dominio .com.co (no .com ni asgro.com.co)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/app/sitemap.ts'), 'utf8');
    expect(src).toContain('https://asgroseguros.com.co');
    expect(src).not.toContain('https://asgroseguros.com/');
    expect(src).not.toContain('https://asgro.com.co');
  });

  it('robots.ts usa el dominio .com.co', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/app/robots.ts'), 'utf8');
    expect(src).toContain('https://asgroseguros.com.co');
  });

  it('layout.tsx usa el dominio .com.co como fallback de metadataBase/canonical', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/app/layout.tsx'), 'utf8');
    expect(src).toContain('https://asgroseguros.com.co');
  });
});

describe('Secret hygiene — .env.example solo placeholders', () => {
  const example = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');

  it('DATABASE_URL es ficticia (host de ejemplo, no Neon real)', () => {
    expect(example).toContain('ep-example');
    // No debe contener un host Neon con sufijo real de proyecto (heurística).
    expect(example).not.toMatch(/ep-[a-z]+-[a-z]+-\d{6,}\.[a-z0-9-]+\.aws\.neon\.tech.*password[^"]*[A-Za-z0-9]{16}/);
  });

  it('las API keys quedan vacías en el ejemplo', () => {
    expect(example).toContain('OPENAI_API_KEY=""');
    expect(example).toContain('GEMINI_API_KEY=""');
    expect(example).toContain('RESEND_API_KEY=""');
  });

  it('documenta el flag público de la Asesora', () => {
    expect(example).toContain('NEXT_PUBLIC_AI_ASSISTANT_ENABLED');
  });
});
