# ASGRO — Knowledge Base V2 · Fundación gobernada (Bloque 5B.1)

> **Naturaleza:** fundación técnica de la KB V2 con gobernanza, trazabilidad,
> aprobación y contenido seguro. **No** conecta la Asesora (`/api/chat`,
> `agent.ts`) a la nueva KB, **no** cambia el comportamiento del chat y **no**
> modifica ni migra destructivamente el legacy. Prepara 5B.2.
>
> Rama: `redesign-seguros-first` · Commit base: `96f65ac`.

---

## 0. Resumen

- Se crea la tabla **aditiva** `knowledge_base_v2`, que **convive** con
  `knowledge_base` (legacy) sin renombrar, borrar ni migrar datos.
- Se define una **taxonomía cerrada** (category / subcategory / sourceType /
  authority) en tipos TypeScript estrictos.
- Se implementa una **capa de gobernanza** (validación Zod + regla de
  elegibilidad) y un **repository desacoplado**, ninguno conectado todavía al
  chat.
- Se crea un **safe corpus** de 24 unidades atómicas, reformuladas fielmente
  desde el sitio actual: 23 aprobadas y 1 pendiente de aprobación.
- Se añaden **tests de gobernanza, corpus y seguridad de contenido** que
  impiden que regresen los claims peligrosos detectados en 5B.0.

---

## 1. Principio arquitectónico

`knowledge_base_v2` es una tabla nueva y **aditiva**. La KB legacy permanece
intacta y sigue alimentando al chat exactamente como antes. La transición del
chat a la V2 ocurrirá en **5B.2**, únicamente después de validar la V2.

```
knowledge_base      (legacy, intacta)  ── usada hoy por /api/chat
knowledge_base_v2   (nueva, gobernada) ── fundación para 5B.2 (NO conectada)
```

---

## 2. Schema V2 (`knowledge_base_v2`)

| Columna         | Tipo                | Notas |
|-----------------|---------------------|-------|
| `id`            | uuid PK (random)    | Identificador técnico. |
| `key`           | varchar(160) UNIQUE | Clave estable legible (slug). **Identifica el contenido corporativo, no el UUID.** |
| `topic`         | varchar(200)        | Título humano corto. |
| `category`      | varchar(40)         | Taxonomía nivel 1 (validada en app). |
| `subcategory`   | varchar(60)         | Taxonomía nivel 2 (validada en app). |
| `content`       | text                | Una sola idea (atómico). |
| `tags`          | text                | Palabras clave separadas por comas. |
| `source`        | varchar(200)        | Origen (ruta web o institucional). Obligatorio. |
| `source_type`   | varchar(30)         | `institutional` · `website` · `product` · `regulatory` · `faq`. |
| `authority`     | varchar(20)         | `orientative` · `informational` · `contractual`. |
| `effective_from`| timestamp (now)     | Inicio de vigencia. |
| `effective_to`  | timestamp NULL      | Fin de vigencia. NULL = sin expiración. |
| `version`       | integer (1)         | Inicia en 1. |
| `priority`      | integer (0)         | Ranking futuro (0 = neutro). |
| `is_approved`   | boolean (false)     | Gobernanza. |
| `is_active`     | boolean (true)      | Gobernanza. |
| `reviewed_at`   | timestamp NULL      | Auditoría de revisión. |
| `reviewed_by`   | varchar(120) NULL   | Quién/qué aprobó. |
| `created_at`    | timestamp (now)     | |
| `updated_at`    | timestamp (now)     | |

**Índices** (preparados para 5B.2): `category`, `subcategory`, `is_approved`,
`is_active`, `priority`. Sin pgvector, sin embeddings, sin FTS en este bloque.

Definición Drizzle: `src/lib/db/schema.ts` (export `knowledgeBaseV2`).

---

## 3. Taxonomía (`src/lib/ai/knowledge/taxonomy.ts`)

Conjuntos **cerrados**; cualquier valor fuera de la lista se rechaza.

- **CATEGORY:** `personas` · `empresas` · `capacidades` · `transversal`.
- **SUBCATEGORY:** `vida`, `salud`, `accidentes_personales`, `hogar`,
  `vehiculos`, `arrendamiento`, `multirriesgo`, `responsabilidad_civil`,
  `cumplimiento`, `manejo`, `vida_grupo`, `otros_riesgos_empresariales`, `arl`,
  `sst`, `siniestros`, `cotizacion`, `contacto`, `institucional_asgro`, `faq`.
- **SOURCE TYPE:** `institutional`, `website`, `product`, `regulatory`, `faq`
  (en 5B.1 solo se usan `institutional` y `website`).
