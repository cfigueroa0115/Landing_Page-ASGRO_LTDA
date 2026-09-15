// ============================================================================
// Resolución segura de secretos server-side — ASGRO
//
// Resolver SÍNCRONO (getSecret): prioridad
//   1. process.env.<NOMBRE>
//   2. process.env.secrets[<NOMBRE>]  (AWS Amplify Gen 1 — secrets como JSON)
//   3. ''
//
// Resolver ASÍNCRONO (getSecretAsync): misma prioridad + un tercer nivel
//   1. process.env.<NOMBRE>
//   2. process.env.secrets[<NOMBRE>]
//   3. AWS SSM Parameter Store (SecureString), ruta:
//        <NEXT_PUBLIC_SSM_PATH_PREFIX>/<NOMBRE>  (prefijo por entorno, allowlist)
//   4. ''
//
// Reglas de seguridad (estrictas):
// - NUNCA loguear valores de secretos.
// - NUNCA exponer el contenido de process.env.secrets.
// - NUNCA incluir secretos ni errores crudos en mensajes.
// - Uso EXCLUSIVAMENTE server-side. No importar desde componentes cliente.
// - Credenciales AWS: se usa el proveedor de credenciales IAM del runtime
//   (rol de cómputo SSR). NO se hardcodean access key / secret key / session token.
// ============================================================================

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

/**
 * Nombres soportados por el resolver.
 * Incluye secretos (DATABASE_URL, RESEND_API_KEY, ...) y configuración
 * server-side no sensible que también puede vivir en SSM en runtimes donde
 * las variables normales no llegan (CONTACT_NOTIFICATION_TO, CONTACT_FROM_EMAIL).
 */
export type SecretName =
  | 'DATABASE_URL'
  | 'RESEND_API_KEY'
  | 'OPENAI_API_KEY'
  | 'GEMINI_API_KEY'
  | 'CONTACT_NOTIFICATION_TO'
  | 'CONTACT_FROM_EMAIL';

/** Región de AWS para SSM Parameter Store. */
const SSM_REGION = 'us-east-1';

/**
 * Prefijo de ruta de los parámetros en SSM, resuelto por ENTORNO en build-time
 * vía NEXT_PUBLIC_SSM_PATH_PREFIX (horneada por rama en AWS Amplify).
 *
 * Política de FALLO CERRADO: solo se aceptan valores de la allowlist. Si la
 * variable está ausente, vacía o contiene un valor NO autorizado, el prefijo
 * es null → el resolver NO consulta SSM (comportamiento seguro). No se usa
 * NODE_ENV, AWS_BRANCH ni detección de rama en runtime, ni fallback automático.
 */
const ALLOWED_SSM_PREFIXES = [
  '/asgro/redesign-seguros-first',
  '/asgro/production',
] as const;

/**
 * Resuelve y valida el prefijo SSM. Retorna null si no está en la allowlist
 * (fallo cerrado). No revela el valor en errores/logs.
 */
function resolveSsmPrefix(): string | null {
  const raw = (process.env.NEXT_PUBLIC_SSM_PATH_PREFIX ?? '').trim();
  return (ALLOWED_SSM_PREFIXES as readonly string[]).includes(raw) ? raw : null;
}

/** Indica si el prefijo SSM está configurado con un valor autorizado. */
export function isSsmPrefixConfigured(): boolean {
  return resolveSsmPrefix() !== null;
}

// ─── SSM client singleton (lazy) ────────────────────────────────────────────

let _ssmClient: SSMClient | null = null;

function getSsmClient(): SSMClient {
  if (_ssmClient) return _ssmClient;
  // Sin credenciales explícitas: el SDK usa la cadena de proveedores por
  // defecto (rol IAM del runtime SSR). No se hardcodean credenciales.
  _ssmClient = new SSMClient({ region: SSM_REGION });
  return _ssmClient;
}

// ─── Cache de valores resueltos por SSM (evita llamadas repetidas) ──────────

const _ssmCache = new Map<SecretName, string>();

// ─── Fuentes síncronas (env directo + secrets JSON) ─────────────────────────

