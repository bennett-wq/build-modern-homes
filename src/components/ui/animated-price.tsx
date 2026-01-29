// ============================================================================
// AnimatedPrice Component
// Odometer-style animated price counter for smooth number transitions
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedPriceProps {
  value: number;
  className?: string;
  prefix?: string;
  duration?: number;
  showCents?: boolean;
}

export function AnimatedPrice({
  value,
  className,
  prefix = '$',
  duration = 0.5,
  showCents = false,
}: AnimatedPriceProps) {
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) =>
    showCents
      ? current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(current).toLocaleString('en-US')
  );

  const [displayValue, setDisplayValue] = useState(
    showCents
      ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value.toLocaleString('en-US')
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on('change', (latest) => {
      setDisplayValue(latest);
    });
  }, [display]);

  return (
    <span className={cn('tabular-nums font-semibold', className)}>
      {prefix}
      <motion.span>{displayValue}</motion.span>
    </span>
  );
}

// Simplified version for smaller price displays
export function AnimatedPriceCompact({
  value,
  className,
  prefix = '$',
}: Omit<AnimatedPriceProps, 'duration' | 'showCents'>) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      // Animate from previous to new value
      const startValue = prevValue.current;
      const endValue = value;
      const startTime = performance.now();
      const animDuration = 400;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animDuration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const current = startValue + (endValue - startValue) * eased;
        setDisplayValue(Math.round(current));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
      prevValue.current = value;
    }
  }, [value]);

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{displayValue.toLocaleString('en-US')}
    </span>
  );
}
