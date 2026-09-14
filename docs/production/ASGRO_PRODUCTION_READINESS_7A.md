# ASGRO — Production Readiness / Release Candidate (Bloque 7A)

> **Naturaleza:** endurecimiento de seguridad web y preparación del *release
> candidate*. **No** despliega a producción, **no** toca master, infraestructura
> ni datos, y **no** inicia 5B.2. La Asesora sigue sobre la KB legacy.

---

## 1. Alcance

Cierre de seguridad, exposición técnica, SEO y controles de regresión de la
rama `redesign-seguros-first`, dejándola lista como candidata a producción
(pendiente de revisión y del bloque operativo posterior).

## 2. Commit base

- Rama: `redesign-seguros-first`
- Commit base: `3a595b5`
- master (intacto): `de8d1ff`
- Dominio web canónico: `https://asgroseguros.com.co`
- Correo corporativo: `@asgroseguros.com` (separado del dominio web)

## 3. Security headers

Aplicados a `/(.*)` en `next.config.ts`:

| Header | Valor |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(self), geolocation=(), interest-cohort=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | ver §4 |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `X-DNS-Prefetch-Control` | `off` |

**Nota sobre COOP/CORP/DNS-prefetch:** se eligieron `same-origin` porque el
sitio solo consume subrecursos y APIs del mismo origen; navegaciones externas
(WhatsApp, redes) no son subrecursos y no se ven afectadas. `X-DNS-Prefetch-
Control: off` reduce fugas de DNS sin impacto funcional perceptible.

**Voice policy (corregida en 7A.1):** `microphone=(self)`. La Asesora usa
`SpeechRecognition` (dictado por voz) en `useVoiceAssistant.ts`, activado **solo
por acción explícita** del usuario y en el mismo origen; por eso `microphone=()`
(bloqueo total) contradecía la funcionalidad publicada. Se corrige a
`microphone=(self)` — solo el propio origen ASGRO — manteniendo `camera=()` y
`geolocation=()` bloqueadas y **sin** abrir `microphone=*`. Se decidió **no**
añadir `on-device-speech-recognition`: es un token experimental, aún no
estandarizado en el registro de Permissions-Policy y con soporte marginal;
incluirlo podría generar avisos de parsing sin aportar control efectivo. La
implementación de voz (`useVoiceAssistant.ts`, `FloatingChatButton`, `ChatInput`,
`ChatWindow`) **no** se modificó: solo el header que la gobierna.

## 4. Content-Security-Policy

```
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'self';
form-action 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
upgrade-insecure-requests;
```

**Justificación de excepciones:**
- `script-src 'unsafe-inline'`: Next.js App Router inyecta el bootstrap de
  hydration en línea y el sitio emite JSON-LD vía `dangerouslySetInnerHTML`
  (SEO estructurado). Sin un pipeline de **nonce por request** (middleware) no
  es posible eliminar `'unsafe-inline'` sin romper el runtime.
- `style-src 'unsafe-inline'`: requerido por `next/font` y estilos en línea del
  runtime de Next.
- **Se evita `'unsafe-eval'`** por completo (verificado por test).

**Mejora futura (no en 7A):** migrar a CSP con nonces vía middleware para
eliminar `'unsafe-inline'`.

## 5. Source-map policy

- `productionBrowserSourceMaps = false` → el build **no** publica `.map` del
  frontend que permitan reconstruir el TS/TSX del cliente.
- No se aplicó ofuscación agresiva, anti-debugging, bloqueo de DevTools ni de
  clic derecho (JavaScript hostil descartado por decisión de calidad).

## 6. Diagnostics removal

- Eliminado `src/app/api/diagnostics/runtime/route.ts` (endpoint temporal, su
  propio código indicaba retirarlo antes del merge) y su directorio.
- Eliminado el test específico `__tests__/unit/api/diagnostics.test.ts`.
- Tras el build, `/api/diagnostics/runtime` **no** aparece en la lista de rutas
  (verificado). No devuelve 200.
- **No** se modificó el resolver SSM, `getDbAsync` ni los secretos. El helper
  `hasSsmSecret` permanece en `secrets.ts` como utilidad (ya no consumida).

## 7. Secret scan

- Búsqueda en archivos versionados (excluyendo `node_modules`, `.next`,
  `package-lock.json`) por: connection strings, `sk-`, `AIza`, `AKIA`, tokens
  AWS, `Bearer`, y nombres de secretos.
- **Resultado: PASS — 0 secretos reales.** Todas las coincidencias son
  **placeholders** (`user:password@ep-example…`) o **fixtures de test**
  (`test:test@localhost`, `user:pass@host`, `key_directo`, `test_resend_key`,
  `resend_desde_ssm`).
- `.gitignore` excluye `.env`, `.env*.local` y `.vercel`.
- `.env.example` contiene solo documentación: `DATABASE_URL` claramente ficticia,
  API keys vacías, dominio canónico `.com.co`.

> No se imprimen valores reales en este documento.

## 8. Public repository security posture

El repositorio **permanece PÚBLICO por decisión del propietario** (sin cambios
de visibilidad, ownership ni permisos). Un repo público es clonable; **esto no
es una vulnerabilidad**. La estrategia de seguridad se basa en:

1. secretos fuera de Git; 2. lógica crítica server-side; 3. privilegio mínimo;
4. SSM (SecureString); 5. IAM; 6. CSP; 7. sin source maps de cliente;
8. WAF (posterior); 9. errores sanitizados.

