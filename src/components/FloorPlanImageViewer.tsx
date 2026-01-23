// FloorPlanImageViewer - Premium image viewer with zoom/pan (no PDFs)
import { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  X,
  Maximize2,
  Loader2,
  FileText,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Floor plan image mappings by model slug
export const floorPlanImages: Record<string, string> = {
  hawthorne: '/images/floorplans/hawthorne-floorplan.png',
  aspen: '/images/floorplans/aspen-floorplan.png',
  belmont: '/images/floorplans/belmont-floorplan.png',
  keeneland: '/images/floorplans/keeneland-floorplan.png',
  laurel: '/images/floorplans/laurel-floorplan.png',
  cypress: '/images/floorplans/cypress-floorplan.png',
};

// Models that need special cropping (to hide manufacturer logos/identifiers)
const modelsToCrop: Record<string, { clipPath: string }> = {
  laurel: { clipPath: 'inset(0 22% 5% 0)' }, // Crop right 22% and bottom 5% to hide logo and model ID
  belmont: { clipPath: 'inset(0 0 8% 0)' }, // Crop bottom 8% to hide revision text
};

interface FloorPlanImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelSlug: string;
  modelName: string;
  onRequestQuote?: () => void;
}

export function FloorPlanImageViewer({
  open,
  onOpenChange,
  modelSlug,
  modelName,
  onRequestQuote,
}: FloorPlanImageViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imageUrl = floorPlanImages[modelSlug];
  const cropStyle = modelsToCrop[modelSlug];

  const handleImageLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  // Reset state when dialog opens
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (newOpen) {
      setLoading(true);
      setError(false);
    }
    onOpenChange(newOpen);
  }, [onOpenChange]);

  // Prevent right-click on images
  const preventContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const hasImage = !!imageUrl;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-5xl max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-sm"
        onContextMenu={preventContextMenu}
      >
        {hasImage ? (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            wheel={{ step: 0.1 }}
            pinch={{ step: 5 }}
            doubleClick={{ mode: 'reset' }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-background">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-foreground">{modelName} Floor Plan</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Layout preview
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => zoomOut()}
                      className="h-9 w-9"
                      title="Zoom out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => resetTransform()}
                      className="h-9 w-9"
                      title="Reset zoom"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => zoomIn()}
                      className="h-9 w-9"
                      title="Zoom in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenChange(false)}
                      className="h-9 w-9"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Image Content */}
                <div className="flex-1 overflow-hidden bg-white relative min-h-[500px]">
                  <AnimatePresence mode="wait">
                    {loading && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 z-10"
                      >
                        <Loader2 className="h-8 w-8 text-accent animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">Loading floor plan…</p>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-10"
                      >
                        <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground mb-4">Floor plan coming soon</p>
                        {onRequestQuote && (
                          <Button onClick={onRequestQuote} variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Request Floor Plan
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!error && (
                    <TransformComponent
                      wrapperClass="!w-full !h-full"
                      contentClass="!w-full !h-full flex items-center justify-center"
                    >
                      <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                          src={imageUrl}
                          alt={`${modelName} layout preview`}
                          className={cn(
                            "max-w-full max-h-[70vh] object-contain select-none",
                            loading ? "opacity-0" : "opacity-100"
                          )}
                          style={cropStyle ? { clipPath: cropStyle.clipPath } : undefined}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          onContextMenu={preventContextMenu}
                          draggable={false}
                        />
                      </div>
                    </TransformComponent>
                  )}
                </div>

                {/* Footer disclaimer */}
                <div className="px-4 py-3 border-t border-border bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">
                    Layout preview for marketing purposes. Not for construction. Layouts may vary. Final documents provided after contracting.
                  </p>
                </div>
              </>
            )}
          </TransformWrapper>
        ) : (
          /* No image available */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Floor Plan Coming Soon
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              The layout preview for the {modelName} is coming soon. 
              Contact us to request detailed floor plan information.
            </p>
            {onRequestQuote && (
              <Button onClick={onRequestQuote}>
                <Mail className="h-4 w-4 mr-2" />
                Request Floor Plan
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Inline thumbnail component for the model detail page
interface FloorPlanThumbnailProps {
  modelSlug: string;
  modelName: string;
  className?: string;
  onExpand: () => void;
}

export function FloorPlanThumbnail({
  modelSlug,
  modelName,
  className,
  onExpand,
}: FloorPlanThumbnailProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = floorPlanImages[modelSlug];
  const cropStyle = modelsToCrop[modelSlug];
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload full image on hover
  useEffect(() => {
    if (isHovered && imageUrl) {
      const img = new Image();
      img.src = imageUrl;
    }
  }, [isHovered, imageUrl]);

  // Prevent right-click
  const preventContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const hasImage = !!imageUrl;

  if (!hasImage) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl bg-muted/30 border border-border",
        className
      )}>
        <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">
          Floor plan coming soon
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-xl overflow-hidden border border-border bg-white cursor-pointer group transition-all duration-300",
        "hover:shadow-lg hover:border-accent/30",
        className
      )}
      onClick={onExpand}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={preventContextMenu}
    >
      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-muted/30 animate-pulse flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      )}

      {/* Thumbnail image */}
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={`${modelName} layout preview`}
          className={cn(
            "w-full h-full object-contain transition-transform duration-300 select-none",
            "group-hover:scale-105",
            loading ? "opacity-0" : "opacity-100"
          )}
          style={cropStyle ? { clipPath: cropStyle.clipPath } : undefined}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          onContextMenu={preventContextMenu}
          draggable={false}
          loading="lazy"
        />
      </div>

      {/* Expand overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300",
        "flex items-center justify-center"
      )}>
        <div className={cn(
          "bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "shadow-lg"
        )}>
          <Maximize2 className="h-4 w-4 text-foreground" />
          <span className="text-sm font-medium text-foreground">Click to expand</span>
        </div>
      </div>

      {/* Disclaimer bar at bottom (not on image itself) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent py-3 px-4">
        <p className="text-xs text-white/90">
          Layout preview for marketing purposes
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <p className="text-sm text-muted-foreground">Image unavailable</p>
        </div>
      )}
    </div>
  );
}

export default FloorPlanImageViewer;
