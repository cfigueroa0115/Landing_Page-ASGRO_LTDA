# ASGRO — Activación de Knowledge Base V2 en PREVIEW (Bloque 5B.1.2)

> **Naturaleza:** documento de **evidencia operativa**. Registra la activación
> controlada de `knowledge_base_v2` en la base Neon de **preview** y las
> verificaciones de integridad. **No** conecta `/api/chat` a KB V2, **no**
> cambia el comportamiento de la Asesora y **no** contiene secretos.
>
> Rama: `redesign-seguros-first` · Commit base: `70c53b9`.

---

## 0. Alcance y regla de seguridad

La activación se ejecutó **exclusivamente** contra la branch Neon de preview,
desde un entorno AWS autorizado. Kiro **no** ejecutó migración ni seed desde la
máquina local: al no poder resolver el `DATABASE_URL` de preview de forma
inequívoca y segura (sin AWS CLI, sin credenciales IAM locales, sin prefijo SSM
autorizado), se detuvo antes de cualquier escritura, conforme a la regla de
seguridad del bloque. Las operaciones de DB se realizaron externamente y sus
resultados se documentan aquí.

**No se exponen** en este documento: contraseñas, connection strings, hosts
completos, API keys ni valores desencriptados de SSM.

---

## 1. Entorno

| Elemento | Valor |
|----------|-------|
| Neon project | `SQL_ASGRO` |
| Neon branch (activación) | `preview-redesign-seguros-first` |
| Neon branch producción | `production` — **NO tocada** |
| AWS account | `ASGRO-Web-Prod` (063028693540) |
| AWS region | `us-east-1` |
| Fuente del secreto | SSM SecureString `/asgro/redesign-seguros-first/DATABASE_URL` |
| Ejecución | AWS CloudShell (cuenta autorizada) |
| Amplify preview | `redesign-seguros-first` |
| Preview URL | `redesign-seguros-first.d2a24og78z38ro.amplifyapp.com` |

---

## 2. Mecanismos de ejecución (migración vs seed)

La migración y el seed **no** usaron el mismo mecanismo. Es importante no
confundirlos:

**Migración — `drizzle-kit migrate`.** La migración versionada
`drizzle/0001_dashing_the_watchers.sql` se aplicó mediante `drizzle-kit migrate`
contra la branch Neon de preview, y terminó con `migrations applied
successfully`. La migración **no** utilizó el runner temporal `neon-http`.

**Seed — runner temporal `neon-http` (solo por compatibilidad en CloudShell).**
El seed oficial (`npm run db:seed:kb-v2`, que usa `drizzle-orm/neon-serverless`
+ `@neondatabase/serverless` Pool) **falló** en AWS CloudShell / Node 20 por una
incompatibilidad del **transporte WebSocket** del adaptador Pool en ese entorno
(no fue un error del corpus, del schema, de Neon ni de la migración). Como
diagnóstico se validó que `SELECT 1` vía `Pool` + `poolQueryViaFetch` daba PASS,
pero Drizzle `neon-serverless` seguía intentando prepared queries por WebSocket.

Por esa razón, y **solo** para ejecutar el seed en CloudShell, se creó un runner
temporal basado en `drizzle-orm/neon-http` + `@neondatabase/serverless` `neon()`.
Ese runner **reutilizó exactamente los artefactos oficiales del proyecto**:
`SAFE_CORPUS_V2`, `knowledgeBaseV2SeedSchema5B1`, `knowledgeBaseV2`,
`buildInsertValues` y `buildUpdateSet`. No duplicó ni modificó el corpus, no
introdujo lógica de negocio distinta, **no** se añadió al runtime de la
aplicación, **no** se committeó y fue **eliminado** al completar la operación.

Naturaleza del workaround: es un **workaround operacional temporal de
CloudShell**, no una arquitectura definitiva, no un cambio de runtime, no un
nuevo driver de producción ni una nueva dependencia de la aplicación. En
concreto:

- **no** se modificó `src/lib/db/index.ts` (el runtime del sitio sigue usando
  `drizzle-orm/neon-serverless` + Pool);
