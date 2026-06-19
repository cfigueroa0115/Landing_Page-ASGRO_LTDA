'use client';

import { motion } from 'framer-motion';
import type { AnimatedSectionProps } from '@/types';

/**
 * AnimatedSection — Framer Motion viewport animation wrapper.
 *
 * Triggers entrance animations when the element scrolls into view.
 * Supports directional entrance (up, down, left, right) with configurable
 * delay and viewport threshold via Intersection Observer.
 */
export default function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = 'up',
  threshold = 0.2,
}: AnimatedSectionProps) {
  // Convert delay from milliseconds to seconds for Framer Motion
  const delayInSeconds = delay / 1000;

  // Build initial animation state based on direction
  const getInitialState = () => {
    switch (direction) {
      case 'up':
        return { y: 30, opacity: 0 };
      case 'down':
        return { y: -30, opacity: 0 };
      case 'left':
        return { x: -30, opacity: 0 };
      case 'right':
        return { x: 30, opacity: 0 };
      default:
        return { y: 30, opacity: 0 };
    }
  };

  // Target (visible) animation state
  const getAnimateState = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { y: 0, opacity: 1 };
      case 'left':
      case 'right':
        return { x: 0, opacity: 1 };
      default:
        return { y: 0, opacity: 1 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitialState()}
      whileInView={getAnimateState()}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
        delay: delayInSeconds,
        staggerChildren: 0.1,
      }}
    >
      {children}
    </motion.div>
  );
}
