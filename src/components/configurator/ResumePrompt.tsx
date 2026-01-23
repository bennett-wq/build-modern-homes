// Resume Quote Prompt - Shown when user has an in-progress build
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, RefreshCw, Home, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getModelBySlug } from '@/data/pricing-config';

interface ResumePromptProps {
  isOpen: boolean;
  savedModelSlug?: string;
  savedStep: number;
  onResume: () => void;
  onStartFresh: () => void;
}

export function ResumePrompt({
  isOpen,
  savedModelSlug,
  savedStep,
  onResume,
  onStartFresh,
}: ResumePromptProps) {
  const model = savedModelSlug ? getModelBySlug(savedModelSlug) : null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Card className="max-w-md w-full shadow-xl border-border">
              <CardContent className="p-6 sm:p-8">
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-7 h-7 text-accent" />
                </div>
                
                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center mb-2">
                  Resume your quote?
                </h2>
                
                {/* Description */}
                <p className="text-muted-foreground text-center mb-6">
                  You have an in-progress build{model ? ` with the ${model.name}` : ''}.
                  Would you like to continue where you left off?
                </p>
                
                {/* Progress indicator */}
                {savedStep > 1 && (
                  <div className="bg-muted rounded-lg p-3 mb-6">
                    <p className="text-sm text-muted-foreground text-center">
                      <span className="font-medium text-foreground">Step {savedStep} of 7</span>
                      {model && (
                        <span className="block mt-1">
                          <Home className="w-3.5 h-3.5 inline mr-1" />
                          {model.name} • {model.sqft.toLocaleString()} sq ft
                        </span>
                      )}
                    </p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={onResume}
                    size="lg"
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resume Quote
                  </Button>
                  <Button
                    onClick={onStartFresh}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start Fresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}