- **no** se cambió `/api/chat`;
- **no** se cambió el runtime de Amplify;
- **no** se cambió la arquitectura productiva;
- **no** se modificó `package.json` ni se añadió `neon-http` como dependencia de
  runtime;
- **no** se modificó Neon production.

**No** se persistió ningún connection string ni credencial en el repositorio,
en `.env*` ni en esta documentación.

---

## 3. Baseline autoritativo (pre-migración)

Ejecutado en `preview-redesign-seguros-first` antes de cualquier escritura:

| Tabla | Filas |
|-------|-------|
| `knowledge_base` (legacy) | 8 |
| `chat_sessions` | 7 |
| `chat_messages` | 24 |

Existencia de objetos antes de migrar:

| Objeto | Estado |
|--------|--------|
| `knowledge_base` | existe |
| `chat_sessions` | existe |
| `chat_messages` | existe |
| `knowledge_base_v2` | **ausente** |

---

## 4. Migración aplicada

- Migración: `drizzle/0001_dashing_the_watchers.sql` (la existente; **no** se
  generó una nueva).
- Mecanismo: **`drizzle-kit migrate`** contra la branch Neon de preview,
  finalizada con `migrations applied successfully`. **No** se usó el runner
  temporal `neon-http` para la migración.
- Naturaleza: **aditiva**. Solo `CREATE TABLE "knowledge_base_v2"`,
  `UNIQUE("key")` y 5 `CREATE INDEX`. Sin `DROP/TRUNCATE/DELETE/ALTER/UPDATE/
  INSERT` sobre tablas legacy.
- Resultado: `to_regclass('public.knowledge_base_v2')` → **`knowledge_base_v2`**
  (presente tras migrar).

