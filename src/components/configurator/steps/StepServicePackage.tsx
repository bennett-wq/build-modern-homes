// ============================================================================
// Step: Service Package Selection
// Choose between Delivered & Installed, Home Package Only, or Community All-in
// ============================================================================

import { motion } from 'framer-motion';
import { 
  Truck, 
  Package, 
  Home, 
  Check, 
  AlertCircle,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfiguratorStore } from '@/state/useConfiguratorStore';
import type { ServicePackageType } from '@/lib/pricing-mode-utils';

interface ServicePackageOption {
  id: ServicePackageType;
  name: string;
  shortName: string;
  description: string;
  icon: typeof Package;
  features: string[];
  recommended?: boolean;
  requiresLot?: boolean;
}

const SERVICE_PACKAGES: ServicePackageOption[] = [
  {
    id: 'delivered_installed',
    name: 'Delivered & Installed',
    shortName: 'Full Service',
    description: 'Factory home delivered and professionally installed on your land. Includes foundation, utility connections, and on-site completion.',
    icon: Truck,
    features: [
      'Factory-built home',
      'Freight & delivery',
      'Professional installation',
      'Foundation & set',
      'On-site completion',
      'Utility connections',
    ],
    recommended: true,
  },
  {
    id: 'supply_only',
    name: 'Home Package Only',
    shortName: 'Home Only',
    description: 'Factory home delivered to your site. Installation, foundation, and site work quoted separately.',
    icon: Package,
    features: [
      'Factory-built home',
      'Freight to site',
    ],
    recommended: false,
  },
  {
    id: 'community_all_in',
    name: 'Community All-in',
    shortName: 'Turnkey',
    description: 'Complete turnkey pricing in a BaseMod community. Includes lot, home, and all installation.',
    icon: Home,
    features: [
      'Lot included',
      'Factory-built home',
      'Full installation',
      'Turn-key ready',
    ],
    requiresLot: true,
  },
];

export interface StepServicePackageProps {
  onNext: () => void;
  onBack: () => void;
  hasLotSelected?: boolean;
}

export function StepServicePackage({
  onNext,
  onBack,
  hasLotSelected = false,
}: StepServicePackageProps) {
  // Get service package from store
  const selectedPackage = useConfiguratorStore(s => s.servicePackage);
  const onSelectPackage = (pkg: ServicePackageType) => useConfiguratorStore.getState().setServicePackage(pkg as 'delivered_installed' | 'supply_only' | 'community_all_in');
  
  // Filter packages based on lot selection
  const availablePackages = SERVICE_PACKAGES.filter(pkg => {
    if (pkg.requiresLot && !hasLotSelected) return false;
    return true;
  });

  const handleContinue = () => {
    if (selectedPackage) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Choose Your Service Package
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Select how you'd like your BaseMod home delivered and installed.
        </p>
      </div>

      {/* Package Options */}
      <div className="grid gap-4 sm:gap-6 max-w-3xl mx-auto">
        {availablePackages.map((pkg, index) => {
          const isSelected = selectedPackage === pkg.id;
          const IconComponent = pkg.icon;
          
          return (
            <motion.button
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectPackage(pkg.id)}
              className={cn(
                'relative w-full p-6 rounded-xl border-2 text-left transition-all duration-200',
                'hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                  ? 'border-accent bg-accent/5 shadow-md'
                  : 'border-border bg-card hover:border-accent/50'
              )}
            >
              {/* Recommended badge */}
              {pkg.recommended && (
                <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Recommended
                </div>
              )}
              
              {/* Selection indicator */}
              <div className={cn(
                'absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-muted-foreground/30'
              )}>
                {isSelected && <Check className="w-4 h-4" />}
              </div>

              <div className="flex gap-4 items-start pr-10">
                {/* Icon */}
                <div className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
                  isSelected ? 'bg-accent/20' : 'bg-muted'
                )}>
                  <IconComponent className={cn(
                    'w-6 h-6',
                    isSelected ? 'text-accent' : 'text-muted-foreground'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {pkg.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {pkg.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {pkg.features.map((feature) => (
                      <span
                        key={feature}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs',
                          isSelected
                            ? 'bg-accent/10 text-accent'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Check className="w-3 h-3" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Supply Only Disclaimer */}
      {selectedPackage === 'supply_only' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-700 mb-1">
                Sitework & Installation Excluded
              </p>
              <p className="text-amber-600/90">
                This package includes the factory home and freight only. Installation, foundation, 
                utility connections, and site preparation are not included. Request a separate 
                installation quote if needed.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Community All-in Info */}
      {selectedPackage === 'community_all_in' && hasLotSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-700 mb-1">
                Turnkey Pricing Available
              </p>
              <p className="text-green-600/90">
                Your selected lot is in a BaseMod community. All-in pricing includes the lot, 
                home, and complete professional installation.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border max-w-3xl mx-auto">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            You can change this later
          </span>
          <Button 
            onClick={handleContinue}
            disabled={!selectedPackage}
            className="min-w-[120px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
