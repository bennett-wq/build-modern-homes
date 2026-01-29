/**
 * VerificationProgress - Staged progress indicator for financial verification
 * Shows clear progress through verification stages with animated transitions
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Calculator, 
  Award, 
  Loader2, 
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface VerificationStage {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const VERIFICATION_STAGES: VerificationStage[] = [
  { id: 'connecting', label: 'Securing your connection', icon: <Shield className="h-4 w-4" /> },
  { id: 'verifying', label: 'Verifying income & assets', icon: <Search className="h-4 w-4" /> },
  { id: 'calculating', label: 'Calculating affordability', icon: <Calculator className="h-4 w-4" /> },
  { id: 'matching', label: 'Matching best programs', icon: <Award className="h-4 w-4" /> },
];

// Stage durations for animated progress (simulated when real progress isn't available)
const STAGE_DURATIONS = [3000, 5000, 4000, 3000]; // 15s total simulated

interface VerificationProgressProps {
  isVerifying: boolean;
  onTimeout?: () => void;
  timeoutSeconds?: number;
  onFallbackToManual?: () => void;
  className?: string;
}

export function VerificationProgress({
  isVerifying,
  onTimeout,
  timeoutSeconds = 30,
  onFallbackToManual,
  className,
}: VerificationProgressProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Progress through stages
  useEffect(() => {
    if (!isVerifying) {
      setCurrentStageIndex(0);
      setIsTimedOut(false);
      setElapsedSeconds(0);
      return;
    }

    let stageIndex = 0;
    let elapsed = 0;
    
    const stageTimer = setInterval(() => {
      elapsed += 1000;
      setElapsedSeconds(Math.floor(elapsed / 1000));

      // Move to next stage based on elapsed time
      let cumulative = 0;
      for (let i = 0; i < STAGE_DURATIONS.length; i++) {
        cumulative += STAGE_DURATIONS[i];
        if (elapsed < cumulative) {
          setCurrentStageIndex(i);
          break;
        }
      }
      
      // If past all stages, stay on last one
      if (elapsed >= STAGE_DURATIONS.reduce((a, b) => a + b, 0)) {
        setCurrentStageIndex(STAGE_DURATIONS.length - 1);
      }
    }, 1000);

    return () => clearInterval(stageTimer);
  }, [isVerifying]);

  // Timeout handler
  useEffect(() => {
    if (!isVerifying) return;

    const timeout = setTimeout(() => {
      setIsTimedOut(true);
      onTimeout?.();
    }, timeoutSeconds * 1000);

    return () => clearTimeout(timeout);
  }, [isVerifying, timeoutSeconds, onTimeout]);

  if (!isVerifying && !isTimedOut) return null;

  const currentStage = VERIFICATION_STAGES[currentStageIndex];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main status */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-flex items-center justify-center p-4 rounded-full bg-blue-100 dark:bg-blue-900/30"
        >
          {isTimedOut ? (
            <Clock className="h-8 w-8 text-amber-600" />
          ) : (
            <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
          )}
        </motion.div>

        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {isTimedOut ? 'Taking longer than expected' : 'Analyzing your financials'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isTimedOut 
              ? "Don't worry — we're still working on your verification."
              : 'This usually takes 15-20 seconds'}
          </p>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="space-y-2">
        {VERIFICATION_STAGES.map((stage, index) => {
          const isComplete = index < currentStageIndex;
          const isCurrent = index === currentStageIndex && !isTimedOut;
          const isPending = index > currentStageIndex;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all duration-300',
                isCurrent && 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800',
                isComplete && 'bg-green-50/50 dark:bg-green-950/20',
                isPending && 'opacity-50'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                isComplete && 'bg-green-500 text-white',
                isCurrent && 'bg-blue-500 text-white',
                isPending && 'bg-muted'
              )}>
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  stage.icon
                )}
              </div>
              <span className={cn(
                'text-sm font-medium',
                isCurrent && 'text-foreground',
                isComplete && 'text-green-700 dark:text-green-400',
                isPending && 'text-muted-foreground'
              )}>
                {stage.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Timeout fallback options */}
      <AnimatePresence>
        {isTimedOut && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Verification is taking longer than usual
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  You can wait, or choose an alternative option below:
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onFallbackToManual}
              >
                Continue with manual verification
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                We'll email your results once verification completes
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer */}
      {!isTimedOut && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {elapsedSeconds}s elapsed
          </p>
        </div>
      )}
    </div>
  );
}
