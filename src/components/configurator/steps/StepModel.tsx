// ============================================================================
// Step 3: Pick a Model
// Redesigned for visual confidence, scannability, and conversion focus
// ============================================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  Ruler, 
  BedDouble, 
  Bath, 
  Check, 
  AlertCircle,
  Scale,
  X,
  Star,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { models, type ModelConfig, type BuildType, getDefaultZone } from '@/data/pricing-config';
import { calculatePriceBreakdown, defaultBuildSelection, defaultExteriorSelection } from '@/hooks/usePricingEngine';
import { getModelHeroImageBySlug } from '@/lib/model-images';
import { cn } from '@/lib/utils';

// ============================================================================
// MODEL METADATA - Badges and descriptors for marketing
// ============================================================================

interface ModelMeta {
  badge?: { label: string; icon: typeof Star; variant: 'popular' | 'value' | 'affordable' };
  descriptor: string;
}

const modelMeta: Record<string, ModelMeta> = {
  hawthorne: {
    badge: { label: 'Most Popular', icon: Star, variant: 'popular' },
    descriptor: 'Our best-selling modern layout',
  },
  belmont: {
    badge: { label: 'Best Value', icon: TrendingUp, variant: 'value' },
    descriptor: 'Compact efficiency meets strong livability',
  },
  aspen: {
    descriptor: 'Maximum bedrooms in a smart footprint',
  },
  keeneland: {
    badge: { label: 'Most Affordable', icon: DollarSign, variant: 'affordable' },
    descriptor: 'Attainable price, premium feel',
  },
  laurel: {
    descriptor: 'Open concept with flexible spaces',
  },
};

// ============================================================================
// INTERFACES
// ============================================================================

