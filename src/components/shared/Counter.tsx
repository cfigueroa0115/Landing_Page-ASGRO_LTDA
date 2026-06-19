'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { formatNumber } from '@/lib/utils/format';

/** Props del componente Counter — contador numérico animado */
interface CounterProps {
  /** Valor objetivo al que se incrementa el contador */
  target: number;
  /** Duración de la animación en milisegundos (1500-2500, por defecto 2000) */
  duration?: number;
  /** Clases CSS adicionales */
  className?: string;
  /** Sufijo mostrado después del número (ej: "%", "+") */
  suffix?: string;
  /** Prefijo mostrado antes del número (ej: "+", "$") */
  prefix?: string;
}

/**
 * Counter — Contador numérico animado.
 *
 * Incrementa desde 0 hasta el valor objetivo usando requestAnimationFrame
 * para una animación fluida. Se activa una sola vez cuando el componente
 * entra en el viewport (25% visible) usando Intersection Observer via
 * framer-motion useInView.
 *
 * Los números se formatean usando la convención colombiana (es-CO):
 * Ejemplo: 1000 → "1.000"
 */
export default function Counter({
  target,
  duration = 2000,
  className,
  suffix = '',
  prefix = '',
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only trigger once per page load
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration at the end
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(easedProgress * target);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Ensure we land exactly on the target
        setDisplayValue(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}
