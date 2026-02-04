// ============================================================================
// Step 1: Pick a Lot - Premium Proptech Experience
// World-class lot selection with real-time all-in pricing
// ============================================================================

import { useCallback, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSitePlanViewer } from '@/components/siteplan/FixedSitePlanViewer';
import { LotListPanel } from '@/components/siteplan/LotListPanel';
import { LotPricingPreview, LotPricingBadge } from '@/components/wizard/LotPricingPreview';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertCircle, X, TrendingUp, Sparkles, Check, ChevronUp, List } from 'lucide-react';
import { Lot } from '@/data/lots/grand-haven';
import { WizardStickyFooter, WizardFooterSpacer } from '@/components/wizard/WizardStickyFooter';
import { AnimatedPriceCompact } from '@/components/ui/animated-price';
import { InlineMobilePricing, type BuyerPricingFlags } from '@/components/pricing/BuyerPricingDisplay';
import type { BuyerFacingBreakdown } from '@/hooks/usePricingEngine';
import { cn } from '@/lib/utils';

// ============================================================================
// LotPill Component - Compact horizontal scrolling selector for mobile
// ============================================================================

interface LotPillProps {
  lot: Lot;
  isSelected: boolean;
  onClick: () => void;
  allInPrice: number;
}

function LotPill({ lot, isSelected, onClick, allInPrice }: LotPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center px-4 py-3 rounded-xl border min-w-[100px]',
        'transition-all duration-150 touch-manipulation',
        isSelected 
          ? 'bg-accent/20 border-accent shadow-md ring-2 ring-accent/40' 
          : 'bg-card border-border hover:border-accent/50 active:scale-95'
      )}
    >
      <span className="font-bold text-foreground text-sm">{lot.label}</span>
      <span className="text-xs text-muted-foreground mt-0.5">
        ${(allInPrice / 1000).toFixed(0)}K
      </span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-1"
        >
          <Check className="h-4 w-4 text-accent" strokeWidth={3} />
        </motion.div>
      )}
    </button>
  );
}

