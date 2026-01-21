// ============================================================================
// Step 3: Pick a Model
// UI STABILIZATION: Clean layout, centered grid, no overflow issues
// ============================================================================

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ruler, 
  BedDouble, 
  Bath, 
  Check, 
  Star,
  TrendingUp,
  DollarSign,
  Sparkles,
  Users,
  Info,
  Home,
} from 'lucide-react';
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
import { getModelHeroImageBySlug, HERO_PLACEHOLDER } from '@/lib/model-images';
import { getHeroImageFallbackChain, verifyModelHeroImages } from '@/lib/image-utils';
import { WizardStickyFooter, WizardFooterSpacer } from '@/components/wizard/WizardStickyFooter';
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
  cypress: {
    badge: { label: 'Most Compact', icon: Home, variant: 'value' },
    descriptor: 'Efficient two-bedroom design with a flexible den',
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
  
  for (const buildType of model.buildTypes) {
    const selection = {
      ...defaultBuildSelection,
      modelSlug: model.slug,
      buildType,
      includeUtilityFees,
      includePermitsCosts,
      exteriorSelection: defaultExteriorSelection,
      pricingMode: 'delivered_installed' as const,
    };
    
    const pricingOutput = calculateFullPricing(selection, model, zone);
    
    if (pricingOutput.hasPricing && pricingOutput.buyerFacingBreakdown.startingFromPrice < lowestPrice) {
      lowestPrice = pricingOutput.buyerFacingBreakdown.startingFromPrice;
      hasPricing = true;
      bestBuildType = buildType;
      bestPricingOutput = pricingOutput;
    }
  }
  
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
  // Dev-only: Verify all model hero images are served on mount
  const hasVerified = useRef(false);
  useEffect(() => {
    if (!hasVerified.current && import.meta.env.DEV) {
      hasVerified.current = true;
      verifyModelHeroImages(models, 'StepModel');
    }
  }, []);

  // Pre-calculate buyer-facing prices for all models
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
    <div className="w-full py-6 space-y-6">
      {/* Header - Centered, clean */}
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
        {/* Inline guidance */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground/70 text-xs mt-2"
        >
          Not sure which to choose? Start with our most popular or best value option.
        </motion.p>
      </div>
      
      {/* Model Grid - Responsive, constrained */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {models.map((model, index) => {
          const isSelected = selectedModelSlug === model.slug;
          const { price, hasPricing } = modelPrices[model.slug] || { price: 0, hasPricing: false };
          const meta = modelMeta[model.slug] || { descriptor: 'Modern floor plan' };
          // Check if this is a recommended model (popular or value)
          const isRecommended = meta.badge?.variant === 'popular' || meta.badge?.variant === 'value';
          
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
                isRecommended={isRecommended}
                price={price}
                hasPricing={hasPricing}
                onSelect={() => onSelectModel(model.slug)}
              />
            </motion.div>
          );
        })}
      </div>
      
      {/* Footer spacer */}
      <WizardFooterSpacer />
      
      {/* Sticky Footer */}
      <WizardStickyFooter
        onBack={onBack}
        onContinue={onNext}
        canContinue={!!selectedModelSlug}
        continueLabel="Continue to Build Type"
      >
        {selectedModel && selectedPrice && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Home className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{selectedModel.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(selectedPrice.price)}
              </p>
            </div>
          </div>
        )}
      </WizardStickyFooter>
    </div>
  );
}

// ============================================================================
// MODEL CARD COMPONENT - Clean, contained, no overflow
// ============================================================================

function ModelCard({
  model,
  meta,
  isSelected,
  isRecommended,
  price,
  hasPricing,
  onSelect,
}: {
  model: ModelConfig;
  meta: ModelMeta;
  isSelected: boolean;
  isRecommended: boolean;
  price: number;
  hasPricing: boolean;
  onSelect: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Build fallback chain: heroImage -> /slug/hero.webp -> /slug/hero.png -> placeholder
  const fallbackChain = useMemo(
    () => getHeroImageFallbackChain(model.slug, model.heroImage),
    [model.slug, model.heroImage]
  );
  
  const currentSrc = fallbackChain[currentImageIndex];
  
  // Badge styling based on variant - enhanced for popular/value
  const getBadgeClasses = (variant: string) => {
    const base = 'text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm';
    switch (variant) {
      case 'popular':
        return cn(base, 'bg-amber-500 text-white');
      case 'value':
        return cn(base, 'bg-emerald-500 text-white');
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
        'relative rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col',
        'hover:shadow-lg hover:-translate-y-0.5',
        isSelected 
          ? 'border-accent ring-2 ring-accent/20 shadow-lg bg-card' 
          : isRecommended
            ? 'border-border bg-card hover:border-accent/40 ring-1 ring-accent/10'
            : 'border-border bg-card hover:border-accent/40',
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-pressed={isSelected}
    >
      {/* Image Area - Fixed aspect ratio, contained */}
      <div className="aspect-video relative overflow-hidden bg-muted rounded-t-2xl">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse" />
        )}
        
        <img
          src={currentSrc}
          alt={`${model.name} exterior`}
          loading="lazy"
          decoding="async"
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            'group-hover:scale-[1.02]',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            // Dev-only warning for missing assets
            if (import.meta.env.DEV && currentSrc !== HERO_PLACEHOLDER) {
              console.warn(`[ModelCard] Image failed for "${model.slug}": ${currentSrc}`);
            }
            // Try next fallback in chain
            if (currentImageIndex < fallbackChain.length - 1) {
              setCurrentImageIndex(prev => prev + 1);
            } else {
              // Final fallback reached, show placeholder
              setImageLoaded(true);
            }
          }}
        />
        
        {/* Gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Badge - Top Left, contained within image */}
        {meta.badge && (
          <div className="absolute top-3 left-3">
            <div className={getBadgeClasses(meta.badge.variant)}>
              <meta.badge.icon className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              {meta.badge.label}
            </div>
          </div>
        )}
        
        {/* Selected checkmark - Top Right, contained within image */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg"
            >
              <Check className="w-4 h-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Content - Flex grow to ensure consistent card heights */}
      <div className="p-4 flex flex-col flex-1">
        {/* Model name and selected pill */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-lg font-semibold text-foreground">
            {model.name}
          </h3>
          {isSelected && (
            <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
              Selected
            </span>
          )}
        </div>
        
        {/* Descriptor */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
          {meta.descriptor}
        </p>
        
        {/* Specs row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
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
        
        {/* Spacer to push price to bottom */}
        <div className="flex-1" />
        
        {/* Price row - At bottom, no button inside card */}
        <div className="pt-3 border-t border-border/50">
          {hasPricing ? (
            <div>
              <span className="text-xl font-bold text-foreground">
                {formatPrice(price)}
              </span>
              <span className="block text-[10px] text-muted-foreground uppercase tracking-wide">
                Installed from
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span className="text-xs">Price coming soon</span>
            </div>
          )}
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
      
      {/* Blueprint line art */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15"
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 30 70 L 30 100 L 170 100 L 170 70 L 100 35 L 30 70"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        <rect x="90" y="75" width="20" height="25" stroke="white" strokeWidth="0.5" fill="none" />
        <rect x="50" y="75" width="18" height="14" stroke="white" strokeWidth="0.5" fill="none" />
        <rect x="132" y="75" width="18" height="14" stroke="white" strokeWidth="0.5" fill="none" />
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
