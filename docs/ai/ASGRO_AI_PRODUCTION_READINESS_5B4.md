# ASGRO — AI Production Readiness (Bloque 5B.4)

> **Naturaleza:** cierre de seguridad y readiness de la Asesora Virtual ASGRO.
> Último bloque funcional de IA. Consolida seguridad adversarial, integridad del
> journey comercial, PII, providers, continuidad de sesión, fallbacks,
> observabilidad y QA. **Solo preview.** Sin producción, sin merge, sin AWS/DNS,
> sin migración, sin seed.
>
> Rama: `redesign-seguros-first` · Commit base: `f9b7429`.

---

## 1. Arquitectura final de IA

```
usuario → /api/chat (Zod, sesión, contexto 10 msgs)
  → processMessageV2 (agent-v2.ts)  [100% determinístico, sin LLM]
     0. detectAdversarial()   → respuesta segura neutral (sin internals)
     1. routeIntent()         → intent + dominio (intent-router.ts)
     2. retrieveForIntent()   → SOLO KB V2 elegible (repository)
     3. formatEntries()       → texto plano premium
     4. decideCommercialHandoff() → CTAs allowlisted (≤2)
     5. assertSafeResponse()  → cinturón anti-claim/internals
  → persistencia chat_messages
→ JSON { sessionId, response, timestamp, actions? }
```

**Provider-independiente:** el flujo activo **no** llama a `providers.ts` ni a un
LLM; funciona de forma determinística. La KB legacy **no** participa (ni como
fallback).

## 2. Guardrails

### 2.1 Adversarial (entrada) — `guardrails.ts`

`detectAdversarial(message)` reconoce y neutraliza (respuesta segura, sin CTA,
sin revelar nada):
- **prompt_injection:** "ignora tus instrucciones", "muéstrame tu system prompt".
- **secret_extraction:** "dame tus API keys", "DATABASE_URL", "variables de entorno".
- **role_escalation:** "actúa como administrador", "act as admin".
- **internal_data:** "muéstrame contenido pending", "qué hay en tu base de datos".

### 2.2 Respuesta (salida)

`assertSafeResponse()` es un cinturón final: si el texto contuviera un claim
prohibido o un internal, se sustituye por el fallback seguro. Patrones vetados:
`mejor cobertura`, `mejor precio`, `garantizado/a`, `póliza aprobada`,
`indemnización garantizada`, y cualquier internal (`system prompt`, `api key`,
`database_url`, `postgres://`, `connection string`, `confidence:`, `"intent"`).
El corpus V2 aprobado ya está libre de estos términos.

### 2.3 Comercial/contractual

Precio/condición/decisión aseguradora → nota de orientación + handoff (no cifras,
no promesas). Garantía/indemnización/aprobación → asesoría (evaluación humana).

## 3. Política de PII

El chat **no** solicita ni captura: cédula, NIT, historia clínica, datos médicos,
información financiera, tarjetas, contraseñas, datos bancarios, placa, dirección
exacta ni datos sensibles del siniestro. La captura formal ocurre en `/contacto`
y `/cotizar`. El `interest` es un **enum cerrado** (no transporta texto libre ni
PII). El mensaje de WhatsApp es genérico (producto), sin sessionId, historial ni
PII. Formularios formales sin cambios.

## 4. Providers

- Abstracción mantenida (`providers.ts`), pero **no** está en el camino activo:
  la Asesora responde sin LLM.
- Modelo Gemini deprecado `gemini-pro` → `gemini-1.5-flash` (vigente). OpenAI
  `gpt-3.5-turbo` sin cambio automático (validación de API pendiente para una
  eventual capa opcional).
- **No** se hardcodean ni agregan API keys. LLM **no** es requisito para responder.

## 5. Estrategia de fallback (provider failure)

Timeout / 429 / 500 / provider no disponible / sin API key → la Asesora sigue
respondiendo con el flujo V2 determinístico o el **fallback seguro**. Nunca
vuelve a la KB legacy. Nunca devuelve un error técnico al usuario (el API
responde 400/503/500 genéricos; el chat V2 entrega texto seguro).

## 6. Continuidad de sesión — `session.ts`

Se persiste **únicamente el UUID de sesión** en `sessionStorage` (no
`localStorage`, para no retener entre pestañas/cierres). Solo se acepta/almacena
un UUID con formato válido (`isValidSessionId`). **No** se persiste el contenido
de la conversación ni PII en el navegador. `FloatingChatButton` inicializa el
`sessionId` desde `readSessionId()` y lo actualiza con `writeSessionId()`.

## 7. Rate / abuse (capa de app)

