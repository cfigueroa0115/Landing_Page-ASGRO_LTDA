# ASGRO — Retrieval selectivo + Intent Router (Bloque 5B.2)

> **Naturaleza:** conecta la Knowledge Base V2 (activada en la branch Neon de
> **preview**) al flujo de la Asesora, sustituyendo el patrón legacy de "cargar
> toda la KB" por: mensaje → intent router → retrieval selectivo → solo
> contenido V2 elegible → respuesta segura. **Solo preview.** Sin producción,
> sin merge, sin migraciones, sin seed, sin cambios de UI.
>
> Rama: `redesign-seguros-first` · Commit base: `1aab3bb`.

---

## 1. Arquitectura

```
usuario
  → /api/chat (Zod, sesión, contexto 10 msgs)
      → processMessageV2 (src/lib/ai/agent-v2.ts)
          → routeIntent           (src/lib/ai/routing/intent-router.ts)   [PURO]
          → retrieveForIntent     (src/lib/ai/retrieval/selective-retrieval.ts)
              → repository V2      (getKnowledgeByCategory, solo ELEGIBLE)
              → rankAndLimit       (topK ≤ 4)
          → formatter determinístico / fallback seguro / handoff
      → persistencia chat_messages
  → JSON { sessionId, response, timestamp }   (shape sin cambios)
```

Principios: **no** se envía toda la KB; **no** se usa la KB legacy; funciona
**100 % sin LLM** (formatter determinístico); **no** hay fallback a contenido
legacy; nunca se exponen intención, scores, keys, SQL ni metadata al cliente.

## 2. Intents

24 intenciones (`Intent`): `general_insurance`, `personas`, `vida`, `salud`,
`accidentes_personales`, `hogar`, `vehiculos`, `arrendamiento`, `empresas`,
`multirriesgo`, `responsabilidad_civil`, `cumplimiento`, `manejo`, `vida_grupo`,
`arl`, `sst`, `siniestros`, `cotizacion`, `contacto`, `institucional`,
`human_advisor`, `whatsapp`, `off_topic`, `unknown`.

Cada resultado (`IntentResult`) incluye `intent`, `category`, `subcategory`,
`confidence`, `reason` (**interno**) y `wantsCommercialOrContractual`.

Routing **determinístico** (sin LLM): `normalize` (minúsculas, sin acentos,
puntuación → espacio), reglas con sinónimos y pesos, scoring y prioridad por
orden. Señales multi-palabra pesan más. Si no hay regla pero hay señal de
dominio → `general_insurance`; si no hay señal → `off_topic`; vacío → `unknown`.

## 3. Mapping intent → KB V2

| Intent | category | subcategory |
|--------|----------|-------------|
| vida / salud / accidentes_personales / hogar / vehiculos / arrendamiento | personas | (misma) |
| personas / general_insurance | personas | — |
| multirriesgo / responsabilidad_civil / cumplimiento / manejo / vida_grupo | empresas | (misma) |
| empresas | empresas | — |
| arl / sst | capacidades | (misma) |
| siniestros / cotizacion / contacto / institucional | transversal | (correspondiente) |
| human_advisor / whatsapp | transversal | contacto (handoff, sin retrieval) |
| off_topic / unknown | — | — |

Ejemplos: "seguro para mi carro" → personas/vehiculos; "póliza para mi empresa"
→ empresas; "responsabilidad civil" → empresas/responsabilidad_civil; "quiero
afiliar mi empresa a una ARL" → capacidades/arl; "necesito implementar SG-SST"
→ capacidades/sst; "quiero cotizar" → transversal/cotizacion; "tuve un
siniestro" → transversal/siniestros; "quiero hablar con un asesor" →
human_advisor.

## 4. Contexto conversacional (follow-up)

Se mantiene la ventana de 10 mensajes. Follow-ups ambiguos ("¿y qué cubre?",
"me interesa ese") **heredan** el dominio/subdominio de la última intención de
dominio del contexto. Una **intención explícita nueva NUNCA** se sobrescribe por
contexto antiguo (p. ej. tras hablar de carro, "ahora quiero cotizar" →
cotizacion).

## 5. Retrieval

- Solo entradas **elegibles** (repository: `isApproved ∧ isActive ∧ vigente`).
- Consulta por `category` (+`subcategory` si existe). Si la intención tiene
  subcategory y esta no arroja filas elegibles, **no** se rellena con otra
  subcategory (caso arrendamiento).
- **Ranking** (mayor a menor peso): (1) subcategory exacta, (2) category exacta,
  (3) topic, (4) tags, (5) coincidencia lexical con la consulta (content),
  (6) priority. Desempate estable por `key`.
