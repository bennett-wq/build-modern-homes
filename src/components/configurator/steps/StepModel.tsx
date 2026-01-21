// ============================================================================
// Step 3: Pick a Model
// Premium redesign with price trust, branded placeholders, and clean hierarchy
// ============================================================================

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Ruler, 
  BedDouble, 
  Bath, 
  Check, 
  Scale,
  X,
  Star,
  TrendingUp,
  DollarSign,
  Sparkles,
  Users,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  models, 
  type ModelConfig, 
  type BuildType, 
  getDefaultZone,
} from '@/data/pricing-config';
import { 
  calculateFullPricing, 
  defaultBuildSelection, 
  defaultExteriorSelection,
  type PricingOutput,
} from '@/hooks/usePricingEngine';
import { getModelHeroImageBySlug } from '@/lib/model-images';
import { cn } from '@/lib/utils';

// ============================================================================
// MODEL METADATA - Badges and descriptors for marketing
// ============================================================================

interface ModelMeta {
  badge?: { 
    label: string; 
    icon: typeof Star; 
    variant: 'popular' | 'value' | 'affordable' | 'premium' | 'family';
  };
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
    badge: { label: 'Most Bedrooms', icon: Users, variant: 'family' },
    descriptor: 'Maximum bedrooms in a smart footprint',
  },
  keeneland: {
    badge: { label: 'Premium', icon: Sparkles, variant: 'premium' },
    descriptor: 'Spacious open-concept with refined details',
  },
  laurel: {
    badge: { label: 'Most Affordable', icon: DollarSign, variant: 'affordable' },
    descriptor: 'Attainable price, quality construction',
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
// UNIFIED PRICING HELPER
// Uses the same buyerFacingBreakdown logic as the pricing rail
// This is the SINGLE SOURCE OF TRUTH for "Starting from" prices
// ============================================================================

function getBuyerFacingStartingPrice(
  model: ModelConfig,
  includeUtilityFees: boolean,
  includePermitsCosts: boolean
): {
  price: number;
  hasPricing: boolean;
  buildType: BuildType;
  pricingOutput: PricingOutput | null;
} {
  const zone = getDefaultZone();
  let lowestPrice = Infinity;
  let hasPricing = false;
  let bestBuildType: BuildType = model.buildTypes[0];
  let bestPricingOutput: PricingOutput | null = null;
  
  // Find the lowest buyer-facing price across all build types
  for (const buildType of model.buildTypes) {
    const selection = {
      ...defaultBuildSelection,
      modelSlug: model.slug,
      buildType,
      includeUtilityFees,
      includePermitsCosts,
      exteriorSelection: defaultExteriorSelection,
      pricingMode: 'delivered_installed' as const, // Match the pricing rail mode
    };
    
    // Use the SAME calculateFullPricing that powers the pricing rail
    const pricingOutput = calculateFullPricing(selection, model, zone);
    
    if (pricingOutput.hasPricing && pricingOutput.buyerFacingBreakdown.startingFromPrice < lowestPrice) {
      lowestPrice = pricingOutput.buyerFacingBreakdown.startingFromPrice;
      hasPricing = true;
      bestBuildType = buildType;
      bestPricingOutput = pricingOutput;
    }
  }
  
  // Fallback for models without factory pricing
  if (!hasPricing) {
    const selection = {
      ...defaultBuildSelection,
      modelSlug: model.slug,
      buildType: model.buildTypes[0],
      includeUtilityFees,
      includePermitsCosts,
      pricingMode: 'delivered_installed' as const,
    };
    const pricingOutput = calculateFullPricing(selection, model, zone);
    lowestPrice = pricingOutput.buyerFacingBreakdown.startingFromPrice;
    bestPricingOutput = pricingOutput;
  }
  
  return {
    price: lowestPrice === Infinity ? 0 : lowestPrice,
    hasPricing,
    buildType: bestBuildType,
    pricingOutput: bestPricingOutput,
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
        return [...prev.slice(1), slug];
      }
      return [...prev, slug];
    });
  };
  
  // Pre-calculate buyer-facing prices for all models using unified logic
  const modelPrices = useMemo(() => {
    const prices: Record<string, { price: number; hasPricing: boolean }> = {};
    models.forEach(model => {
      const result = getBuyerFacingStartingPrice(model, includeUtilityFees, includePermitsCosts);
      prices[model.slug] = { price: result.price, hasPricing: result.hasPricing };
    });
    return prices;
  }, [includeUtilityFees, includePermitsCosts]);
  
  // Get selected model details
  const selectedModel = selectedModelSlug 
    ? models.find(m => m.slug === selectedModelSlug) 
    : null;
  const selectedPrice = selectedModelSlug 
    ? modelPrices[selectedModelSlug] 
    : null;
  
  return (
    <div className="space-y-8">
      {/* Header - Premium and tight */}
      <div className="text-center max-w-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-2"
        >
          Choose your home
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-sm"
        >
          Select a model to continue. You can change this later.
        </motion.p>
        
        {/* Compare link (moved from cards) */}
        {compareModels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompare(true)}
              className="text-accent hover:text-accent/80"
            >
              <Scale className="w-4 h-4 mr-2" />
              Compare {compareModels.length} models
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCompareModels([])}
              className="text-muted-foreground ml-2"
            >
              Clear
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Model Grid - 3 columns desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      
      {/* Navigation - Deliberate, not auto-advance */}
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
        
        <div className="flex items-center gap-4">
          {selectedModel && selectedPrice && (
            <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedModel.name}</span>
              <span>•</span>
              <span className="text-foreground font-semibold">{formatPrice(selectedPrice.price)}</span>
            </div>
          )}
          <Button
            size="lg"
            onClick={onNext}
            disabled={!selectedModelSlug}
            className="min-w-[180px]"
          >
            Continue to Build Type
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
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
// MODEL CARD COMPONENT - Premium design with branded placeholders
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
  
  // Badge styling based on variant
  const getBadgeClasses = (variant: string) => {
    const base = 'text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm';
    switch (variant) {
      case 'popular':
        return cn(base, 'bg-amber-500/90 text-white');
      case 'value':
        return cn(base, 'bg-emerald-500/90 text-white');
      case 'affordable':
        return cn(base, 'bg-blue-500/90 text-white');
      case 'premium':
        return cn(base, 'bg-violet-500/90 text-white');
      case 'family':
        return cn(base, 'bg-rose-500/90 text-white');
      default:
        return cn(base, 'bg-accent/90 text-accent-foreground');
    }
  };
  
  return (
    <div
      className={cn(
        'group relative rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5',
        isSelected 
          ? 'border-accent ring-2 ring-accent/20 shadow-lg' 
          : 'border-border bg-card hover:border-accent/40',
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-pressed={isSelected}
    >
      {/* Image Area - Consistent aspect ratio */}
      <div className="aspect-video relative overflow-hidden bg-muted">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse" />
        )}
        
        {!imageError ? (
          <img
            src={heroImage}
            alt={`${model.name} exterior`}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              'group-hover:scale-[1.02]',
              imageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          // Premium branded placeholder
          <PremiumPlaceholder modelName={model.name} descriptor={meta.descriptor} />
        )}
        
        {/* Subtle gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Badge - Top Left (subtle pill) */}
        {meta.badge && (
          <div className="absolute top-3 left-3 z-10">
            <div className={getBadgeClasses(meta.badge.variant)}>
              <meta.badge.icon className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              {meta.badge.label}
            </div>
          </div>
        )}
        
        {/* Selected checkmark - Top Right */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg"
            >
              <Check className="w-4 h-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Compare toggle - Bottom right of image */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
          className={cn(
            'absolute bottom-2 right-2 z-10 px-2 py-1 rounded text-[10px] font-medium transition-all',
            'bg-black/50 backdrop-blur-sm hover:bg-black/70',
            isComparing 
              ? 'text-accent' 
              : 'text-white/70 hover:text-white',
          )}
        >
          {isComparing ? '✓ Comparing' : '+ Compare'}
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Model name - Large */}
        <h3 className="text-lg font-semibold text-foreground">
          {model.name}
        </h3>
        
        {/* Descriptor - 1 line, no truncation mid-word */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {meta.descriptor}
        </p>
        
        {/* Specs row - Smaller, muted */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" />
            {model.beds} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            {model.baths} bath
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5" />
            {model.sqft.toLocaleString()} sf
          </span>
        </div>
        
        {/* Price row + CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {hasPricing ? (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(price)}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Installed from
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span className="text-xs">Price coming soon</span>
            </div>
          )}
          
          {/* CTA - "Select" or "Selected" */}
          <Button
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            className={cn(
              'transition-all',
              isSelected && 'bg-accent hover:bg-accent/90',
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" />
                Selected
              </>
            ) : (
              'Select'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PREMIUM PLACEHOLDER - Branded fallback for missing images
// ============================================================================

function PremiumPlaceholder({ 
  modelName, 
  descriptor 
}: { 
  modelName: string; 
  descriptor: string;
}) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
      
      {/* Architectural grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {/* Blueprint line art - simplified house shape */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15"
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* House outline */}
        <path
          d="M 30 70 L 30 100 L 170 100 L 170 70 L 100 35 L 30 70"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        {/* Door */}
        <rect x="90" y="75" width="20" height="25" stroke="white" strokeWidth="0.5" fill="none" />
        {/* Windows */}
        <rect x="50" y="75" width="18" height="14" stroke="white" strokeWidth="0.5" fill="none" />
        <rect x="132" y="75" width="18" height="14" stroke="white" strokeWidth="0.5" fill="none" />
        {/* Chimney */}
        <rect x="140" y="45" width="10" height="20" stroke="white" strokeWidth="0.5" fill="none" />
      </svg>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-lg tracking-wide">
            {modelName}
          </h4>
          <p className="text-white/60 text-xs max-w-[180px] line-clamp-2">
            {descriptor}
          </p>
          <p className="text-white/40 text-[10px] uppercase tracking-wider pt-2">
            Exterior render coming soon
          </p>
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
  models: compareModels,
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
  if (compareModels.length === 0) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            Compare Models
          </DialogTitle>
        </DialogHeader>
        
        <div 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${compareModels.length}, 1fr)` }}
        >
          {compareModels.map(model => {
            const { price, hasPricing } = prices[model.slug] || { price: 0, hasPricing: false };
            const isSelected = selectedSlug === model.slug;
            const meta = modelMeta[model.slug] || { descriptor: 'Modern floor plan' };
            const heroImage = model.heroImage || getModelHeroImageBySlug(model.slug);
            
            return (
              <div
                key={model.slug}
                className={cn(
                  'rounded-lg border p-4 transition-all cursor-pointer',
                  isSelected 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border hover:border-accent/40',
                )}
                onClick={() => onSelect(model.slug)}
              >
                {/* Image */}
                <div className="aspect-video rounded-md overflow-hidden bg-muted mb-3">
                  <img
                    src={heroImage}
                    alt={model.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Name */}
                <h4 className="font-semibold text-foreground mb-1">{model.name}</h4>
                
                {/* Specs */}
                <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                  <div className="flex justify-between">
                    <span>Square feet</span>
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
                    <span>Build types</span>
                    <span className="font-medium text-foreground uppercase text-xs">
                      {model.buildTypes.join(', ')}
                    </span>
                  </div>
                </div>
                
                {/* Price */}
                <div className="pt-3 border-t border-border">
                  {hasPricing ? (
                    <div>
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(price)}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        Installed from
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Price coming soon</span>
                  )}
                </div>
                
                {/* Select button */}
                <Button
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(model.slug);
                  }}
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
            );
          })}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
