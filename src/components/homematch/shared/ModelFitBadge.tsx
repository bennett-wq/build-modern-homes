import { cn } from '@/lib/utils';

interface ModelFitBadgeProps {
  fittingCount: number;
  className?: string;
}

export function ModelFitBadge({ fittingCount, className }: ModelFitBadgeProps) {
  const config = fittingCount >= 3
    ? { bg: 'bg-green-100', text: 'text-green-800', label: `${fittingCount} models fit` }
    : fittingCount >= 1
      ? { bg: 'bg-yellow-100', text: 'text-yellow-800', label: `${fittingCount} model${fittingCount > 1 ? 's' : ''} fit` }
      : { bg: 'bg-red-100', text: 'text-red-700', label: 'No models fit' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}
