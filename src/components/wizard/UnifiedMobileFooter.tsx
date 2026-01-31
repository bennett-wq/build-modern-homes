// ============================================================================
// UnifiedMobileFooter - Tier-1 Mobile Wizard UX
// Always-visible: price, financing CTA, navigation
// Detail drawer available via intentional "View details" tap
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Sparkles,
  MapPin,
  Info,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MonthlyPaymentBadge } from '@/components/financing/MonthlyPaymentBadge';
import { FinancingCalculator } from '@/components/financing/FinancingCalculator';
import { PreQualificationFlow } from '@/components/financing/PreQualificationFlow';
import type { BuyerFacingBreakdown } from '@/hooks/usePricingEngine';
import type { BuyerPricingFlags } from '@/components/pricing/BuyerPricingDisplay';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedMobileFooterProps {
  breakdown: BuyerFacingBreakdown | null;
  flags: BuyerPricingFlags;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
  onPreQual?: () => void;
  showPricing?: boolean;
  showFinancingCTA?: boolean;
  stepLabel?: string;
  isLoadingPricing?: boolean;
  backLabel?: string;
  continueLabel?: string;
  quoteId?: string;
  /** Trigger pulse animation on Continue button */
  pulseOnReady?: string | number | boolean | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getPricingModeHeadline(mode: string): string {
  switch (mode) {
    case 'supply_only':
      return 'Home package';
    case 'delivered_installed':
      return 'Starting from';
    case 'community_all_in':
      return 'All-in price';
    default:
      return 'Starting from';
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UnifiedMobileFooter({
  breakdown,
  flags,
  onBack,
  onContinue,
  canContinue,
  onPreQual,
  showPricing = true,
  showFinancingCTA = true,
  stepLabel,
  isLoadingPricing = false,
  backLabel = 'Back',
  continueLabel = 'Continue',
  quoteId,
  pulseOnReady,
}: UnifiedMobileFooterProps) {
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [showFinancingCalculator, setShowFinancingCalculator] = useState(false);
  const [showPreQualFlow, setShowPreQualFlow] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const isFirstRender = useRef(true);

  // Pulse animation effect for Continue button
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (pulseOnReady !== null && pulseOnReady !== undefined && canContinue) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [pulseOnReady, canContinue]);

  const hasPricing = flags.hasPricing && breakdown && breakdown.startingFromPrice > 0;
  const price = breakdown?.startingFromPrice || 0;

  // Handle Pre-Qual click
  const handlePreQualClick = () => {
    if (onPreQual) {
      onPreQual();
    } else {
      setShowPreQualFlow(true);
    }
  };

  const footerContent = (
    <div
      className={cn(
        // Fixed positioning at viewport bottom
        'fixed bottom-0 left-0 right-0 z-50',
        // Premium visual styling
        'bg-card/98 backdrop-blur-lg border-t border-border/80',
        'shadow-[0_-8px_30px_rgba(0,0,0,0.12)]',
        // Safe area padding for modern devices
        'pb-[max(12px,env(safe-area-inset-bottom))]'
      )}
    >
      {/* ROW 1: Pricing Summary (always visible when showPricing=true) */}
      {showPricing && (
        <div className="px-4 pt-3 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            {/* Left: Price info */}
            <div className="flex-1 min-w-0">
              {isLoadingPricing ? (
                <div className="space-y-1.5">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-28 bg-muted rounded animate-pulse" />
                </div>
              ) : hasPricing ? (
                <>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs text-muted-foreground">
                      {getPricingModeHeadline(flags.pricingMode)}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 cursor-help">
                            Preliminary
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs max-w-48">
                            Preliminary estimate. Final pricing confirmed in a written quote.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={price}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="text-xl font-semibold text-foreground"
                    >
                      {formatPrice(price)}
                    </motion.p>
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground py-1">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Select options to see pricing</span>
                </div>
              )}
            </div>

            {/* Center: Monthly payment estimate */}
            {hasPricing && (
              <div className="text-right mr-2">
                <p className="text-[10px] text-muted-foreground mb-0.5">Est. monthly</p>
                <MonthlyPaymentBadge
                  purchasePrice={price}
                  variant="compact"
                />
              </div>
            )}

            {/* Right: View details trigger */}
            {hasPricing && (
              <Drawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen}>
                <DrawerTrigger asChild>
                  <button
                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                    aria-label="View price details"
                  >
                    <span className="hidden xs:inline">View</span>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </DrawerTrigger>

                {/* Detail Drawer Content */}
                <DrawerContent className="max-h-[80vh] pb-[env(safe-area-inset-bottom)]">
                  <DetailDrawerContent
                    breakdown={breakdown}
                    flags={flags}
                    onExplorePayments={() => {
                      setDetailDrawerOpen(false);
                      setShowFinancingCalculator(true);
                    }}
                    onPreQual={() => {
                      setDetailDrawerOpen(false);
                      handlePreQualClick();
                    }}
                  />
                </DrawerContent>
              </Drawer>
            )}
          </div>

          {/* Warning flags */}
          {flags.freightPending && hasPricing && (
            <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              Freight pending — estimate shown
            </p>
          )}
        </div>
      )}

      {/* ROW 2: Primary Financing CTA (always visible) */}
      {showFinancingCTA && hasPricing && (
        <div className="px-4 py-2.5">
          <Button
            onClick={handlePreQualClick}
            className={cn(
              'w-full h-12',
              'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80',
              'text-primary-foreground font-medium',
              'shadow-md hover:shadow-lg transition-all'
            )}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get Pre-Qualified
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* ROW 3: Navigation (always visible) */}
      <div className="px-4 py-2.5 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-11 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {backLabel}
        </Button>

        <Button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            'flex-1 h-11 min-h-[44px]',
            canContinue ? 'shadow-sm hover:shadow-md' : 'opacity-60',
            isPulsing && 'animate-[pulse-attention_0.6s_ease-in-out_2]'
          )}
        >
          {continueLabel}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      {/* Step label indicator (optional) */}
      {stepLabel && (
        <div className="px-4 pb-1 text-center">
          <span className="text-[10px] text-muted-foreground">{stepLabel}</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {createPortal(footerContent, document.body)}

      {/* Financing Calculator Modal */}
      <Dialog open={showFinancingCalculator} onOpenChange={setShowFinancingCalculator}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Payment Calculator
            </DialogTitle>
            <DialogDescription>
              Estimate your monthly payment with different down payment amounts and terms.
            </DialogDescription>
          </DialogHeader>
          <FinancingCalculator
            purchasePrice={price}
            onGetPreQualified={() => {
              setShowFinancingCalculator(false);
              setShowPreQualFlow(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Pre-Qualification Flow */}
      <PreQualificationFlow
        open={showPreQualFlow}
        onOpenChange={setShowPreQualFlow}
        purchasePrice={price}
        quoteId={quoteId}
        onComplete={() => setShowPreQualFlow(false)}
      />
    </>
  );
}

// ============================================================================
// DETAIL DRAWER CONTENT
// ============================================================================

function DetailDrawerContent({
  breakdown,
  flags,
  onExplorePayments,
  onPreQual,
}: {
  breakdown: BuyerFacingBreakdown | null;
  flags: BuyerPricingFlags;
  onExplorePayments: () => void;
  onPreQual: () => void;
}) {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  if (!breakdown) return null;

  return (
    <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-sm text-muted-foreground">
            {getPricingModeHeadline(flags.pricingMode)}
          </span>
          <Badge variant="secondary" className="text-xs">Preliminary</Badge>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={breakdown.startingFromPrice}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-semibold text-foreground"
          >
            {formatPrice(breakdown.startingFromPrice)}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Financing Quick Actions */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground text-sm">BaseMod Financial</span>
          </div>
          <span className="text-xs text-muted-foreground">6.875% APR</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Est. Monthly Payment</p>
            <MonthlyPaymentBadge
              purchasePrice={breakdown.startingFromPrice}
              variant="default"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onExplorePayments}>
            <Calculator className="w-4 h-4 mr-1.5" />
            Explore Payments
          </Button>
          <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={onPreQual}>
            <Shield className="w-4 h-4 mr-1.5" />
            Get Pre-Qualified
          </Button>
        </div>
      </div>

      {/* Collapsible Price Breakdown */}
      <Collapsible open={isBreakdownExpanded} onOpenChange={setIsBreakdownExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between py-3 text-sm text-muted-foreground hover:text-foreground transition-colors border-t border-border">
            <span>View price breakdown</span>
            {isBreakdownExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 pb-3">
            {/* Lot Premium */}
            {breakdown.lotPremium > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {breakdown.lotNumber ? `Lot ${breakdown.lotNumber}` : 'Lot Premium'}
                </span>
                <span className="font-medium">{formatPrice(breakdown.lotPremium)}</span>
              </div>
            )}

            {/* Home Package */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{breakdown.labels.homePackage}</span>
              <span className="font-medium">{formatPrice(breakdown.homePackagePrice)}</span>
            </div>

            {/* Install Package */}
            {breakdown.installPackagePrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{breakdown.labels.installPackage}</span>
                <span className="font-medium">{formatPrice(breakdown.installPackagePrice)}</span>
              </div>
            )}

            {/* Options */}
            {breakdown.optionDetails.length > 0 && (
              <div className="pt-2 border-t border-border space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Add-ons</p>
                {breakdown.optionDetails.map((opt, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">{opt.name}</span>
                    <span className="flex-shrink-0">+{formatPrice(opt.price)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fees */}
            {breakdown.feesPermitsTotal > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground">{breakdown.labels.feesPermits}</span>
                <span className="font-medium">{formatPrice(breakdown.feesPermitsTotal)}</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Disclaimers */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
        <p>
          {breakdown.lotPremium > 0
            ? 'All-in price includes your selected lot.'
            : 'Estimates exclude land unless selected.'}
        </p>
        <p>Final pricing confirmed via formal written quote.</p>
      </div>
    </div>
  );
}

// ============================================================================
// SPACER COMPONENT
// ============================================================================

/**
 * Spacer to prevent content from being hidden behind the footer.
 * Height accounts for: pricing row (~70px) + CTA row (~56px) + nav row (~52px) + safe area
 */
export function UnifiedMobileFooterSpacer({ 
  showPricing = true, 
  showFinancingCTA = true,
  className 
}: { 
  showPricing?: boolean;
  showFinancingCTA?: boolean;
  className?: string;
}) {
  // Calculate approximate footer height
  let height = 60; // Base nav row
  if (showPricing) height += 72;
  if (showFinancingCTA) height += 56;
  height += 16; // Safe area buffer
  
  return (
    <div
      className={cn('shrink-0', className)}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    />
  );
}

export default UnifiedMobileFooter;
