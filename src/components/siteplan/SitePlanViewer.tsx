import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Lot, LotStatus } from '@/data/lots/grand-haven';

interface SitePlanViewerProps {
  sitePlanImagePath: string;
  lots: Lot[];
  onSelectLot: (lot: Lot | null) => void;
  selectedLotId: number | null;
  className?: string;
}

const STATUS_COLORS: Record<LotStatus, { fill: string; stroke: string; label: string }> = {
  available: { 
    fill: 'rgba(34, 197, 94, 0.25)', 
    stroke: 'rgb(34, 197, 94)', 
    label: 'Available' 
  },
  reserved: { 
    fill: 'rgba(251, 191, 36, 0.25)', 
    stroke: 'rgb(251, 191, 36)', 
    label: 'Reserved' 
  },
  sold: { 
    fill: 'rgba(156, 163, 175, 0.25)', 
    stroke: 'rgb(156, 163, 175)', 
    label: 'Sold' 
  },
};

export function SitePlanViewer({
  sitePlanImagePath,
  lots,
  onSelectLot,
  selectedLotId,
  className,
}: SitePlanViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredLotId, setHoveredLotId] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;
  const ZOOM_STEP = 0.25;

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + ZOOM_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - ZOOM_STEP, MIN_SCALE));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale(prev => Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE));
  }, []);

  // Pan handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
    // Update tooltip position
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handling for mobile
  const [lastTouchDist, setLastTouchDist] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDist(dist);
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStart) {
      setPosition({
        x: e.touches[0].clientX - touchStart.x,
        y: e.touches[0].clientY - touchStart.y,
      });
    } else if (e.touches.length === 2 && lastTouchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleDelta = (dist - lastTouchDist) * 0.01;
      setScale(prev => Math.min(Math.max(prev + scaleDelta, MIN_SCALE), MAX_SCALE));
      setLastTouchDist(dist);
    }
  }, [touchStart, lastTouchDist]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    setLastTouchDist(null);
  }, []);

  // Convert polygon points to SVG path
  const getPolygonPath = (polygon: { x: number; y: number }[]) => {
    if (polygon.length < 3) return '';
    return polygon.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ') + ' Z';
  };

  const handleLotClick = (lot: Lot, e: React.MouseEvent) => {
    e.stopPropagation();
    if (lot.status !== 'sold') {
      onSelectLot(selectedLotId === lot.id ? null : lot);
    }
  };

  return (
    <div className={cn('relative overflow-hidden bg-muted rounded-lg', className)}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="shadow-md bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="shadow-md bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleReset}
          className="shadow-md bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <p className="text-xs font-medium text-foreground mb-2">Legend</p>
        <div className="flex flex-col gap-1.5">
          {Object.entries(STATUS_COLORS).map(([status, { stroke, label }]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm border-2"
                style={{ borderColor: stroke, backgroundColor: `${stroke}40` }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className={cn(
          'relative w-full h-full cursor-grab',
          isDragging && 'cursor-grabbing'
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative origin-center transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {/* Site Plan Image */}
          <img
            src={sitePlanImagePath}
            alt="Site Plan"
            className="max-w-none select-none"
            draggable={false}
          />

          {/* SVG Overlay for Lot Polygons */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {lots
              .filter(lot => lot.polygon.length >= 3)
              .map(lot => {
                const isSelected = selectedLotId === lot.id;
                const isHovered = hoveredLotId === lot.id;
                const colors = STATUS_COLORS[lot.status];
                const isSold = lot.status === 'sold';

                return (
                  <path
                    key={lot.id}
                    d={getPolygonPath(lot.polygon)}
                    fill={isSelected ? colors.stroke + '40' : colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={isSelected || isHovered ? '0.3' : '0.15'}
                    className={cn(
                      'pointer-events-auto transition-all duration-200',
                      !isSold && 'cursor-pointer',
                      isSold && 'opacity-60'
                    )}
                    style={{
                      filter: isHovered && !isSold ? 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' : undefined,
                    }}
                    onMouseEnter={() => setHoveredLotId(lot.id)}
                    onMouseLeave={() => setHoveredLotId(null)}
                    onClick={(e) => handleLotClick(lot, e)}
                  />
                );
              })}
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredLotId && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-50 px-3 py-2 bg-foreground text-background rounded-md shadow-lg text-sm pointer-events-none"
            style={{
              left: tooltipPos.x + 15,
              top: tooltipPos.y + 15,
            }}
          >
            {(() => {
              const lot = lots.find(l => l.id === hoveredLotId);
              if (!lot) return null;
              return (
                <div>
                  <p className="font-medium">{lot.label}</p>
                  <p className="text-xs opacity-80">
                    {STATUS_COLORS[lot.status].label}
                    {lot.acreage && ` • ${lot.acreage} ac`}
                  </p>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
