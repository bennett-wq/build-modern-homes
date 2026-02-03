// ============================================================================
// Buyer-Facing Pricing Display Component
// Shows retail prices without exposing cost-plus markup data
// Integrated with BaseMod Financial for monthly payment estimates
// ============================================================================

import { useState } from 'react';
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
      <MobilePricingBar 
        breakdown={breakdown} 
        flags={flags}
        onAction={onAction}
        actionLabel={actionLabel}
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
 * Mobile fixed bottom bar variant
 */
function MobilePricingBar({
  breakdown,
  flags,
  onAction,
  actionLabel,
}: {
  breakdown: BuyerFacingBreakdown;
  flags: BuyerPricingFlags;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Starting from</span>
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
                className="text-xl font-semibold text-foreground"
              >
                {formatPrice(breakdown.startingFromPrice)}
              </motion.p>
            </AnimatePresence>
          ) : (
            <p className="text-sm text-muted-foreground">Select a model</p>
          )}
          {flags.freightPending && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Freight TBD
            </span>
          )}
        </div>
        
        {onAction && actionLabel && (
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline mobile pricing summary - collapsible bar for wizard flows
 * Renders above sticky footer without z-index conflicts
 */
function InlineMobilePricing({
  breakdown,
  flags,
  className = '',
}: {
  breakdown: BuyerFacingBreakdown;
  flags: BuyerPricingFlags;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFinancingCalculator, setShowFinancingCalculator] = useState(false);
  const [showPreQualFlow, setShowPreQualFlow] = useState(false);

  return (
    <>
      <div className={`bg-card border-t border-border ${className}`}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="w-full px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-3">
                {flags.hasPricing && (
                  <MonthlyPaymentBadge
                    purchasePrice={breakdown.startingFromPrice}
                    downPaymentPercent={5}
                    className="text-xs"
                  />
                )}
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {/* Financing CTAs */}
              {flags.hasPricing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFinancingCalculator(true);
                    }}
                  >
                    <Calculator className="h-3 w-3 mr-1.5" />
                    Explore Payments
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreQualFlow(true);
                    }}
                  >
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Get Pre-Qualified
                  </Button>
                </div>
              )}
              
              {/* Disclaimer */}
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Preliminary estimate. Final pricing confirmed via formal written quote and site review.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

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
      />
    </>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default BuyerPricingDisplay;
export { CompactPricingCard, MobilePricingBar, InlineMobilePricing, WhatsIncludedModal, PreliminaryBadge };
