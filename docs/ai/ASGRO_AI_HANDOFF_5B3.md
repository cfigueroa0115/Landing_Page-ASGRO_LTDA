# ASGRO — Handoff comercial contextual + CTA premium (Bloque 5B.3)

> **Naturaleza:** convierte el flujo V2 gobernado en una experiencia comercial
> premium: la Asesora recomienda en el momento adecuado WhatsApp, Solicitar
> asesoría o Cotizar, **sin capturar PII en el chat, sin inventar precios, sin
> usar contenido legacy y sin abrir canales innecesariamente.** Solo preview.
> Sin producción, sin merge, sin migraciones, sin seed, sin tocar KB V2/schema/
> infra/master.
>
> Rama: `redesign-seguros-first` · Commit base: `8d0f5f0`.

---

## 1. Formatter de texto plano (precondición)

`formatEntries` produce **texto plano premium** (`topic` en su línea + contenido),
sin sintaxis Markdown (`**`, `##`, `` ` ``). La UI del chat renderiza texto plano
con `whitespace-pre-line` (preserva saltos de línea). No se instaló renderer de
Markdown ni se usa `dangerouslySetInnerHTML`. Test anti-Markdown incluido.

## 2. Motor de decisión (puro y testeable)

`src/lib/ai/handoff/commercial-handoff.ts`:
- `decideHandoffKind(intent, ctx)` → `NONE | WHATSAPP | ADVISORY | QUOTE`.
- `decideCommercialHandoff(intent, ctx)` → `ChatAction[]` (máx 2).
- `buildWhatsAppMessage(intent)` → mensaje contextual sin PII.
- `sanitizeActions(actions)` → allowlist + máximo 2 (borde de seguridad).

La **decisión** está separada del **render**: `FloatingChatButton` no contiene
reglas comerciales. No abre URLs automáticamente; el usuario decide con un clic.

## 3. Reglas de handoff

| Situación | Kind |
|-----------|------|
| Pide WhatsApp explícito | WHATSAPP |
| `human_advisor` (hablar con persona) | ADVISORY |
| `siniestros` (no pedir datos sensibles en chat) | ADVISORY |
| `arrendamiento` (contenido pending, sin retrieval) | ADVISORY |
| Garantía / indemnización / aprobación (`wantsContractualGuarantee`) | ADVISORY |
| `cotizacion` o precio/prima/valor/costo (`wantsCommercialOrContractual`) | QUOTE |
| Fallback seguro sobre dominio legítimo | ADVISORY |
| Informativo / institucional / general / off-topic | NONE |

No se muestra CTA comercial tras cada respuesta: las consultas puramente
informativas (p. ej. "seguro de hogar", "qué seguros manejan") devuelven `NONE`.

## 4. Contexto de producto

El handoff conserva `category`/`subcategory`/`domainIntent` del router (5B.2.1):
- "quiero cotizar seguro para mi carro" → QUOTE, contexto "seguro de vehículo".
- "cotizar cumplimiento" → QUOTE, contexto "pólizas de cumplimiento".
- "tuve un accidente con mi carro" → ADVISORY (siniestros + vehículo).

El contexto se refleja en el mensaje de WhatsApp cuando aplica.

## 5. Contrato de API (backward compatible)

`/api/chat` responde:

```
{ sessionId, response, timestamp, actions? }
```

`actions` solo aparece cuando hay CTA (omitido si vacío → 100% compatible con la
UI previa). Tipo público cerrado `ChatAction`:

```ts
type ChatAction =
  | { type: 'whatsapp';  label: 'Escribir por WhatsApp'; href: string }
  | { type: 'advisory';  label: 'Solicitar asesoría';    href: '/contacto' }
  | { type: 'quote';     label: 'Solicitar cotización';  href: '/cotizar' };
```

Máximo **2** acciones (preferido 1). **No** se exponen: intent, primaryIntent,
domainIntent, category, subcategory, confidence, scores, usedEntries, keys,
reason ni meta.

## 6. Seguridad de acciones

`sanitizeActions` valida contra allowlist en el borde: tipos permitidos, `href`
exacto para internas (`/contacto`, `/cotizar`) y `https://wa.me/` para WhatsApp.
No se permite URL arbitraria; tipos/hrefs los define el servidor. Máximo 2.

## 7. WhatsApp

Reutiliza `NEXT_PUBLIC_WHATSAPP_NUMBER` y `generateWhatsAppUrl` (no se hardcodea
teléfono). El mensaje es contextual y **seguro**: referencia el producto cuando
se conoce, **sin** sessionId, historial, confidence, keys ni PII. Ejemplo:
"Hola, vengo del sitio web de ASGRO y me interesa recibir orientación sobre
seguro de vehículo." Si no hay número configurado, no se ofrece WhatsApp.

## 8. Política de PII

La Asesora **no** solicita ni captura en el chat: cédula, NIT, datos médicos,
información financiera, placas ni datos sensibles del siniestro. La captura
formal ocurre en los formularios (`/contacto`, `/cotizar`). La acción de
asesoría no autocompleta campos personales. No se persiste el href de WhatsApp
en DB; solo se guardan el mensaje del usuario y el texto de la respuesta
(sin cambios de schema).

## 9. Guardrails de copy

CTAs permitidos: "Solicitar cotización", "Solicitar asesoría", "Escribir por
WhatsApp". Nunca "Comprar ahora", "Contratar", "Póliza aprobada", "Mejor precio",
"Mejor cobertura", "Garantizado". Las preguntas de garantía/indemnización se
derivan a asesoría (evaluación humana), sin prometer resultados.

## 10. UI premium

`FloatingChatButton` renderiza los chips **debajo** de la burbuja de la respuesta
(sin nesting de elementos interactivos), en un grupo accesible
(`role="group"`, `aria-label="Acciones sugeridas"`). WhatsApp abre en pestaña
nueva (`<a target="_blank" rel="noopener noreferrer">`, acento verde ASGRO);
asesoría/cotización navegan internamente (`<Link>`) y cierran el panel.
Touch target ≥ 44px, focus visible, accesible por teclado. Máximo 2 botones.
Mensajes de bienvenida y error **no** llevan acciones.

## 11. Casos de QA (Live matrix)

| Consulta | Handoff |
|----------|---------|
| "quiero cotizar seguro para mi carro" | QUOTE |
| "cotizar cumplimiento" | QUOTE |
| "cuánto cuesta un seguro de vida" | QUOTE |
| "quiero hablar con un asesor" | ADVISORY |
| "quiero escribir por WhatsApp" | WHATSAPP |
| "tuve un accidente con mi carro" | ADVISORY |
| "seguro de hogar" | NONE |
| "qué seguros manejan" | NONE |
| "arrendamiento" | ADVISORY (fallback seguro) |
| "capital de Francia" | NONE |
| "me garantizan que me indemnizan" | ADVISORY |

Cubiertos en `__tests__/unit/lib/ai-handoff-5b3.test.ts`,
`__tests__/unit/api/routes.test.ts` (contrato +actions, no internals) y
`__tests__/unit/components/floating-assistant.test.tsx` (render de chips ≤2 y
ausencia sin actions). Suite total: 454 tests.

## 12. Sin LLM / providers congelados

5B.3 funciona sin proveedor IA: la decisión es determinística. `providers.ts`
**no** se modificó (modernización de modelos → 5B.4). No se habilitaron API keys.

## 13. Limitaciones conocidas

- Reglas de handoff determinísticas (sin LLM); ajustables por sinónimos.
- El contexto de WhatsApp deriva del `domainIntent`; consultas sin dominio usan
  un mensaje genérico seguro.
- Validación visual real (overflow, mobile 390/430, landscape) recomendada en
  navegador; los tests cubren estructura y accesibilidad, no pixel-perfect.
- Providers legacy y hardening de producción → 5B.4. Activo solo en preview.

---

## 14. Journey de cotización endurecido (Bloque 5B.3.1)

### 14.1 Personas vs empresas

El formulario `/cotizar` es **empresarial** (empresa, NIT, actividad económica,
nº de trabajadores) y no es apropiado para seguros de personas. Por eso:

- **Personas** (`vehiculos`, `hogar`, `vida`, `salud`, `accidentes_personales`,
  `personas`, `arrendamiento`) → **ADVISORY + WhatsApp**. **No** se envía a
  `/cotizar` mientras no exista un formulario específico de personas.
- **Empresas** (`empresas`, `multirriesgo`, `responsabilidad_civil`,
  `cumplimiento`, `manejo`, `vida_grupo`) y **ARL/SST** → **QUOTE** hacia
  `/cotizar` con contexto allowlisted.

Ejemplo: "quiero cotizar seguro para mi carro" → Solicitar asesoría + Escribir
por WhatsApp (no cotización empresarial).

### 14.2 Política de personas (decisión)

No se amplía el formulario empresarial para hacerlo "universal" en este bloque
(evita complejidad y captura inadecuada de datos). Hasta crear un formulario
específico de Personas, las cotizaciones personales se atienden por
asesoría/WhatsApp. Documentado como pendiente.

### 14.3 Cotización empresarial + contexto

QUOTE genera `href` con **query allowlisted** (sin PII, sin texto libre):
- `service` ∈ {`arl`, `sst`, `seguros`, `bienestar`} (opciones reales del form).
- `interest` ∈ {`multirriesgo`, `responsabilidad_civil`, `cumplimiento`,
  `manejo`, `vida_grupo`, `arl`, `sst`}.

Ejemplos:
- "cotizar cumplimiento" → `/cotizar?service=seguros&interest=cumplimiento`
- "cotizar RC" → `/cotizar?service=seguros&interest=responsabilidad_civil`
- "cotizar ARL" → `/cotizar?service=arl...`
- "cotizar SST" → `/cotizar?service=sst...`

`isSafeQuoteHref` valida en el borde: cualquier parámetro fuera de la allowlist
(p. ej. `email`, `nit`, texto libre) invalida la acción. **Nunca** viajan
`sessionId`, nombre, teléfono, email, NIT ni contenido de conversación.

### 14.4 Comparación / recomendación → asesoría

Preguntas como "cuál es la mejor cobertura", "qué cobertura me conviene",
"cuál me recomiendan", "cuál es mejor" → **ADVISORY** (recomendación humana),
nunca QUOTE automático. Precio explícito ("cuánto cuesta", "prima") → QUOTE solo
si el dominio es empresarial; si es personas → ADVISORY/WhatsApp.

### 14.5 Prefill seguro del formulario

`QuoteSection` lee `?service=&interest=` desde `window.location.search` y los
**sanitiza** con `parseQuotePrefill` contra las allowlists. Solo preselecciona
`serviceRequired` y muestra una etiqueta visible "Interés: …". **No**
autocompleta campos personales ni confía en el query crudo.

### 14.6 Duplicación de CTA resuelta

El bloque estático "Hablar con un asesor" del panel se muestra **solo en el
estado inicial** (antes de conversar, junto a las consultas frecuentes). Cuando
ya hay conversación, el acceso al asesor humano se preserva mediante las acciones
de asesoría dinámicas bajo las respuestas, evitando redundancia visual.

### 14.7 Contrato de API

Sin cambios: `{ sessionId, response, timestamp, actions? }`. El tipo `quote.href`
admite `/cotizar` con query allowlisted; no se exponen nuevos internals.
