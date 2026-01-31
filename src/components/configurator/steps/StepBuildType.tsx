// ============================================================================
// Step: Choose Build Type (CrossMod vs Modular)
// Premium educational experience for understanding construction methods
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Info, 
  Sparkles, 
  Building2, 
  Factory, 
  Clock, 
  BadgeCheck, 
  DollarSign,
  Ruler,
  ChevronRight,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type ModelConfig, type BuildType } from '@/data/pricing-config';
import { WizardFooterSpacer, WizardStickyFooter } from '@/components/wizard/WizardStickyFooter';
import { cn } from '@/lib/utils';

interface StepBuildTypeProps {
  model: ModelConfig;
  selectedBuildType: BuildType | null;
  onSelectBuildType: (type: BuildType) => void;
  onNext: () => void;
  onBack: () => void;
  /** Hide built-in navigation (when parent handles it, e.g., mobile with UnifiedMobileFooter) */
  hideNavigation?: boolean;
}

interface BuildTypeDetail {
  title: string;
  badge: string;
  tagline: string;
  description: string;
  icon: typeof Factory;
  highlights: {
    icon: typeof Clock;
    label: string;
    value: string;
  }[];
  features: {
    text: string;
    tooltip?: string;
  }[];
  learnMore: {
    title: string;
    sections: {
      heading: string;
      content: string;
    }[];
  };
}

const buildTypeDetails: Record<BuildType, BuildTypeDetail> = {
  xmod: {
    title: 'CrossMod®',
    badge: 'CROSSMOD',
    tagline: 'Site-built curb appeal, factory efficiency',
    description: 'CrossMod homes combine factory precision with architectural features traditionally found in site-built homes. They meet HUD standards plus additional requirements that make them virtually indistinguishable from conventional construction.',
    icon: Building2,
    highlights: [
      { icon: Clock, label: 'Build time', value: '~78 days' },
      { icon: BadgeCheck, label: 'Certification', value: 'HUD + CrossMod' },
      { icon: DollarSign, label: 'Financing', value: 'FHA/VA/Conv.' },
    ],
    features: [
      { text: 'HUD + CrossMod certified', tooltip: 'Meets federal HUD standards plus additional CrossMod architectural requirements.' },
      { text: 'Architectural roof pitch', tooltip: 'Higher roof pitch (typically 5:12 or greater) creates traditional home aesthetics.' },
      { text: 'Covered entry porch', tooltip: 'Factory-integrated covered porch adds curb appeal and weather protection.' },
    ],
    learnMore: {
      title: 'Understanding CrossMod®',
      sections: [
        {
          heading: 'What makes CrossMod different?',
          content: 'CrossMod® is a certification created by the Manufactured Housing Institute (MHI) that identifies factory-built homes meeting specific architectural and construction standards. These homes include features like higher roof pitches, garages, porches, and drywall interiors—features traditionally associated with site-built homes.',
        },
        {
          heading: 'HUD + CrossMod certification',
          content: 'CrossMod homes are built to federal HUD standards with additional architectural requirements. This dual certification ensures consistent quality while delivering the curb appeal of traditional construction. The result is a home that looks and feels like site-built construction.',
        },
        {
          heading: 'Financing options',
          content: 'CrossMod homes are eligible for FHA, VA, USDA, and conventional mortgages. We recommend speaking with a lender to understand which programs best fit your situation, as eligibility depends on multiple factors including credit, income, and property location.',
        },
      ],
    },
  },
  mod: {
    title: 'Modular',
    badge: 'MODULAR',
    tagline: 'Maximum flexibility, state-code certified',
    description: 'Modular homes are built to the same state and local building codes as site-built homes. This construction method offers more customization options and is ideal for buyers who want specific modifications or premium upgrades.',
    icon: Factory,
    highlights: [
      { icon: Clock, label: 'Build time', value: '~90 days' },
      { icon: BadgeCheck, label: 'Certification', value: 'State building code' },
      { icon: Ruler, label: 'Customization', value: 'More options' },
    ],
    features: [
      { text: 'State building code certified', tooltip: 'Built to IRC/IBC standards—the same codes governing site-built construction in your area.' },
      { text: 'More layout flexibility', tooltip: 'Additional floor plan modifications and custom configurations available beyond standard options.' },
      { text: 'Custom configurations', tooltip: 'Work with our team on specific modifications to meet your unique requirements.' },
      { text: 'Premium upgrade paths', tooltip: 'Access to additional upgrade packages and custom finishes not available on standard builds.' },
    ],
    learnMore: {
      title: 'Understanding Modular Construction',
      sections: [
        {
          heading: 'How is modular different from CrossMod?',
          content: 'While both are factory-built, modular homes are certified under state building codes (IRC/IBC) rather than HUD standards. This means they\'re treated identically to site-built homes in every regulatory sense. The trade-off is that modular builds typically take slightly longer.',
        },
        {
          heading: 'Customization advantages',
          content: 'Modular construction offers more flexibility for modifications. Features like 9-foot ceilings, custom room configurations, and premium material upgrades are more readily available. If you have specific requirements that go beyond standard options, modular may be the better path.',
        },
        {
          heading: 'Financing options',
          content: 'Modular homes qualify for conventional mortgages and many government-backed programs. We recommend speaking with a lender to understand which financing options best fit your situation, as requirements vary by program and location.',
        },
      ],
    },
  },
};