/**
 * Parsea process.env.secrets (JSON) de forma segura.
 * Retorna un objeto plano, o {} si no existe o es inválido.
 * No expone ni loguea el contenido; ante error, silencioso y seguro.
 */
function parseAmplifySecrets(): Record<string, unknown> {
  const raw = process.env.secrets;

  if (typeof raw !== 'string' || raw.length === 0) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Resuelve un secreto desde las fuentes SÍNCRONAS (env directo, secrets JSON).
 * Retorna '' si no está en ninguna de las dos.
 */
function resolveFromSyncSources(name: SecretName): string {
  const direct = process.env[name];
  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct.trim();
  }

  const secrets = parseAmplifySecrets();
  const fromJson = secrets[name];
  if (typeof fromJson === 'string' && fromJson.trim().length > 0) {
    return fromJson.trim();
  }

  return '';
}

// ─── Resolver SÍNCRONO (retrocompatible) ─────────────────────────────────────

/**
 * Resuelve un secreto server-side por nombre (SÍNCRONO).
 * Prioridad: process.env.<NOMBRE> → process.env.secrets[<NOMBRE>] → ''.
 * No consulta SSM (para eso usar getSecretAsync).
 */
export function getSecret(name: SecretName): string {
  return resolveFromSyncSources(name);
}

/** Indica si un secreto está disponible de forma síncrona. No revela el valor. */
export function hasSecret(name: SecretName): boolean {
  return getSecret(name).length > 0;
}

// ─── Resolver desde SSM Parameter Store ──────────────────────────────────────

/**
 * Lee un parámetro SecureString desde AWS SSM Parameter Store.
 * Ruta: <prefijo-por-entorno>/<NOMBRE>. Usa WithDecryption.
 * Cachea el resultado. Ante cualquier error, retorna '' (nunca lanza ni
 * loguea el error crudo ni el valor).
 *
 * FALLO CERRADO: si el prefijo no está en la allowlist (ausente/inválido),
 * NO se consulta SSM y se retorna '' de inmediato.
 */
async function resolveFromSsm(name: SecretName): Promise<string> {
  const prefix = resolveSsmPrefix();
  if (prefix === null) {
    // Prefijo no autorizado: no consultar SSM. Valor seguro.
    return '';
  }

  const cached = _ssmCache.get(name);
  if (cached !== undefined) return cached;

  try {
    const client = getSsmClient();
    const command = new GetParameterCommand({
      Name: `${prefix}/${name}`,
      WithDecryption: true,
    });
    const response = await client.send(command);
    const value = response.Parameter?.Value?.trim() ?? '';
    _ssmCache.set(name, value);
    return value;
  } catch {
    // Nunca exponer/loguear el error crudo. Valor seguro por defecto.
    _ssmCache.set(name, '');
    return '';
  }
}

// ─── Resolver ASÍNCRONO (env → secrets JSON → SSM) ───────────────────────────

/**
 * Resuelve un secreto server-side por nombre (ASÍNCRONO).
 * Prioridad:
 *   1. process.env.<NOMBRE>
 *   2. process.env.secrets[<NOMBRE>]
 *   3. AWS SSM Parameter Store (SecureString)
 *   4. '' (valor seguro)
 */
export async function getSecretAsync(name: SecretName): Promise<string> {
  const sync = resolveFromSyncSources(name);
  if (sync.length > 0) return sync;

  return resolveFromSsm(name);
}

/** Indica si un secreto está disponible (incluyendo SSM). No revela el valor. */
export async function hasSecretAsync(name: SecretName): Promise<boolean> {
  const value = await getSecretAsync(name);
  return value.length > 0;
}

/**
 * Indica si un secreto está disponible ESPECÍFICAMENTE en SSM Parameter Store
 * (ignora env directo y secrets JSON). Solo para diagnóstico. No revela el valor.
 */
export async function hasSsmSecret(name: SecretName): Promise<boolean> {
  const value = await resolveFromSsm(name);
  return value.length > 0;
}

/**
 * Limpia la caché de SSM. Solo para pruebas.
 * @internal
 */
export function _resetSsmCache(): void {
  _ssmCache.clear();
  _ssmClient = null;
}
