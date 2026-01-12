import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Lot, LotPolygonPoint, LotStatus } from '@/data/lots/grand-haven';

interface FixedSitePlanViewerProps {
  sitePlanImagePath: string;
  lots: Lot[];
  onSelectLot: (lot: Lot | null) => void;
  selectedLotId: number | null;
  hoveredLotId?: number | null;
  onHoverLot?: (lotId: number | null) => void;
  className?: string;
}

const STATUS_COLORS: Record<LotStatus, { fill: string; stroke: string; hoverFill: string }> = {
  available: {
    fill: 'rgba(34, 197, 94, 0.15)',
    stroke: 'rgb(34, 197, 94)',
    hoverFill: 'rgba(34, 197, 94, 0.35)',
  },
  reserved: {
    fill: 'rgba(245, 158, 11, 0.15)',
    stroke: 'rgb(245, 158, 11)',
    hoverFill: 'rgba(245, 158, 11, 0.35)',
  },
  sold: {
    fill: 'rgba(156, 163, 175, 0.1)',
    stroke: 'rgb(156, 163, 175)',
    hoverFill: 'rgba(156, 163, 175, 0.2)',
  },
};

const STATUS_LABELS: Record<LotStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
};

export function FixedSitePlanViewer({
  sitePlanImagePath,
  lots,
  onSelectLot,
  selectedLotId,
  hoveredLotId: externalHoveredId,
  onHoverLot,
  className,
}: FixedSitePlanViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalHoveredLotId, setInternalHoveredLotId] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // Use external hover state if provided, otherwise internal
  const hoveredLotId = externalHoveredId !== undefined ? externalHoveredId : internalHoveredLotId;

  const hoveredLot = lots.find(l => l.id === hoveredLotId);

  const getPolygonPoints = useCallback((polygon: LotPolygonPoint[]) => {
    if (polygon.length < 3) return '';
    return polygon.map(p => `${p.x},${p.y}`).join(' ');
  }, []);

  const handleLotClick = useCallback((lot: Lot) => {
    onSelectLot(lot);
  }, [onSelectLot]);

  const handleLotHover = useCallback((lotId: number | null, event?: React.MouseEvent) => {
    if (onHoverLot) {
      onHoverLot(lotId);
    } else {
      setInternalHoveredLotId(lotId);
    }
    
    if (event && lotId !== null) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
        });
      }
    } else {
      setTooltipPosition(null);
    }
  }, [onHoverLot]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (hoveredLotId !== null) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
        });
      }
    }
  }, [hoveredLotId]);

  // Prevent any touch gestures from causing zoom/pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventGestures = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', preventGestures, { passive: false });
    container.addEventListener('touchmove', preventGestures, { passive: false });

    return () => {
      container.removeEventListener('touchstart', preventGestures);
      container.removeEventListener('touchmove', preventGestures);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden bg-muted select-none touch-none',
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Fixed aspect ratio container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Image wrapper with preserved aspect ratio */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}

          {/* Site Plan Image */}
          <img
            src={sitePlanImagePath}
            alt="Site Plan"
            className={cn(
              'max-w-full max-h-full object-contain transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            draggable={false}
          />

          {/* SVG Overlay - positioned over the image */}
          {imageLoaded && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              style={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
              }}
            >
              {lots.map(lot => {
                if (lot.polygon.length < 3) return null;
                
                const colors = STATUS_COLORS[lot.status];
                const isSelected = lot.id === selectedLotId;
                const isHovered = lot.id === hoveredLotId;
                const isDisabled = lot.status === 'sold';

                return (
                  <polygon
                    key={lot.id}
                    points={getPolygonPoints(lot.polygon)}
                    fill={isSelected || isHovered ? colors.hoverFill : colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? 0.4 : isHovered ? 0.3 : 0.15}
                    className={cn(
                      'pointer-events-auto transition-all duration-200',
                      isDisabled ? 'cursor-default' : 'cursor-pointer'
                    )}
                    onClick={() => handleLotClick(lot)}
                    onMouseEnter={(e) => handleLotHover(lot.id, e)}
                    onMouseLeave={() => handleLotHover(null)}
                  />
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredLot && tooltipPosition && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
              <p className="text-sm font-medium text-foreground">{hoveredLot.label}</p>
              <p className={cn(
                'text-xs',
                hoveredLot.status === 'available' && 'text-green-600',
                hoveredLot.status === 'reserved' && 'text-amber-600',
                hoveredLot.status === 'sold' && 'text-muted-foreground'
              )}>
                {STATUS_LABELS[hoveredLot.status]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
