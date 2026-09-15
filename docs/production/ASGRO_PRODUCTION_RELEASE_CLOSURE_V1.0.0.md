# ASGRO Web — Production Release Closure

> **Naturaleza:** documento de cierre formal, evidencia y gobernanza del release
> productivo **ya desplegado y validado**. Este documento NO modifica código,
> runtime, base de datos, AWS, Amplify, DNS, IAM, SSM, KB V2 ni IA. Solo
> documenta, consolida evidencias, declara la versión cerrada y fija el
> procedimiento obligatorio de cambios futuros.

| Campo | Valor |
|-------|-------|
| **Status** | CLOSED / PRODUCTION ACTIVE |
| **Release** | `v1.0.0-production` |
| **Production date** | 2026-09-15 |
| **Canonical URL** | https://asgroseguros.com.co |
| **Secondary URL** | https://www.asgroseguros.com.co → HTTP 301 → https://asgroseguros.com.co |
| **Production branch** | `master` |
| **Production commit** | `1d21c6589cd986041a729173cddff43c5e9c48d8` |
| **Approved RC** | `01a208aa22a47f966519c1d9f4561d1ad9275e5f` |
| **Promotion PR** | #1 (`redesign-seguros-first` → `master`) |
| **Amplify App** | `ASGRO-Web-Prod` (App ID `d2a24og78z38ro`) |
| **Production Amplify Job** | 11 — SUCCEED |
| **Production technical URL** | https://master.d2a24og78z38ro.amplifyapp.com |
| **Preview URL** | https://redesign-seguros-first.d2a24og78z38ro.amplifyapp.com |

> El árbol de código del commit de producción `1d21c658` es **idéntico** al del
> Release Candidate aprobado `01a208a`: el runtime productivo corresponde
> exactamente al código validado.

---

## 1. Bloques cerrados (CLOSED)

No hay cambio funcional adicional como parte de `v1.0.0-production`.

| Bloque | Descripción | Estado |
|--------|-------------|--------|
| 5B.0 | AI Audit Baseline | CLOSED |
| 5B.1 | KB V2 Governance | CLOSED |
| 5B.1.2 | Preview Activation | CLOSED |
| 5B.1.2A | Activation Evidence Correction | CLOSED |
| 5B.2 | Selective Retrieval + Intent Router | CLOSED |
| 5B.2.1 | Intent Precision Hardening | CLOSED |
| 5B.3 | Commercial Handoff | CLOSED |
| 5B.3.1 | Handoff Journey & Quote Routing Hardening | CLOSED |
| 5B.3.2 | Quote Context Persistence Hardening | CLOSED |
| 5B.4 | AI Safety, Provider & Production Readiness | CLOSED |
| 5B.4.1 | Final AI Production Hygiene | CLOSED |
| 7A | Production Hardening & Premium Release Candidate | CLOSED |
| 7A.1 | Voice Permissions & AI Release Flag Hardening | CLOSED |
| 7B.1 | Contact Success UX & Receipt Hardening | CLOSED |
| 7B.1.1 | Select Visual Reset Fix | CLOSED |
| 8A | Formal Production Release Closure | CLOSED |

**No additional functional change is part of v1.0.0-production.**

---

## 2. Evidencias productivas

| Control | Resultado |
|---------|-----------|
| Home | PASS |
| Navegación | PASS |
| WhatsApp | PASS |
| Asesora Virtual | PASS |
| KB V2 | PASS |
| Consulta seguros personas | PASS |
| Consulta seguros empresas | PASS |
| Consulta cumplimiento | PASS |
| Contacto | PASS |
| Receipt | PASS |
| Referencia | PASS |
| Correo Contacto | PASS |
| Reply-To | PASS |
| Reset formulario | PASS |
| Select visual reset | PASS |
| Cotización | PASS |
| Correo cotización | PASS |
| `/api/diagnostics/runtime` | 404 — PASS (endpoint eliminado) |
| Production technical URL | PASS |
| Canonical domain | PASS |
| HTTPS | PASS |
| www | PASS |
| www → apex 301 | PASS |
| Path preservation | PASS |

---

## 3. Estado KB V2 en producción

| Métrica | Valor |
|---------|-------|
| total_rows | 24 |
| unique_keys | 24 |
| eligible_rows | 23 |
| non_eligible_rows | 1 |
| min_version | 1 |
| max_version | 1 |

**Categorías:** capacidades = 4 · empresas = 7 · personas = 7 · transversal = 6.

**Arrendamiento:** `is_approved = false`, `is_active = false` (pending; no expuesto).

**Legacy preservado:** `knowledge_base = 8`; `chat_sessions` y `chat_messages`
con su baseline preservado. **No borrar legacy todavía.**

---

## 4. Aislamiento de entornos

### PREVIEW
- Branch: `redesign-seguros-first`
- Amplify URL: https://redesign-seguros-first.d2a24og78z38ro.amplifyapp.com
- SSM prefix: `/asgro/redesign-seguros-first`
- Compute Role: `ASGRO-Amplify-SSR-Preview-Role`