Estructura verificada — columnas presentes: `id`, `key`, `topic`, `category`,
`subcategory`, `content`, `tags`, `source`, `source_type`, `authority`,
`effective_from`, `effective_to`, `version`, `priority`, `is_approved`,
`is_active`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`.

- Constraint **UNIQUE** en `key`: presente.
- Índices presentes: `kb_v2_category_idx`, `kb_v2_subcategory_idx`,
  `kb_v2_is_approved_idx`, `kb_v2_is_active_idx`, `kb_v2_priority_idx`.

---

## 5. Seed V2

**Mecanismo real.** Los primeros intentos con el seed oficial
(`npm run db:seed:kb-v2`) **fallaron** en CloudShell por el transporte WebSocket
de `drizzle-orm/neon-serverless` + Pool (ver §2). El seed se **completó
exitosamente** mediante el **runner temporal `neon-http`**, que reutilizó los
artefactos oficiales del proyecto (`SAFE_CORPUS_V2`, `knowledgeBaseV2SeedSchema5B1`,
`knowledgeBaseV2`, `buildInsertValues`, `buildUpdateSet`) con upsert idempotente
por `key`. **No** se ejecutó seed legacy, reset, truncate ni delete.

**Sin inserción parcial.** Tras los intentos fallidos del seed oficial (y antes
de ejecutar el runner HTTP), se verificó:

| Verificación | Resultado |
|--------------|-----------|
| `knowledge_base_v2` filas | 0 |
| `knowledge_base` (legacy) | 8 |
| `chat_sessions` | 7 |
| `chat_messages` | 24 |

Es decir: los fallos del seed oficial **no** dejaron inserción parcial, no
corrompieron datos ni alteraron las tablas legacy. Solo después se ejecutó el
runner HTTP temporal, que sí completó.

**Runs del runner HTTP (idempotencia):**

| Run | Procesadas | Aprobadas | Pendiente |
|-----|-----------|-----------|-----------|
| 1º | 24 | 23 | 1 |
| 2º | 24 | 23 | 1 |

Resultado de integridad tras el seed:

| Verificación | Esperado | Resultado |
|--------------|----------|-----------|
| Total filas | 24 | **24** |
| Keys únicas (`COUNT(DISTINCT key)`) | 24 | **24** |
| Elegibles (approved ∧ active ∧ vigente) | 23 | **23** |
| Pendiente | 1 | **1** |
| `authority = 'contractual'` | 0 | **0** |
| `MIN(version)` / `MAX(version)` | 1 / 1 | **1 / 1** |

Distribución por categoría:

| category | filas |
|----------|-------|
| personas | 7 |
| empresas | 7 |
| capacidades | 4 |
| transversal | 6 |
| **Total** | **24** |

Entrada pendiente (arrendamiento):

| key | is_approved | is_active |
|-----|-------------|-----------|
| `personas-arrendamiento-orientacion-general` | false | false |

(Exactamente una fila.)

Sanity check de claims críticos sobre `content` aprobado: **no** aparecen
"500 SMMLV", "0.522", "6.960", "48 horas", "mismo día", "mejor cobertura" ni
"mejor relación costo-beneficio". (La verificación autoritativa sigue siendo el
test automatizado anti-regresión de 5B.0/5B.1.)

---

## 6. Idempotencia del seed

Segunda ejecución del seed V2 (solo en preview): completó sin error y mantuvo
**24 filas / 24 keys únicas / 23 elegibles / 1 pendiente**. Idempotencia del
upsert: **confirmada**. No se ejecutó más de dos veces.

---

## 7. Legacy intacto (post-seed)

Reconsultado tras la activación, **sin** haber abierto el chat durante el
proceso:

| Tabla | Baseline | Post-seed | ¿Sin cambios? |
|-------|----------|-----------|----------------|
| `knowledge_base` | 8 | 8 | ✅ |
| `chat_sessions` | 7 | 7 | ✅ |
| `chat_messages` | 24 | 24 | ✅ |

La migración/seed de V2 **no alteró** las tablas legacy.

---

## 8. Runtime diagnostics (`/api/diagnostics/runtime`)

| Campo | Valor |
|-------|-------|
| `nodeEnv` | production |
| `ssmPrefixConfigured` | true |
| `ssmDatabaseAvailable` | true |
| `ssmResendAvailable` | true |
| `ssmContactNotificationToAvailable` | true |
| `ssmContactFromEmailAvailable` | true |
| `emailNotificationAvailable` | true |
| `databaseConnectivity` | **ok** |

---

## 9. Smoke test del preview

| Elemento | Resultado |
|----------|-----------|
| Home carga | PASS |
| Header / navegación | PASS |
| WhatsApp | PASS |
| Asesora (abre y responde) | PASS |

Pregunta de prueba: *"¿Qué soluciones tienen para una empresa?"*

La Asesora respondió mediante la **KB legacy**, como estaba previsto. La
respuesta todavía **mezcla Seguros Empresariales + ARL + SG-SST** y conserva
claims legacy (p. ej. "mejor cobertura").

> **Esto NO es una regresión de 5B.1.2.** Es evidencia del comportamiento legacy
> que será sustituido en **5B.2** mediante retrieval selectivo + intent routing.
> No se corrige en este bloque.

---

## 10. Chat sin cambios / KB V2 no conectada

- `/api/chat` continúa leyendo `knowledge_base` (legacy). **No** usa
  `knowledge_base_v2`.
- Sin cambios en: `src/app/api/chat/route.ts`, `src/lib/ai/agent.ts`,
  `src/lib/ai/providers.ts`, `src/lib/ai/keyword-matcher.ts`,
  `src/lib/ai/knowledge/repository.ts`, `src/components/shared/FloatingChatButton.tsx`,
  `src/lib/hooks/useVoiceAssistant.ts`.
- Cero cambios de comportamiento en runtime.

---

## 11. Integridad de código e infraestructura

- **master:** intacto (`de8d1ff`).
- **Producción Neon:** NO tocada.
- **Infra:** sin cambios en AWS/Amplify/SSM/IAM/DNS/dominio/variables.
- **Secretos:** no expuestos.
- Único cambio de repositorio en este bloque: **este documento de evidencia**.

---

## 12. Estado para 5B.2

`knowledge_base_v2` está **activa y verificada en preview** (24 filas, 23
elegibles, 1 pendiente, categorías 7/7/4/6, sin contractual, versión 1). Queda
lista para que 5B.2 implemente retrieval selectivo + intent router sobre ella y,
solo tras validar, evalúe la transición del chat desde la KB legacy.

**Este bloque se detiene aquí.** No inicia 5B.2, no conecta la Asesora a KB V2,
sin merge, sin producción.
