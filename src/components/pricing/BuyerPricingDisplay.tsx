// ============================================================================
// Buyer-Facing Pricing Display Component
// Shows retail prices without exposing cost-plus markup data
// Integrated with BaseMod Financial for monthly payment estimates
// Enhanced mobile drawer with financing CTAs and integrated navigation
// ============================================================================

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Info, 
  HelpCircle,
  Shield,
  Truck,
  Wrench,
  Package,
  FileText,
  MapPin,
  Calculator,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InlineInclusionsAccordion } from './InclusionsAccordion';
import { MonthlyPaymentBadge } from '@/components/financing/MonthlyPaymentBadge';
import { FinancingCalculator } from '@/components/financing/FinancingCalculator';
import { PreQualificationFlow } from '@/components/financing/PreQualificationFlow';
import type { BuyerFacingBreakdown } from '@/hooks/usePricingEngine';
import type { PricingMode } from '@/data/pricing-layers';

// ============================================================================
// TYPES
// ============================================================================

export interface BuyerPricingFlags {
  freightPending: boolean;
  basementSelectedRequiresQuote: boolean;
  estimateConfidence: 'high' | 'medium' | 'low';
  hasPricing: boolean;
  pricingMode: PricingMode;
}

export interface BuyerPricingDisplayProps {
  breakdown: BuyerFacingBreakdown;
  flags: BuyerPricingFlags;
  variant?: 'full' | 'compact' | 'mobile';
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
  /** When true, shows a collapsed placeholder prompting model selection */
  showPlaceholder?: boolean;
  /** Callback to switch to delivered_installed mode (for supply_only upsell) */
  onSwitchToInstalled?: () => void;
  /** Show financing calculator section */
  showFinancing?: boolean;
  /** Quote ID for pre-qualification flow */
  quoteId?: string;
  // Mobile navigation integration (steps 4-8)
  onBack?: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
  backLabel?: string;
  continueLabel?: string;
  showNavigation?: boolean;
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

function getConfidenceBadgeVariant(confidence: 'high' | 'medium' | 'low'): 'secondary' {
  // Always use secondary/neutral styling - no confidence claims
  return 'secondary';
}

function getConfidenceLabel(confidence: 'high' | 'medium' | 'low'): string {
  // Always use neutral "Preliminary" label - no confidence claims
  return 'Preliminary';
}

function getPricingModeDisplayLabel(mode: PricingMode): string {
  switch (mode) {
    case 'supply_only':
      return 'Home Package Estimate';
    case 'delivered_installed':
      return 'Typical Installed Allowance (Preliminary)';
    case 'community_all_in':
      return 'All-in Price (Includes Lot)';
  }
}

function getPricingModeHeadline(mode: PricingMode): string {
  switch (mode) {
    case 'supply_only':
      return 'Home package';
    case 'delivered_installed':
      return 'Starting from';
    case 'community_all_in':
      return 'All-in price';
  }
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function PreliminaryBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary"
            className="text-xs cursor-help"
          >
            Preliminary
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-48">
            Preliminary estimate. Not a contract or final bid. Final pricing confirmed in a written quote after site review.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function WhatsIncludedModal() {
  // Import modal content from centralized copy
  const modalContent = {
    title: "What's included in your price",
    subtitle: "A high‑level breakdown of what your estimate covers.",
    sections: [
      {
        title: "BaseMod Home Package",
        description: "Your factory‑built home with standard features and selected plan options, built to factory or modular standards (as applicable).",
        icon: Package,
      },
      {
        title: "Appliances & Standard Finishes",
        description: "Standard appliance package and finish specifications (cabinetry, counters, fixtures) as defined by the series/model. Upgrades are available.",
        icon: Wrench,
      },
      {
        title: "Professional Installation",
        description: "Home set and on‑site completion scope as quoted (varies by site and delivery model). Foundation/excavation are not included unless explicitly quoted.",
        icon: Truck,
      },
      {
        title: "Freight & Delivery",
        description: "Transportation from the factory to the build site. Route and access conditions may affect final delivery cost.",
        icon: Truck,
      },
    ],
    footerNote: "All estimates are preliminary and subject to site review. Final pricing is confirmed in a written quote.",
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-auto p-1">
          <HelpCircle className="w-4 h-4 mr-1" />
          What's included?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalContent.title}</DialogTitle>
          <DialogDescription>
            {modalContent.subtitle}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {modalContent.sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">{section.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{modalContent.footerNote}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PriceLineItem({ 
  label, 
  amount, 
  pending = false,
  isSubtotal = false,
}: { 
  label: string; 
  amount: number; 
  pending?: boolean;
  isSubtotal?: boolean;
}) {
  if (amount === 0 && !pending) return null;
  
  return (
    <div className={`flex justify-between ${isSubtotal ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
      <span className="text-sm">{label}</span>
      <span className={`text-sm ${pending ? 'text-amber-600' : ''}`}>
        {pending ? 'TBD' : formatPrice(amount)}
      </span>
    </div>
  );
}

function OptionLineItem({ name, price }: { name: string; price: number }) {
  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span className="truncate mr-2">{name}</span>
      <span className="flex-shrink-0">+{formatPrice(price)}</span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

/**
 * Full desktop pricing display with collapsible breakdown
 */
export function BuyerPricingDisplay({
  breakdown,
  flags,
  variant = 'full',
  className = '',
  onAction,
  actionLabel,
  showPlaceholder = false,
  onSwitchToInstalled,
  showFinancing = true,
  quoteId,
  // Mobile navigation props
  onBack,
  onContinue,
  canContinue = true,
  backLabel = 'Back',
  continueLabel = 'Continue',
  showNavigation = false,
  pulseOnReady,
}: BuyerPricingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFinancingCalculator, setShowFinancingCalculator] = useState(false);
  const [showPreQualFlow, setShowPreQualFlow] = useState(false);
  const isSupplyOnly = flags.pricingMode === 'supply_only';

  // Show placeholder when requested (e.g., during model selection step)
  if (showPlaceholder && variant === 'full') {
    return (
      <div className={`bg-card rounded-xl border border-border overflow-hidden ${className}`}>
        <div className="p-5 bg-secondary/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Starting from</span>
            <Badge variant="outline" className="text-xs">Preliminary</Badge>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground py-2">
            <Info className="w-4 h-4" />
            <span className="text-sm">Select a model to see pricing</span>
          </div>
          
          <p className="text-xs text-muted-foreground mt-3">
            {getPricingModeDisplayLabel(flags.pricingMode)}
          </p>
        </div>
        
        <div className="p-4 text-xs text-muted-foreground border-t border-border">
          <p>Estimates exclude land unless selected.</p>
          <p className="mt-1">Final pricing confirmed via formal written quote and site review.</p>
        </div>
      </div>
    );
  }

  // Mobile placeholder
  if (showPlaceholder && variant === 'mobile') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-4 py-3 safe-bottom">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Info className="w-4 h-4" />
          <span className="text-sm">Select a model to see pricing</span>
        </div>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <MobilePricingDrawer 
        breakdown={breakdown} 
        flags={flags}
        onAction={onAction}
        actionLabel={actionLabel}
        onBack={onBack}
        onContinue={onContinue}
        canContinue={canContinue}
        backLabel={backLabel}
        continueLabel={continueLabel}
        showNavigation={showNavigation}
        pulseOnReady={pulseOnReady}
        showFinancing={showFinancing}
        quoteId={quoteId}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <CompactPricingCard 
        breakdown={breakdown} 
        flags={flags}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-card rounded-xl border border-border shadow-lg overflow-hidden ${className}`}>
      {/* Header with main price */}
      <div className="p-5 bg-secondary/50 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {getPricingModeHeadline(flags.pricingMode)}
            </span>
            <PreliminaryBadge />
          </div>
          <WhatsIncludedModal />
        </div>
        
        {flags.hasPricing ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={breakdown.startingFromPrice}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-3xl font-semibold text-foreground">
                {formatPrice(breakdown.startingFromPrice)}
              </span>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Select a model to see pricing</span>
          </div>
        )}
        
        {/* Pricing mode label */}
        <p className="text-sm text-muted-foreground mt-1">
          {getPricingModeDisplayLabel(flags.pricingMode)}
        </p>
        
        {/* Warning flags */}
        {flags.freightPending && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Freight pending — estimate shown
          </p>
        )}
        
        {flags.basementSelectedRequiresQuote && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Basement requires site review — estimate range
          </p>
        )}
      </div>
      
      {/* Supply-only upsell to include installation */}
      {isSupplyOnly && onSwitchToInstalled && flags.hasPricing && (
        <div className="px-5 py-4 bg-accent/5 border-b border-border">
          <button
            onClick={onSwitchToInstalled}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                  Add Installation Estimate
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Most buyers choose Installed for a more complete number.
                </p>
              </div>
              <div className="flex items-center gap-1 text-accent opacity-70 group-hover:opacity-100 transition-opacity">
                <Truck className="w-4 h-4" />
                <ChevronDown className="w-3 h-3 -rotate-90" />
              </div>
            </div>
          </button>
        </div>
      )}
      
      {/* Collapsible breakdown */}
      {flags.hasPricing && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 flex items-center justify-between text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
              <span>View price breakdown</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-4">
              {/* Lot Premium (community builds - show first) */}
              {breakdown.lotPremium > 0 && (
                <div className="pb-2 border-b border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Your Lot
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-foreground">
                    <span className="text-sm">
                      {breakdown.lotNumber ? `Lot ${breakdown.lotNumber}` : 'Lot Premium'}
                      {breakdown.developmentName && (
                        <span className="text-muted-foreground font-normal"> at {breakdown.developmentName}</span>
                      )}
                    </span>
                    <span className="text-sm">{formatPrice(breakdown.lotPremium)}</span>
                  </div>
                </div>
              )}
              
              {/* Home Package */}
              <div>
                <PriceLineItem 
                  label={breakdown.labels.homePackage}
                  amount={breakdown.homePackagePrice}
                  isSubtotal
                />
              </div>
              
              {/* Install Package */}
              {breakdown.installPackagePrice > 0 && (
                <div>
                  <PriceLineItem 
                    label={breakdown.labels.installPackage}
                    amount={breakdown.installPackagePrice}
                    isSubtotal
                  />
                </div>
              )}
              
              {/* Community & Land (legacy - only for community_all_in) */}
              {breakdown.communityAdder > 0 && (
                <div>
                  <PriceLineItem 
                    label={breakdown.labels.communityPackage}
                    amount={breakdown.communityAdder}
                    isSubtotal
                  />
                </div>
              )}
              
              {/* Selected options & upgrades */}
              {breakdown.optionDetails.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Selected Add-ons
                  </p>
                  <div className="space-y-1">
                    {breakdown.optionDetails.map((option, i) => (
                      <OptionLineItem key={i} name={option.name} price={option.price} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fees & Permits */}
              {breakdown.feesPermitsTotal > 0 && (
                <div className="pt-2 border-t border-border">
                  <PriceLineItem 
                    label={breakdown.labels.feesPermits}
                    amount={breakdown.feesPermitsTotal}
                  />
                </div>
              )}
              
              {/* Total */}
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-foreground">
                    {breakdown.lotPremium > 0 ? 'All-In Estimate' : 'Estimated Total'}
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={breakdown.startingFromPrice}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-foreground"
                    >
                      {formatPrice(breakdown.startingFromPrice)}
                    </motion.span>
                  </AnimatePresence>
                </div>
                {breakdown.lotPremium > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Includes lot, home package, and typical sitework
                  </p>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {/* What's Included / Not Included Accordions */}
      {flags.hasPricing && (
        <InlineInclusionsAccordion />
      )}
      
      {/* Monthly Payment Estimate - BaseMod Financial */}
      {flags.hasPricing && showFinancing && breakdown.startingFromPrice > 0 && (
        <div className="px-5 py-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-foreground">BaseMod Financial</span>
            </div>
            <Badge variant="secondary" className="text-xs">6.875% APR</Badge>
          </div>
          
          <MonthlyPaymentBadge
            purchasePrice={breakdown.startingFromPrice}
            downPaymentPercent={5}
            onClick={() => setShowFinancingCalculator(true)}
          />
          
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setShowFinancingCalculator(true)}
            >
              <Calculator className="h-3 w-3 mr-1.5" />
              Explore Payments
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              onClick={() => setShowPreQualFlow(true)}
            >
              <Sparkles className="h-3 w-3 mr-1.5" />
              Get Pre-Qualified
            </Button>
          </div>
        </div>
      )}
      
      {/* Disclaimers */}
      <div className="px-5 py-4 bg-muted/30 border-t border-border space-y-1">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {breakdown.lotPremium > 0 
            ? 'All-in price includes your selected lot.'
            : 'Estimates exclude land unless selected.'}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Final pricing confirmed via formal written quote and site review.
        </p>
      </div>
      
      {/* Action button */}
      {onAction && actionLabel && (
        <div className="p-4 border-t border-border">
          <Button onClick={onAction} className="w-full">
            {actionLabel}
          </Button>
        </div>
      )}
      
      {/* Financing Calculator Dialog */}
      <Dialog open={showFinancingCalculator} onOpenChange={setShowFinancingCalculator}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>BaseMod Financial Calculator</DialogTitle>
            <DialogDescription>
              Calculate your estimated monthly payments
            </DialogDescription>
          </DialogHeader>
          <FinancingCalculator
            purchasePrice={breakdown.startingFromPrice}
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
        purchasePrice={breakdown.startingFromPrice}
        quoteId={quoteId}
      />
    </div>
  );
}

/**
 * Compact card variant for model cards and quick views
 */
function CompactPricingCard({
  breakdown,
  flags,
  className = '',
}: {
  breakdown: BuyerFacingBreakdown;
  flags: BuyerPricingFlags;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {flags.hasPricing ? (
        <>
          <AnimatePresence mode="wait">
            <motion.p
              key={breakdown.startingFromPrice}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium text-foreground"
            >
              Starting from {formatPrice(breakdown.startingFromPrice)}
            </motion.p>
          </AnimatePresence>
          <p className="text-xs text-muted-foreground">
            {getPricingModeDisplayLabel(flags.pricingMode)}
          </p>
          {flags.freightPending && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Freight TBD
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">Pricing available on request</p>
      )}
    </div>
  );
}

/**
 * Enhanced Mobile Pricing Drawer with financing CTAs and navigation
 * Uses vaul Drawer for smooth bottom sheet UX
 */
function MobilePricingDrawer({
  breakdown,
  flags,
  onAction,
  actionLabel,
  onBack,
  onContinue,
  canContinue = true,
  backLabel = 'Back',
  continueLabel = 'Continue',
  showNavigation = false,
  pulseOnReady,
  showFinancing = true,
  quoteId,
}: {
  breakdown: BuyerFacingBreakdown;
  flags: BuyerPricingFlags;
  onAction?: () => void;
  actionLabel?: string;
  onBack?: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
  backLabel?: string;
  continueLabel?: string;
  showNavigation?: boolean;
  pulseOnReady?: string | number | boolean | null;
  showFinancing?: boolean;
  quoteId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFinancingCalculator, setShowFinancingCalculator] = useState(false);
  const [showPreQualFlow, setShowPreQualFlow] = useState(false);
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Pulse animation effect for Continue button
  useState(() => {
    if (pulseOnReady !== null && pulseOnReady !== undefined && canContinue) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  });

  const drawerContent = (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      {/* Collapsed Trigger Bar - Always visible */}
      <DrawerTrigger asChild>
        <button className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)]">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left side: Price info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-muted-foreground">
                    {getPricingModeHeadline(flags.pricingMode)}
                  </span>
                  <PreliminaryBadge />
                </div>
                {flags.hasPricing ? (
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={breakdown.startingFromPrice}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="text-lg font-semibold text-foreground"
                    >
                      {formatPrice(breakdown.startingFromPrice)}
                    </motion.p>
                  </AnimatePresence>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a model</p>
                )}
              </div>

              {/* Center: Monthly payment estimate */}
              {flags.hasPricing && showFinancing && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Est. monthly</p>
                    <MonthlyPaymentBadge 
                      purchasePrice={breakdown.startingFromPrice} 
                      variant="compact"
                    />
                  </div>
                </div>
              )}

              {/* Right side: Expand indicator */}
              <div className="flex items-center gap-2 ml-3">
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Warning flags inline */}
            {flags.freightPending && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                Freight TBD
              </p>
            )}
          </div>
        </button>
      </DrawerTrigger>

      {/* Expanded Drawer Content */}
      <DrawerContent className="max-h-[85vh] pb-[env(safe-area-inset-bottom)]">
        <div className="overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="px-5 py-4 space-y-5">
            {/* Header Price Section */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground">
                  {getPricingModeHeadline(flags.pricingMode)}
                </span>
                <PreliminaryBadge />
              </div>
              {flags.hasPricing && (
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
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {getPricingModeDisplayLabel(flags.pricingMode)}
              </p>
            </div>

            {/* BaseMod Financial Section */}
            {flags.hasPricing && showFinancing && (
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-48">
                          Estimated payment based on 30-year term, 20% down, 6.875% APR. 
                          Includes taxes & insurance estimates.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setIsOpen(false);
                      setShowFinancingCalculator(true);
                    }}
                  >
                    <Calculator className="w-4 h-4 mr-1.5" />
                    Explore Payments
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setIsOpen(false);
                      setShowPreQualFlow(true);
                    }}
                  >
                    <Shield className="w-4 h-4 mr-1.5" />
                    Get Pre-Qualified
                  </Button>
                </div>
              </div>
            )}

