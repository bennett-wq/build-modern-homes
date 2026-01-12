import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Maximize2, Undo, Trash2, CheckCircle, Copy, Download, Grid3X3 } from 'lucide-react';
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

interface SitePlanEditorProps {
  sitePlanImagePath: string;
  initialLots: Lot[];
  onLotsChange?: (lots: Lot[]) => void;
  className?: string;
}

export function SitePlanEditor({
  sitePlanImagePath,
  initialLots,
  onLotsChange,
  className,
}: SitePlanEditorProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [lots, setLots] = useState<Lot[]>(initialLots);
  const [selectedLotId, setSelectedLotId] = useState<number>(1);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isDrawing, setIsDrawing] = useState(true);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;
  const ZOOM_STEP = 0.25;
  const GRID_SIZE = 2; // 2% grid

  const selectedLot = lots.find(l => l.id === selectedLotId);

  // Update parent when lots change
  useEffect(() => {
    onLotsChange?.(lots);
  }, [lots, onLotsChange]);

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

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale(prev => Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !isDrawing) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position, isDrawing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add point on image click
  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    let x = rawX;
    let y = rawY;

    if (snapToGrid) {
      x = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
      y = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
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
  }, [isDrawing, selectedLotId, snapToGrid]);

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

  const getPolygonPath = (polygon: LotPolygonPoint[]) => {
    if (polygon.length < 2) return '';
    return polygon.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ');
  };

  const getClosedPolygonPath = (polygon: LotPolygonPoint[]) => {
    if (polygon.length < 3) return '';
    return polygon.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ') + ' Z';
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
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lots.map(lot => (
                <SelectItem key={lot.id} value={lot.id.toString()}>
                  {lot.label} {lot.polygon.length > 0 && `(${lot.polygon.length})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Switch
            id="draw-mode"
            checked={isDrawing}
            onCheckedChange={setIsDrawing}
          />
          <Label htmlFor="draw-mode" className="text-sm">Draw Mode</Label>
        </div>

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

      {/* Editor Canvas */}
      <div className="flex-1 relative overflow-hidden bg-muted">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomIn}
            className="shadow-md bg-background/90 backdrop-blur-sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomOut}
            className="shadow-md bg-background/90 backdrop-blur-sm"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleReset}
            className="shadow-md bg-background/90 backdrop-blur-sm"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 z-20 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-md max-w-xs">
          <p className="text-xs font-medium text-foreground mb-1">Editor Instructions</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            <li>• Click on the map to add polygon points</li>
            <li>• Toggle "Draw Mode" off to pan the map</li>
            <li>• Use "Snap to Grid" for cleaner shapes</li>
            <li>• Click "Copy JSON" when done editing all lots</li>
          </ul>
        </div>

        {/* Map Container */}
        <div
          ref={containerRef}
          className={cn(
            'relative w-full h-full',
            isDrawing ? 'cursor-crosshair' : 'cursor-grab',
            isDragging && 'cursor-grabbing'
          )}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="relative origin-center transition-transform duration-100"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          >
            {/* Site Plan Image */}
            <img
              ref={imageRef}
              src={sitePlanImagePath}
              alt="Site Plan"
              className="max-w-none select-none"
              draggable={false}
              onClick={handleImageClick}
            />

            {/* Grid Overlay */}
            {showGrid && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {Array.from({ length: Math.floor(100 / GRID_SIZE) }).map((_, i) => (
                  <g key={i}>
                    <line
                      x1={`${(i + 1) * GRID_SIZE}%`}
                      y1="0%"
                      x2={`${(i + 1) * GRID_SIZE}%`}
                      y2="100%"
                      stroke="currentColor"
                      strokeWidth="0.05"
                    />
                    <line
                      x1="0%"
                      y1={`${(i + 1) * GRID_SIZE}%`}
                      x2="100%"
                      y2={`${(i + 1) * GRID_SIZE}%`}
                      stroke="currentColor"
                      strokeWidth="0.05"
                    />
                  </g>
                ))}
              </svg>
            )}

            {/* SVG Overlay for Polygons */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Completed polygons (other lots) */}
              {lots
                .filter(lot => lot.id !== selectedLotId && lot.polygon.length >= 3)
                .map(lot => (
                  <path
                    key={lot.id}
                    d={getClosedPolygonPath(lot.polygon)}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="0.15"
                  />
                ))}

              {/* Current lot polygon (in progress) */}
              {selectedLot && selectedLot.polygon.length > 0 && (
                <>
                  {/* Lines */}
                  <path
                    d={getPolygonPath(selectedLot.polygon)}
                    fill="none"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="0.2"
                    strokeDasharray={selectedLot.polygon.length < 3 ? '0.5 0.3' : undefined}
                  />
                  {/* Fill if closed */}
                  {selectedLot.polygon.length >= 3 && (
                    <path
                      d={getClosedPolygonPath(selectedLot.polygon)}
                      fill="rgba(34, 197, 94, 0.2)"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="0.2"
                    />
                  )}
                  {/* Points */}
                  {selectedLot.polygon.map((point, i) => (
                    <circle
                      key={i}
                      cx={`${point.x}%`}
                      cy={`${point.y}%`}
                      r="0.4"
                      fill={i === 0 ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)'}
                      stroke="white"
                      strokeWidth="0.1"
                    />
                  ))}
                </>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
