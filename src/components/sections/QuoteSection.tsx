'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quoteSchema, type QuoteFormData } from '@/lib/validations/quote';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AnimatedSection from '@/components/shared/AnimatedSection';

/** Opciones del dropdown de servicio requerido */
const SERVICE_OPTIONS = [
  { value: 'arl', label: 'ARL' },
  { value: 'sst', label: 'SST' },
  { value: 'seguros', label: 'Seguros empresariales a la medida' },
  { value: 'bienestar', label: 'Bienestar laboral' },
] as const;

/**
 * QuoteSection — Formulario de cotización con validación Zod + React Hook Form.
 * Campos expandidos, etiquetas y mensajes de error en español.
 * POST a /api/quote con confirmación de éxito y manejo de errores.
 */
export default function QuoteSection() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      companyName: '',
      nit: '',
      contactName: '',
      position: '',
      phone: '',
      email: '',
      city: '',
      economicActivity: '',
      employeeCount: undefined as unknown as number,
      serviceRequired: undefined as unknown as QuoteFormData['serviceRequired'],
      currentArl: '',
      comments: '',
      dataAcceptance: false,
    },
  });

  const onSubmit = async (data: QuoteFormData) => {
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/quote', {
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
          errorData?.error || 'Ocurrió un error al enviar la cotización. Intente nuevamente.'
        );
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
    }
  };

  return (
    <section id="cotizar" className="py-10 bg-brand-light-gray" aria-labelledby="quote-heading">
      <div className="max-w-[900px] mx-auto px-2">
        <AnimatedSection direction="up" threshold={0.1}>
          <h2 id="quote-heading" className="text-h2 text-brand-dark-blue text-center mb-1">
            Solicitar Cotización
          </h2>
          <p className="text-body text-gray-600 text-center mb-4 max-w-[600px] mx-auto">
            Complete el formulario y nuestro equipo le enviará una propuesta personalizada.
          </p>

          {/* Mensaje de éxito */}
          {submitStatus === 'success' && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-3 p-2 bg-green-50 border border-green-300 text-green-800 rounded-input text-sm text-center"
            >
              ¡Su solicitud de cotización ha sido enviada exitosamente! Nos comunicaremos pronto.
            </div>
          )}

          {/* Mensaje de error general */}
          {submitStatus === 'error' && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-3 p-2 bg-red-50 border border-red-300 text-red-800 rounded-input text-sm text-center"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
            {/* Fila 1: Nombre de empresa + NIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="quote-companyName">Nombre de empresa *</Label>
                <Input
                  id="quote-companyName"
                  placeholder="Nombre de la empresa"
                  aria-invalid={!!errors.companyName}
                  aria-describedby={errors.companyName ? 'quote-companyName-error' : undefined}
                  {...register('companyName')}
                />
                {errors.companyName && (
                  <p id="quote-companyName-error" className="mt-0.5 text-small text-red-600">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="quote-nit">NIT *</Label>
                <Input
                  id="quote-nit"
                  placeholder="000000000-0"
                  aria-invalid={!!errors.nit}
                  aria-describedby={errors.nit ? 'quote-nit-error' : undefined}
                  {...register('nit')}
                />
                {errors.nit && (
                  <p id="quote-nit-error" className="mt-0.5 text-small text-red-600">
                    {errors.nit.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 2: Nombre de contacto + Cargo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="quote-contactName">Nombre de contacto *</Label>
                <Input
                  id="quote-contactName"
                  placeholder="Nombre completo del contacto"
                  aria-invalid={!!errors.contactName}
                  aria-describedby={errors.contactName ? 'quote-contactName-error' : undefined}
                  {...register('contactName')}
                />
                {errors.contactName && (
                  <p id="quote-contactName-error" className="mt-0.5 text-small text-red-600">
                    {errors.contactName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="quote-position">Cargo *</Label>
                <Input
                  id="quote-position"
                  placeholder="Cargo en la empresa"
                  aria-invalid={!!errors.position}
                  aria-describedby={errors.position ? 'quote-position-error' : undefined}
                  {...register('position')}
                />
                {errors.position && (
                  <p id="quote-position-error" className="mt-0.5 text-small text-red-600">
                    {errors.position.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 3: Teléfono + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="quote-phone">Teléfono *</Label>
                <Input
                  id="quote-phone"
                  type="tel"
                  placeholder="+573001234567"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'quote-phone-error' : undefined}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p id="quote-phone-error" className="mt-0.5 text-small text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="quote-email">Correo electrónico *</Label>
                <Input
                  id="quote-email"
                  type="email"
                  placeholder="correo@empresa.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'quote-email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="quote-email-error" className="mt-0.5 text-small text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 4: Ciudad + Actividad económica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="quote-city">Ciudad *</Label>
                <Input
                  id="quote-city"
                  placeholder="Ciudad"
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? 'quote-city-error' : undefined}
                  {...register('city')}
                />
                {errors.city && (
                  <p id="quote-city-error" className="mt-0.5 text-small text-red-600">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="quote-economicActivity">Actividad económica *</Label>
                <Input
                  id="quote-economicActivity"
                  placeholder="Sector o actividad económica"
                  aria-invalid={!!errors.economicActivity}
                  aria-describedby={errors.economicActivity ? 'quote-economicActivity-error' : undefined}
                  {...register('economicActivity')}
                />
                {errors.economicActivity && (
                  <p id="quote-economicActivity-error" className="mt-0.5 text-small text-red-600">
                    {errors.economicActivity.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 5: Número de trabajadores + Servicio requerido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="quote-employeeCount">Número aproximado de trabajadores *</Label>
                <Input
                  id="quote-employeeCount"
                  type="number"
                  min={1}
                  max={99999}
                  placeholder="Ej: 50"
                  aria-invalid={!!errors.employeeCount}
                  aria-describedby={errors.employeeCount ? 'quote-employeeCount-error' : undefined}
                  {...register('employeeCount', { valueAsNumber: true })}
                />
                {errors.employeeCount && (
                  <p id="quote-employeeCount-error" className="mt-0.5 text-small text-red-600">
                    {errors.employeeCount.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="quote-serviceRequired">Servicio o seguro requerido *</Label>
                <Controller
                  name="serviceRequired"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <SelectTrigger
                        id="quote-serviceRequired"
                        aria-invalid={!!errors.serviceRequired}
                        aria-describedby={errors.serviceRequired ? 'quote-serviceRequired-error' : undefined}
                      >
                        <SelectValue placeholder="Seleccione un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.serviceRequired && (
                  <p id="quote-serviceRequired-error" className="mt-0.5 text-small text-red-600">
                    {errors.serviceRequired.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 6: ARL actual (opcional) */}
            <div>
              <Label htmlFor="quote-currentArl">ARL actual (opcional)</Label>
              <Input
                id="quote-currentArl"
                placeholder="Nombre de la ARL actual"
                aria-invalid={!!errors.currentArl}
                aria-describedby={errors.currentArl ? 'quote-currentArl-error' : undefined}
                {...register('currentArl')}
              />
              {errors.currentArl && (
                <p id="quote-currentArl-error" className="mt-0.5 text-small text-red-600">
                  {errors.currentArl.message}
                </p>
              )}
            </div>

            {/* Fila 7: Comentarios adicionales (opcional) */}
            <div>
              <Label htmlFor="quote-comments">Comentarios adicionales (opcional)</Label>
              <textarea
                id="quote-comments"
                rows={4}
                placeholder="Información adicional sobre sus necesidades"
                className="flex w-full rounded-input border border-gray-300 bg-white px-2 py-1 text-body placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-y"
                aria-invalid={!!errors.comments}
                aria-describedby={errors.comments ? 'quote-comments-error' : undefined}
                {...register('comments')}
              />
              {errors.comments && (
                <p id="quote-comments-error" className="mt-0.5 text-small text-red-600">
                  {errors.comments.message}
                </p>
              )}
            </div>

            {/* Checkbox: Aceptación de datos */}
            <div className="flex items-start gap-1">
              <Controller
                name="dataAcceptance"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="quote-dataAcceptance"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={!!errors.dataAcceptance}
                    aria-describedby={errors.dataAcceptance ? 'quote-dataAcceptance-error' : undefined}
                  />
                )}
              />
              <div className="flex flex-col">
                <Label htmlFor="quote-dataAcceptance" className="cursor-pointer leading-tight">
                  Acepto el tratamiento de datos personales *
                </Label>
                {errors.dataAcceptance && (
                  <p id="quote-dataAcceptance-error" className="mt-0.5 text-small text-red-600">
                    {errors.dataAcceptance.message}
                  </p>
                )}
              </div>
            </div>

            {/* Botón de envío */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-4 py-1 bg-brand-blue text-white font-semibold rounded-btn shadow-btn hover:bg-brand-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px]"
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar cotización'}
              </button>
            </div>
          </form>
        </AnimatedSection>
      </div>
    </section>
  );
}