- **AUTHORITY:** `orientative`, `informational`, `contractual`
  (en 5B.1 solo se usan `orientative` e `informational`).

Se exponen type guards (`isKbCategory`, etc.) y la lista de autoridades
permitidas en 5B.1 (`KB_5B1_ALLOWED_AUTHORITIES`).

> **Nota de diseño (para 5B.2):** hoy `category` y `subcategory` son conjuntos
> cerrados **independientes**; el esquema no restringe qué subcategorías pueden
> aparecer bajo cada categoría (la coherencia la aporta el corpus, no el tipo).
> 5B.1.1 **no** rediseña la taxonomía. En 5B.2, el intent router deberá mantener
> una **matriz explícita de intención → dominio (category/subcategory)** que
> preserve la coherencia del enrutamiento; esa matriz es el lugar natural para
> validar combinaciones válidas, no este microbloque.

---

## 4. Gobernanza

### 4.1 Validación (`src/lib/ai/knowledge/validation.ts`)

Zod schema `knowledgeBaseV2Schema`:
- `key` no vacía y con formato slug (`a-z0-9` y guiones).
- `category` / `subcategory` / `sourceType` / `authority` dentro de taxonomía.
- `content` y `source` no vacíos; `source` obligatorio.
- `version >= 1`; `priority` en `[0, 100]`.
- Entradas aprobadas requieren `source` no vacío.
- `effectiveTo` (si existe) debe ser posterior a `effectiveFrom`.

`knowledgeBaseV2SeedSchema5B1` añade la regla del bloque: **prohíbe
`authority = 'contractual'`**.

### 4.2 Regla de elegibilidad (`src/lib/ai/knowledge/repository.ts`)

```
elegible  ⇔  is_approved = true
          AND is_active   = true
          AND (effective_to IS NULL OR effective_to > now())
```

Se expresa de dos formas equivalentes:
- `isEligible(entry, now)` — predicado **puro**, testeable sin base de datos.
- `eligibilityCondition()` — condición Drizzle SQL para `.where(...)`.

Contenido **no aprobado, inactivo o vencido nunca es elegible**.

---

## 5. Repository / acceso a datos (`src/lib/ai/knowledge/repository.ts`)

Capa desacoplada, **NO** invocada aún por el chat:
- `getEligibleKnowledgeBaseV2()` — todas las entradas elegibles (orden:
  prioridad desc, luego key).
- `getKnowledgeByCategory(category, subcategory?)` — filtrado por dominio.
- `getKnowledgeByKey(key)` — una entrada por su key estable (solo si elegible).

Objetivo: ser la base del retrieval de 5B.2.

---

## 6. Safe corpus (`src/lib/ai/knowledge/corpus.ts`)

**Fuente única:** contenido ya publicado en el sitio ASGRO en el commit actual.
Reformulación fiel, sin Internet, sin inventar productos, aseguradoras,
coberturas, tarifas, tiempos ni beneficios.

### 6.1 Entradas creadas (20 total)

