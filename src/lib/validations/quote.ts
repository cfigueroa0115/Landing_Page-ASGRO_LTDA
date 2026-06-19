import { z } from 'zod';

/**
 * Tipos de servicio disponibles para el formulario de cotización.
 */
export const serviceRequiredEnum = z.enum(['arl', 'sst', 'seguros', 'bienestar'], {
  message: 'Seleccione un servicio o seguro requerido',
});

/**
 * Esquema Zod para el formulario de cotización.
 * Campos expandidos: nombre de empresa, NIT, nombre de contacto, cargo,
 * teléfono, email, ciudad, actividad económica, número aproximado de
 * trabajadores, servicio o seguro requerido, ARL actual (opcional),
 * comentarios adicionales (opcional), aceptación de tratamiento de datos.
 * Todos los mensajes de error en español.
 */
export const quoteSchema = z.object({
  companyName: z
    .string()
    .min(1, 'El nombre de la empresa es requerido')
    .max(150, 'El nombre de la empresa no puede exceder 150 caracteres'),

  nit: z
    .string()
    .min(1, 'El NIT es requerido')
    .max(20, 'El NIT no puede exceder 20 caracteres')
    .regex(/^[\d-]+$/, 'El NIT solo puede contener dígitos y guiones'),

  contactName: z
    .string()
    .min(1, 'El nombre de contacto es requerido')
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres'),

  position: z
    .string()
    .min(1, 'El cargo es requerido')
    .max(100, 'El cargo no puede exceder 100 caracteres'),

  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(/^\+?\d{1,15}$/, 'El teléfono debe contener máximo 15 dígitos, con + opcional al inicio'),

  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingrese un correo electrónico válido')
    .max(254, 'El correo electrónico no puede exceder 254 caracteres'),

  city: z
    .string()
    .min(1, 'La ciudad es requerida')
    .max(100, 'La ciudad no puede exceder 100 caracteres'),

  economicActivity: z
    .string()
    .min(1, 'La actividad económica es requerida')
    .max(200, 'La actividad económica no puede exceder 200 caracteres'),

  employeeCount: z
    .number({ message: 'El número de trabajadores debe ser un valor numérico' })
    .int('El número de trabajadores debe ser un entero')
    .min(1, 'Debe tener al menos 1 trabajador')
    .max(99999, 'El número de trabajadores no puede exceder 99,999'),

  serviceRequired: serviceRequiredEnum,

  currentArl: z
    .string()
    .max(100, 'La ARL actual no puede exceder 100 caracteres')
    .optional(),

  comments: z
    .string()
    .max(1000, 'Los comentarios no pueden exceder 1000 caracteres')
    .optional(),

  dataAcceptance: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debe aceptar el tratamiento de datos personales para continuar',
    }),
});

/** Tipo inferido del esquema de cotización */
export type QuoteFormData = z.infer<typeof quoteSchema>;
