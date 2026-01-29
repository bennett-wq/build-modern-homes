// WizardStickyFooter - consistent, premium footer for all wizard steps
// Fixed to viewport bottom, never requires scrolling to find Continue
// Includes non-blocking inline feedback for selections (no toasts)
import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WizardStickyFooterProps {
  onBack?: () => void;
  onContinue: () => void;
  canContinue: boolean;
  backLabel?: string;
  continueLabel?: string;
  /** Optional summary content shown between back and continue */
  children?: ReactNode;
  /** Show reassurance text "You can change this later." */
  showReassurance?: boolean;
  /** Hide back button (e.g., on first step) */
  hideBack?: boolean;
  className?: string;
  /** Show "Updated" indicator (triggers when value changes) */
  showUpdatedIndicator?: boolean;
  /** Callback for undo action (if provided, shows Undo button with indicator) */
  onUndo?: () => void;
  /** Trigger pulse animation on the Continue button (pass a changing value to trigger) */
  pulseOnReady?: string | number | boolean | null;
}

// Inline feedback indicator duration (ms)
const INDICATOR_DURATION = 2500;
// Pulse animation duration (ms)
const PULSE_DURATION = 2000;

export function WizardStickyFooter({
  onBack,
  onContinue,
  canContinue,
  backLabel = 'Back',
  continueLabel = 'Continue',
  children,
  showReassurance = true,
  hideBack = false,
  className,
  showUpdatedIndicator = false,
  onUndo,
  pulseOnReady,
}: WizardStickyFooterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const isFirstRender = useRef(true);
  
  // Show indicator when showUpdatedIndicator becomes true, auto-hide after duration
  useEffect(() => {
    if (showUpdatedIndicator) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, INDICATOR_DURATION);
      return () => clearTimeout(timer);
    }
  }, [showUpdatedIndicator]);
  
  // Trigger pulse animation when pulseOnReady changes (skip initial render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (pulseOnReady !== null && pulseOnReady !== undefined && canContinue) {
      setIsPulsing(true);
      const timer = setTimeout(() => {
        setIsPulsing(false);
      }, PULSE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [pulseOnReady, canContinue]);
  
  return (
    <div 
      className={cn(
        // Fixed positioning with premium styling
        'fixed bottom-0 left-0 right-0 z-50',
        // Subtle shadow and backdrop blur for depth
        'bg-card/95 backdrop-blur-md border-t border-border',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Mobile: Show selection summary above buttons */}
        <div className="md:hidden mb-3">
          <AnimatePresence mode="wait">
            {children && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Back Button */}
          {!hideBack && onBack ? (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="shrink-0"
              size="default"
            >
              <ArrowLeft className="mr-1.5 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
              <span className="sm:hidden">Back</span>
            </Button>
          ) : (
            <div className="shrink-0" />
          )}

          {/* Desktop: Center content - selection summary + inline feedback */}
          <div className="hidden md:flex items-center gap-3 min-w-0 flex-1 justify-center">
            <AnimatePresence mode="wait">
              {children && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-3"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Inline "Updated" indicator + Undo */}
            <AnimatePresence>
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Updated
                  </span>
                  {onUndo && (
                    <button
                      onClick={onUndo}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Undo2 className="w-3 h-3" />
                      Undo
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Continue Button with reassurance */}
          <div className="flex flex-col items-end gap-0.5 sm:gap-1 shrink-0">
            <Button
              onClick={onContinue}
              disabled={!canContinue}
              size="lg"
              className={cn(
                'min-w-[120px] sm:min-w-[140px] transition-all duration-200',
                canContinue 
                  ? 'shadow-md hover:shadow-lg' 
                  : 'opacity-60',
                // Subtle pulse animation to draw attention after selection
                isPulsing && 'animate-[pulse-attention_0.6s_ease-in-out_2]'
              )}
            >
              {continueLabel}
              <ArrowRight className="ml-1.5 sm:ml-2 h-4 sm:h-5 w-4 sm:w-5" />
            </Button>
            {showReassurance && (
              <span className="text-[10px] sm:text-[11px] text-muted-foreground/70">
                You can change this later.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 
 * Spacer to add safe bottom padding so content isn't covered by the footer.
 * Use this at the bottom of scrollable content areas.
 */
export function WizardFooterSpacer({ className }: { className?: string }) {
  return (
    <div 
      className={cn('h-28 sm:h-24 shrink-0', className)} 
      aria-hidden="true" 
    />
  );
}