export function StepBuildType({
  model,
  selectedBuildType,
  onSelectBuildType,
  onNext,
  onBack,
  hideNavigation = false,
}: StepBuildTypeProps) {
  const [expandedInfo, setExpandedInfo] = useState<BuildType | null>(null);
  const isFirstRender = useRef(true);
  
  // Check for 9' walls option
  const has9ftWalls = model.floorPlanOptions.some(
    opt => opt.id === '9ft-walls' && opt.available && opt.buildTypes?.includes('mod')
  );
  
  // If only one build type, show simplified view
  const hasOnlyOne = model.buildTypes.length === 1;
  const onlyType = hasOnlyOne ? model.buildTypes[0] : null;
  const effectiveSelection = selectedBuildType ?? onlyType;
  
  if (hasOnlyOne && onlyType) {
    const details = buildTypeDetails[onlyType];
    const handleContinue = () => {
      if (!selectedBuildType) {
        onSelectBuildType(onlyType);
      }
      onNext();
    };
    
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4"
          >
            <BadgeCheck className="w-4 h-4" />
            <span>Build type confirmed</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-semibold text-foreground mb-2"
          >
            {details.title} Construction
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            {details.tagline}
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <details.icon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-muted-foreground leading-relaxed">{details.description}</p>
            </div>
          </div>
          
          {/* Highlights */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
            {details.highlights.map((highlight, i) => (
              <div key={i} className="text-center">
                <highlight.icon className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground mb-0.5">{highlight.label}</p>
                <p className="text-sm font-semibold text-foreground">{highlight.value}</p>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <Info className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              The <span className="font-medium text-foreground">{model.name}</span> is available exclusively in {details.title} configuration.
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedInfo(onlyType)}
            className="mt-4 text-accent hover:text-accent"
          >
            Learn more about {details.title}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>

        <WizardFooterSpacer />
        {!hideNavigation && (
          <WizardStickyFooter
            onBack={onBack}
            onContinue={handleContinue}
            canContinue={true}
            continueLabel="Continue"
            pulseOnReady={effectiveSelection ?? undefined}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-accent" />
              <span className="truncate">{details.title}</span>
            </div>
          </WizardStickyFooter>
        )}
        
        {/* Learn More Modal */}
        <LearnMoreModal
          type={expandedInfo}
          onClose={() => setExpandedInfo(null)}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4"
        >
          <Factory className="w-4 h-4" />
          <span>Construction method</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          How should we build your {model.name}?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground max-w-xl mx-auto"
        >
          Both options deliver exceptional quality through precision factory construction. 
          Your choice affects financing options, customization flexibility, and certification type.
        </motion.p>
      </div>
      
      {/* Build Type Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {model.buildTypes.map((type, index) => {
          const details = buildTypeDetails[type];
          const isSelected = selectedBuildType === type;
          const Icon = details.icon;
          
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <button
                onClick={() => onSelectBuildType(type)}
                className={cn(
                  'w-full text-left rounded-2xl border-2 transition-all duration-300',
                  'hover:shadow-lg hover:border-accent/40',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-border bg-card hover:bg-card/80',
                )}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                        isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <Badge 
                          variant={isSelected ? 'default' : 'secondary'} 
                          className="mb-1"
                        >
                          {details.badge}
                        </Badge>
                        <h3 className="text-xl font-semibold text-foreground">{details.title}</h3>
                      </div>
                    </div>
                    
                    {/* Selection indicator */}
                    <div className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                      isSelected 
                        ? 'border-accent bg-accent' 
                        : 'border-muted-foreground/30 bg-transparent'
                    )}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check className="w-4 h-4 text-accent-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-accent mb-2">{details.tagline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {details.description}
                  </p>
                </div>
                
                {/* Highlights Bar */}
                <div className="px-6 py-4 bg-muted/30 border-t border-border/50">
                  <div className="grid grid-cols-3 gap-3">
                    {details.highlights.map((highlight, i) => (
                      <div key={i} className="text-center">
                        <highlight.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{highlight.label}</p>
                        <p className="text-xs font-semibold text-foreground">{highlight.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Features */}
                <div className="p-6 pt-4 space-y-2">
                  {details.features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className={cn(
                        'w-4 h-4 mt-0.5 flex-shrink-0 transition-colors',
                        isSelected ? 'text-accent' : 'text-muted-foreground'
                      )} />
                      <span className="text-sm text-muted-foreground">{feature.text}</span>
                    </div>
                  ))}
                  {type === 'mod' && (
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                      <span className="text-sm text-foreground font-medium">9' walls available</span>
                    </div>
                  )}
                  {type === 'xmod' && (
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                      <span className="text-sm text-foreground font-medium">Faster build timeline</span>
                    </div>
                  )}
                </div>
              </button>
              
              {/* Learn More Button - outside main button to prevent nested interactive */}
              <div className="px-6 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedInfo(type);
                  }}
                  className="text-accent hover:text-accent -ml-2"
                >
                  Learn more
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Educational callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl border border-border">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Not sure which to choose?</span>{' '}
              CrossMod offers a faster build timeline with HUD + CrossMod certification. 
              Choose Modular if you want 9' ceilings or need additional customization flexibility.
            </p>
          </div>
        </div>
      </motion.div>
      
      <WizardFooterSpacer />
      {!hideNavigation && (
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
              <span className="truncate">{buildTypeDetails[selectedBuildType].title}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Select a build type to continue</span>
          )}
        </WizardStickyFooter>
      )}
      
      {/* Learn More Modal */}
      <LearnMoreModal
        type={expandedInfo}
        onClose={() => setExpandedInfo(null)}
      />
    </div>
  );
}

