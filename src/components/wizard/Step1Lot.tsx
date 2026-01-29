// ============================================================================
// Step 1: Pick a Lot - Premium Proptech Experience
// World-class lot selection with real-time all-in pricing
// ============================================================================

import { useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSitePlanViewer } from '@/components/siteplan/FixedSitePlanViewer';
import { LotListPanel } from '@/components/siteplan/LotListPanel';
import { LotPricingPreview, LotPricingBadge } from '@/components/wizard/LotPricingPreview';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertCircle, X, TrendingUp, Sparkles } from 'lucide-react';
import { Lot } from '@/data/lots/grand-haven';
import { WizardStickyFooter, WizardFooterSpacer } from '@/components/wizard/WizardStickyFooter';
import { AnimatedPriceCompact } from '@/components/ui/animated-price';
import { cn } from '@/lib/utils';

interface Step1LotProps {
  lots: Lot[];
  selectedLotId: number | null;
  sitePlanImagePath: string;
  onSelectLot: (lotId: number) => void;
  onNext: () => void;
  isMobile: boolean;
  // Pricing context for all-in estimates
  baseHomePackage?: number;
  baseSitework?: number;
  baseFeesAllowance?: number;
  modelName?: string;
}

export function Step1Lot({
  lots,
  selectedLotId,
  sitePlanImagePath,
  onSelectLot,
  onNext,
  isMobile,
  baseHomePackage = 129485,
  baseSitework = 114533,
  baseFeesAllowance = 9631,
  modelName = 'Hawthorne',
}: Step1LotProps) {
  const selectedLot = lots.find(l => l.id === selectedLotId);
  const canProceed = selectedLot && selectedLot.status === 'available';
  const [hoveredLotId, setHoveredLotId] = useState<number | null>(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [showPricingPreview, setShowPricingPreview] = useState(false);

  // Calculate all-in price for selected lot
  const allInPrice = useMemo(() => {
    if (!selectedLot?.premium) return null;
    return baseHomePackage + baseSitework + baseFeesAllowance + selectedLot.premium;
  }, [selectedLot, baseHomePackage, baseSitework, baseFeesAllowance]);

  // Get phase 1 lots count for highlighting
  const phase1Count = useMemo(() => {
    return lots.filter(l => l.phase === 1 && l.status === 'available').length;
  }, [lots]);

  const handleLotClick = useCallback((lot: Lot | null) => {
    if (lot) {
      onSelectLot(lot.id);
      setShowPricingPreview(true);
      // Close mobile list when lot is selected
      if (isMobile) {
        setMobileListOpen(false);
      }
    }
  }, [onSelectLot, isMobile]);

  const handleLotFromList = useCallback((lot: Lot) => {
    onSelectLot(lot.id);
    setShowPricingPreview(true);
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
              Choose Your Homesite
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Select a lot to see your all-in price instantly
            </p>
          </div>
          <div className="flex items-center gap-2">
            {phase1Count > 0 && !isMobile && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {phase1Count} Available Now
              </Badge>
            )}
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileListOpen(true)}
                className="shrink-0"
              >
                <MapPin className="h-4 w-4 mr-1.5" />
                Browse Lots
              </Button>
            )}
          </div>
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

          {/* Floating Pricing Preview - Desktop only */}
          {!isMobile && selectedLot && allInPrice && (
            <div className="absolute bottom-6 left-6 z-20 max-w-sm">
              <LotPricingPreview
                lotLabel={selectedLot.label}
                lotPremium={selectedLot.premium || 0}
                homePackage={baseHomePackage}
                sitework={baseSitework}
                feesAllowance={baseFeesAllowance}
                allInTotal={allInPrice}
                modelName={modelName}
                isVisible={showPricingPreview}
                showBreakdown={true}
              />
            </div>
          )}
        </div>

        {/* Lot List - Desktop sidebar */}
        {!isMobile && (
          <div className="w-96 border-l border-border bg-background shrink-0 flex flex-col">
            <LotListPanel
              lots={lots}
              selectedLotId={selectedLotId}
              hoveredLotId={hoveredLotId}
              onSelectLot={handleLotFromList}
              onHoverLot={setHoveredLotId}
              className="flex-1 overflow-auto"
              baseHomePackage={baseHomePackage}
              baseSitework={baseSitework}
              baseFeesAllowance={baseFeesAllowance}
            />
            {/* Safe bottom padding for sticky footer */}
            <WizardFooterSpacer />
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
                className="absolute inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col"
                style={{ touchAction: 'pan-y' }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
                  <div>
                    <h3 className="font-semibold text-foreground">Select a Lot</h3>
                    {phase1Count > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {phase1Count} lots available now
                      </p>
                    )}
                  </div>
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
                    baseHomePackage={baseHomePackage}
                    baseSitework={baseSitework}
                    baseFeesAllowance={baseFeesAllowance}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Footer */}
      <WizardStickyFooter
        onContinue={onNext}
        canContinue={!!canProceed}
        continueLabel="Continue"
        hideBack={true}
      >
        {selectedLot ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{selectedLot.label}</p>
                  {selectedLot.phase === 1 && selectedLot.status === 'available' && (
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-[10px] px-1.5 py-0 h-4">
                      Available Now
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs font-medium',
                      selectedLot.status === 'available' && 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
                      selectedLot.status === 'reserved' && 'bg-amber-500/10 text-amber-600 border-amber-200',
                      selectedLot.status === 'sold' && 'bg-gray-500/10 text-gray-500 border-gray-200'
                    )}
                  >
                    {selectedLot.status.charAt(0).toUpperCase() + selectedLot.status.slice(1)}
                  </Badge>
                  {selectedLot.acreage && (
                    <span className="text-xs text-muted-foreground">{selectedLot.acreage} acres</span>
                  )}
                  {!canProceed && selectedLot && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      Not available
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* All-in price badge */}
            {allInPrice && canProceed && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent/10 to-transparent border border-accent/20">
                <TrendingUp className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">All-In</p>
                  <AnimatedPriceCompact 
                    value={allInPrice} 
                    className="text-sm font-bold text-foreground"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <p className="text-sm">Select a lot to continue</p>
          </div>
        )}
      </WizardStickyFooter>
    </div>
  );
}
