// ============================================================================
// Step Indicator - Wizard progress navigation
// ============================================================================

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  name: string;
  shortName: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      {/* Desktop */}
      <ol className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && (isCompleted || step.id <= currentStep);
          
          return (
            <li key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-3 group transition-colors',
                  isClickable ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    'relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
                    isCompleted
                      ? 'bg-accent border-accent'
                      : isCurrent
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-background',
                    isClickable && !isCurrent && 'group-hover:border-accent/50',
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-accent-foreground" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-accent' : 'text-muted-foreground',
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                  
                  {/* Current step indicator */}
                  {isCurrent && (
                    <motion.div
                      layoutId="currentStep"
                      className="absolute inset-0 rounded-full border-2 border-accent"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                
                {/* Step name */}
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isCurrent
                      ? 'text-foreground'
                      : isCompleted
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/60',
                    isClickable && 'group-hover:text-foreground',
                  )}
                >
                  {step.name}
                </span>
              </button>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn(
                      'h-0.5 w-full transition-colors duration-300',
                      step.id < currentStep ? 'bg-accent' : 'bg-border',
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      
      {/* Mobile - Progress bars only (step text shown in parent) */}
      <div className="md:hidden">
        <div className="flex gap-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-200',
                step.id <= currentStep ? 'bg-accent' : 'bg-border',
              )}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default StepIndicator;
