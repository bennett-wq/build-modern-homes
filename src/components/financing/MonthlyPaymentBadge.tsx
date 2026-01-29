// MonthlyPaymentBadge - Compact inline payment estimate for BaseMod Financial
// Shows estimated monthly payment with tooltip breakdown

import React from 'react';
import { Calculator, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateQuickMonthlyEstimate } from '@/hooks/useFinancingCalculator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface MonthlyPaymentBadgeProps {
  purchasePrice: number;
  downPaymentPercent?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  onClick?: () => void;
}

export function MonthlyPaymentBadge({
  purchasePrice,
  downPaymentPercent = 5,
  className,
  variant = 'default',
  onClick,
}: MonthlyPaymentBadgeProps) {
  const monthlyEstimate = calculateQuickMonthlyEstimate(
    purchasePrice,
    downPaymentPercent
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (purchasePrice <= 0) return null;

  const content = (
    <div className="space-y-2">
      <p className="font-medium text-sm">Estimated Monthly Payment</p>
      <p className="text-2xl font-bold text-blue-600">
        {formatCurrency(monthlyEstimate)}/mo
      </p>
      <p className="text-xs text-muted-foreground">
        Based on {downPaymentPercent}% down at 6.875% APR
      </p>
      <div className="border-t pt-2 mt-2">
        <p className="text-xs text-muted-foreground">
          Includes principal, interest, taxes & insurance (PITI)
        </p>
      </div>
      {onClick && (
        <p className="text-xs text-blue-600 font-medium">
          Click to explore financing options
        </p>
      )}
    </div>
  );

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className={cn(
                'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors',
                onClick && 'hover:ring-2 hover:ring-blue-500/20',
                className
              )}
              onClick={onClick}
            >
              <Calculator className="h-3 w-3 mr-1" />
              {formatCurrency(monthlyEstimate)}/mo
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px]">
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                'inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors',
                className
              )}
            >
              Est. {formatCurrency(monthlyEstimate)}/mo
              <Info className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px]">
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={onClick}
            className={cn(
              'flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800',
              onClick && 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors',
              className
            )}
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. Monthly</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(monthlyEstimate)}/mo
              </p>
            </div>
            <Info className="h-4 w-4 text-muted-foreground ml-auto" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px]">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
