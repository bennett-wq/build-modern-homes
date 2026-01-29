import { cn } from "@/lib/utils";

interface DTIGaugeProps {
  value: number | null;
  label: string;
  threshold: number;
  description?: string;
}

export function DTIGauge({ value, label, threshold, description }: DTIGaugeProps) {
  const percentage = value ?? 0;
  const isHealthy = percentage <= threshold;
  const isWarning = percentage > threshold && percentage <= threshold + 5;
  const isDanger = percentage > threshold + 5;

  // Calculate rotation for the gauge needle (0-100 maps to -90 to 90 degrees)
  const rotation = Math.min(Math.max(percentage, 0), 100) * 1.8 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            {/* Gray background arc */}
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Colored progress arc */}
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke={
                isDanger
                  ? "hsl(0 84% 60%)"
                  : isWarning
                  ? "hsl(38 92% 50%)"
                  : "hsl(142 71% 45%)"
              }
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 141.37} 141.37`}
              className="transition-all duration-1000 ease-out"
            />
            {/* Threshold marker */}
            <line
              x1="50"
              y1="50"
              x2={50 + 40 * Math.cos((threshold * 1.8 - 90) * (Math.PI / 180))}
              y2={50 - 40 * Math.sin((threshold * 1.8 - 90) * (Math.PI / 180))}
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              strokeDasharray="2 2"
              opacity="0.3"
            />
          </svg>
        </div>
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-12 origin-bottom transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div
            className={cn(
              "w-1 h-10 rounded-full",
              isDanger
                ? "bg-destructive"
                : isWarning
                ? "bg-amber-500"
                : "bg-emerald-500"
            )}
          />
        </div>
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" />
      </div>

      {/* Value display */}
      <div className="mt-2 text-center">
        <div
          className={cn(
            "text-2xl font-bold tabular-nums",
            isDanger
              ? "text-destructive"
              : isWarning
              ? "text-amber-500"
              : "text-emerald-600"
          )}
        >
          {value !== null ? `${value.toFixed(1)}%` : "—"}
        </div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          Target: &lt;{threshold}%
        </div>
      </div>
    </div>
  );
}
