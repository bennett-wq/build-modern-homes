// WizardStickyFooter - consistent, premium footer for all wizard steps
// Fixed to viewport bottom, never requires scrolling to find Continue
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
}

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
}: WizardStickyFooterProps) {
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
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Back Button */}
          {!hideBack && onBack ? (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
          ) : (
            <div className="shrink-0" />
          )}

          {/* Center content - selection summary */}
          {children && (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="hidden md:flex items-center gap-3 min-w-0 flex-1 justify-center"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Continue Button with reassurance */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Button
              onClick={onContinue}
              disabled={!canContinue}
              size="lg"
              className={cn(
                'min-w-[140px] transition-all duration-200',
                canContinue 
                  ? 'shadow-md hover:shadow-lg' 
                  : 'opacity-60'
              )}
            >
              {continueLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {showReassurance && (
              <span className="text-[11px] text-muted-foreground/70">
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
