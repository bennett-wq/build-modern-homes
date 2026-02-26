import { cn } from '@/lib/utils';

interface ActionBadgeProps {
  action: string;
  className?: string;
}

const actionConfig: Record<string, { label: string; bg: string; text: string }> = {
  acquire_direct: { label: 'Acquire Direct', bg: 'bg-purple-100', text: 'text-purple-800' },
  contact_seller: { label: 'Contact Seller', bg: 'bg-blue-100', text: 'text-blue-800' },
  monitor: { label: 'Monitor', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  pass: { label: 'Pass', bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function ActionBadge({ action, className }: ActionBadgeProps) {
  const config = actionConfig[action] || actionConfig.pass;

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