### PRODUCTION
- Branch: `master`
- Amplify URL: https://master.d2a24og78z38ro.amplifyapp.com
- Canonical URL: https://asgroseguros.com.co
- SSM prefix: `/asgro/production`
- Compute Role: `ASGRO-Amplify-SSR-Prod-Role`
- Auto Build: **OFF**

> **Preview secrets MUST NOT be used by production. Production secrets MUST NOT
> be used by preview.**

---

## 5. Gobernanza de variables / secretos

La SSM de producción es la fuente de verdad de:
- `/asgro/production/DATABASE_URL`
- `/asgro/production/RESEND_API_KEY`
- `/asgro/production/CONTACT_NOTIFICATION_TO`
- `/asgro/production/CONTACT_FROM_EMAIL`

Reglas:
- **NO real secret in repository.**
- **NO real secret in release notes.**
- **NO secret in NEXT_PUBLIC variables.**

(No se copian valores de secretos en este documento.)

---

## 6. Dominio y DNS

- **Canonical:** https://asgroseguros.com.co
- **www:** https://www.asgroseguros.com.co → HTTP 301 → https://asgroseguros.com.co
- **DNS provider:** Namecheap

Registros requeridos que **NO deben eliminarse**:

| Tipo | Registro | Destino |
|------|----------|---------|
| CNAME (ACM) | `*…` | `….acm-validations.aws` |
| ALIAS | `@` (apex) | Amplify / CloudFront target |
| CNAME | `www` | Amplify / CloudFront target |

> El CNAME de validación ACM **NO** debe eliminarse: se usa para la validación y
> renovación del certificado.
>
> `asgroseguros.com` **NO** pertenece al sitio web: queda reservado para Google
> Workspace / correo corporativo.

---

## 7. Security baseline (activo)

- `master` protegido
- Auto Build de `master` **OFF**
- endpoint de diagnóstico eliminado
- browser source maps **OFF**
- `poweredByHeader` **OFF**
- CSP habilitada
- HSTS habilitado
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, COOP, CORP
- resolución de secretos vía SSM
- roles de cómputo separados (preview / producción)
- feature flag de IA fail-closed
- errores crudos del provider eliminados (logging genérico)
- validación de sesión con UUID v4
- provider de IA legacy inactivo
- **sin dependencia de provider activo en el chat V2** (flujo determinístico)

---

## 8. MANDATORY PRODUCTION CHANGE GOVERNANCE

1. Ningún cambio funcional se desarrolla directamente en `master`.
2. Todo cambio debe pasar primero por `redesign-seguros-first`.
3. Preview debe desplegar exitosamente.
4. Debe existir prueba funcional y/o técnica del cambio.
5. Debe existir **AUTORIZACIÓN HUMANA EXPLÍCITA**.
6. Solo después puede abrirse PR `redesign-seguros-first` → `master`.
7. El PR debe revisarse antes del merge.
8. `master` debe conservar Auto Build = **OFF**.
9. Merge a `master` **NO** significa autorización de despliegue.
10. El deploy productivo requiere una **SEGUNDA autorización humana explícita**.
11. Producción debe desplegarse mediante **Amplify RELEASE manual**.
12. Primero debe probarse https://master.d2a24og78z38ro.amplifyapp.com
13. Solo después se valida https://asgroseguros.com.co
14. Un cambio de DNS, IAM, SSM, migración de base de datos, seed o asociación de
    dominio requiere **aprobación específica adicional**.

---

## 9. Prohibiciones explícitas (PROHIBITED)

- automatic production deployment
- automatic preview → production promotion
- master Auto Build ON
- direct push to master as normal release flow
- production deploy without authorization
- preview credentials in production
- production credentials in preview
- broad IAM permissions without approval
- public diagnostics endpoints
- secrets in GitHub
- deleting ACM validation DNS
- deleting preview branch
- destructive DB migrations without backup/approval

---

## 10. Nota de repositorio público

El repositorio es **público por decisión consciente**. Por tanto:
- el código puede ser visto;
- el código puede ser clonado;
- no es técnicamente posible impedir la copia del source público.

La seguridad **NO** depende de ocultar el código. Depende de:
- no secrets in source;
- SSM;
- IAM least privilege;
- isolated environments;
- protected master;
- manual production releases;
- validated PR flow;
- server-side validation;
- governed KB;
- HTTPS;
- release governance.

---

## 11. Tag / Release

- Tag anotado: **`v1.0.0-production`** → apunta EXACTAMENTE a
  `1d21c6589cd986041a729173cddff43c5e9c48d8` (código desplegado en producción),
  **no** al commit documental posterior.
- GitHub Release: "ASGRO Web v1.0.0 — Production" (STABLE).

Documentos relacionados: `ASGRO_PRODUCTION_EVIDENCE_V1.0.0.md`,
`ASGRO_PRODUCTION_ROLLBACK_RUNBOOK.md`, `ASGRO_PRODUCTION_CHANGE_CONTROL.md`.