No se modificó LICENSE ni copyright.

## 9. API hardening

Rutas auditadas: `/api/chat`, `/api/contact`, `/api/quote`, `/api/faqs`,
`/api/health`, `/api/metrics`.

- Validación **Zod** en todas las entradas (chat: `message` 1–500,
  `sessionId` UUID; contact/quote: longitudes acotadas y `dataAcceptance`).
- Errores **genéricos**: `Validation failed` (400), `Service temporarily
  unavailable` (503), `An error occurred processing your request` (500).
- **Sin** stack traces, errores SQL ni connection strings en las respuestas.
- Sin cambios de lógica de negocio (no había vulnerabilidad que lo exigiera).
- **Control de payload:** el límite del chat (500 chars) y las longitudes de
  formularios se validan por schema; cuerpos inválidos se rechazan con 400.

## 10. Rate limiting (solo documentado)

No se implementó rate limiting en memoria (sería falsa protección en serverless).
El rate limiting definitivo se hará en el bloque operativo mediante **AWS WAF**.
Endpoints prioritarios: `/api/chat`, `/api/contact`, `/api/quote`.

## 11. Estado de la IA = legacy

`/api/chat` sigue leyendo `knowledge_base` (**legacy**). Comportamiento sin
cambios. La respuesta a *"¿Qué soluciones tienen para una empresa?"* puede seguir
mezclando Seguros Empresariales + ARL + SG-SST y conservando claims legacy
(p. ej. "mejor cobertura"). **Se corregirá en 5B.2** (retrieval selectivo +
intent routing); no es objeto de 7A.

## 12. KB V2 = preparada, no conectada

`knowledge_base_v2` está activada y verificada en la base de **preview** (24
filas, 23 elegibles, 1 pendiente), pero **no** está conectada al chat. La
transición se evalúa en 5B.2.

## 13. Feature flag de la Asesora

`NEXT_PUBLIC_AI_ASSISTANT_ENABLED` (público, no secreto) — **fail-closed
(endurecido en 7A.1)**:
- ausente/undefined → **comportamiento actual** (renderizada), por
  compatibilidad de preview.
- `"true"` (case/espacios: `TRUE`, `  true  `) → renderiza la Asesora.
- **cualquier otro valor** (`"false"`, `"FALSE"`, `"yes"`, `"1"`, `"enabled"`,
  `"abc"`, cadena vacía) → **no** la renderiza.

Antes, cualquier valor distinto de `false` la activaba; ahora solo un `true`
explícito lo hace cuando el flag está presente, de modo que un error de
configuración en producción **no** activa la Asesora silenciosamente.

Implementado en `src/lib/config/feature-flags.ts` (`isAiAssistantEnabled`) y
consumido en `layout.tsx`: `{aiAssistantEnabled && <FloatingChatButton />}`.
WhatsApp es independiente del flag. Tests para undefined/true/false/inválidos y
variantes de caso/espacios.

## 14. Canonical domain

`https://asgroseguros.com.co` consistente en `layout.tsx` (`metadataBase`,
`canonical`, OpenGraph, JSON-LD ×3), `robots.ts` y `sitemap.ts`. No aparece
`asgro.com.co` ni `asgroseguros.com` como canonical (verificado por test).

## 15. Open Graph

Actualmente se usa el logo como imagen OG temporal (documentado en `layout.tsx`).
**Mejora pre-producción (no bloqueante):** crear una imagen OG profesional
1200×630. No se generó en 7A.

## 16. Accessibility

Sin degradación: keyboard nav, focus visible, touch targets, reduced-motion,
aria labels, SkipNav, breadcrumbs y menú móvil intactos. Los tests de
accesibilidad existentes siguen pasando.

## 17. Performance

- Hero con imagen `priority` solo donde corresponde; `sizes` en `next/image`.
- Formatos AVIF/WebP habilitados.
- Sin rediseño ni micro-optimizaciones de riesgo en este bloque.

## 18. Build

`npm run build` → **exit 0**. `/api/diagnostics/runtime` ausente de la lista de
rutas generadas.

## 19. Tests

`npx vitest run` → **367 passed / 27 files / exit 0** (base previa 350 − 8 tests
de diagnostics eliminados + ~25 nuevos de hardening en
`__tests__/unit/lib/security-hardening.test.ts`).

## 20. Known limitations

- CSP usa `'unsafe-inline'` en script/style (ver §4); migración a nonces
  pendiente.
- Rate limiting real pendiente (AWS WAF, bloque operativo).
- Imagen OG profesional 1200×630 pendiente.
- La Asesora sigue en legacy hasta 5B.2.

## 21. Remaining pre-production actions

1. Configurar AWS WAF (rate limiting) para `/api/chat`, `/api/contact`,
   `/api/quote`.
2. Generar imagen OpenGraph 1200×630.
3. (Opcional) CSP con nonces vía middleware.
4. Conectar KB V2 al chat en 5B.2 (retrieval + intent router).
5. Configuración de producción (dominio, SSM production, DNS) en el bloque
   operativo. **No** en 7A.

---

## Integridad

- master intacto (`de8d1ff`). Sin merge. Sin deploy.
- Base de datos, AWS, Amplify, SSM, IAM, Neon, Resend, DNS: **sin tocar**.
- No se ejecutó `db:migrate`, `db:seed` ni `db:seed:kb-v2`.
- 0 secretos reales versionados.