- **topK:** máximo **4** (`MAX_RETRIEVED`); el orquestador pide 3 por defecto,
  suficiente para 2–3 ideas atómicas.
- Con 24 entradas **no** se usan embeddings ni vector DB (complejidad prematura).

## 6. Guardrails de contenido

Las respuestas V2 no inventan coberturas, no prometen indemnizaciones, no dan
precios/primas, no afirman aprobación de pólizas, no dicen "mejor cobertura/
precio", no garantizan aceptación, no usan contenido pending y no convierten
orientación en condición contractual. El corpus V2 ya excluye esos claims
(verificado por los tests de 5B.1). Cuando el usuario pide **precio, condición
contractual, aprobación o decisión aseguradora**
(`wantsCommercialOrContractual`), la respuesta añade una nota de orientación:
los valores y la aceptación dependen de cada aseguradora y del análisis del caso,
y prepara el **handoff** humano (visual/comercial en 5B.3).

## 7. Fallback seguro y handoff

- **off_topic:** mensaje de alcance (seguros personas/empresas, ARL, SST) +
  invitación a asesor. **No** recupera contenido.
- **human_advisor / whatsapp:** handoff directo (WhatsApp / formulario), sin
  recuperar contenido.
- **Sin contenido elegible** (p. ej. `arrendamiento` pending/inactive, o
  `unknown`): **fallback seguro** — "No cuento con información aprobada
  suficiente… puedo orientarte para hablar con un asesor". **Nunca** usa
  contenido pending ni legacy.

## 8. Arrendamiento (caso crítico)

El intent `arrendamiento` **se detecta**, pero la entrada
`personas-arrendamiento-orientacion-general` es pending/inactive → el repository
no la devuelve → retrieval = 0 → **fallback seguro + handoff**. El contenido
pending **jamás** entra al contexto (test explícito).

## 9. Providers (congelados en 5B.2)

`providers.ts` no se modernizó (modelos legacy `gpt-3.5-turbo`/`gemini-pro`
quedan para 5B.4). El flujo V2 **no** depende de LLM: funciona de forma
determinística aunque `OPENAI_API_KEY`/`GEMINI_API_KEY` no existan o el
proveedor falle. No se habilitaron nuevas API keys ni se tocó SSM/IAM.

## 10. /api/chat

Se mantuvo: validación Zod, manejo de sesión, contexto de 10 mensajes,
persistencia en `chat_sessions`/`chat_messages`, shape de respuesta JSON
(`{ sessionId, response, timestamp }`) y errores genéricos (400/503/500). Se
eliminó del flujo el `select all active` de `knowledge_base` legacy. Solo el
texto seguro llega al cliente; intención/scores/keys/meta quedan internos
(test de no-exposición).

## 11. Legacy

`knowledge_base`, `seed.ts`, `keyword-matcher.ts`, `agent.ts` y `providers.ts`
**no** se borran ni modifican. No se mezcla contenido legacy con V2 en una misma
respuesta: cada respuesta proviene del corpus gobernado V2 o del fallback seguro.

## 12. Casos de prueba (resumen)

Cubiertos en `__tests__/unit/lib/ai-retrieval-5b2.test.ts` y el bloque de chat de
`__tests__/unit/api/routes.test.ts`:

- Routing: "seguro para carro/hogar/vida", "empresa", "responsabilidad civil",
  "cumplimiento", "ARL", "SG-SST", "cotizar", "siniestro", "hablar con asesor",
  "arrendamiento"; acentos/mayúsculas; off_topic; unknown (vacío).
- `wantsCommercialOrContractual`: "cuánto cuesta", "mejor cobertura",
  "garantizan la indemnización".
- Follow-up: hereda dominio; no sobrescribe intención explícita nueva.
- Ranking: subcategory > category; topK ≤ 4; desempate por key.
- Orquestador: formatea V2; off_topic; handoff sin retrieval; fallback seguro
  (arrendamiento); guardrail comercial; funciona sin LLM; no expone keys.
- Chat route: shape JSON intacto; no expone internals.

## 13. Limitaciones conocidas

- Routing basado en reglas: consultas muy atípicas pueden caer en
  `general_insurance` o `off_topic`. Ajustable ampliando sinónimos.
- Sin embeddings: la coincidencia lexical es simple (adecuada para 24 entradas).
- Providers legacy sin modernizar (5B.4). Handoff visual/comercial en 5B.3.
- Activo en **preview**; no se conecta ni despliega a producción en este bloque.
