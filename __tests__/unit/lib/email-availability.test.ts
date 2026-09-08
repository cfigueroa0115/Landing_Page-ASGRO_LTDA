import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isEmailNotificationAvailable,
  isResendAvailable,
  getContactNotificationTo,
  getContactFromEmail,
} from '@/lib/config/env';

/**
 * Tests del BLOQUE 3B — Desacoplamiento de la configuración de email.
 *
 * La disponibilidad del envío por Resend debe depender ÚNICAMENTE de:
 *   RESEND_API_KEY, CONTACT_NOTIFICATION_TO, CONTACT_FROM_EMAIL
 * y NO de las variables públicas de contacto
 *   (NEXT_PUBLIC_WHATSAPP_NUMBER / _COMPANY_PHONE / _COMPANY_EMAIL / _COMPANY_ADDRESS).
 */

// Variables de email válidas de referencia (sin secretos reales).
const EMAIL_VARS = {
  RESEND_API_KEY: 'test_resend_key',
  CONTACT_NOTIFICATION_TO: 'destino@example.com',
  CONTACT_FROM_EMAIL: 'ASGRO <no-reply@example.com>',
};

// Variables públicas de contacto (las que NO deben afectar al email).
const PUBLIC_CONTACT_VARS = [
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
  'NEXT_PUBLIC_COMPANY_PHONE',
  'NEXT_PUBLIC_COMPANY_EMAIL',
  'NEXT_PUBLIC_COMPANY_ADDRESS',
];

const ALL_KEYS = [...Object.keys(EMAIL_VARS), ...PUBLIC_CONTACT_VARS];

function setEmailVars() {
  process.env.RESEND_API_KEY = EMAIL_VARS.RESEND_API_KEY;
  process.env.CONTACT_NOTIFICATION_TO = EMAIL_VARS.CONTACT_NOTIFICATION_TO;
  process.env.CONTACT_FROM_EMAIL = EMAIL_VARS.CONTACT_FROM_EMAIL;
}

function clearAll() {
  ALL_KEYS.forEach((k) => {
    delete process.env[k];
  });
}

beforeEach(() => {
  clearAll();
  // Simula producción: es donde antes el acoplamiento rompía el envío.
  process.env.NODE_ENV = 'production';
});

afterEach(() => {
  clearAll();
});

describe('Email disponible SIN variables públicas de contacto', () => {
  it('Resend disponible sin teléfono público', () => {
    setEmailVars();
    // Sin NEXT_PUBLIC_COMPANY_PHONE (ni el resto de públicas).
    expect(isEmailNotificationAvailable()).toBe(true);
  });

  it('Resend disponible sin dirección pública', () => {
    setEmailVars();
    // Presentes las demás públicas pero NO la dirección.
    process.env.NEXT_PUBLIC_COMPANY_PHONE = '+57 300 123 4567';
    process.env.NEXT_PUBLIC_COMPANY_EMAIL = 'contacto@asgroseguros.com';
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '573001234567';
    expect(isEmailNotificationAvailable()).toBe(true);
  });

  it('Resend disponible sin WhatsApp', () => {
    setEmailVars();
    process.env.NEXT_PUBLIC_COMPANY_PHONE = '+57 300 123 4567';
    process.env.NEXT_PUBLIC_COMPANY_EMAIL = 'contacto@asgroseguros.com';
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS = 'Bogotá, Colombia';
    expect(isEmailNotificationAvailable()).toBe(true);
  });

  it('Resend disponible sin email público', () => {
    setEmailVars();
    process.env.NEXT_PUBLIC_COMPANY_PHONE = '+57 300 123 4567';
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '573001234567';
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS = 'Bogotá, Colombia';
    expect(isEmailNotificationAvailable()).toBe(true);
  });

  it('Resend disponible sin NINGUNA variable pública de contacto', () => {
    setEmailVars();
    // Ninguna NEXT_PUBLIC_* de contacto presente.
    expect(isEmailNotificationAvailable()).toBe(true);
    expect(isResendAvailable()).toBe(true);
    expect(getContactNotificationTo()).toBe(EMAIL_VARS.CONTACT_NOTIFICATION_TO);
    expect(getContactFromEmail()).toBe(EMAIL_VARS.CONTACT_FROM_EMAIL);
  });
});

describe('Email NO disponible si falta alguna variable de email', () => {
  it('Resend NO disponible si falta RESEND_API_KEY', () => {
    process.env.CONTACT_NOTIFICATION_TO = EMAIL_VARS.CONTACT_NOTIFICATION_TO;
    process.env.CONTACT_FROM_EMAIL = EMAIL_VARS.CONTACT_FROM_EMAIL;
    // RESEND_API_KEY ausente
    expect(isEmailNotificationAvailable()).toBe(false);
    expect(isResendAvailable()).toBe(false);
  });

  it('Resend NO disponible si falta CONTACT_NOTIFICATION_TO', () => {
    process.env.RESEND_API_KEY = EMAIL_VARS.RESEND_API_KEY;
    process.env.CONTACT_FROM_EMAIL = EMAIL_VARS.CONTACT_FROM_EMAIL;
    // CONTACT_NOTIFICATION_TO ausente
    expect(isEmailNotificationAvailable()).toBe(false);
  });

  it('Resend NO disponible si falta CONTACT_FROM_EMAIL', () => {
    process.env.RESEND_API_KEY = EMAIL_VARS.RESEND_API_KEY;
    process.env.CONTACT_NOTIFICATION_TO = EMAIL_VARS.CONTACT_NOTIFICATION_TO;
    // CONTACT_FROM_EMAIL ausente
    expect(isEmailNotificationAvailable()).toBe(false);
  });
});
