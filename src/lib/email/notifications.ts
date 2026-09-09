// ============================================================================
// Notificaciones por email (Resend) — ASGRO
// Envía notificaciones internas de nuevos contactos y cotizaciones.
//
// Reglas de seguridad:
// - Todas las credenciales son server-side (env.ts). NUNCA se exponen al cliente.
// - Si falta configuración o el envío falla, se retorna { sent:false } sin lanzar
//   ni exponer credenciales/errores internos al frontend.
// - No se registran datos sensibles del formulario en logs (solo un flag genérico).
// ============================================================================

import { Resend } from 'resend';
import {
  isEmailNotificationAvailableAsync,
  getResendApiKeyAsync,
  getContactFromEmailAsync,
  getContactNotificationToAsync,
} from '@/lib/config/env';

/** Resultado del intento de notificación. `sent` indica si el correo salió. */
export interface NotificationResult {
  sent: boolean;
}

/** Campos genéricos de una fila (label + valor) para render en el email. */
interface EmailRow {
  label: string;
  value: string;
}

/**
 * Escapa caracteres HTML para evitar inyección en el cuerpo del correo.
 * El contenido proviene del usuario, así que se sanea antes de interpolar.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Construye el cuerpo HTML del correo a partir de filas etiqueta/valor.
 * Diseño sobrio y legible; sin dependencias externas.
 */
function buildEmailHtml(title: string, rows: EmailRow[], timestamp: string): string {
  const rowsHtml = rows
    .map(
      (row) => `
      <tr>
        <td style="padding:6px 12px;background:#F4F6F9;font-weight:600;color:#011930;white-space:nowrap;vertical-align:top;">${escapeHtml(
          row.label
        )}</td>
        <td style="padding:6px 12px;color:#333;">${escapeHtml(row.value)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <h1 style="font-size:18px;color:#024EA3;margin:0 0 4px;">${escapeHtml(title)}</h1>
      <p style="font-size:12px;color:#666;margin:0 0 16px;">Recibido el ${escapeHtml(timestamp)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${rowsHtml}</table>
      <p style="font-size:11px;color:#999;margin-top:20px;">
        Notificación automática del sitio ASGRO Agencia de Seguros.
      </p>
    </div>
  </body>
</html>`;
}

/**
 * Envía una notificación por email de forma controlada.
 * - Si la configuración de email no está disponible, retorna { sent:false }.
 * - Si Resend falla, captura el error y retorna { sent:false } sin exponer detalles.
 *
 * @param subject   Asunto del correo.
 * @param title     Título mostrado en el cuerpo.
 * @param rows      Filas etiqueta/valor con los datos del formulario.
 * @param replyTo   Email del usuario para configurar reply-to.
 */
async function sendNotification(
  subject: string,
  title: string,
  rows: EmailRow[],
  replyTo: string
): Promise<NotificationResult> {
  if (!(await isEmailNotificationAvailableAsync())) {
    // Config incompleta — no es un error del usuario. No exponemos detalles.
    return { sent: false };
  }

  try {
    // Lectura de config de email desacoplada de las variables públicas.
    // La API key (secreto) se resuelve async (incluye SSM); from/to vía helpers.
    const resend = new Resend(await getResendApiKeyAsync());
    const timestamp = new Date().toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
    });

    const [fromEmail, toEmail] = await Promise.all([
      getContactFromEmailAsync(),
      getContactNotificationToAsync(),
    ]);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: replyTo || undefined,
      subject,
      html: buildEmailHtml(title, rows, timestamp),
    });

    if (error) {
      // Fallo del proveedor: registramos un flag genérico, sin datos ni credenciales.
      console.error('[email] Envío de notificación falló (proveedor).');
      return { sent: false };
    }

    return { sent: true };
  } catch {
    // Cualquier excepción inesperada: nunca exponer credenciales ni el error crudo.
    console.error('[email] Error inesperado al enviar notificación.');
    return { sent: false };
  }
}

/** Datos de contacto para la notificación (ya validados por Zod en la ruta). */
export interface ContactNotificationData {
  fullName: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  city: string;
  serviceOfInterest: string;
  message: string;
}

/**
 * Notifica un nuevo contacto. Asunto: "Nuevo contacto ASGRO".
 * Configura reply-to con el correo del usuario.
 */
export async function sendContactNotification(
  data: ContactNotificationData
): Promise<NotificationResult> {
  const rows: EmailRow[] = [
    { label: 'Nombre', value: data.fullName },
    { label: 'Empresa', value: data.company },
    { label: 'Cargo', value: data.position },
    { label: 'Teléfono', value: data.phone },
    { label: 'Correo', value: data.email },
    { label: 'Ciudad', value: data.city },
    { label: 'Servicio de interés', value: data.serviceOfInterest },
    { label: 'Mensaje', value: data.message },
  ];

  return sendNotification(
    'Nuevo contacto ASGRO',
    'Nuevo contacto desde el sitio',
    rows,
    data.email
  );
}

/** Datos de cotización para la notificación (ya validados por Zod en la ruta). */
export interface QuoteNotificationData {
  companyName: string;
  nit: string;
  contactName: string;
  position: string;
  phone: string;
  email: string;
  city: string;
  economicActivity: string;
  employeeCount: number;
  serviceRequired: string;
  currentArl?: string | null;
  comments?: string | null;
}

/**
 * Notifica una nueva solicitud de cotización.
 * Asunto: "Nueva solicitud de cotización ASGRO".
 * Configura reply-to con el correo del usuario.
 */
export async function sendQuoteNotification(
  data: QuoteNotificationData
): Promise<NotificationResult> {
  const rows: EmailRow[] = [
    { label: 'Empresa', value: data.companyName },
    { label: 'NIT', value: data.nit },
    { label: 'Contacto', value: data.contactName },
    { label: 'Cargo', value: data.position },
    { label: 'Teléfono', value: data.phone },
    { label: 'Correo', value: data.email },
    { label: 'Ciudad', value: data.city },
    { label: 'Actividad económica', value: data.economicActivity },
    { label: 'N.º de trabajadores', value: String(data.employeeCount) },
    { label: 'Servicio requerido', value: data.serviceRequired },
    { label: 'ARL actual', value: data.currentArl || 'No indicada' },
    { label: 'Comentarios', value: data.comments || 'Sin comentarios' },
  ];

  return sendNotification(
    'Nueva solicitud de cotización ASGRO',
    'Nueva solicitud de cotización desde el sitio',
    rows,
    data.email
  );
}
