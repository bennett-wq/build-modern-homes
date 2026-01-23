// Resume Quote Prompt - Shown when user has an in-progress build
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, RefreshCw, Home, Clock, MapPin, Palette, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getModelBySlug } from '@/data/pricing-config';

interface ResumePromptProps {
  isOpen: boolean;
  savedModelSlug?: string;
  savedStep: number;
  onResume: () => void;
  onStartFresh: () => void;
  savedLotLabel?: string;
  savedPackageName?: string;
  savedGarageName?: string;
}

export function ResumePrompt({
  isOpen,
  savedModelSlug,
  savedStep,
  onResume,
  onStartFresh,
  savedLotLabel,
  savedPackageName,
  savedGarageName,
}: ResumePromptProps) {
  const model = savedModelSlug ? getModelBySlug(savedModelSlug) : null;
  
  // Check if we have any selections to show
  const hasSelections = model || savedLotLabel || savedPackageName || savedGarageName;
  
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
                <p className="text-muted-foreground text-center mb-4">
                  You have an in-progress build{model ? ` with the ${model.name}` : ''}.
                  Would you like to continue where you left off?
                </p>
                
                {/* Selections Summary */}
                {hasSelections && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Your selections
                    </p>
                    
                    {savedLotLabel && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Lot:</span>
                        <span className="text-foreground font-medium truncate">{savedLotLabel}</span>
                      </div>
                    )}
                    
                    {model && (
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Model:</span>
                        <span className="text-foreground font-medium truncate">
                          {model.name} • {model.sqft.toLocaleString()} sq ft
                        </span>
                      </div>
                    )}
                    
                    {savedPackageName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Palette className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Exterior:</span>
                        <span className="text-foreground font-medium truncate">{savedPackageName}</span>
                      </div>
                    )}
                    
                    {savedGarageName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Garage:</span>
                        <span className="text-foreground font-medium truncate">{savedGarageName}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Progress indicator - only show if step > 1 and no selections summary */}
                {savedStep > 1 && !hasSelections && (
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
