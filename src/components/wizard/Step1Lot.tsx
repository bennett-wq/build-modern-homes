// Step 1: Pick a Lot - uses the fixed site plan viewer
// Premium proptech UX with stable layout
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSitePlanViewer } from '@/components/siteplan/FixedSitePlanViewer';
import { LotListPanel } from '@/components/siteplan/LotListPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, AlertCircle, ChevronUp, X } from 'lucide-react';
import { Lot } from '@/data/lots/grand-haven';
import { cn } from '@/lib/utils';

interface Step1LotProps {
  lots: Lot[];
  selectedLotId: number | null;
  sitePlanImagePath: string;
  onSelectLot: (lotId: number) => void;
  onNext: () => void;
  isMobile: boolean;
}

export function Step1Lot({
  lots,
  selectedLotId,
  sitePlanImagePath,
  onSelectLot,
  onNext,
  isMobile,
}: Step1LotProps) {
  const selectedLot = lots.find(l => l.id === selectedLotId);
  const canProceed = selectedLot && selectedLot.status === 'available';
  const [hoveredLotId, setHoveredLotId] = useState<number | null>(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const handleLotClick = useCallback((lot: Lot | null) => {
    if (lot) {
      onSelectLot(lot.id);
      // Close mobile list when lot is selected
      if (isMobile) {
        setMobileListOpen(false);
      }
    }
  }, [onSelectLot, isMobile]);

  const handleLotFromList = useCallback((lot: Lot) => {
    onSelectLot(lot.id);
    if (isMobile) {
      setMobileListOpen(false);
    }
  }, [onSelectLot, isMobile]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
              Pick Your Lot
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Select an available lot to build your home
            </p>
          </div>
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileListOpen(true)}
              className="shrink-0"
            >
              <MapPin className="h-4 w-4 mr-1.5" />
              Browse
            </Button>
          )}
        </div>
      </div>

      {/* Content - stable layout */}
      <div className={cn(
        'flex-1 overflow-hidden relative',
        isMobile ? 'flex flex-col' : 'flex'
      )}>
        {/* Site Plan - fixed frame that never moves */}
        <div className={cn(
          'relative bg-muted',
          isMobile ? 'flex-1' : 'flex-1'
        )}>
          <FixedSitePlanViewer
            sitePlanImagePath={sitePlanImagePath}
            lots={lots}
            selectedLotId={selectedLotId}
            hoveredLotId={hoveredLotId}
            onSelectLot={handleLotClick}
            onHoverLot={setHoveredLotId}
            className="h-full"
          />
        </div>

        {/* Lot List - Desktop sidebar */}
        {!isMobile && (
          <div className="w-80 border-l border-border bg-background shrink-0">
            <LotListPanel
              lots={lots}
              selectedLotId={selectedLotId}
              hoveredLotId={hoveredLotId}
              onSelectLot={handleLotFromList}
              onHoverLot={setHoveredLotId}
              className="h-full"
            />
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        <AnimatePresence>
          {isMobile && mobileListOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/40 z-40"
                onClick={() => setMobileListOpen(false)}
              />
              
              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl shadow-xl max-h-[70vh] flex flex-col"
                style={{ touchAction: 'pan-y' }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
                  <h3 className="font-semibold text-foreground">Select a Lot</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileListOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                
                {/* Lot list */}
                <div className="flex-1 overflow-hidden">
                  <LotListPanel
                    lots={lots}
                    selectedLotId={selectedLotId}
                    hoveredLotId={null}
                    onSelectLot={handleLotFromList}
                    onHoverLot={() => {}}
                    className="h-full"
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Selection Footer - always visible, stable position */}
      <div className="px-4 sm:px-6 py-4 border-t border-border bg-card shrink-0">
        <AnimatePresence mode="wait">
          {selectedLot ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{selectedLot.label}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs font-medium',
                        selectedLot.status === 'available' && 'bg-green-500/10 text-green-600 border-green-200',
                        selectedLot.status === 'reserved' && 'bg-amber-500/10 text-amber-600 border-amber-200',
                        selectedLot.status === 'sold' && 'bg-gray-500/10 text-gray-500 border-gray-200'
                      )}
                    >
                      {selectedLot.status.charAt(0).toUpperCase() + selectedLot.status.slice(1)}
                    </Badge>
                    {selectedLot.acreage && (
                      <span className="text-xs text-muted-foreground">{selectedLot.acreage} acres</span>
                    )}
                  </div>
                </div>
              </div>
              
              {canProceed ? (
                <Button 
                  onClick={onNext} 
                  className="shrink-0"
                  size="default"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 shrink-0">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Not available</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-2"
            >
              <p className="text-muted-foreground text-sm">
                {isMobile ? 'Tap a lot on the map or browse the list' : 'Click a lot on the map to select it'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
