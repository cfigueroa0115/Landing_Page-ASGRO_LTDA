'use client';

import { HelpCircle, Shield, Clock, CheckCircle } from 'lucide-react';

export default function QuoteSidebar() {
  return (
    <aside className="space-y-3" aria-label="Ayuda para la cotización">
      {/* How it works */}
      <div className="bg-brand-light-gray rounded-card p-3 border border-gray-100">
        <div className="flex items-center gap-1 mb-2">
          <HelpCircle className="h-[20px] w-[20px] text-brand-blue" />
          <h3 className="font-bold text-brand-dark-blue">
            ¿Cómo funciona?
          </h3>
        </div>
        <ol className="space-y-1 text-sm text-gray-600">
          <li className="flex items-start gap-1">
            <span className="flex-shrink-0 font-bold text-brand-green">1.</span>
            Complete el formulario con los datos de su empresa.
          </li>
          <li className="flex items-start gap-1">
            <span className="flex-shrink-0 font-bold text-brand-green">2.</span>
            Nuestro equipo analiza su información y perfil de riesgo.
          </li>
          <li className="flex items-start gap-1">
            <span className="flex-shrink-0 font-bold text-brand-green">3.</span>
            Le enviamos una propuesta personalizada sin compromiso.
          </li>
        </ol>
      </div>

      {/* What we need */}
      <div className="bg-brand-light-gray rounded-card p-3 border border-gray-100">
        <div className="flex items-center gap-1 mb-2">
          <Shield className="h-[20px] w-[20px] text-brand-blue" />
          <h3 className="font-bold text-brand-dark-blue">
            Datos importantes
          </h3>
        </div>
        <ul className="space-y-0.5 text-sm text-gray-600">
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            NIT de la empresa (para identificación)
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Número aproximado de trabajadores
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Actividad económica principal
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Servicio o seguro requerido
          </li>
        </ul>
      </div>

      {/* Response time */}
      <div className="bg-brand-light-gray rounded-card p-3 border border-gray-100">
        <div className="flex items-center gap-1 mb-2">
          <Clock className="h-[20px] w-[20px] text-brand-blue" />
          <h3 className="font-bold text-brand-dark-blue">
            Tiempo de respuesta
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Nuestro equipo revisará su solicitud y le contactará en horario
          laboral para presentarle la propuesta.
        </p>
      </div>

      {/* Guarantees */}
      <div className="bg-brand-light-gray rounded-card p-3 border border-gray-100">
        <div className="flex items-center gap-1 mb-2">
          <CheckCircle className="h-[20px] w-[20px] text-brand-green" />
          <h3 className="font-bold text-brand-dark-blue">
            Sin compromiso
          </h3>
        </div>
        <ul className="space-y-0.5 text-sm text-gray-600">
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Cotización gratuita
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Sin obligación de compra
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Propuesta adaptada a su empresa
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Sus datos protegidos según la ley
          </li>
        </ul>
      </div>
    </aside>
  );
}