interface StepModelProps {
  selectedModelSlug: string | null;
  onSelectModel: (slug: string) => void;
  onNext: () => void;
  onBack: () => void;
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StepModel({
  selectedModelSlug,
  onSelectModel,
  onNext,
  onBack,
  includeUtilityFees,
  includePermitsCosts,
}: StepModelProps) {
  const [compareModels, setCompareModels] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  
  const toggleCompare = (slug: string) => {
    setCompareModels(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug);
      }
      if (prev.length >= 3) {
        // Replace oldest
        return [...prev.slice(1), slug];
      }
      return [...prev, slug];
    });
  };
  
  // Pre-calculate prices for comparison
  const modelPrices = useMemo(() => {
    const prices: Record<string, { price: number; hasPricing: boolean }> = {};
    models.forEach(model => {
      prices[model.slug] = getStartingPrice(model, includeUtilityFees, includePermitsCosts);
    });
    return prices;
  }, [includeUtilityFees, includePermitsCosts]);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          Choose Your Home
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Each model is designed for efficiency and livability. Pick the one that fits your needs.
        </motion.p>
      </div>
      
      {/* Compare bar - only show when models are selected */}
      <AnimatePresence>
        {compareModels.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {compareModels.length} models selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCompareModels([])}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowCompare(true)}
                >
                  Compare
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Model Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {models.map((model, index) => {
          const isSelected = selectedModelSlug === model.slug;
          const isComparing = compareModels.includes(model.slug);
          const { price, hasPricing } = modelPrices[model.slug] || { price: 0, hasPricing: false };
          const meta = modelMeta[model.slug] || { descriptor: 'Modern floor plan' };
          
          return (
            <motion.div
              key={model.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ModelCard
                model={model}
                meta={meta}
                isSelected={isSelected}
                isComparing={isComparing}
                price={price}
                hasPricing={hasPricing}
                onSelect={() => onSelectModel(model.slug)}
                onToggleCompare={() => toggleCompare(model.slug)}
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
          Get Quote
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
      
      {/* Compare Dialog */}
      <CompareDialog
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        models={models.filter(m => compareModels.includes(m.slug))}
        prices={modelPrices}
        selectedSlug={selectedModelSlug}
        onSelect={(slug) => {
          onSelectModel(slug);
          setShowCompare(false);
        }}
      />
    </div>
  );
}

// ============================================================================
// MODEL CARD COMPONENT
// ============================================================================

function ModelCard({
  model,
  meta,
  isSelected,
  isComparing,
  price,
  hasPricing,
  onSelect,
  onToggleCompare,
}: {
  model: ModelConfig;
  meta: ModelMeta;
  isSelected: boolean;
  isComparing: boolean;
  price: number;
  hasPricing: boolean;
  onSelect: () => void;
  onToggleCompare: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get hero image with fallback
  const heroImage = model.heroImage || getModelHeroImageBySlug(model.slug);
  
  return (
    <div
      className={cn(
        'group relative rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer',
        'hover:shadow-xl hover:border-accent/50 hover:-translate-y-1',
        isSelected 
          ? 'border-accent shadow-lg ring-2 ring-accent/20' 
          : 'border-border bg-card',
      )}
      onClick={onSelect}
    >
      {/* Badge - Top Left */}
      {meta.badge && (
        <div className="absolute top-3 left-3 z-10">
          <Badge 
            className={cn(
              'text-xs font-medium shadow-sm',
              meta.badge.variant === 'popular' && 'bg-accent text-accent-foreground',
              meta.badge.variant === 'value' && 'bg-green-600 text-white',
              meta.badge.variant === 'affordable' && 'bg-blue-600 text-white',
            )}
          >
            <meta.badge.icon className="w-3 h-3 mr-1" />
            {meta.badge.label}
          </Badge>
        </div>
      )}
      
      {/* Selected indicator - Top Right */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg"
          >
            <Check className="w-4 h-4 text-accent-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Image - Dominant */}
      <div className="aspect-[16/10] bg-muted overflow-hidden relative">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {!imageError ? (
          <img
            src={heroImage}
            alt={`${model.name} exterior`}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              'group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          // Branded placeholder fallback
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <Home className="w-12 h-12 text-muted-foreground/40 mb-2" />
            <span className="text-sm font-medium text-muted-foreground">{model.name}</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Model name */}
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {model.name}
        </h3>
        
        {/* One-line descriptor */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {meta.descriptor}
        </p>
        
        {/* Specs row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-accent" />
            {model.beds} Beds
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-accent" />
            {model.baths} Baths
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="w-4 h-4 text-accent" />
            {model.sqft.toLocaleString()} sf
          </span>
        </div>
        
        {/* Price line */}
        <div className="flex items-center justify-between">
          {hasPricing ? (
            <div>
              <span className="text-xl font-bold text-foreground">
                {formatPrice(price)}
              </span>
              <span className="text-xs text-muted-foreground ml-1.5">starting</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Pricing available soon</span>
            </div>
          )}
          
          {/* Compare checkbox */}
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare();
            }}
          >
            <Checkbox 
              checked={isComparing} 
              className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <span className="text-xs text-muted-foreground">Compare</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPARE DIALOG
// ============================================================================

function CompareDialog({
  isOpen,
  onClose,
  models,
  prices,
  selectedSlug,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  models: ModelConfig[];
  prices: Record<string, { price: number; hasPricing: boolean }>;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  if (models.length === 0) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            Compare Models
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${models.length}, 1fr)` }}>
          {models.map(model => {
            const { price, hasPricing } = prices[model.slug] || { price: 0, hasPricing: false };
            const isSelected = selectedSlug === model.slug;
            const heroImage = model.heroImage || getModelHeroImageBySlug(model.slug);
            
            return (
              <div 
                key={model.slug}
                className={cn(
                  'border rounded-lg overflow-hidden',
                  isSelected ? 'border-accent ring-1 ring-accent/30' : 'border-border'
                )}
              >
                {/* Image */}
                <div className="aspect-[16/10] bg-muted">
                  <img
                    src={heroImage}
                    alt={model.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Details */}
                <div className="p-3 space-y-2">
                  <h4 className="font-semibold text-foreground">{model.name}</h4>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Square Feet</span>
                      <span className="font-medium text-foreground">{model.sqft.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bedrooms</span>
                      <span className="font-medium text-foreground">{model.beds}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bathrooms</span>
                      <span className="font-medium text-foreground">{model.baths}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Build Types</span>
                      <span className="font-medium text-foreground uppercase text-xs">
                        {model.buildTypes.join(' / ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    {hasPricing ? (
                      <div className="text-center">
                        <span className="text-lg font-bold text-foreground">{formatPrice(price)}</span>
                        <span className="text-xs text-muted-foreground ml-1">starting</span>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">
                        Pricing coming soon
                      </div>
                    )}
                  </div>
                  
                  <Button
                    className="w-full"
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => onSelect(model.slug)}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Selected
                      </>
                    ) : (
                      'Select This Model'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StepModel;