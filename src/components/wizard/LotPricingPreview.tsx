// ============================================================================
// LotPricingPreview Component
// Floating all-in price preview with animated breakdown
// ============================================================================

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Hammer, MapPin, FileText, TrendingUp, Info } from 'lucide-react';
import { AnimatedPrice } from '@/components/ui/animated-price';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PriceLineItem {
  label: string;
  value: number;
  icon: React.ElementType;
  tooltip?: string;
  highlight?: boolean;
}

interface LotPricingPreviewProps {
  lotLabel: string;
  lotPremium: number;
  homePackage?: number;
  sitework?: number;
  feesAllowance?: number;
  allInTotal: number;
  modelName?: string;
  isVisible: boolean;
  className?: string;
  onLockPrice?: () => void;
  showBreakdown?: boolean;
}

export const LotPricingPreview = memo(function LotPricingPreview({
  lotLabel,
  lotPremium,
  homePackage = 0,
  sitework = 0,
  feesAllowance = 0,
  allInTotal,
  modelName,
  isVisible,
  className,
  onLockPrice,
  showBreakdown = true,
}: LotPricingPreviewProps) {
  const lineItems: PriceLineItem[] = [
    {
      label: lotLabel,
      value: lotPremium,
      icon: MapPin,
      tooltip: 'Homesite premium for this lot',
      highlight: true,
    },
  ];

  if (homePackage > 0) {
    lineItems.push({
      label: modelName ? `${modelName} Home Package` : 'Home Package',
      value: homePackage,
      icon: Home,
      tooltip: 'Factory-built home with standard features',
    });
  }

  if (sitework > 0) {
    lineItems.push({
      label: 'Typical Sitework Allowance',
      value: sitework,
      icon: Hammer,
      tooltip: 'Foundation, driveway, landscaping, and utilities',
    });
  }

  if (feesAllowance > 0) {
    lineItems.push({
      label: 'Permits & Utilities',
      value: feesAllowance,
      icon: FileText,
      tooltip: 'Typical permit fees and utility connection costs',
    });
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'bg-card border border-border rounded-2xl shadow-xl overflow-hidden',
            'backdrop-blur-sm',
            className
          )}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-accent/10 to-transparent border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  All-In Estimate
                </p>
                <AnimatedPrice
                  value={allInTotal}
                  className="text-2xl font-bold text-foreground"
                />
              </div>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                Lock Price
              </Badge>
            </div>
          </div>

          {/* Breakdown */}
          {showBreakdown && (
            <div className="p-5 space-y-3">
              <TooltipProvider>
                {lineItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-center justify-between py-2',
                      index < lineItems.length - 1 && 'border-b border-border/50'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        item.highlight 
                          ? 'bg-accent/20 text-accent' 
                          : 'bg-muted text-muted-foreground'
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-foreground">{item.label}</span>
                        {item.tooltip && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-[200px]">{item.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      'font-medium tabular-nums',
                      item.highlight ? 'text-accent' : 'text-foreground'
                    )}>
                      ${item.value.toLocaleString()}
                    </span>
                  </motion.div>
                ))}
              </TooltipProvider>

              {/* Total */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">All-In Total</span>
                  <AnimatedPrice
                    value={allInTotal}
                    className="text-lg font-bold text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          {onLockPrice && (
            <div className="px-5 pb-5">
              <Button
                onClick={onLockPrice}
                className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg"
              >
                Lock in Today's Pricing
              </Button>
            </div>
          )}

          {/* Footer note */}
          <div className="px-5 pb-4">
            <p className="text-[10px] text-muted-foreground text-center">
              Preliminary estimate only. Final pricing subject to site conditions.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Compact version for inline display
export const LotPricingBadge = memo(function LotPricingBadge({
  allInTotal,
  isVisible,
  className,
}: {
  allInTotal: number;
  isVisible: boolean;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
            'bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30',
            'backdrop-blur-sm',
            className
          )}
        >
          <span className="text-xs text-muted-foreground">All-in from</span>
          <AnimatedPrice
            value={allInTotal}
            className="text-sm font-bold text-accent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
