'use client';

import { useCallback, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, CheckCircle, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { contactSchema, type ContactFormData } from '@/lib/validations/contact';

/** Opciones del dropdown de servicio de interés */
const serviceOptions = [
  { value: 'arl', label: 'ARL' },
  { value: 'sst', label: 'SST' },
  { value: 'seguros', label: 'Seguros empresariales a la medida' },
  { value: 'bienestar', label: 'Bienestar' },
] as const;

/**
 * Valores por defecto del formulario. Se reutilizan en el reset tras un envío
 * exitoso para dejar el estado internamente limpio (sin errores residuales).
 */
const CONTACT_DEFAULT_VALUES: ContactFormData = {
  fullName: '',
  company: '',
  position: '',
  phone: '',
  email: '',
  city: '',
  serviceOfInterest: undefined as unknown as ContactFormData['serviceOfInterest'],
  message: '',
  dataAcceptance: false,
};

export default function ContactSection() {
  // 'success' = registrado y notificado; 'received' = registrado sin notificación.
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'received' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Estado del receipt (confirmación premium) tras un envío exitoso.
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [receiptFirstName, setReceiptFirstName] = useState('');
  const [receiptNotified, setReceiptNotified] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullNameRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    clearErrors,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: CONTACT_DEFAULT_VALUES,
  });

  const { ref: fullNameFieldRef, ...fullNameField } = register('fullName');

  /**
   * Limpia por completo el estado del formulario tras un envío exitoso.
   * Corrige el bug de errores rojos residuales en Select/Checkbox: se resetea a
   * los valores por defecto SIN conservar errores/touched/dirty/isSubmitted, y
   * se limpian los errores de forma explícita. No usa CSS ni timeouts.
   */
  const clearFormState = useCallback(() => {
    reset(CONTACT_DEFAULT_VALUES, {
      keepErrors: false,
      keepDirty: false,
      keepTouched: false,
      keepIsSubmitted: false,
      keepSubmitCount: false,
    });
    clearErrors();
  }, [reset, clearErrors]);

  const onSubmit = async (data: ContactFormData) => {
    // Bloquear doble submit mientras hay un envío en curso o el receipt abierto.
    if (isSubmitting || receiptOpen) return;

    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // El registro quedó almacenado. Diferenciamos si además se notificó.
        const payload = await response.json().catch(() => null);
        const notified = payload?.notified === true;

        // Preparar el receipt con la referencia real devuelta por el servidor.
        setReference(typeof payload?.reference === 'string' ? payload.reference : null);
        setReceiptFirstName(data.fullName.trim().split(/\s+/)[0] ?? '');
        setReceiptNotified(notified);
        setCopied(false);

        // Estado inferior (mensaje verde) + receipt premium.
        setSubmitStatus(notified ? 'success' : 'received');
        // Limpieza total ANTES de abrir el receipt: sin errores residuales.
        clearFormState();
        setReceiptOpen(true);
      } else {
        const errorData = await response.json().catch(() => null);
        setSubmitStatus('error');
        setErrorMessage(
          errorData?.error || 'Ocurrió un error al enviar el formulario. Intente nuevamente.'
        );
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage(
        'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.'
      );
    }
  };

  /** Copia la referencia al portapapeles con feedback no intrusivo (fallback seguro). */
  const handleCopyReference = useCallback(async () => {
    if (!reference) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reference);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Clipboard no disponible: el receipt sigue funcionando; no se bloquea nada.
    }
  }, [reference]);

  /**
   * "Enviar otra solicitud": cierra el receipt, elimina el mensaje verde,
   * limpia referencia/nombre, garantiza formulario vacío y devuelve el foco al
   * primer campo. Sin recarga de página.
   */
  const handleSendAnother = useCallback(() => {
    setReceiptOpen(false);
    setSubmitStatus('idle');
    setErrorMessage('');
    setReference(null);
    setReceiptFirstName('');
    setCopied(false);
    clearFormState();
    // Foco al primer campo tras cerrar el diálogo.
    window.setTimeout(() => {
      try {
        setFocus('fullName');
      } catch {
        fullNameRef.current?.focus();
      }
    }, 0);
  }, [clearFormState, setFocus]);

  return (
    <section
      id="contacto"
      className="py-10 md:py-12 bg-brand-light-gray"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-[800px] mx-auto px-2 md:px-3">
        <AnimatedSection>
          <div className="text-center mb-5">
            <h2
              id="contact-heading"
              className="text-h2 text-brand-dark-blue mb-2"
            >
              Contáctenos
            </h2>
            <p className="text-body-lg text-gray-600 max-w-[600px] mx-auto">
              Complete el formulario y nuestro equipo se comunicará con usted a la brevedad.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="bg-white rounded-card shadow-card p-3 md:p-4 space-y-2"
            aria-label="Formulario de contacto"
          >
            {/* Nombre completo */}
            <div className="space-y-0.5">
              <Label htmlFor="contact-fullName">Nombre completo *</Label>
              <Input
                id="contact-fullName"
                placeholder="Ingrese su nombre completo"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'contact-fullName-error' : undefined}
                {...fullNameField}
                ref={(el) => {
                  fullNameFieldRef(el);
                  fullNameRef.current = el;
                }}
              />
              {errors.fullName && (
                <p id="contact-fullName-error" className="text-sm text-red-600" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Empresa y Cargo - 2 columnas en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Empresa */}
              <div className="space-y-0.5">
                <Label htmlFor="contact-company">Empresa *</Label>
                <Input
                  id="contact-company"
                  placeholder="Nombre de la empresa"
                  aria-invalid={!!errors.company}
                  aria-describedby={errors.company ? 'contact-company-error' : undefined}
                  {...register('company')}
                />
                {errors.company && (
                  <p id="contact-company-error" className="text-sm text-red-600" role="alert">
                    {errors.company.message}
                  </p>
                )}
              </div>

              {/* Cargo */}
              <div className="space-y-0.5">
                <Label htmlFor="contact-position">Cargo *</Label>
                <Input
                  id="contact-position"
                  placeholder="Su cargo en la empresa"
                  aria-invalid={!!errors.position}
                  aria-describedby={errors.position ? 'contact-position-error' : undefined}
                  {...register('position')}
                />
                {errors.position && (
                  <p id="contact-position-error" className="text-sm text-red-600" role="alert">
                    {errors.position.message}
                  </p>
                )}
              </div>
            </div>

            {/* Teléfono y Email - 2 columnas en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Teléfono */}
              <div className="space-y-0.5">
                <Label htmlFor="contact-phone">Teléfono *</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="Ej: 3001234567"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p id="contact-phone-error" className="text-sm text-red-600" role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-0.5">
                <Label htmlFor="contact-email">Correo electrónico *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="contact-email-error" className="text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Ciudad y Servicio de interés - 2 columnas en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Ciudad */}
              <div className="space-y-0.5">
                <Label htmlFor="contact-city">Ciudad *</Label>
                <Input
                  id="contact-city"
                  placeholder="Ciudad de ubicación"
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? 'contact-city-error' : undefined}
                  {...register('city')}
                />
                {errors.city && (
                  <p id="contact-city-error" className="text-sm text-red-600" role="alert">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* Servicio de interés (dropdown) */}
              <div className="space-y-0.5">
                <Label htmlFor="contact-serviceOfInterest">Servicio de interés *</Label>
                <Controller
                  name="serviceOfInterest"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="contact-serviceOfInterest"
                        aria-invalid={!!errors.serviceOfInterest}
                        aria-describedby={
                          errors.serviceOfInterest ? 'contact-serviceOfInterest-error' : undefined
                        }
                      >
                        <SelectValue placeholder="Seleccione un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.serviceOfInterest && (
                  <p
                    id="contact-serviceOfInterest-error"
                    className="text-sm text-red-600"
                    role="alert"
                  >
                    {errors.serviceOfInterest.message}
                  </p>
                )}
              </div>
            </div>

            {/* Mensaje */}
            <div className="space-y-0.5">
              <Label htmlFor="contact-message">Mensaje *</Label>
              <textarea
                id="contact-message"
                className="flex min-h-[120px] w-full rounded-input border border-gray-300 bg-white px-2 py-1 text-body ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-y"
                placeholder="Describa brevemente su consulta o necesidad"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                {...register('message')}
              />
              {errors.message && (
                <p id="contact-message-error" className="text-sm text-red-600" role="alert">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Checkbox tratamiento de datos */}
            <div className="space-y-0.5">
              <div className="flex items-start gap-1">
                <Controller
                  name="dataAcceptance"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="contact-dataAcceptance"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={!!errors.dataAcceptance}
                      aria-describedby={
                        errors.dataAcceptance ? 'contact-dataAcceptance-error' : undefined
                      }
                    />
                  )}
                />
                <Label
                  htmlFor="contact-dataAcceptance"
                  className="text-sm text-gray-700 leading-tight cursor-pointer"
                >
                  Acepto el tratamiento de datos personales *
                </Label>
              </div>
              {errors.dataAcceptance && (
                <p
                  id="contact-dataAcceptance-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {errors.dataAcceptance.message}
                </p>
              )}
            </div>

            {/* Mensajes de estado */}
            {submitStatus === 'success' && (
              <div
                className="flex items-center gap-1 p-2 bg-green-50 border border-green-200 rounded-input text-green-700"
                role="status"
                aria-live="polite"
              >
                <CheckCircle className="h-[20px] w-[20px] shrink-0" />
                <p className="text-sm">
                  Solicitud registrada correctamente. Nuestro equipo se comunicará con usted a la brevedad.
                </p>
              </div>
            )}

            {submitStatus === 'received' && (
              <div
                className="flex items-center gap-1 p-2 bg-green-50 border border-green-200 rounded-input text-green-700"
                role="status"
                aria-live="polite"
              >
                <CheckCircle className="h-[20px] w-[20px] shrink-0" />
                <p className="text-sm">
                  Hemos recibido y registrado su solicitud. Nuestro equipo podrá gestionarla con la
                  información suministrada.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div
                className="flex items-center gap-1 p-2 bg-red-50 border border-red-200 rounded-input text-red-700"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-[20px] w-[20px] shrink-0" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Botón enviar */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || receiptOpen}
              className="w-full rounded-btn"
              aria-disabled={isSubmitting || receiptOpen}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-[20px] w-[20px] mr-1 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-[20px] w-[20px] mr-1" />
                  Enviar mensaje
                </>
              )}
            </Button>
          </form>
        </AnimatedSection>
      </div>

      {/* Receipt / confirmación premium tras un envío exitoso. Reutiliza el
          Dialog accesible del sistema (Radix: role=dialog, aria-modal, focus,
          Escape). Cerrar con X/Escape mantiene el mensaje verde inferior. */}
      <Dialog
        open={receiptOpen}
        onOpenChange={(open) => {
          if (!open) setReceiptOpen(false);
        }}
      >
        <DialogContent
          className="max-w-[440px]"
          aria-labelledby="contact-receipt-title"
          aria-describedby="contact-receipt-desc"
        >
          <DialogHeader>
            <div className="mx-auto mb-1 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand-green/15">
              <CheckCircle className="h-[28px] w-[28px] text-brand-green-alt" aria-hidden="true" />
            </div>
            <DialogTitle id="contact-receipt-title" className="text-center text-h3 text-brand-dark-blue">
              Solicitud recibida
            </DialogTitle>
            <DialogDescription id="contact-receipt-desc" className="text-center text-gray-600">
              {receiptFirstName ? `Gracias, ${receiptFirstName}. ` : 'Gracias. '}
              {receiptNotified
                ? 'Su mensaje fue registrado correctamente y enviado a nuestro equipo de atención.'
                : 'Su solicitud fue registrada correctamente. Nuestro equipo podrá gestionarla con la información suministrada.'}
            </DialogDescription>
          </DialogHeader>

          {reference && (
            <div className="my-1 rounded-card border border-gray-200 bg-brand-light-gray/60 px-3 py-2 text-center">
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-gray-500">
                Referencia
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold tracking-wide text-brand-dark-blue">
                {reference}
              </p>
              <p className="mt-1 text-caption text-gray-500">
                Conserve esta referencia para identificar su solicitud.
              </p>
            </div>
          )}

          <p className="text-center text-sm text-gray-600">
            Nuestro equipo revisará su solicitud y se comunicará con usted a través de los datos
            registrados.
          </p>

          {/* Feedback accesible de copia (no intrusivo). */}
          <p className="sr-only" role="status" aria-live="polite">
            {copied ? 'Referencia copiada' : ''}
          </p>

          <DialogFooter className="mt-1 gap-2 sm:gap-1">
            {reference && (
              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-btn border border-brand-blue/40 bg-white px-3 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                {copied ? (
                  <>
                    <Check className="h-[16px] w-[16px]" aria-hidden="true" />
                    Referencia copiada
                  </>
                ) : (
                  <>
                    <Copy className="h-[16px] w-[16px]" aria-hidden="true" />
                    Copiar referencia
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleSendAnother}
              className="inline-flex min-h-[44px] items-center justify-center rounded-btn bg-brand-green px-3 text-sm font-bold text-brand-dark-blue shadow-btn transition-colors hover:bg-brand-green-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              Enviar otra solicitud
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
