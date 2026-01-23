// ============================================================================
// Step 2: Where Are You Building?
// Premium location input with conditional logic based on build intent
// Designed as a modern, calm onboarding step
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, ArrowLeft, Building2, ChevronDown, CheckCircle2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getZoneForZip } from '@/lib/pricing-mode-utils';
import type { BuildIntent } from '@/data/pricing-config';
import { useConfiguratorStore } from '@/state/useConfiguratorStore';

interface StepLocationProps {
  buildIntent: BuildIntent | null;
  zipCode: string;
  address: string;
  locationKnown: boolean | null;
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
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Check if user is building in a BaseMod community
  const isCommunityIntent = buildIntent === 'basemod-community';
  
  // Validate ZIP code (5 digits)
  const isValidZip = /^\d{5}$/.test(zipCode);
  const hasPartialZip = zipCode.length > 0 && zipCode.length < 5;
  
  // Get zone info for display
  const zipZoneResult = getZoneForZip(zipCode);
  
  // Can continue if: community intent, valid ZIP entered, or "don't know yet" selected
  const canContinue = isCommunityIntent || isValidZip || locationKnown === false;
  
  // Auto-focus ZIP input on mount
  useEffect(() => {
    if (!isCommunityIntent && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isCommunityIntent]);
  
  // Handle ZIP input - only allow digits, max 5
  const handleZipChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 5);
    onZipCodeChange(digitsOnly);
    useConfiguratorStore.getState().setLocationZip(digitsOnly);
    // If user starts typing ZIP, they know their location
    if (digitsOnly.length > 0 && locationKnown !== true) {
      onLocationKnownChange(true);
      useConfiguratorStore.getState().setLocationKnown(true);
    }
  };
  
  // Handle "I don't know yet" selection
  const handleDontKnow = () => {
    onLocationKnownChange(false);
    onZipCodeChange('');
    onAddressChange('');
    useConfiguratorStore.getState().setLocationKnown(false);
    useConfiguratorStore.getState().setLocationZip('');
    useConfiguratorStore.getState().setLocationAddress('');
    setShowAddressField(false);
  };
  
  // If community intent, show community selection UI
  if (isCommunityIntent) {
    return (
      <div className="space-y-10 max-w-xl mx-auto pb-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto"
          >
            <Building2 className="w-7 h-7 text-accent" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight"
          >
            Choose Your Community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base max-w-sm mx-auto"
          >
            Explore our curated communities with all-in pricing.
          </motion.p>
        </div>
        
        {/* Community CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Browse Available Communities
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Each community offers pre-approved lots with all-in pricing — land, site work, and your home included.
          </p>
          
          <Button asChild size="lg" className="w-full sm:w-auto px-8">
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
          className="flex items-center justify-between pt-2"
        >
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Or continue to browse models
            <Button variant="link" onClick={onNext} className="ml-1 p-0 h-auto text-accent">
              Skip →
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Default: ZIP code flow for on-your-land or find-land intents
  return (
    <div className="space-y-10 max-w-xl mx-auto pb-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto"
        >
          <MapPin className="w-7 h-7 text-accent" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight"
        >
          Where are you building?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-base max-w-sm mx-auto"
        >
          Your location helps us tailor delivery and site costs.
        </motion.p>
      </div>
      
      {/* ZIP Code Input - Large, Centered, Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative w-full max-w-[280px]">
          <Input
            ref={inputRef}
            id="zip-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="00000"
            value={zipCode}
            onChange={(e) => handleZipChange(e.target.value)}
            className={`
              text-3xl md:text-4xl h-16 md:h-20 text-center font-mono tracking-[0.3em] 
              border-2 rounded-xl bg-card
              placeholder:text-muted-foreground/30 placeholder:tracking-[0.3em]
              focus:border-accent focus:ring-accent/20
              transition-all duration-200
              ${isValidZip ? 'border-accent/50 bg-accent/5' : 'border-border'}
            `}
            maxLength={5}
            autoComplete="postal-code"
          />
          
          {/* Validation indicator */}
          <AnimatePresence>
            {isValidZip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Digit counter / validation hint */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {hasPartialZip && (
              <motion.p
                key="counting"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-sm text-muted-foreground"
              >
                {zipCode.length} of 5 digits
              </motion.p>
            )}
            {isValidZip && zipZoneResult.regionLabel && (
              <motion.p
                key="confirmed"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-sm text-accent font-medium"
              >
                Using baseline for {zipZoneResult.regionLabel}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Why we ask - Tooltip */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                <Info className="w-3.5 h-3.5" />
                Why we ask
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px] text-center">
              <p className="text-xs leading-relaxed">
                Your ZIP helps us estimate freight, local permit fees, and site prep costs. You can always refine this later.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
      
      {/* Optional Address Field (Expandable) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto"
      >
        <AnimatePresence mode="wait">
          {!showAddressField ? (
            <motion.button
              key="trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressField(true)}
              className="w-full text-center py-3 rounded-lg border border-dashed border-border/60 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group"
            >
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex items-center justify-center gap-2">
                I have a property address
                <ChevronDown className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <Label htmlFor="address" className="text-sm font-medium text-foreground mb-2 block">
                Property Address <span className="text-muted-foreground/60 font-normal">(optional)</span>
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, City, State"
                value={address}
                onChange={(e) => {
                  onAddressChange(e.target.value);
                  useConfiguratorStore.getState().setLocationAddress(e.target.value);
                }}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground/70 mt-2">
                We'll use this for more accurate site estimates.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-4 max-w-md mx-auto"
      >
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </motion.div>
      
      {/* "I don't know yet" Option */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto"
      >
        <button
          onClick={handleDontKnow}
          className={`
            w-full text-center py-4 px-5 rounded-xl border-2 transition-all duration-200
            ${locationKnown === false
              ? 'border-accent bg-accent/5 shadow-sm'
              : 'border-border hover:border-accent/40 hover:bg-accent/5'
            }
          `}
        >
          <p className={`font-medium ${locationKnown === false ? 'text-accent' : 'text-foreground'}`}>
            I don't know yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Continue with a preliminary estimate
          </p>
        </button>
      </motion.div>
      
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
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
          <span className="text-xs text-muted-foreground/60">
            You can change this later
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default StepLocation;