| key | category | subcategory | source | authority | approved |
|-----|----------|-------------|--------|-----------|----------|
| `personas-orientacion-general` | personas | institucional_asgro | website:/servicios | orientative | ✅ |
| `personas-vida-orientacion-general` | personas | vida | website:/servicios/bienestar-proteccion | orientative | ✅ |
| `personas-salud-orientacion-general` | personas | salud | website:/servicios/bienestar-proteccion | orientative | ✅ |
| `personas-accidentes-personales-orientacion-general` | personas | accidentes_personales | website:/servicios/bienestar-proteccion | orientative | ✅ |
| `personas-hogar-orientacion-general` | personas | hogar | website:/ (vitrina) | orientative | ✅ |
| `personas-vehiculos-orientacion-general` | personas | vehiculos | website:/ (vitrina) | orientative | ✅ |
| `personas-arrendamiento-orientacion-general` | personas | arrendamiento | PENDING_CONTENT_APPROVAL | orientative | ⛔ |
| `empresas-orientacion-general` | empresas | institucional_asgro | website:/servicios/seguros-empresariales | orientative | ✅ |
| `empresas-multirriesgo-orientacion-general` | empresas | multirriesgo | website:/servicios/seguros-empresariales | orientative | ✅ |
| `empresas-responsabilidad-civil-orientacion-general` | empresas | responsabilidad_civil | website:/servicios/seguros-empresariales | orientative | ✅ |
| `empresas-cumplimiento-orientacion-general` | empresas | cumplimiento | website:/servicios/seguros-empresariales | orientative | ✅ |
| `empresas-manejo-orientacion-general` | empresas | manejo | website:/servicios/seguros-empresariales | orientative | ✅ |
| `empresas-vida-grupo-orientacion-general` | empresas | vida_grupo | website:/servicios/bienestar-proteccion | orientative | ✅ |
| `empresas-otros-riesgos-orientacion-general` | empresas | otros_riesgos_empresariales | website:/servicios/seguros-empresariales | orientative | ✅ |
| `capacidades-arl-acompanamiento-general` | capacidades | arl | website:/servicios/riesgos-laborales | orientative | ✅ |
| `capacidades-arl-gestion-casos-general` | capacidades | arl | website:/servicios/riesgos-laborales | orientative | ✅ |
| `capacidades-sst-acompanamiento-general` | capacidades | sst | website:/servicios/seguridad-salud-trabajo | orientative | ✅ |
| `capacidades-sst-componentes-general` | capacidades | sst | website:/servicios/seguridad-salud-trabajo | informational | ✅ |
| `transversal-institucional-que-hace-asgro` | transversal | institucional_asgro | website:/nosotros | informational | ✅ |
| `transversal-institucional-valores` | transversal | institucional_asgro | website:/nosotros | informational | ✅ |
| `transversal-cotizacion-como-solicitar` | transversal | cotizacion | website:/cotizar | orientative | ✅ |
| `transversal-contacto-hablar-con-asesor` | transversal | contacto | website:/contacto | orientative | ✅ |
| `transversal-siniestros-orientacion-general` | transversal | siniestros | website:/servicios/seguros-empresariales | orientative | ✅ |
| `transversal-alcance-asesora-virtual` | transversal | institucional_asgro | institutional:asesora-virtual-scope | informational | ✅ |

> La tabla lista las **24 entradas** atómicas del corpus, una fila por entrada.
> No hay consolidación: el código NO agrupa ni reduce entradas. El conteo
> autoritativo proviene de `SAFE_CORPUS_V2.length` (= 24) y está fijado por los
> tests de conteo exacto (§9).

### 6.2 Por categoría

- **personas:** 7 (6 aprobadas + 1 pendiente).
- **empresas:** 7 (aprobadas).
- **capacidades:** 4 (aprobadas).
- **transversal:** 6 (aprobadas).

- **Total:** 24.
- **Aprobadas:** 23.
- **Pendientes de aprobación:** 1 (`personas-arrendamiento-orientacion-general`).

### 6.3 Fuentes utilizadas

`website:/servicios`, `website:/servicios/seguros-empresariales`,
`website:/servicios/riesgos-laborales`, `website:/servicios/seguridad-salud-trabajo`,
`website:/servicios/bienestar-proteccion`, `website:/nosotros`,
`website:/cotizar`, `website:/contacto`, `website:/` (vitrina),
`institutional:asesora-virtual-scope`.

### 6.4 Contenido excluido por riesgo

Se excluyeron deliberadamente todas las afirmaciones sensibles detectadas en
5B.0: superlativos ("mejor cobertura", "mejor relación costo-beneficio"), SLA
comerciales ("48 horas", "mismo día"), multas ("500 SMMLV"), tarifas ARL
("0.522%", "6.960%"), porcentajes, primas, promesas de indemnización y garantías
de aceptación/emisión. El corpus solo comunica **orientación general**, con la
salvedad explícita de que coberturas y condiciones dependen de cada póliza y
aseguradora.

### 6.5 Contenido pendiente (PENDING_CONTENT_APPROVAL)

- **arrendamiento** (`personas-arrendamiento-orientacion-general`): el sitio
  actual no presenta información específica de seguro de arrendamiento. Se deja
  como `isApproved=false`, `isActive=false` y `source=PENDING_CONTENT_APPROVAL`.
  No debe comunicarse como disponible hasta contar con fuente aprobada.

---

## 7. Migración

- Archivo generado: `drizzle/0001_dashing_the_watchers.sql`.
- Contenido: **solo** `CREATE TABLE "knowledge_base_v2"` + 5 `CREATE INDEX`.
- **No destructiva:** sin `DROP`, `TRUNCATE`, `DELETE` ni `ALTER` sobre legacy.
- La migración `0000` y su snapshot **no fueron modificados**; el journal se
  amplió de forma aditiva (entrada idx 1).
- **No aplicada a producción** en este bloque.

SQL relevante:

