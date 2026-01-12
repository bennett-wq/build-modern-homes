// Step 1: Pick a Lot - uses the fixed site plan viewer
import { motion } from 'framer-motion';
import { FixedSitePlanViewer } from '@/components/siteplan/FixedSitePlanViewer';
import { LotListPanel } from '@/components/siteplan/LotListPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, AlertCircle } from 'lucide-react';
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

  const handleLotClick = (lot: Lot | null) => {
    if (lot) {
      onSelectLot(lot.id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">Pick Your Lot</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select an available lot to build your new home
        </p>
      </div>

      {/* Content */}
      <div className={cn(
        'flex-1 overflow-hidden',
        isMobile ? 'flex flex-col' : 'flex'
      )}>
        {/* Site Plan */}
        <div className={cn(
          'relative bg-muted',
          isMobile ? 'flex-1 min-h-[40vh]' : 'flex-1'
        )}>
          <FixedSitePlanViewer
            sitePlanImagePath={sitePlanImagePath}
            lots={lots}
            selectedLotId={selectedLotId}
            onSelectLot={handleLotClick}
            className="h-full"
          />
        </div>

        {/* Lot List */}
        <div className={cn(
          'border-l border-border bg-background',
          isMobile ? 'h-48' : 'w-72'
        )}>
          <LotListPanel
            lots={lots}
            selectedLotId={selectedLotId}
            hoveredLotId={null}
            onSelectLot={(lot) => onSelectLot(lot.id)}
            onHoverLot={() => {}}
            className="h-full"
          />
        </div>
      </div>

      {/* Selection Footer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4 border-t border-border bg-card"
      >
        {selectedLot ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedLot.label}</p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      selectedLot.status === 'available' && 'bg-green-500/10 text-green-600',
                      selectedLot.status === 'reserved' && 'bg-amber-500/10 text-amber-600',
                      selectedLot.status === 'sold' && 'bg-gray-500/10 text-gray-500'
                    )}
                  >
                    {selectedLot.status.charAt(0).toUpperCase() + selectedLot.status.slice(1)}
                  </Badge>
                  {selectedLot.acreage && (
                    <span className="text-xs text-muted-foreground">{selectedLot.acreage} ac</span>
                  )}
                </div>
              </div>
            </div>
            {canProceed ? (
              <Button onClick={onNext} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">This lot is not available</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-muted-foreground text-sm">Click a lot on the map to select it</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