// ============================================================================
// Main Step1Lot Component
// ============================================================================

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
  // Pricing bar props for mobile
  buyerFacingBreakdown?: BuyerFacingBreakdown;
  pricingFlags?: BuyerPricingFlags;
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
  buyerFacingBreakdown,
  pricingFlags,
}: Step1LotProps) {
  const selectedLot = lots.find(l => l.id === selectedLotId);
  const canProceed = selectedLot && selectedLot.status === 'available';
  const [hoveredLotId, setHoveredLotId] = useState<number | null>(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [showPricingPreview, setShowPricingPreview] = useState(false);
  const [justSelected, setJustSelected] = useState(false);

  // Calculate all-in price for any lot
  const calculateAllIn = useCallback((lot: Lot) => {
    return baseHomePackage + baseSitework + baseFeesAllowance + (lot.premium || 0);
  }, [baseHomePackage, baseSitework, baseFeesAllowance]);

  // Calculate all-in price for selected lot
  const allInPrice = useMemo(() => {
    if (!selectedLot?.premium) return null;
    return calculateAllIn(selectedLot);
  }, [selectedLot, calculateAllIn]);

  // Get available lots for quick selector
  const availableLots = useMemo(() => {
    return lots.filter(l => l.status === 'available');
  }, [lots]);

  // Get phase 1 lots count for highlighting
  const phase1Count = useMemo(() => {
    return lots.filter(l => l.phase === 1 && l.status === 'available').length;
  }, [lots]);

  // Trigger celebration animation on selection - NO auto-advance
  // Users click Continue to feel in control
  useEffect(() => {
    if (selectedLotId) {
      setJustSelected(true);
      const celebrationTimer = setTimeout(() => setJustSelected(false), 1500);
      return () => clearTimeout(celebrationTimer);
    }
  }, [selectedLotId]);

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
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-semibold text-foreground tracking-tight">
              Choose Your Homesite
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
              {phase1Count > 0 
                ? `${phase1Count} lots available now`
                : 'Select a lot to see your all-in price'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {phase1Count > 0 && !isMobile && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {phase1Count} Available Now
              </Badge>
            )}
            {isMobile && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setMobileListOpen(true)}
                className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <MapPin className="h-4 w-4 mr-1.5" />
                Browse
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
        {/* Site Plan - reduced height on mobile to show lot pills */}
        <div className={cn(
          'relative bg-muted',
          isMobile ? 'h-[45vh] shrink-0' : 'flex-1'
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

        {/* Mobile: Horizontal Lot Quick-Select */}
        {isMobile && availableLots.length > 0 && (
          <div className="shrink-0 border-t border-border bg-card">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Quick Select</h3>
                <p className="text-xs text-muted-foreground">{availableLots.length} available</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setMobileListOpen(true)}
                className="text-muted-foreground"
              >
                <List className="h-4 w-4 mr-1.5" />
                Browse All
              </Button>
            </div>
            <div className="px-4 pb-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2" style={{ width: 'max-content' }}>
                {availableLots.map(lot => (
                  <LotPill
                    key={lot.id}
                    lot={lot}
                    isSelected={lot.id === selectedLotId}
                    onClick={() => handleLotClick(lot)}
                    allInPrice={calculateAllIn(lot)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

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
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-black/50 z-40 backdrop-blur-[2px]"
                onClick={() => setMobileListOpen(false)}
              />
              
              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 400 }}
                className="absolute inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
                style={{ touchAction: 'pan-y' }}
              >
                {/* Drag handle - larger touch target */}
                <div className="flex justify-center pt-3 pb-2" onClick={() => setMobileListOpen(false)}>
                  <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
                </div>
                
                {/* Header - Premium styling */}
                <div className="flex items-center justify-between px-5 pb-4 border-b border-border/50">
                  <div>
                    <h3 className="font-bold text-foreground text-lg tracking-tight">Select a Lot</h3>
                    {phase1Count > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-[10px] px-2 py-0.5">
                          <Sparkles className="h-2.5 w-2.5 mr-1" />
                          {phase1Count} Available Now
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileListOpen(false)}
                    className="h-10 w-10 rounded-full hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                
                {/* Lot list - fixed height with proper scroll */}
                <div 
                  className="flex-1 overflow-auto min-h-0" 
                  style={{ 
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain'
                  }}
                >
                  <LotListPanel
                    lots={lots}
                    selectedLotId={selectedLotId}
                    hoveredLotId={null}
                    onSelectLot={handleLotFromList}
                    onHoverLot={() => {}}
                    className="h-auto"
                    baseHomePackage={baseHomePackage}
                    baseSitework={baseSitework}
                    baseFeesAllowance={baseFeesAllowance}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Selection Confirmation Overlay */}
        <AnimatePresence>
          {isMobile && justSelected && selectedLot && allInPrice && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute bottom-24 left-4 right-4 z-30"
            >
              <div className="bg-card/95 backdrop-blur-lg border border-accent/30 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 25 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg"
                  >
                    <Check className="h-6 w-6 text-accent-foreground" strokeWidth={3} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-lg">{selectedLot.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLot.acreage} acres • ${selectedLot.premium?.toLocaleString()} premium
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">All-In</p>
                    <p className="text-lg font-bold text-accent">${allInPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Pricing Bar - positioned above sticky footer */}
      {isMobile && selectedLot && buyerFacingBreakdown && pricingFlags && (
        <InlineMobilePricing
          breakdown={buyerFacingBreakdown}
          flags={pricingFlags}
        />
      )}

      {/* Sticky Footer - Enhanced with clear lot details */}
      <WizardStickyFooter
        onContinue={onNext}
        canContinue={!!canProceed}
        continueLabel="Continue"
        hideBack={true}
        pulseOnReady={selectedLotId}
      >
        {selectedLot ? (
          <div className="flex items-center gap-3 sm:gap-4 w-full">
            {/* Lot Icon & Details - Mobile optimized */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <motion.div
                key={selectedLot.id}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shrink-0 shadow-lg"
              >
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground text-base sm:text-lg truncate">{selectedLot.label}</p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[10px] sm:text-xs font-semibold shrink-0',
                      selectedLot.status === 'available' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200',
                      selectedLot.status === 'reserved' && 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200',
                      selectedLot.status === 'sold' && 'bg-gray-500/15 text-gray-600 border-gray-200'
                    )}
                  >
                    {selectedLot.status.charAt(0).toUpperCase() + selectedLot.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                  {selectedLot.acreage && (
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">{selectedLot.acreage} ac</span>
                  )}
                  {selectedLot.premium !== undefined && (
                    <span className="text-xs sm:text-sm text-foreground font-semibold">
                      ${selectedLot.premium.toLocaleString()}
                    </span>
                  )}
                  {/* Mobile all-in price inline */}
                  {allInPrice && canProceed && isMobile && (
                    <span className="text-xs font-bold text-accent ml-auto">
                      ${allInPrice.toLocaleString()} all-in
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* All-in price badge - Desktop only */}
            {allInPrice && canProceed && !isMobile && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-accent/15 to-accent/5 border border-accent/30">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">All-In</p>
                  <AnimatedPriceCompact 
                    value={allInPrice} 
                    className="text-lg font-bold text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Not available warning */}
            {!canProceed && selectedLot && (
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shrink-0">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-medium">Not available</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted/80 flex items-center justify-center border border-border/50">
                <MapPin className="h-5 w-5 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Select a lot</p>
                <p className="text-xs text-muted-foreground">{lots.filter(l => l.status === 'available').length} available</p>
              </div>
            </div>
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileListOpen(true)}
                className="shrink-0"
              >
                <ChevronUp className="h-4 w-4 mr-1.5" />
                Browse
              </Button>
            )}
          </div>
        )}
      </WizardStickyFooter>
    </div>
  );
}
