'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
import { contactSchema, type ContactFormData } from '@/lib/validations/contact';

/** Opciones del dropdown de servicio de interés */
const serviceOptions = [
  { value: 'arl', label: 'ARL' },
  { value: 'sst', label: 'SST' },
  { value: 'seguros', label: 'Seguros empresariales a la medida' },
  { value: 'bienestar', label: 'Bienestar' },
] as const;

export default function ContactSection() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      company: '',
      position: '',
      phone: '',
      email: '',
      city: '',
      serviceOfInterest: undefined,
      message: '',
      dataAcceptance: false,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
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
                {...register('fullName')}
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
                  ¡Mensaje enviado exitosamente! Nos comunicaremos con usted pronto.
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
              disabled={isSubmitting}
              className="w-full rounded-btn"
              aria-disabled={isSubmitting}
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
    </section>
  );
}
