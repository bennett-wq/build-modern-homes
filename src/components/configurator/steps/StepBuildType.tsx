// ============================================================================
// Step 4: Choose Build Type (XMOD vs MOD)
// ============================================================================

import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type ModelConfig, type BuildType, getDefaultZone } from '@/data/pricing-config';
import { calculatePriceBreakdown, defaultBuildSelection, defaultExteriorSelection } from '@/hooks/usePricingEngine';
import { cn } from '@/lib/utils';

interface StepBuildTypeProps {
  model: ModelConfig;
  selectedBuildType: BuildType | null;
  onSelectBuildType: (type: BuildType) => void;
  onNext: () => void;
  onBack: () => void;
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
}

const buildTypeInfo: Record<BuildType, {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}> = {
  xmod: {
    title: 'CrossMod® (XMOD)',
    subtitle: 'Factory standardized',
    description: 'Factory-built to CrossMod® program standards with standardized specifications.',
    features: [
      'CrossMod® certification path',
      'Standardized floor plan',
      'Financing eligibility varies by lender',
      'Faster delivery timeline',
    ],
  },
  mod: {
    title: 'Modular (MOD)',
    subtitle: 'More flexibility',
    description: 'Modular construction with additional customization options available.',
    features: [
      'More layout flexibility',
      "9' walls option (where applicable)",
      'Custom configurations possible',
      'State-modular certification',
    ],
  },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function StepBuildType({
  model,
  selectedBuildType,
  onSelectBuildType,
  onNext,
  onBack,
  includeUtilityFees,
  includePermitsCosts,
}: StepBuildTypeProps) {
  // If only one build type, auto-select and show message
  const hasOnlyOne = model.buildTypes.length === 1;
  const zone = getDefaultZone();
  
  // Calculate prices for each build type
  const buildTypePrices = model.buildTypes.map(type => {
    const selection = {
      ...defaultBuildSelection,
      modelSlug: model.slug,
      buildType: type,
      includeUtilityFees,
      includePermitsCosts,
      exteriorSelection: defaultExteriorSelection,
    };
    const breakdown = calculatePriceBreakdown(selection, model, zone);
    return {
      type,
      price: breakdown.allInEstimateTotal,
      hasPricing: breakdown.hasPricing,
    };
  });
  
  // Check for 9' walls option
  const has9ftWalls = model.floorPlanOptions.some(
    opt => opt.id === '9ft-walls' && opt.available && opt.buildTypes?.includes('mod')
  );
  
  if (hasOnlyOne) {
    const onlyType = model.buildTypes[0];
    const info = buildTypeInfo[onlyType];
    
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
          >
            Build Type
          </motion.h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/5 border border-accent/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Check className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.subtitle}</p>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-4">{info.description}</p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>The {model.name} is only available in {info.title} configuration.</span>
          </div>
        </motion.div>
        
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between pt-4"
        >
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button size="lg" onClick={onNext}>
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          Choose Build Type
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Both options deliver quality factory-built construction with different features.
        </motion.p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {model.buildTypes.map((type, index) => {
          const info = buildTypeInfo[type];
          const isSelected = selectedBuildType === type;
          const priceInfo = buildTypePrices.find(p => p.type === type);
          
          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectBuildType(type)}
              className={cn(
                'relative p-6 rounded-xl border-2 text-left transition-all duration-200',
                'hover:border-accent/50 hover:shadow-md',
                isSelected
                  ? 'border-accent bg-accent/5 shadow-md'
                  : 'border-border bg-card',
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-accent flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-accent-foreground" />
                </motion.div>
              )}
              
              <div className="mb-4">
                <Badge variant={type === 'xmod' ? 'default' : 'secondary'} className="mb-2">
                  {type.toUpperCase()}
                </Badge>
                <h3 className="text-xl font-semibold text-foreground">{info.title}</h3>
                <p className="text-sm text-muted-foreground">{info.subtitle}</p>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4">{info.description}</p>
              
              {/* Features */}
              <ul className="space-y-2 mb-4">
                {info.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {type === 'mod' && has9ftWalls && (
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">9' walls available</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Upgrade to 9-foot ceilings for a more spacious feel. Additional cost applies.</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                )}
              </ul>
              
              {/* Price */}
              <div className="pt-4 border-t border-border">
                {priceInfo?.hasPricing ? (
                  <div>
                    <span className="text-lg font-semibold text-foreground">
                      {formatPrice(priceInfo.price)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">starting</span>
                  </div>
                ) : (
                  <span className="text-sm text-amber-600">Pricing coming soon</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between pt-4 max-w-4xl mx-auto"
      >
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!selectedBuildType}
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}

export default StepBuildType;
