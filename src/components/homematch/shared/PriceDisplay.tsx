import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  amount: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({ amount, label, size = 'md', className }: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-bold',
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <span className={cn('font-semibold', sizeClasses[size])}>{formatted}</span>
    </div>
  );
}

interface PriceRangeDisplayProps {
  low: number;
  high: number;
  label?: string;
  className?: string;
}

export function PriceRangeDisplay({ low, high, label, className }: PriceRangeDisplayProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className={cn('flex flex-col', className)}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <span className="font-semibold">
        {fmt(low)} – {fmt(high)}
      </span>
    </div>
  );
}
