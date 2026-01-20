// ============================================================================
// Sticky Pricing Panel - Real-time price display with smooth animations
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle, Info, Copy, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { PriceBreakdown } from '@/hooks/usePricingEngine';
import type { ModelConfig } from '@/data/pricing-config';

interface PricingPanelProps {
  breakdown: PriceBreakdown;
  model: ModelConfig | null;
  formatPrice: (price: number) => string;
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
  onCopyLink: () => Promise<string>;
  onReset: () => void;
  isMobile?: boolean;
}

export function PricingPanel({
  breakdown,
  model,
  formatPrice,
  includeUtilityFees,
  includePermitsCosts,
  onCopyLink,
  onReset,
  isMobile = false,
}: PricingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = async () => {
    await onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const hasAnyPricing = breakdown.hasPricing || breakdown.basemodSiteworkTotal > 0;
  
  if (isMobile) {
    return (
      <MobilePricingBar
        breakdown={breakdown}
        formatPrice={formatPrice}
        hasAnyPricing={hasAnyPricing}
      />
    );
  }
  
  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-secondary/50 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-muted-foreground">Estimated Price</span>
          {breakdown.pricingSource && (
            <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {breakdown.pricingSource}
            </span>
          )}
        </div>
        
        {hasAnyPricing ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={breakdown.allInEstimateTotal}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-3xl font-semibold text-foreground">
                {formatPrice(breakdown.allInEstimateTotal)}
              </span>
              <span className="text-sm text-muted-foreground ml-2">starting from</span>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Select a model to see pricing</span>
          </div>
        )}
        
        {breakdown.freightPending && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Freight pending — estimate shown without freight
          </p>
        )}
      </div>
      
      {/* Breakdown */}
      {hasAnyPricing && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 flex items-center justify-between text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
              <span>View price breakdown</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-4">
              {/* Factory Home */}
              {breakdown.factoryTotal > 0 && (
                <BreakdownSection title="Factory Home" total={breakdown.factoryTotal} formatPrice={formatPrice}>
                  <BreakdownLine label="Base cost" value={breakdown.baseCost} formatPrice={formatPrice} />
                  <BreakdownLine 
                    label="Options adjustment" 
                    value={breakdown.optionsAdjustment} 
                    formatPrice={formatPrice}
                    showSign
                  />
                  <BreakdownLine 
                    label="Freight" 
                    value={breakdown.freight} 
                    formatPrice={formatPrice}
                    pending={breakdown.freightPending}
                  />
                  <BreakdownLine label="MHI dues" value={breakdown.mhiDues} formatPrice={formatPrice} />
                </BreakdownSection>
              )}
              
              {/* BaseMod Sitework */}
              <BreakdownSection title="BaseMod Sitework" total={breakdown.basemodSiteworkTotal} formatPrice={formatPrice}>
                <BreakdownLine label="Delivery & setup" value={breakdown.deliverySetupTotal} formatPrice={formatPrice} />
                <BreakdownLine label="On-site completion" value={breakdown.onSitePortionTotal} formatPrice={formatPrice} />
              </BreakdownSection>
              
              {/* Floor Plan Adders */}
              {breakdown.floorPlanAddersTotal > 0 && (
                <BreakdownSection title="Floor Plan Options" total={breakdown.floorPlanAddersTotal} formatPrice={formatPrice}>
                  {breakdown.floorPlanAdderDetails.map((item, i) => (
                    <BreakdownLine key={i} label={item.name} value={item.price} formatPrice={formatPrice} />
                  ))}
                </BreakdownSection>
              )}
              
              {/* Exterior Adders */}
              {breakdown.exteriorAddersTotal > 0 && (
                <BreakdownSection title="Exterior Options" total={breakdown.exteriorAddersTotal} formatPrice={formatPrice}>
                  {breakdown.exteriorAdderDetails.map((item, i) => (
                    <BreakdownLine key={i} label={item.name} value={item.price} formatPrice={formatPrice} />
                  ))}
                </BreakdownSection>
              )}
              
              {/* Optional Fees */}
              {(includeUtilityFees || includePermitsCosts) && breakdown.optionalFeesTotal > 0 && (
                <BreakdownSection title="Typical Fees (Optional)" total={breakdown.optionalFeesTotal} formatPrice={formatPrice}>
                  {includeUtilityFees && (
                    <BreakdownLine label="Utility authority fees" value={breakdown.utilityAuthorityFees} formatPrice={formatPrice} />
                  )}
                  {includePermitsCosts && (
                    <BreakdownLine label="Permits & soft costs" value={breakdown.permitsAndSoftCosts} formatPrice={formatPrice} />
                  )}
                </BreakdownSection>
              )}
              
              {/* Totals */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Home + BaseMod Sitework</span>
                  <span className="font-medium text-foreground">{formatPrice(breakdown.homeAndSiteworkTotal)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-foreground">All-in Estimate</span>
                  <span className="text-foreground">{formatPrice(breakdown.allInEstimateTotal)}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {/* Disclaimer */}
      <div className="px-5 py-4 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Estimated pricing. Final costs confirmed through formal quote and site review. 
          Excludes land, financing costs, taxes, and unusual site conditions.
        </p>
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Save & Share Build
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Build
        </Button>
      </div>
    </div>
  );
}

// Mobile pricing bar
function MobilePricingBar({
  breakdown,
  formatPrice,
  hasAnyPricing,
}: {
  breakdown: PriceBreakdown;
  formatPrice: (price: number) => string;
  hasAnyPricing: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground">Starting from</span>
          {hasAnyPricing ? (
            <AnimatePresence mode="wait">
              <motion.p
                key={breakdown.allInEstimateTotal}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="text-xl font-semibold text-foreground"
              >
                {formatPrice(breakdown.allInEstimateTotal)}
              </motion.p>
            </AnimatePresence>
          ) : (
            <p className="text-sm text-muted-foreground">Select a model</p>
          )}
        </div>
        {breakdown.freightPending && (
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Freight TBD
          </span>
        )}
      </div>
    </div>
  );
}

// Breakdown section component
function BreakdownSection({
  title,
  total,
  formatPrice,
  children,
}: {
  title: string;
  total: number;
  formatPrice: (price: number) => string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-sm font-medium text-foreground">{formatPrice(total)}</span>
      </div>
      <div className="space-y-1 pl-3 border-l-2 border-border">
        {children}
      </div>
    </div>
  );
}

// Individual breakdown line
function BreakdownLine({
  label,
  value,
  formatPrice,
  showSign = false,
  pending = false,
}: {
  label: string;
  value: number;
  formatPrice: (price: number) => string;
  showSign?: boolean;
  pending?: boolean;
}) {
  if (value === 0 && !pending) return null;
  
  const formattedValue = pending ? 'TBD' : formatPrice(Math.abs(value));
  const sign = showSign && value !== 0 ? (value > 0 ? '+' : '-') : '';
  
  return (
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{label}</span>
      <span className={pending ? 'text-amber-600' : ''}>
        {sign}{formattedValue}
      </span>
    </div>
  );
}

export default PricingPanel;
