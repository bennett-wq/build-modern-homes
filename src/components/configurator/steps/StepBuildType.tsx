// ============================================================================
// Step 4: Choose Build Type (XMOD vs MOD)
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type ModelConfig, type BuildType } from '@/data/pricing-config';
import { WizardFooterSpacer, WizardStickyFooter } from '@/components/wizard/WizardStickyFooter';
import { cn } from '@/lib/utils';

interface StepBuildTypeProps {
  model: ModelConfig;
  selectedBuildType: BuildType | null;
  onSelectBuildType: (type: BuildType) => void;
  onNext: () => void;
  onBack: () => void;
}

const buildTypeInfo: Record<BuildType, {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}> = {
  xmod: {
    title: 'Factory-Built (XMOD)',
    subtitle: 'Factory standardized',
    description: 'Factory-built to program standards with standardized specifications.',
    features: [
      'Factory certification path',
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

export function StepBuildType({
  model,
  selectedBuildType,
  onSelectBuildType,
  onNext,
  onBack,
}: StepBuildTypeProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const isFirstRender = useRef(true);
  
  // Trigger pulse when selection changes (skip initial render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selectedBuildType) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedBuildType]);
  
  // If only one build type, auto-select and show message
  const hasOnlyOne = model.buildTypes.length === 1;
  const onlyType = hasOnlyOne ? model.buildTypes[0] : null;
  const effectiveSelection = selectedBuildType ?? onlyType;
  
  // Check for 9' walls option
  const has9ftWalls = model.floorPlanOptions.some(
    opt => opt.id === '9ft-walls' && opt.available && opt.buildTypes?.includes('mod')
  );
  
  if (hasOnlyOne) {
    const info = buildTypeInfo[onlyType!];
    const handleContinue = () => {
      // Failsafe: ensure store selection is set even if upstream auto-select didn't run yet
      if (!selectedBuildType) {
        onSelectBuildType(onlyType!);
      }
      onNext();
    };
    
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

        <WizardFooterSpacer />
        <WizardStickyFooter
          onBack={onBack}
          onContinue={handleContinue}
          canContinue={true}
          continueLabel="Continue"
          pulseOnReady={effectiveSelection ?? undefined}
        >
          {effectiveSelection && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-accent" />
              <span className="truncate">{buildTypeInfo[effectiveSelection].title}</span>
            </div>
          )}
        </WizardStickyFooter>
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground/70 text-xs mt-2"
        >
          Your estimate is shown in the pricing panel on the right.
        </motion.p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {model.buildTypes.map((type, index) => {
          const info = buildTypeInfo[type];
          const isSelected = selectedBuildType === type;
          
          // No auto-advance - let users click Continue to feel in control
          const handleSelect = () => {
            onSelectBuildType(type);
          };
          
          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={handleSelect}
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
              <ul className="space-y-2">
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
            </motion.button>
          );
        })}
      </div>
      
      <WizardFooterSpacer />
      <WizardStickyFooter
        onBack={onBack}
        onContinue={onNext}
        canContinue={!!selectedBuildType}
        continueLabel="Continue"
        pulseOnReady={selectedBuildType}
      >
        {selectedBuildType ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-accent" />
            <span className="truncate">{buildTypeInfo[selectedBuildType].title}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Select a build type to continue</span>
        )}
      </WizardStickyFooter>
    </div>
  );
}

export default StepBuildType;
