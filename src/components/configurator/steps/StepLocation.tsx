// ============================================================================
// Step 2: Location & Assumptions
// ============================================================================

import { motion } from 'framer-motion';
import { MapPin, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { zones } from '@/data/pricing-config';

interface StepLocationProps {
  zoneId: string;
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
  onZoneChange: (zoneId: string) => void;
  onUtilityFeesChange: (value: boolean) => void;
  onPermitsCostsChange: (value: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepLocation({
  zoneId,
  includeUtilityFees,
  includePermitsCosts,
  onUtilityFeesChange,
  onPermitsCostsChange,
  onNext,
  onBack,
}: StepLocationProps) {
  const currentZone = zones.find(z => z.id === zoneId) || zones[0];
  
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          Location & Assumptions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          These defaults help us estimate your total cost.
        </motion.p>
      </div>
      
      {/* Current Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Build Location</h3>
            <p className="text-lg text-foreground">{currentZone.name}</p>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Defaults based on Ypsilanti/Washtenaw baseline. You can refine later.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Fee Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border p-6 space-y-6"
      >
        <h3 className="font-semibold text-foreground">Include in Estimate</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="utility-fees" className="text-base font-medium text-foreground cursor-pointer">
                Typical Utility Authority Fees
              </Label>
              <p className="text-sm text-muted-foreground">
                Water, sewer, and utility connections (${zones[0].fees.utility_authority_fees.toLocaleString()} baseline)
              </p>
            </div>
            <Switch
              id="utility-fees"
              checked={includeUtilityFees}
              onCheckedChange={onUtilityFeesChange}
            />
          </div>
          
          <div className="border-t border-border" />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="permits-costs" className="text-base font-medium text-foreground cursor-pointer">
                Permits & Soft Costs
              </Label>
              <p className="text-sm text-muted-foreground">
                Building permits and related fees (${zones[0].fees.permits_soft_costs.toLocaleString()} baseline)
              </p>
            </div>
            <Switch
              id="permits-costs"
              checked={includePermitsCosts}
              onCheckedChange={onPermitsCostsChange}
            />
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          These are typical baseline fees for the area. Your actual costs may vary based on your specific site and municipality.
        </p>
      </motion.div>
      
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
        <Button size="lg" onClick={onNext}>
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}

export default StepLocation;