            {/* Collapsible Price Breakdown */}
            {flags.hasPricing && (
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
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* What's Included */}
            <div className="border-t border-border pt-3">
              <WhatsIncludedModal />
            </div>

            {/* Disclaimers */}
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
              <p>Estimates exclude land unless selected.</p>
              <p>Final pricing confirmed via formal written quote.</p>
            </div>
          </div>
        </div>

        {/* Navigation Footer inside drawer */}
        {showNavigation && onContinue && (
          <div className="border-t border-border px-5 py-4 bg-card">
            <div className="flex items-center justify-between gap-3">
              {onBack ? (
                <Button variant="outline" onClick={() => { setIsOpen(false); onBack(); }}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  {backLabel}
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={() => { setIsOpen(false); onContinue(); }}
                disabled={!canContinue}
                size="lg"
                className={`min-w-[140px] ${isPulsing ? 'animate-[pulse-attention_0.6s_ease-in-out_2]' : ''}`}
              >
                {continueLabel}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      {createPortal(drawerContent, document.body)}
      
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
            purchasePrice={breakdown.startingFromPrice}
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
        purchasePrice={breakdown.startingFromPrice}
        quoteId={quoteId}
        onComplete={() => setShowPreQualFlow(false)}
      />
    </>
  );
}

// Legacy alias for backwards compatibility
const MobilePricingBar = MobilePricingDrawer;

// ============================================================================
// EXPORTS
// ============================================================================

export default BuyerPricingDisplay;
export { CompactPricingCard, MobilePricingBar, MobilePricingDrawer, WhatsIncludedModal, PreliminaryBadge };
