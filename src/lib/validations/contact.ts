import { z } from 'zod';

/**
 * Tipos de servicio disponibles para el formulario de contacto.
 */
export const serviceTypeEnum = z.enum(['arl', 'sst', 'seguros', 'bienestar'], {
  message: 'Seleccione un servicio de interés',
});

/**
 * Esquema Zod para el formulario de contacto.
 * Campos expandidos: nombre completo, empresa, cargo, teléfono, email,
 * ciudad, servicio de interés, mensaje, aceptación de tratamiento de datos.
 * Todos los mensajes de error en español.
 */
export const contactSchema = z.object({
  fullName: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .max(100, 'El nombre completo no puede exceder 100 caracteres'),

  company: z
    .string()
    .min(1, 'La empresa es requerida')
    .max(120, 'La empresa no puede exceder 120 caracteres'),

  position: z
    .string()
    .min(1, 'El cargo es requerido')
    .max(100, 'El cargo no puede exceder 100 caracteres'),

  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(/^\d{7,15}$/, 'El teléfono debe contener entre 7 y 15 dígitos numéricos'),

  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingrese un correo electrónico válido')
    .max(254, 'El correo electrónico no puede exceder 254 caracteres'),

  city: z
    .string()
    .min(1, 'La ciudad es requerida')
    .max(100, 'La ciudad no puede exceder 100 caracteres'),

  serviceOfInterest: serviceTypeEnum,

  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje no puede exceder 2000 caracteres'),

  dataAcceptance: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debe aceptar el tratamiento de datos personales para continuar',
    }),
});

/** Tipo inferido del esquema de contacto */
export type ContactFormData = z.infer<typeof contactSchema>;
