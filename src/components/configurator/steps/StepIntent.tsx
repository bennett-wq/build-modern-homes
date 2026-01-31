// ============================================================================
// Step 1: Build Intent - How do you want to build?
// ============================================================================

import { motion } from 'framer-motion';
import { MapPin, Search, Building2, Check } from 'lucide-react';
import type { BuildIntent } from '@/data/pricing-config';
import { cn } from '@/lib/utils';
import { WizardStickyFooter, WizardFooterSpacer } from '@/components/wizard/WizardStickyFooter';

const intentOptions: {
  id: BuildIntent;
  name: string;
  description: string;
  icon: typeof MapPin;
}[] = [
  {
    id: 'my-land',
    name: 'Build on My Land',
    description: "You have land or you're buying land—we'll help you build there",
    icon: MapPin,
  },
  {
    id: 'find-land',
    name: 'Find Land to Build',
    description: "We'll help you find the perfect lot for your new home",
    icon: Search,
  },
  {
    id: 'basemod-community',
    name: 'Build in a BaseMod Community',
    description: 'Choose from our curated development communities',
    icon: Building2,
  },
];

interface StepIntentProps {
  selectedIntent: BuildIntent | null;
  onSelectIntent: (intent: BuildIntent) => void;
  onNext: () => void;
}

export function StepIntent({ selectedIntent, onSelectIntent, onNext }: StepIntentProps) {
  // No auto-advance - let users confirm with Continue button
  const handleSelect = (intent: BuildIntent) => {
    onSelectIntent(intent);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          How do you want to build?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          This helps us tailor your experience and next steps.
        </motion.p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {intentOptions.map((option, index) => {
          const isSelected = selectedIntent === option.id;
          const Icon = option.icon;
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(option.id)}
              className={cn(
                'relative p-6 rounded-xl border-2 text-left transition-all duration-200',
                'hover:border-accent/50 hover:shadow-md hover:-translate-y-0.5',
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
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-accent-foreground" />
                </motion.div>
              )}
              
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors',
                  isSelected ? 'bg-accent/20' : 'bg-muted',
                )}
              >
                <Icon className={cn('w-6 h-6', isSelected ? 'text-accent' : 'text-muted-foreground')} />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {option.name}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {option.description}
              </p>
            </motion.button>
          );
        })}
      </div>
      
      {/* Inline guidance */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-muted-foreground/80"
      >
        Most buyers choose "Build on My Land" or "Find Land to Build". You can change this later.
      </motion.p>
      
      <WizardFooterSpacer />
      
      {/* Standardized Sticky Footer */}
      <WizardStickyFooter
        onContinue={onNext}
        canContinue={!!selectedIntent}
        continueLabel="Continue"
        hideBack={true}
        pulseOnReady={selectedIntent}
      >
        {selectedIntent ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-accent" />
            {intentOptions.find(o => o.id === selectedIntent)?.name}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Select an option above</span>
        )}
      </WizardStickyFooter>
    </div>
  );
}

export default StepIntent;