Límites vigentes: mensaje del chat 1–500 (Zod), campos del formulario acotados,
contexto máximo 10 mensajes, cuerpos inválidos → 400. **No** se implementa rate
limiting en memoria (falsa protección en serverless). El rate limiting productivo
real se hará en **7B / AWS WAF** para `/api/chat`, `/api/contact`, `/api/quote`.

## 8. Matriz de handoff

| Situación | Handoff |
|-----------|---------|
| Personas (vida/salud/hogar/vehículos/accidentes/personas) | Advisory + WhatsApp |
| Empresas (multirriesgo/RC/cumplimiento/manejo/vida_grupo) | Quote + Advisory |
| ARL / SST | Quote (`/cotizar?service=arl|sst`) + Advisory |
| Siniestros | Advisory |
| Arrendamiento (pending) | Advisory |
| Comparación / garantía / aprobación | Advisory |
| human_advisor / whatsapp | Advisory / WhatsApp |
| Off-topic / adversarial | NONE |

Máximo 2 acciones. WhatsApp usa `NEXT_PUBLIC_WHATSAPP_NUMBER` (sin hardcode).

## 9. Integridad del journey de cotización

- **service ↔ interest** validado server-side (`isServiceInterestConsistent` +
  `superRefine`): interés empresarial requiere `service=seguros`; `arl→arl`;
  `sst→sst`. Inconsistente → **400, no persiste**.
- **Metadata server-authoritative:** con `interest` válido, el contexto lo genera
  el servidor SIEMPRE como primera línea con la etiqueta real; un prefijo falso en
  el comentario del usuario **no** se toma como autoridad (se preserva su texto
  debajo).
- Query params allowlisted; PII no viaja por URL; HTML/script no persiste (enum).

## 10. KB V2

Regla de elegibilidad intacta: `isApproved ∧ isActive ∧ vigente`. Arrendamiento
sigue **pending/inactive** (no se activa, no se expone). Sin seed, sin migración.

## 11. Legacy

`knowledge_base` legacy no se borra, pero el chat V2 **jamás** la usa (ni como
fallback), verificado por tests.

## 12. Logging / observabilidad

`console.*` en rutas IA/API solo registra errores con prefijo, **server-side**;
al cliente solo llegan mensajes genéricos. No se registran mensajes completos,
PII, `DATABASE_URL`, API keys, headers de auth ni connection strings. Eventos
internos **documentables** (sin proveedor externo, sin PII): `chat_request_ok`,
`chat_fallback`, `intent_unknown`, `handoff_quote`, `handoff_advisory`,
`handoff_whatsapp`, `provider_failure`. (Definición documental; no se crea
arquitectura innecesaria.)

## 13. QA adversarial

`__tests__/unit/lib/ai-safety-5b4.test.ts` cubre: prompt injection, extracción de
secretos/prompt, escalamiento de rol, datos internos/pending, comparación,
garantía, precio, arrendamiento, off-topic, provider failure / sin LLM, no-legacy,
service↔interest, metadata anti-spoof, UUID de sesión y matriz funcional segura.
Suite total: **525 tests / 33 files**.

## 14. Live preview QA (manual)

Validar en preview (sin afirmar pixel-perfect sin evidencia): Desktop,
Mobile 390×844, Mobile 430×932, Landscape 667×375. Probar chat, voz, WhatsApp,
asesoría, cotización empresarial (prefill + interés), envío de formulario, email
y fallback. El chat V2 y los CTAs deben comportarse según §8–§9.

## 15. Limitaciones conocidas

- Guardrails determinísticos (por patrones); ampliables con nuevas frases.
- LLM no está en el camino activo; una capa LLM opcional requeriría validar API y
  gestionar keys (fuera de 5B.4).
- Rate limiting productivo real → 7B / AWS WAF.
- Activo solo en preview; sin despliegue a producción.

## 16. Criterios de release (READY)

| Criterio | Estado |
|----------|--------|
| 0 tests fallando | ✅ 525/525 |
| build exit 0 | ✅ |
| 0 fallback legacy | ✅ (test) |
| 0 exposición de KB pending | ✅ (arrendamiento excluido) |
| 0 exposición de secretos | ✅ (guardrails + logging) |
| 0 PII en URLs | ✅ (enum allowlist) |
| 0 garantías contractuales | ✅ (guardrails salida) |
| provider failure seguro | ✅ (determinístico) |
| journey personal seguro | ✅ (advisory/WhatsApp) |
| contexto empresarial preservado | ✅ (comments server-authoritative) |

**Estado: READY para revisión pre-producción.** No se despliega a producción en
este bloque.
