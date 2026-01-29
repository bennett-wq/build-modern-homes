// FinancingCalculator - Interactive PITI Calculator for BaseMod Financial
// Premium, world-class financing experience with smooth animations

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp,
  Home,
  Shield,
  Receipt,
  TrendingDown,
  Info,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinancingCalculator } from '@/hooks/useFinancingCalculator';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnimatedPrice } from '@/components/ui/animated-price';

interface FinancingCalculatorProps {
  purchasePrice: number;
  className?: string;
  onGetPreQualified?: () => void;
  compact?: boolean;
}

const DOWN_PAYMENT_PRESETS = [3, 5, 10, 15, 20];

export function FinancingCalculator({
  purchasePrice,
  className,
  onGetPreQualified,
  compact = false,
}: FinancingCalculatorProps) {
  const [showBreakdown, setShowBreakdown] = useState(!compact);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5);

  const {
    breakdown,
    setDownPaymentPercent,
    setLoanTermYears,
    downPaymentPercent,
    loanTermYears,
  } = useFinancingCalculator(purchasePrice);

  const handlePresetClick = (percent: number) => {
    setSelectedPreset(percent);
    setDownPaymentPercent(percent);
  };

  const handleSliderChange = (value: number[]) => {
    const percent = value[0];
    setDownPaymentPercent(percent);
    // Clear preset selection if slider moved away from preset values
    if (!DOWN_PAYMENT_PRESETS.includes(percent)) {
      setSelectedPreset(null);
    } else {
      setSelectedPreset(percent);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn(
      'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
      'rounded-2xl border border-slate-200 dark:border-slate-700',
      'overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                BaseMod Financial
              </h3>
              <p className="text-blue-100 text-sm">
                Financing made simple
              </p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-white/20 text-white border-0 backdrop-blur-sm"
          >
            {breakdown.interestRate}% APR
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Monthly Payment Hero */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">
            Estimated Monthly Payment
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-foreground tracking-tight">
              <AnimatedPrice 
                value={breakdown.totalMonthlyPayment} 
                className="text-4xl font-bold"
              />
            </span>
            <span className="text-lg text-muted-foreground">/mo</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Principal, interest, taxes & insurance included
          </p>
        </div>

        {/* Down Payment Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Down Payment
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">
                {downPaymentPercent}%
              </span>
              <span className="text-sm text-muted-foreground">
                ({formatCurrency(breakdown.downPaymentAmount)})
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2">
            {DOWN_PAYMENT_PRESETS.map((percent) => (
              <button
                key={percent}
                onClick={() => handlePresetClick(percent)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                  'border',
                  selectedPreset === percent
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-background text-foreground border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950'
                )}
              >
                {percent}%
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="pt-2">
            <Slider
              value={[downPaymentPercent]}
              onValueChange={handleSliderChange}
              min={3}
              max={30}
              step={1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>3%</span>
              <span>30%</span>
            </div>
          </div>

          {/* PMI Notice */}
          <AnimatePresence>
            {breakdown.requiresPMI && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <TrendingDown className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      PMI Required
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 text-xs">
                      With less than 20% down, PMI of {formatCurrency(breakdown.monthlyPMI)}/mo applies until you reach 20% equity.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loan Term Toggle */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Loan Term
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setLoanTermYears(30)}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl transition-all duration-200',
                'border-2',
                loanTermYears === 30
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300'
                  : 'bg-background border-border hover:border-blue-300'
              )}
            >
              <div className="text-center">
                <p className="font-semibold">30 Years</p>
                <p className="text-xs text-muted-foreground">Lower payments</p>
              </div>
            </button>
            <button
              onClick={() => setLoanTermYears(15)}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl transition-all duration-200',
                'border-2',
                loanTermYears === 15
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300'
                  : 'bg-background border-border hover:border-blue-300'
              )}
            >
              <div className="text-center">
                <p className="font-semibold">15 Years</p>
                <p className="text-xs text-muted-foreground">Pay off faster</p>
              </div>
            </button>
          </div>
        </div>

        {/* PITI Breakdown */}
        <div className="space-y-3">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-blue-600 transition-colors"
          >
            <span>Payment Breakdown</span>
            {showBreakdown ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-2">
                  {/* Principal & Interest */}
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Principal & Interest</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(breakdown.loanAmount)} loan
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(breakdown.monthlyPrincipalInterest)}
                    </span>
                  </div>

                  {/* Property Tax */}
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                        <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Property Taxes</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                                Est. 1.5% annually
                                <Info className="h-3 w-3" />
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-[200px]">
                                Actual rates vary by location. This estimate is for planning purposes.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(breakdown.monthlyPropertyTax)}
                    </span>
                  </div>

                  {/* Insurance */}
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Homeowner's Insurance</p>
                        <p className="text-xs text-muted-foreground">
                          Est. $1,800/year
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(breakdown.monthlyInsurance)}
                    </span>
                  </div>

                  {/* PMI (if applicable) */}
                  {breakdown.requiresPMI && (
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                          <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Private Mortgage Insurance
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Removed at 20% equity
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-amber-800 dark:text-amber-200">
                        {formatCurrency(breakdown.monthlyPMI)}
                      </span>
                    </div>
                  )}

                  {/* Divider and Total */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        Total Monthly Payment
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(breakdown.totalMonthlyPayment)}
                      </span>
                    </div>
                  </div>

                  {/* Affordability Insight */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Recommended income:</strong>{' '}
                      {formatCurrency(breakdown.recommendedMinIncome)}/year
                      <br />
                      <span className="text-blue-600 dark:text-blue-400">
                        Based on 28% debt-to-income ratio guideline
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA Button */}
        {onGetPreQualified && (
          <Button
            onClick={onGetPreQualified}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Get Pre-Qualified in 2 Minutes
          </Button>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground">
          This is not a commitment to lend. Rates and terms subject to change.
          <br />
          Pre-qualification is not pre-approval.
        </p>
      </div>
    </div>
  );
}
