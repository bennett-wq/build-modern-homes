// ============================================================================
// Step 3: Pick a Model
// ============================================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Home, Ruler, BedDouble, Bath, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { models, type ModelConfig, type BuildType, getDefaultZone } from '@/data/pricing-config';
import { calculatePriceBreakdown, defaultBuildSelection, defaultExteriorSelection } from '@/hooks/usePricingEngine';
import { cn } from '@/lib/utils';

interface StepModelProps {
  selectedModelSlug: string | null;
  onSelectModel: (slug: string) => void;
  onNext: () => void;
  onBack: () => void;
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
}

// Calculate "Starting From" price for a model (using lowest buildType)
function getStartingPrice(model: ModelConfig, includeUtilityFees: boolean, includePermitsCosts: boolean): {
  price: number;
  hasPricing: boolean;
  buildType: BuildType;
} {
  const zone = getDefaultZone();
  let lowestPrice = Infinity;
  let hasPricing = false;
  let bestBuildType: BuildType = model.buildTypes[0];
  
  for (const buildType of model.buildTypes) {
    const selection = {
      ...defaultBuildSelection,
      modelSlug: model.slug,
      buildType,
      includeUtilityFees,
      includePermitsCosts,
      exteriorSelection: defaultExteriorSelection,
    };
    
    const breakdown = calculatePriceBreakdown(selection, model, zone);
    
    if (breakdown.hasPricing && breakdown.allInEstimateTotal < lowestPrice) {
      lowestPrice = breakdown.allInEstimateTotal;
      hasPricing = true;
      bestBuildType = buildType;
    }
  }
  
  // If no factory pricing, calculate sitework-only estimate
  if (!hasPricing) {
    const selection = {
      ...defaultBuildSelection,
      modelSlug: model.slug,
      buildType: model.buildTypes[0],
      includeUtilityFees,
      includePermitsCosts,
    };
    const breakdown = calculatePriceBreakdown(selection, model, zone);
    lowestPrice = breakdown.basemodSiteworkTotal + breakdown.optionalFeesTotal;
  }
  
  return {
    price: lowestPrice === Infinity ? 0 : lowestPrice,
    hasPricing,
    buildType: bestBuildType,
  };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function StepModel({
  selectedModelSlug,
  onSelectModel,
  onNext,
  onBack,
  includeUtilityFees,
  includePermitsCosts,
}: StepModelProps) {
  const [detailModel, setDetailModel] = useState<ModelConfig | null>(null);
  
  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          Pick a Model
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Compare floor plans and find the right fit for your needs.
        </motion.p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model, index) => {
          const isSelected = selectedModelSlug === model.slug;
          const { price, hasPricing } = getStartingPrice(model, includeUtilityFees, includePermitsCosts);
          
          return (
            <motion.div
              key={model.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ModelCard
                model={model}
                isSelected={isSelected}
                price={price}
                hasPricing={hasPricing}
                onSelect={() => onSelectModel(model.slug)}
                onViewDetails={() => setDetailModel(model)}
              />
            </motion.div>
          );
        })}
      </div>
      
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between pt-4"
      >
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!selectedModelSlug}
        >
          Configure
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
      
      {/* Details Dialog */}
      <ModelDetailsDialog
        model={detailModel}
        onClose={() => setDetailModel(null)}
      />
    </div>
  );
}

// Model Card Component
function ModelCard({
  model,
  isSelected,
  price,
  hasPricing,
  onSelect,
  onViewDetails,
}: {
  model: ModelConfig;
  isSelected: boolean;
  price: number;
  hasPricing: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div
      className={cn(
        'relative rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:border-accent/50',
        isSelected ? 'border-accent shadow-lg' : 'border-border bg-card',
      )}
      onClick={onSelect}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-accent flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-accent-foreground" />
        </motion.div>
      )}
      
      {/* Image */}
      <div className="aspect-[16/10] bg-muted overflow-hidden">
        {model.heroImage && !imageError ? (
          <img
            src={model.heroImage}
            alt={model.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Home className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">{model.name}</h3>
          <div className="flex gap-1">
            {model.buildTypes.map(type => (
              <Badge key={type} variant="secondary" className="text-xs uppercase">
                {type}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Specs */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5" />
            {model.sqft.toLocaleString()} sf
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" />
            {model.beds} bd
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            {model.baths} ba
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-baseline justify-between">
          {hasPricing ? (
            <div>
              <span className="text-lg font-semibold text-foreground">
                {formatPrice(price)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">starting</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-sm">Pricing coming soon</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            What's included?
          </Button>
        </div>
      </div>
    </div>
  );
}

// Model Details Dialog
function ModelDetailsDialog({
  model,
  onClose,
}: {
  model: ModelConfig | null;
  onClose: () => void;
}) {
  if (!model) return null;
  
  return (
    <Dialog open={!!model} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{model.name} - What's Included</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{model.sqft.toLocaleString()} sq ft</span>
            <span>{model.beds} bedrooms</span>
            <span>{model.baths} bathrooms</span>
          </div>
          
          {/* Build types */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Available Build Types</h4>
            <div className="flex gap-2">
              {model.buildTypes.map(type => (
                <Badge key={type} variant="outline" className="uppercase">
                  {type === 'xmod' ? 'CrossMod (XMOD)' : 'Modular (MOD)'}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Standard features */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Standard Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Factory-built to CrossMod® or Modular standards</li>
              <li>• Energy-efficient construction</li>
              <li>• Quality-controlled manufacturing</li>
              <li>• Full architectural drawings</li>
            </ul>
          </div>
          
          {/* Floor plan options */}
          {model.floorPlanOptions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Available Options</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {model.floorPlanOptions.map(option => (
                  <li key={option.id} className={!option.available ? 'opacity-50' : ''}>
                    • {option.name} {option.available && option.price > 0 && `(+${formatPrice(option.price)})`}
                    {!option.available && ' (not available)'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Pricing source */}
          {model.pricingSource && (
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              Pricing source: {model.pricingSource}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StepModel;
