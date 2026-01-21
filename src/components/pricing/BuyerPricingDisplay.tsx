// ============================================================================
// Buyer-Facing Pricing Display Component
// Shows retail prices without exposing cost-plus markup data
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

function getConfidenceBadgeVariant(confidence: 'high' | 'medium' | 'low'): 'default' | 'secondary' | 'outline' {
  switch (confidence) {
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
  }
}

function getConfidenceLabel(confidence: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high':
      return 'High confidence';
    case 'medium':
      return 'Estimate';
    case 'low':
      return 'Preliminary';
  }
}

function getPricingModeDisplayLabel(mode: PricingMode): string {
  switch (mode) {
    case 'supply_only':
      return 'Home Package Only';
    case 'delivered_installed':
      return 'Delivered & Installed Estimate';
    case 'community_all_in':
      return 'All-in Price (Includes Lot)';
  }
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={getConfidenceBadgeVariant(confidence)}
            className="text-xs cursor-help"
          >
            {getConfidenceLabel(confidence)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-48">
            {confidence === 'high' && 'Pricing is based on confirmed factory quotes.'}
            {confidence === 'medium' && 'Some costs (like freight) are pending final confirmation.'}
            {confidence === 'low' && 'Preliminary estimate. Contact us for a detailed quote.'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function WhatsIncludedModal() {
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
          <DialogTitle>What's Included in Your Price</DialogTitle>
          <DialogDescription>
            A breakdown of what each package covers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Home Package */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">BaseMod Home Package</h4>
              <p className="text-sm text-muted-foreground">
                Your factory-built home including all standard features, selected floor plan options, 
                and exterior finishes. Built to CrossMod® standards with quality-controlled construction.
              </p>
            </div>
          </div>

          {/* Installation */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Professional Installation</h4>
              <p className="text-sm text-muted-foreground">
                Delivery, crane set, foundation connection, and on-site completion work. 
                Includes utility connections, drywall finishing, and final inspections.
              </p>
            </div>
          </div>

          {/* Delivery */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Freight & Delivery</h4>
              <p className="text-sm text-muted-foreground">
                Transportation from the factory to your build site. Distance and route 
                complexity may affect final delivery costs.
              </p>
            </div>
          </div>

          {/* Fees */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Fees & Permits</h4>
              <p className="text-sm text-muted-foreground">
                Typical utility authority fees, building permits, and soft costs. 
                Actual fees vary by jurisdiction and site conditions.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              All estimates are preliminary and subject to site review. 
              Final pricing will be confirmed through a formal written quote.
            </p>
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
}: BuyerPricingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
            <span className="text-sm font-medium text-muted-foreground">Starting from</span>
            <ConfidenceBadge confidence={flags.estimateConfidence} />
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
              
              {/* Community & Land (only for community_all_in) */}
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
                  <span className="text-foreground">Estimated Total</span>
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
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {/* What's Included / Not Included Accordions */}
      {flags.hasPricing && (
        <InlineInclusionsAccordion />
      )}
      
      {/* Disclaimers */}
      <div className="px-5 py-4 bg-muted/30 border-t border-border space-y-1">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Estimates exclude land unless selected.
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
            <ConfidenceBadge confidence={flags.estimateConfidence} />
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

// ============================================================================
// EXPORTS
// ============================================================================

export default BuyerPricingDisplay;
export { CompactPricingCard, MobilePricingBar, WhatsIncludedModal, ConfidenceBadge };
