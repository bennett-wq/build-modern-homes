// Schematic regional map panel for Communities discovery.
// NOTE: Marker positions are schematic (state-level), not parcel-accurate.
// Will upgrade to live Mapbox once verified coordinates land.

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Development } from '@/data/developments';

export interface MapCommunity {
  slug: string;
  name: string;
  city: string;
  state: string;
  status: Development['status'];
}

interface CommunityMapPanelProps {
  communities: MapCommunity[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  className?: string;
}

// Approximate state centroid coordinates (lng, lat). Schematic only.
const STATE_CENTROIDS: Record<string, [number, number]> = {
  Michigan: [-84.5, 43.3],
  Florida: [-81.7, 27.8],
  Illinois: [-89.0, 40.0],
  Ohio: [-82.9, 40.3],
  Indiana: [-86.1, 39.9],
  Wisconsin: [-89.6, 44.5],
  Georgia: [-83.4, 32.6],
  Texas: [-99.0, 31.5],
  California: [-119.4, 36.7],
  'New York': [-75.5, 42.9],
};

// Continental-US bounds for a clean equirectangular projection into viewBox.
const BOUNDS = { minLng: -125, maxLng: -66, minLat: 24, maxLat: 50 };
const VIEW_W = 1000;
const VIEW_H = 600;

function project(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * VIEW_W;
  const y = VIEW_H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VIEW_H;
  return { x, y };
}

// Tiny offset so multiple communities in the same state don't stack perfectly.
function jitter(slug: string): { dx: number; dy: number } {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return {
    dx: ((h % 40) - 20),
    dy: (((h >> 8) % 40) - 20),
  };
}

export function CommunityMapPanel({
  communities,
  selectedSlug,
  onSelect,
  className,
}: CommunityMapPanelProps) {
  const markers = useMemo(() => {
    return communities
      .map((c) => {
        const center = STATE_CENTROIDS[c.state];
        if (!center) return null;
        const { x, y } = project(center[0], center[1]);
        const j = jitter(c.slug);
        return { ...c, x: x + j.dx, y: y + j.dy };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [communities]);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-border bg-secondary',
        className,
      )}
    >
      {/* Schematic disclosure */}
      <div className="absolute left-3 top-3 z-10 rounded-md border border-border/60 bg-background/85 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
        Regional view · schematic
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="block h-full w-full"
        role="img"
        aria-label="Schematic regional map of BaseMod communities"
      >
        <defs>
          <pattern id="cmp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </pattern>
          <radialGradient id="cmp-bg" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="hsl(var(--background))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </radialGradient>
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="url(#cmp-bg)" />
        <rect width={VIEW_W} height={VIEW_H} fill="url(#cmp-grid)" />

        {/* Stylized continental footprint */}
        <path
          d="M 80 240 Q 180 180 300 200 T 540 180 Q 700 170 820 210 Q 900 240 920 320 Q 880 410 760 440 Q 600 470 440 460 Q 280 450 180 410 Q 90 360 80 240 Z"
          fill="hsl(var(--muted))"
          opacity="0.55"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* Markers */}
        {markers.map((m) => {
          const isSelected = m.slug === selectedSlug;
          const isActive = m.status === 'active';
          const fill = isActive ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))';
          const labelW = Math.max(80, m.name.length * 7.5 + 18);
          return (
            <g
              key={m.slug}
              role="button"
              tabIndex={0}
              aria-label={`${m.name}, ${m.state}${isActive ? ' (active)' : ' (coming soon)'}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(m.slug)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(m.slug);
                }
              }}
              className="cursor-pointer outline-none [&:focus-visible_circle.cmp-pin]:stroke-ring"
            >
              {/* Larger transparent hit-area for easier tap/click */}
              <circle cx={m.x} cy={m.y} r={26} fill="transparent" />
              {isSelected && (
                <circle
                  cx={m.x}
                  cy={m.y}
                  r={22}
                  fill="hsl(var(--accent))"
                  opacity="0.18"
                  className="animate-pulse"
                />
              )}
              <circle
                className="cmp-pin transition-all"
                cx={m.x}
                cy={m.y}
                r={isSelected ? 11 : 8}
                fill={fill}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
              {isActive && (
                <circle cx={m.x} cy={m.y} r={3} fill="hsl(var(--background))" />
              )}
              {/* Name pill */}
              <g transform={`translate(${m.x + 14}, ${m.y - 12})`}>
                <rect
                  width={labelW}
                  height={22}
                  rx={11}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--border))"
                  strokeWidth={isSelected ? 1.5 : 1}
                  opacity={0.95}
                />
                <text
                  x={labelW / 2}
                  y={15}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="12
                  fontWeight={isSelected ? 600 : 500}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {m.name}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-md border border-border/60 bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground" />
          Coming soon
        </span>
      </div>
    </div>
  );
}

export default CommunityMapPanel;
