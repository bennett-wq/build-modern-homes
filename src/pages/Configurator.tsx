// ============================================================================
// /build - Buyer Configurator Wizard
// Multi-step build configuration with live pricing
// ============================================================================

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfiguratorState } from '@/hooks/useConfiguratorState';
import { usePricingEngine } from '@/hooks/usePricingEngine';
import { useIsMobile } from '@/hooks/use-mobile';
import { StepIndicator, type Step } from '@/components/configurator/StepIndicator';
import { BuyerPricingDisplay, type BuyerPricingFlags } from '@/components/pricing/BuyerPricingDisplay';
import { StepIntent } from '@/components/configurator/steps/StepIntent';
import { StepLocation } from '@/components/configurator/steps/StepLocation';
import { StepModel } from '@/components/configurator/steps/StepModel';
import { StepBuildType } from '@/components/configurator/steps/StepBuildType';
import { StepFloorPlan } from '@/components/configurator/steps/StepFloorPlan';
import { StepExterior } from '@/components/configurator/steps/StepExterior';
import { StepSummary } from '@/components/configurator/steps/StepSummary';

const STEPS: Step[] = [
  { id: 1, name: 'Build Intent', shortName: 'Intent' },
  { id: 2, name: 'Location', shortName: 'Location' },
  { id: 3, name: 'Pick Model', shortName: 'Model' },
  { id: 4, name: 'Build Type', shortName: 'Type' },
  { id: 5, name: 'Floor Plan', shortName: 'Plan' },
  { id: 6, name: 'Exterior', shortName: 'Exterior' },
  { id: 7, name: 'Summary', shortName: 'Summary' },
];

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function Configurator() {
  const isMobile = useIsMobile();
  const {
    selection,
    currentStep,
    currentModel,
    goToStep,
    nextStep,
    prevStep,
    setIntent,
    setModelSlug,
    setBuildType,
    setIncludeUtilityFees,
    setIncludePermitsCosts,
    toggleFloorPlanOption,
    updateExteriorSelection,
    isFloorPlanOptionSelected,
    copyShareableLink,
    resetBuild,
  } = useConfiguratorState();
  
  const { breakdown, formatPrice, model, pricing } = usePricingEngine(selection);
  
  // Build buyer-facing pricing flags from full pricing output
  const pricingFlags: BuyerPricingFlags = {
    freightPending: pricing.freightPending,
    basementSelectedRequiresQuote: pricing.basementSelectedRequiresQuote,
    estimateConfidence: pricing.estimateConfidence,
    hasPricing: pricing.hasPricing,
    pricingMode: pricing.pricingMode,
  };
  
  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);
  
  // Auto-select build type if only one available
  useEffect(() => {
    if (currentStep === 4 && currentModel && currentModel.buildTypes.length === 1) {
      if (!selection.buildType) {
        setBuildType(currentModel.buildTypes[0]);
      }
    }
  }, [currentStep, currentModel, selection.buildType, setBuildType]);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit
                </Link>
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-5 h-5 text-accent" />
                <span className="font-semibold text-foreground">BaseMod</span>
              </Link>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Design & price your home
            </span>
          </div>
          
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className={isMobile ? '' : 'grid lg:grid-cols-[1fr_360px] gap-8'}>
          {/* Step Content */}
          <div className={isMobile ? 'pb-24' : ''}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                {currentStep === 1 && (
                  <StepIntent
                    selectedIntent={selection.intent}
                    onSelectIntent={setIntent}
                    onNext={nextStep}
                  />
                )}
                
                {currentStep === 2 && (
                  <StepLocation
                    zoneId={selection.zoneId}
                    includeUtilityFees={selection.includeUtilityFees}
                    includePermitsCosts={selection.includePermitsCosts}
                    onZoneChange={() => {}}
                    onUtilityFeesChange={setIncludeUtilityFees}
                    onPermitsCostsChange={setIncludePermitsCosts}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                
                {currentStep === 3 && (
                  <StepModel
                    selectedModelSlug={selection.modelSlug}
                    onSelectModel={setModelSlug}
                    onNext={nextStep}
                    onBack={prevStep}
                    includeUtilityFees={selection.includeUtilityFees}
                    includePermitsCosts={selection.includePermitsCosts}
                  />
                )}
                
                {currentStep === 4 && currentModel && (
                  <StepBuildType
                    model={currentModel}
                    selectedBuildType={selection.buildType}
                    onSelectBuildType={setBuildType}
                    onNext={nextStep}
                    onBack={prevStep}
                    includeUtilityFees={selection.includeUtilityFees}
                    includePermitsCosts={selection.includePermitsCosts}
                  />
                )}
                
                {currentStep === 5 && currentModel && selection.buildType && (
                  <StepFloorPlan
                    model={currentModel}
                    buildType={selection.buildType}
                    isOptionSelected={isFloorPlanOptionSelected}
                    onToggleOption={toggleFloorPlanOption}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                
                {currentStep === 6 && currentModel && (
                  <StepExterior
                    model={currentModel}
                    exteriorSelection={selection.exteriorSelection}
                    onUpdateExterior={updateExteriorSelection}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                
                {currentStep === 7 && currentModel && selection.buildType && (
                  <StepSummary
                    model={currentModel}
                    buildType={selection.buildType}
                    breakdown={breakdown}
                    exteriorSelection={selection.exteriorSelection}
                    intent={selection.intent}
                    formatPrice={formatPrice}
                    onCopyLink={copyShareableLink}
                    onBack={prevStep}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Buyer-Facing Pricing Panel (Desktop) */}
          {!isMobile && (
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <BuyerPricingDisplay
                  breakdown={pricing.buyerFacingBreakdown}
                  flags={pricingFlags}
                  variant="full"
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Mobile Pricing Bar */}
      {isMobile && (
        <BuyerPricingDisplay
          breakdown={pricing.buyerFacingBreakdown}
          flags={pricingFlags}
          variant="mobile"
        />
      )}
    </div>
  );
}