```sql
CREATE TABLE "knowledge_base_v2" ( ... , CONSTRAINT "knowledge_base_v2_key_unique" UNIQUE("key") );
CREATE INDEX "kb_v2_category_idx"    ON "knowledge_base_v2" ("category");
CREATE INDEX "kb_v2_subcategory_idx" ON "knowledge_base_v2" ("subcategory");
CREATE INDEX "kb_v2_is_approved_idx" ON "knowledge_base_v2" ("is_approved");
CREATE INDEX "kb_v2_is_active_idx"   ON "knowledge_base_v2" ("is_active");
CREATE INDEX "kb_v2_priority_idx"    ON "knowledge_base_v2" ("priority");
```

Seed independiente: `src/lib/db/seed-kb-v2.ts`
(`npm run db:seed:kb-v2`). Es upsert idempotente por `key`, valida cada entrada
con `knowledgeBaseV2SeedSchema5B1` y **no toca** legacy ni tablas de chat.

El reporte del seed (5B.1.1) informa de forma honesta: "N entradas procesadas
mediante upsert" más el desglose aprobadas/pendientes. **No** distingue insert de
update, porque `RETURNING` con `onConflictDoUpdate` no diferencia ambos casos de
forma confiable; mostrar esa estadística sería engañoso.

---

## 8. Estrategia de versionado

- `version` inicia en 1.
- No se sobrescribe silenciosamente conocimiento aprobado. Futuras
  modificaciones deberán:
  1. incrementar `version`;
  2. actualizar `reviewedAt`;
  3. actualizar `reviewedBy`;
  4. conservar trazabilidad (source/authority).
- `reviewedBy` no inventa nombres: se usa `"ASGRO-web-approved-source"` para
  reformulaciones fieles de la web, o `null` cuando requiere revisión manual.

---

## 9. Tests

Nuevos (en `__tests__/unit/lib/`):
- **`kb-v2-governance.test.ts`** — regla de elegibilidad (approved/active/
  expired/effectiveTo null/exactamente-ahora), validación Zod (key, taxonomía,
  content, source, version, priority, approved requiere source, prohibición de
  contractual en 5B.1) y type guards de taxonomía.
- **`kb-v2-corpus.test.ts`** — **conteo exacto** (24 entradas, 23 aprobadas,
  1 pendiente; personas 7 / empresas 7 / capacidades 4 / transversal 6), keys
  únicas, taxonomía válida, cada entrada valida contra el schema 5B.1,
  gobernanza (aprobadas con source y content, ninguna contractual, pendientes
  marcadas e inactivas, reviewedBy en aprobadas) y **seguridad de contenido
  anti-regresión 5B.0** (sin SMMLV, 0.522, 6.960, "48 horas", "mismo día",
  superlativos, tarifas, primas, porcentajes, garantías/indemnizaciones).

El test de seguridad **detectó un claim en la propia redacción inicial** ("no
fija primas ni tarifas") y forzó su reformulación a "no define valores ni
condiciones económicas", validando que el guardrail funciona. Los tests de
conteo exacto (5B.1.1) evitan que documentación y corpus se desincronicen.

Total suite: **340 tests / 26 files** (305 previos + 35 nuevos: gobernanza 20,
corpus 15). Build: exit 0.

---

## 10. Riesgos pendientes

- La KB V2 aún **no** alimenta al chat; el comportamiento en producción/preview
  sigue basado en la KB legacy y sus claims sensibles (5B.0). La sustitución
  ocurre en 5B.2/5B.3.
- El corpus inicial es orientativo y deliberadamente conservador; áreas como
  arrendamiento quedan pendientes de aprobación corporativa.
- Los índices están listos, pero el ranking real (FTS/embeddings) no existe aún.

---

## 11. Preparación para 5B.2

- Tabla gobernada con índices por category/subcategory/approved/active/priority.
- Regla de elegibilidad y repository desacoplado listos para el retrieval.
- Taxonomía cerrada y validación Zod para admitir nuevo contenido con seguridad.
- Corpus semilla verificado por tests de contenido.

**Siguiente bloque (5B.2):** conectar el retrieval selectivo (Postgres FTS
español, recomendado en 5B.0) sobre `knowledge_base_v2` + intent router, y solo
entonces evaluar la transición del chat desde la KB legacy.

---

## 12. Estado / integridad

- **Chat sin cambios:** `/api/chat`, `agent.ts`, `providers.ts`,
  `keyword-matcher.ts`, `FloatingChatButton.tsx`, `useVoiceAssistant.ts` **no
  modificados**.
- **Legacy intacto:** `knowledge_base`, `chat_sessions`, `chat_messages`,
  `seed.ts` sin cambios; migración `0000` intacta.
- **Infra intacta:** 0 cambios AWS/Amplify/SSM/IAM/Resend/DNS/dominio; 0
  variables nuevas requeridas en runtime.
- **Migración no aplicada a producción.** Sin merge. Sin producción.
