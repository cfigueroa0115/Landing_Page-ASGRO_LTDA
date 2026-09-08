// ============================================================================
// ⚠️ ENDPOINT TEMPORAL DE DIAGNÓSTICO — /api/diagnostics/runtime
//
// Propósito: verificar en runtime (AWS Amplify) la DISPONIBILIDAD de secretos y
// la conectividad a la base de datos, SIN revelar ningún valor sensible.
//
// SEGURIDAD ESTRICTA — este endpoint SOLO devuelve booleanos/estados:
// - NO devuelve secretos, longitudes, fragmentos ni connection strings.
// - NO devuelve errores crudos.
// - NO loguea secretos.
//
// TEMPORAL: debe ELIMINARSE antes del merge a master.
// ============================================================================

import { getDbAsync } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { hasSecret, hasSsmSecret } from '@/lib/config/secrets';

export async function GET() {
  // Disponibilidad de secretos por fuentes SÍNCRONAS (env directo / secrets JSON).
  const databaseUrlAvailable = hasSecret('DATABASE_URL');
  const resendApiKeyAvailable = hasSecret('RESEND_API_KEY');

  // Fuentes de configuración (booleanos de existencia, sin exponer contenido).
  const amplifySecretsContainerAvailable =
    typeof process.env.secrets === 'string' && process.env.secrets.length > 0;
  const directDatabaseEnvAvailable =
    typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.length > 0;
  const directResendEnvAvailable =
    typeof process.env.RESEND_API_KEY === 'string' && process.env.RESEND_API_KEY.length > 0;

  // Disponibilidad ESPECÍFICA en AWS SSM Parameter Store (solo booleanos).
  const ssmDatabaseAvailable = await hasSsmSecret('DATABASE_URL');
  const ssmResendAvailable = await hasSsmSecret('RESEND_API_KEY');

  // Conectividad de base de datos: solo ejecuta SELECT 1 (resuelve DATABASE_URL
  // por la cadena completa env → secrets JSON → SSM). Nunca propaga el error crudo.
  let databaseConnectivity: 'ok' | 'failed' = 'ok';
  try {
    const db = await getDbAsync();
    await db.execute(sql`SELECT 1`);
  } catch {
    databaseConnectivity = 'failed';
  }

  return Response.json({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    databaseUrlAvailable,
    resendApiKeyAvailable,
    amplifySecretsContainerAvailable,
    directDatabaseEnvAvailable,
    directResendEnvAvailable,
    ssmDatabaseAvailable,
    ssmResendAvailable,
    databaseConnectivity,
    timestamp: new Date().toISOString(),
  });
}