// Learn More Modal Component
function LearnMoreModal({ 
  type, 
  onClose 
}: { 
  type: BuildType | null; 
  onClose: () => void;
}) {
  const details = type ? buildTypeDetails[type] : null;
  
  return (
    <AnimatePresence>
      {type && details && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal Container - centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85vh] pointer-events-auto"
            >
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-border flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3 pr-10">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    type === 'xmod' ? 'bg-accent/10' : 'bg-muted'
                  )}>
                    <details.icon className={cn(
                      "w-6 h-6",
                      type === 'xmod' ? 'text-accent' : 'text-foreground'
                    )} />
                  </div>
                  <div>
                    <Badge 
                      variant={type === 'xmod' ? 'default' : 'secondary'} 
                      className="mb-1 text-xs"
                    >
                      {details.badge}
                    </Badge>
                    <h3 className="text-xl font-semibold text-foreground">{details.learnMore.title}</h3>
                  </div>
                </div>
              </div>
              
              {/* Content - scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                {details.learnMore.sections.map((section, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "p-6",
                      i !== details.learnMore.sections.length - 1 && "border-b border-border"
                    )}
                  >
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                      {section.heading}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-border bg-muted/30 flex-shrink-0">
                <Button onClick={onClose} className="w-full" size="lg">
                  Got it
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default StepBuildType;
