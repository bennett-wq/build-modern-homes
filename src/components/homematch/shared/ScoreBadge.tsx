import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-500' };
  if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-500' };
  if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-500' };
  return { bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-400' };
}

export function ScoreBadge({ score, size = 'md', className }: ScoreBadgeProps) {
  const colors = getScoreColor(score);
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-lg font-bold',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center ring-2',
        colors.bg,
        colors.text,
        colors.ring,
        sizeClasses[size],
        className
      )}
    >
      {score}
    </div>
  );
}
