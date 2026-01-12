import { useState, useRef, useCallback, useEffect } from 'react';
import { Undo, Trash2, CheckCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Lot, LotPolygonPoint } from '@/data/lots/grand-haven';

interface FixedSitePlanEditorProps {
  sitePlanImagePath: string;
  initialLots: Lot[];
  onLotsChange?: (lots: Lot[]) => void;
  className?: string;
}

export function FixedSitePlanEditor({
  sitePlanImagePath,
  initialLots,
  onLotsChange,
  className,
}: FixedSitePlanEditorProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  
  const [lots, setLots] = useState<Lot[]>(initialLots);
  const [selectedLotId, setSelectedLotId] = useState<number>(1);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);

  const GRID_SIZE = 2; // 2% grid

  const selectedLot = lots.find(l => l.id === selectedLotId);

  // Update parent when lots change
  useEffect(() => {
    onLotsChange?.(lots);
  }, [lots, onLotsChange]);

  // Get image dimensions for proper overlay positioning
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  }, []);

  // Add point on click
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate click position relative to the image
    const clickX = e.clientX - imageRect.left;
    const clickY = e.clientY - imageRect.top;

    // Check if click is within image bounds
    if (clickX < 0 || clickX > imageRect.width || clickY < 0 || clickY > imageRect.height) {
      return;
    }

    // Convert to percentage
    let x = (clickX / imageRect.width) * 100;
    let y = (clickY / imageRect.height) * 100;

    if (snapToGrid) {
      x = Math.round(x / GRID_SIZE) * GRID_SIZE;
      y = Math.round(y / GRID_SIZE) * GRID_SIZE;
    }

    // Clamp values
    x = Math.max(0, Math.min(100, parseFloat(x.toFixed(2))));
    y = Math.max(0, Math.min(100, parseFloat(y.toFixed(2))));

    setLots(prev => prev.map(lot => {
      if (lot.id === selectedLotId) {
        return {
          ...lot,
          polygon: [...lot.polygon, { x, y }],
        };
      }
      return lot;
    }));
  }, [selectedLotId, snapToGrid]);

  const handleUndoPoint = useCallback(() => {
    setLots(prev => prev.map(lot => {
      if (lot.id === selectedLotId) {
        return {
          ...lot,
          polygon: lot.polygon.slice(0, -1),
        };
      }
      return lot;
    }));
  }, [selectedLotId]);

  const handleClearPolygon = useCallback(() => {
    setLots(prev => prev.map(lot => {
      if (lot.id === selectedLotId) {
        return { ...lot, polygon: [] };
      }
      return lot;
    }));
  }, [selectedLotId]);

  const handleClosePolygon = useCallback(() => {
    if (selectedLot && selectedLot.polygon.length >= 3) {
      toast({
        title: 'Polygon Closed',
        description: `${selectedLot.label} polygon has ${selectedLot.polygon.length} points.`,
      });
    }
  }, [selectedLot, toast]);

  const handleCopyJSON = useCallback(() => {
    const lotsExport = lots.map(lot => ({
      id: lot.id,
      label: lot.label,
      status: lot.status,
      polygon: lot.polygon,
      acreage: lot.acreage,
      netAcreage: lot.netAcreage,
      zoning: lot.zoning,
      premium: lot.premium,
      notes: lot.notes,
    }));

    const json = JSON.stringify(lotsExport, null, 2);
    navigator.clipboard.writeText(json);
    toast({
      title: 'Copied to Clipboard',
      description: 'Lot data JSON has been copied. Paste it into grand-haven.ts.',
    });
  }, [lots, toast]);

  const getPolygonPoints = (polygon: LotPolygonPoint[]) => {
    if (polygon.length < 2) return '';
    return polygon.map(p => `${p.x},${p.y}`).join(' ');
  };

  const getClosedPolygonPoints = (polygon: LotPolygonPoint[]) => {
    if (polygon.length < 3) return '';
    return polygon.map(p => `${p.x},${p.y}`).join(' ');
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Editor Toolbar */}
      <div className="bg-card border-b border-border p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Editing:</Label>
          <Select
            value={selectedLotId.toString()}
            onValueChange={(v) => setSelectedLotId(parseInt(v))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lots.map(lot => (
                <SelectItem key={lot.id} value={lot.id.toString()}>
                  {lot.label} {lot.polygon.length > 0 && `(${lot.polygon.length} pts)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Switch
            id="snap-grid"
            checked={snapToGrid}
            onCheckedChange={setSnapToGrid}
          />
          <Label htmlFor="snap-grid" className="text-sm">Snap to Grid</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="show-grid"
            checked={showGrid}
            onCheckedChange={setShowGrid}
          />
          <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndoPoint}
            disabled={!selectedLot?.polygon.length}
          >
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearPolygon}
            disabled={!selectedLot?.polygon.length}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClosePolygon}
            disabled={!selectedLot || selectedLot.polygon.length < 3}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button
          variant="default"
          size="sm"
          onClick={handleCopyJSON}
          className="bg-accent hover:bg-accent/90"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy JSON
        </Button>

        <div className="ml-auto text-sm text-muted-foreground">
          {selectedLot && `${selectedLot.polygon.length} points`}
        </div>
      </div>

      {/* Editor Canvas - Fixed, no zoom/pan */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-muted cursor-crosshair select-none touch-none"
        onClick={handleContainerClick}
      >
        {/* Instructions */}
        <div className="absolute bottom-4 left-4 z-20 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-md max-w-xs">
          <p className="text-xs font-medium text-foreground mb-1">Editor Instructions</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            <li>• Click on the map to add polygon points</li>
            <li>• Use "Snap to Grid" for cleaner shapes</li>
            <li>• Click "Copy JSON" when done editing all lots</li>
            <li>• Map is fixed (no zoom/pan) for accurate tracing</li>
          </ul>
        </div>

        {/* Centered Image Container */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}

          {/* Wrapper for image and overlay */}
          <div className="relative max-w-full max-h-full">
            {/* Site Plan Image */}
            <img
              ref={imageRef}
              src={sitePlanImagePath}
              alt="Site Plan"
              className={cn(
                'max-w-full max-h-full object-contain transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              style={{ maxHeight: 'calc(100vh - 200px)' }}
              draggable={false}
              onLoad={handleImageLoad}
            />

            {/* SVG Overlay - exactly matches image */}
            {imageLoaded && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Grid Overlay */}
                {showGrid && (
                  <g className="opacity-30">
                    {Array.from({ length: Math.floor(100 / GRID_SIZE) }).map((_, i) => (
                      <g key={i}>
                        <line
                          x1={`${(i + 1) * GRID_SIZE}`}
                          y1="0"
                          x2={`${(i + 1) * GRID_SIZE}`}
                          y2="100"
                          stroke="currentColor"
                          strokeWidth="0.05"
                        />
                        <line
                          x1="0"
                          y1={`${(i + 1) * GRID_SIZE}`}
                          x2="100"
                          y2={`${(i + 1) * GRID_SIZE}`}
                          stroke="currentColor"
                          strokeWidth="0.05"
                        />
                      </g>
                    ))}
                  </g>
                )}

                {/* Completed polygons (other lots) */}
                {lots
                  .filter(lot => lot.id !== selectedLotId && lot.polygon.length >= 3)
                  .map(lot => (
                    <polygon
                      key={lot.id}
                      points={getClosedPolygonPoints(lot.polygon)}
                      fill="rgba(59, 130, 246, 0.2)"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="0.15"
                    />
                  ))}

                {/* Current lot polygon (in progress) */}
                {selectedLot && selectedLot.polygon.length > 0 && (
                  <>
                    {/* Lines connecting points */}
                    {selectedLot.polygon.length >= 2 && (
                      <polyline
                        points={getPolygonPoints(selectedLot.polygon)}
                        fill="none"
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="0.2"
                        strokeDasharray={selectedLot.polygon.length < 3 ? '0.5 0.3' : undefined}
                      />
                    )}
                    {/* Closed fill if 3+ points */}
                    {selectedLot.polygon.length >= 3 && (
                      <polygon
                        points={getClosedPolygonPoints(selectedLot.polygon)}
                        fill="rgba(34, 197, 94, 0.2)"
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="0.2"
                      />
                    )}
                    {/* Points */}
                    {selectedLot.polygon.map((point, i) => (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="0.5"
                        fill={i === 0 ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)'}
                        stroke="white"
                        strokeWidth="0.15"
                      />
                    ))}
                  </>
                )}
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
