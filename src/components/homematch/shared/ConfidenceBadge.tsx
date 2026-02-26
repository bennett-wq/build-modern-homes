import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  confidence: string;
  className?: string;
}

const confidenceConfig: Record<string, { emoji: string; label: string; color: string }> = {
  verified: { emoji: '🟢', label: 'Verified', color: 'text-green-700' },
  ai_parsed: { emoji: '🟡', label: 'AI-Parsed', color: 'text-yellow-700' },
  incomplete: { emoji: '🔴', label: 'Incomplete', color: 'text-red-700' },
  not_started: { emoji: '⬜', label: 'Not Available', color: 'text-gray-500' },
};

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const config = confidenceConfig[confidence] || confidenceConfig.not_started;

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', config.color, className)}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
