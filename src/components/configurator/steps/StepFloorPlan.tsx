// ============================================================================
// Step 6: Personalize Floor Plan
// Uses database-driven upgrade options with fallback to static config
// ============================================================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Info, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FloorPlanImageViewer } from '@/components/FloorPlanImageViewer';
import { WizardStickyFooter, WizardFooterSpacer } from '@/components/wizard/WizardStickyFooter';
import { type ModelConfig, type BuildType, getAvailableFloorPlanOptions } from '@/data/pricing-config';
import { useFilteredUpgradeOptions } from '@/hooks/useUpgradeOptions';
import { useModels } from '@/hooks/useModels';
import { cn } from '@/lib/utils';

interface StepFloorPlanProps {
  model: ModelConfig;
  buildType: BuildType;
  isOptionSelected: (optionId: string) => boolean;
  onToggleOption: (optionId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function StepFloorPlan({
  model,
  buildType,
  isOptionSelected,
  onToggleOption,
  onNext,
  onBack,
}: StepFloorPlanProps) {
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);
  
  // Fetch models from database to get UUID for the selected model
  const { models: dbModels, isLoading: modelsLoading } = useModels();
  
  // Find the database model by slug to get its UUID
  const dbModel = useMemo(() => {
    return dbModels.find(m => m.slug === model.slug);
  }, [dbModels, model.slug]);
  
  // Fetch upgrade options from database, filtered by model ID and build type
  const { 
    filteredFloorPlanOptions: dbOptions, 
    isLoading: optionsLoading,
    error: optionsError 
  } = useFilteredUpgradeOptions(dbModel?.id || null, buildType);
  
  // Fallback to static options if database fetch fails or returns empty
  const staticOptions = getAvailableFloorPlanOptions(model, buildType);
  
  // Use database options if available, otherwise fall back to static
  const availableOptions = useMemo(() => {
    // If we have database options, use them
    if (dbOptions && dbOptions.length > 0) {
      return dbOptions.map(opt => ({
        id: opt.slug, // Use slug as ID for consistency with store
        name: opt.label,
        description: opt.description || '',
        price: opt.base_price,
        available: opt.is_active,
        buildTypes: opt.applies_to_build_types || undefined,
      }));
    }
    // Fall back to static options
    return staticOptions;
  }, [dbOptions, staticOptions]);
  
  const isLoading = modelsLoading || optionsLoading;
  const hasOptions = availableOptions.length > 0;
  
  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          Personalize Your Floor Plan
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Select optional upgrades for the {model.name}.
        </motion.p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Options Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground">Available Options</h3>
          
          {isLoading ? (
            <div className="p-6 rounded-xl bg-muted/30 border border-border flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading options...</p>
            </div>
          ) : hasOptions ? (
            <div className="space-y-3">
              {availableOptions.map((option, index) => {
                const isSelected = isOptionSelected(option.id);
                const isAvailable = option.available !== false;
                const appliesToBuildType = !option.buildTypes || option.buildTypes.includes(buildType);
                const isDisabled = !isAvailable || !appliesToBuildType;
                
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-200',
                      isDisabled
                        ? 'bg-muted/30 border-border opacity-60'
                        : isSelected
                        ? 'bg-accent/5 border-accent'
                        : 'bg-card border-border hover:border-accent/50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{option.name}</h4>
                          {isDisabled && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              {!isAvailable ? 'Not available' : `${buildType.toUpperCase()} only`}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        {option.price > 0 && isAvailable && (
                          <p className="text-sm font-medium text-accent mt-1">
                            +{formatPrice(option.price)}
                          </p>
                        )}
                      </div>
                      
                      {isDisabled ? (
                        <div className="w-10 h-6 rounded-full bg-muted flex items-center justify-center">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ) : (
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => onToggleOption(option.id)}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-muted/30 border border-border text-center">
              <Info className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">
                No additional floor plan options available for this model.
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Floor Plan Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground">Floor Plan Preview</h3>
          
          <div className="aspect-[4/3] rounded-xl bg-muted/30 border border-border flex items-center justify-center">
            {model.floorPlanPdf ? (
              <div className="text-center p-6">
                <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Floor plan available</p>
                <Button variant="outline" onClick={() => setFloorPlanOpen(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Floor Plan
                </Button>
              </div>
            ) : (
              <div className="text-center p-6">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Floor plan PDF coming next</p>
              </div>
            )}
          </div>
          
          {/* Model specs */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">Base Specifications</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Square Feet</span>
                <span className="font-medium text-foreground">{model.sqft.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bedrooms</span>
                <span className="font-medium text-foreground">{model.beds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bathrooms</span>
                <span className="font-medium text-foreground">{model.baths}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Length</span>
                <span className="font-medium text-foreground">{model.length}'</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <WizardFooterSpacer />
      <WizardStickyFooter
        onBack={onBack}
        onContinue={onNext}
        canContinue={true}
        continueLabel="Continue to Exterior"
        showReassurance={false}
      >
        <span className="text-sm text-muted-foreground">Options are optional</span>
      </WizardStickyFooter>
      
      {/* Floor Plan Viewer - image-based with zoom/pan */}
      <FloorPlanImageViewer
        open={floorPlanOpen}
        onOpenChange={setFloorPlanOpen}
        modelSlug={model.slug}
        modelName={model.name}
      />
    </div>
  );
}

export default StepFloorPlan;
