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

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { hasSecret } from '@/lib/config/secrets';

export async function GET() {
  // Disponibilidad de secretos (booleanos, nunca valores).
  const databaseUrlAvailable = hasSecret('DATABASE_URL');
  const resendApiKeyAvailable = hasSecret('RESEND_API_KEY');

  // Fuentes de configuración (booleanos de existencia, sin exponer contenido).
  const amplifySecretsContainerAvailable =
    typeof process.env.secrets === 'string' && process.env.secrets.length > 0;
  const directDatabaseEnvAvailable =
    typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.length > 0;
  const directResendEnvAvailable =
    typeof process.env.RESEND_API_KEY === 'string' && process.env.RESEND_API_KEY.length > 0;

  // Conectividad de base de datos: solo ejecuta SELECT 1.
  // Nunca se propaga el error crudo; solo el estado ok/failed.
  let databaseConnectivity: 'ok' | 'failed' = 'ok';
  try {
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
    databaseConnectivity,
    timestamp: new Date().toISOString(),
  });
}
