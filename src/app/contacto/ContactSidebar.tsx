'use client';

import { useState, useEffect } from 'react';
import { Clock, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import { getWhatsAppNumber } from '@/lib/utils/constants';
import PremiumButton from '@/components/shared/PremiumButton';
import type { TimeResponse } from '@/types';

export default function ContactSidebar() {
  const [timeData, setTimeData] = useState<TimeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTime() {
      try {
        const res = await fetch('/api/time');
        if (res.ok) {
          const data: TimeResponse = await res.json();
          setTimeData(data);
        }
      } catch {
        // Silently fail — sidebar shows fallback
      } finally {
        setLoading(false);
      }
    }
    fetchTime();
  }, []);

  const whatsappNumber = getWhatsAppNumber();
  const whatsappUrl = whatsappNumber
    ? generateWhatsAppUrl(whatsappNumber, 'Hola, me gustaría recibir asesoría de ASGRO.')
    : '';

  return (
    <aside className="space-y-3" aria-label="Información adicional de contacto">
      {/* Time / Availability status */}
      <div className="bg-brand-light-gray rounded-card p-3 border border-gray-100">
        <div className="flex items-center gap-1 mb-2">
          <Clock className="h-[20px] w-[20px] text-brand-blue" />
          <h3 className="font-bold text-brand-dark-blue">Estado de atención</h3>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ) : timeData ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {timeData.isBusinessHours ? (
                <Wifi className="h-[16px] w-[16px] text-green-500" />
              ) : (
                <WifiOff className="h-[16px] w-[16px] text-orange-500" />
              )}
              <span
                className={cn(
                  'text-sm font-semibold',
                  timeData.isBusinessHours ? 'text-green-700' : 'text-orange-700'
                )}
              >
                {timeData.availabilityStatus}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {timeData.dayOfWeek}, {timeData.time}
            </p>
            <p className="text-xs text-gray-500">
              Zona horaria: {timeData.timezone}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Horario de atención: lunes a viernes, jornada laboral.
          </p>
        )}
      </div>

      {/* WhatsApp CTA */}
      {whatsappUrl && (
        <div className="bg-green-50 rounded-card p-3 border border-green-200">
          <div className="flex items-center gap-1 mb-1">
            <MessageCircle className="h-[20px] w-[20px] text-green-600" />
            <h3 className="font-bold text-brand-dark-blue">WhatsApp</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            ¿Prefiere una respuesta rápida? Escríbanos por WhatsApp y le
            atenderemos a la brevedad.
          </p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <PremiumButton variant="whatsapp" size="sm" className="w-full">
              Escribir por WhatsApp
            </PremiumButton>
          </a>
        </div>
      )}

      {/* Quick info */}
      <div className="bg-brand-light-gray rounded-card p-3 border border-gray-100">
        <h3 className="font-bold text-brand-dark-blue mb-1">
          ¿Qué puede esperar?
        </h3>
        <ul className="space-y-0.5 text-sm text-gray-600">
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Respuesta en horario laboral
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Asesoría personalizada sin compromiso
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-[6px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-green" />
            Información clara y transparente
          </li>
        </ul>
      </div>
    </aside>
  );
}
