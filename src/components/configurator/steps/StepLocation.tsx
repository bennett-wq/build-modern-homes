// ============================================================================
// Step 2: Where Are You Building?
// Premium location input with conditional logic based on build intent
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, ArrowLeft, Building2, ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getZoneForZip } from '@/lib/pricing-mode-utils';
import type { BuildIntent } from '@/data/pricing-config';

interface StepLocationProps {
  buildIntent: BuildIntent | null;
  zipCode: string;
  address: string;
  locationKnown: boolean | null; // null = not answered, true = known, false = "I don't know yet"
  onZipCodeChange: (zipCode: string) => void;
  onAddressChange: (address: string) => void;
  onLocationKnownChange: (known: boolean | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepLocation({
  buildIntent,
  zipCode,
  address,
  locationKnown,
  onZipCodeChange,
  onAddressChange,
  onLocationKnownChange,
  onNext,
  onBack,
}: StepLocationProps) {
  const [showAddressField, setShowAddressField] = useState(!!address);
  
  // Check if user is building in a BaseMod community
  const isCommunityIntent = buildIntent === 'basemod-community';
  
  // Validate ZIP code (5 digits)
  const isValidZip = /^\d{5}$/.test(zipCode);
  
  // Get zone info for display
  const zipZoneResult = getZoneForZip(zipCode);
  
  // Can continue if: community intent, valid ZIP entered, or "don't know yet" selected
  const canContinue = isCommunityIntent || isValidZip || locationKnown === false;
  
  // Handle ZIP input - only allow digits, max 5
  const handleZipChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 5);
    onZipCodeChange(digitsOnly);
    // If user starts typing ZIP, they know their location
    if (digitsOnly.length > 0 && locationKnown !== true) {
      onLocationKnownChange(true);
    }
  };
  
  // Handle "I don't know yet" selection
  const handleDontKnow = () => {
    onLocationKnownChange(false);
    onZipCodeChange('');
    onAddressChange('');
    setShowAddressField(false);
  };
  
  // If community intent, show community selection UI
  if (isCommunityIntent) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
          >
            Choose Your Community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Select from our curated development communities with all-in pricing.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-accent" />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Browse Available Communities
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Each community offers pre-approved lots with all-in pricing that includes land, site work, and your home.
          </p>
          
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/communities">
              <Building2 className="mr-2 h-5 w-5" />
              Browse Communities
            </Link>
          </Button>
        </motion.div>
        
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-between pt-4"
        >
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Or continue to browse models first
            <Button variant="link" onClick={onNext} className="ml-1 p-0 h-auto">
              Skip for now →
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Default: ZIP code flow for on-your-land or find-land intents
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          Where are you building?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Help us tailor your estimate to your location.
        </motion.p>
      </div>
      
      {/* ZIP Code Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              <Label htmlFor="zip-code" className="text-base font-semibold text-foreground">
                ZIP Code
              </Label>
              <p className="text-sm text-muted-foreground">
                Enter the ZIP code where you plan to build
              </p>
            </div>
          </div>
          
          <Input
            id="zip-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter 5-digit ZIP"
            value={zipCode}
            onChange={(e) => handleZipChange(e.target.value)}
            className="text-lg h-12 text-center font-mono tracking-wider max-w-[200px]"
            maxLength={5}
          />
          
          {/* Regional baseline confirmation after valid ZIP */}
          {isValidZip && zipZoneResult.regionLabel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 text-sm text-accent bg-accent/5 px-3 py-2 rounded-lg"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                Using regional baseline for ZIP {zipZoneResult.regionLabel} (refine later).
              </span>
            </motion.div>
          )}
          
          {!isValidZip && (
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              We use your ZIP to estimate sitework, delivery, and local fees. You can refine later.
            </p>
          )}
        </div>
      </motion.div>
      
      {/* Optional Address Field (Expandable) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {!showAddressField ? (
          <button
            onClick={() => setShowAddressField(true)}
            className="w-full text-left px-4 py-3 rounded-lg border border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                I have an address
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
            </div>
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <Label htmlFor="address" className="text-sm font-medium text-foreground mb-2 block">
                Property Address <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, City, State"
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground mt-2">
                If you have a specific property, we can provide more accurate site estimates.
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
      
      {/* "I don't know yet" Option */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <button
          onClick={handleDontKnow}
          className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
            locationKnown === false
              ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
              : 'border-border hover:border-accent/50 hover:bg-accent/5'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              locationKnown === false ? 'border-accent bg-accent' : 'border-muted-foreground/30'
            }`}>
              {locationKnown === false && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">I don't know yet</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Continue with a preliminary estimate — you can add your location later.
              </p>
            </div>
          </div>
        </button>
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
        <div className="flex flex-col items-end gap-1">
          <Button size="lg" onClick={onNext} disabled={!canContinue}>
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <span className="text-xs text-muted-foreground/70">
            You can change this later.
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default StepLocation;
