// ============================================================================
// /build - Buyer Configurator Wizard
// Multi-step build configuration with live pricing
// Enhanced with intelligent preselection and resume capability
// 
// LAYOUT ARCHITECTURE:
// - Steps 1-3 (Intent, Location, Model): Single-column centered layout, no pricing rail
// - Steps 4-7 (Build Type, Floor Plan, Exterior, Summary): Two-column with pricing rail
// ============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfiguratorState } from '@/hooks/useConfiguratorState';
import { usePricingEngine } from '@/hooks/usePricingEngine';
import { useIsMobile } from '@/hooks/use-mobile';
import { StepIndicator, type Step } from '@/components/configurator/StepIndicator';
import { BuyerPricingDisplay, type BuyerPricingFlags } from '@/components/pricing/BuyerPricingDisplay';
import { ResumePrompt } from '@/components/configurator/ResumePrompt';
import { StepIntent } from '@/components/configurator/steps/StepIntent';
import { StepLocation } from '@/components/configurator/steps/StepLocation';
import { StepModel } from '@/components/configurator/steps/StepModel';
import { StepBuildType } from '@/components/configurator/steps/StepBuildType';
import { StepServicePackage } from '@/components/configurator/steps/StepServicePackage';
import { StepFloorPlan } from '@/components/configurator/steps/StepFloorPlan';
import { Step3Design } from '@/components/wizard/Step3Design';
import { StepSummary } from '@/components/configurator/steps/StepSummary';
import { getModelBySlug } from '@/data/pricing-config';

const STEPS: Step[] = [
  { id: 1, name: 'Build Intent', shortName: 'Intent' },
  { id: 2, name: 'Location', shortName: 'Location' },
  { id: 3, name: 'Pick Model', shortName: 'Model' },
  { id: 4, name: 'Build Type', shortName: 'Type' },
  { id: 5, name: 'Service Package', shortName: 'Service' },
  { id: 6, name: 'Floor Plan', shortName: 'Plan' },
  { id: 7, name: 'Exterior', shortName: 'Exterior' },
  { id: 8, name: 'Summary', shortName: 'Summary' },
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
    setServicePackage,
    setIncludeUtilityFees,
    setIncludePermitsCosts,
    toggleFloorPlanOption,
    updateExteriorSelection,
    isFloorPlanOptionSelected,
    setPackageId,
    setGarageDoorId,
    copyShareableLink,
    resetBuild,
    // Location setters
    setZipCode,
    setAddress,
    setLocationKnown,
    // Resume prompt
    showResumePrompt,
    pendingResumeState,
    resumeSavedState,
    startFresh,
    // Model change tracking
    isModelChangeFromPreselected,
    preselectedModel,
  } = useConfiguratorState();
  
  const { breakdown, formatPrice, model, pricing } = usePricingEngine(selection);
  
  // Step 4 override: Force supply_only pricing for MOD/XMOD comparison
  // This helps users compare home package costs before install is applied in Step 5
  const step4Selection = {
    ...selection,
    servicePackage: 'supply_only' as const,
  };
  const { pricing: step4Pricing } = usePricingEngine(step4Selection);
  
  // Determine which pricing to display based on current step
  const displayPricing = currentStep === 4 ? step4Pricing : pricing;
  
  // Track previous model for undo functionality
  const previousModelRef = useRef<string | null>(null);
  // Track model change for inline feedback (non-blocking)
  const [modelJustChanged, setModelJustChanged] = useState(false);
  
  // Build buyer-facing pricing flags from displayed pricing output
  const pricingFlags: BuyerPricingFlags = {
    freightPending: displayPricing.freightPending,
    basementSelectedRequiresQuote: displayPricing.basementSelectedRequiresQuote,
    estimateConfidence: displayPricing.estimateConfidence,
    hasPricing: displayPricing.hasPricing,
    pricingMode: displayPricing.pricingMode,
  };
  
  // Determine if we should show the pricing rail
  // Only show on steps 4+ when there's meaningful pricing context
  const showPricingRail = currentStep >= 4;
  
  // Handle model selection - immediate, non-blocking inline feedback
  const handleModelSelect = useCallback((modelSlug: string) => {
    const prevSlug = selection.modelSlug;
    const prevModel = prevSlug ? getModelBySlug(prevSlug) : null;
    const newModel = getModelBySlug(modelSlug);
    
    // Store previous for undo
    previousModelRef.current = prevSlug;
    
    // Immediately update model
    setModelSlug(modelSlug);
    
    // Trigger inline feedback if changing models (no toast)
    if (prevModel && newModel && prevSlug !== modelSlug) {
      setModelJustChanged(true);
    }
  }, [selection.modelSlug, setModelSlug]);
  
  // Undo model change handler
  const handleUndoModelChange = useCallback(() => {
    if (previousModelRef.current) {
      setModelSlug(previousModelRef.current);
      setModelJustChanged(false);
    }
  }, [setModelSlug]);
  
  // Clear feedback flag when it's consumed
  const clearModelChangeFeedback = useCallback(() => {
    setModelJustChanged(false);
  }, []);
  
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
    <>
      {/* Resume Prompt Overlay */}
      <ResumePrompt
        isOpen={showResumePrompt}
        savedModelSlug={pendingResumeState?.selection.modelSlug}
        savedStep={pendingResumeState?.step || 1}
        onResume={resumeSavedState}
        onStartFresh={startFresh}
      />
      
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
              <div className="text-center flex-1 hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">Get Your BaseMod Price</h1>
                <p className="text-xs text-muted-foreground">Design your home and see a real estimate in minutes.</p>
              </div>
              <div className="w-24" /> {/* Spacer for centering */}
            </div>
            
            <div className="space-y-2">
              <StepIndicator
                steps={STEPS}
                currentStep={currentStep}
                onStepClick={goToStep}
              />
              {/* Step progress text */}
              <p className="text-center text-xs text-muted-foreground/70">
                Step {currentStep} of {STEPS.length}
              </p>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* 
            LAYOUT LOGIC:
            - Steps 1-3: Single column, centered content, no pricing rail
            - Steps 4+: Two-column layout with pricing rail on desktop
          */}
          {showPricingRail ? (
            // Two-column layout for steps 4+
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
                    {currentStep === 4 && currentModel && (
                      <StepBuildType
                        model={currentModel}
                        selectedBuildType={selection.buildType}
                        onSelectBuildType={setBuildType}
                        onNext={nextStep}
                        onBack={prevStep}
                      />
                    )}
                    
                    {currentStep === 5 && (
                      <StepServicePackage
                        selectedPackage={selection.servicePackage}
                        onSelectPackage={setServicePackage}
                        onNext={nextStep}
                        onBack={prevStep}
                        hasLotSelected={false}
                      />
                    )}
                    
                    {currentStep === 6 && currentModel && selection.buildType && (
                      <StepFloorPlan
                        model={currentModel}
                        buildType={selection.buildType}
                        isOptionSelected={isFloorPlanOptionSelected}
                        onToggleOption={toggleFloorPlanOption}
                        onNext={nextStep}
                        onBack={prevStep}
                      />
                    )}
                    
                    {currentStep === 7 && currentModel && (
                      <Step3Design
                        selectedPackageId={selection.packageId}
                        selectedGarageDoorId={selection.garageDoorId}
                        onSelectPackage={setPackageId}
                        onSelectGarageDoor={setGarageDoorId}
                        onNext={nextStep}
                        onBack={prevStep}
                        isMobile={isMobile}
                        modelSlug={selection.modelSlug}
                      />
                    )}
                    
                    {currentStep === 8 && currentModel && selection.buildType && (
                      <StepSummary
                        model={currentModel}
                        buildType={selection.buildType}
                        breakdown={breakdown}
                        exteriorSelection={selection.exteriorSelection}
                        intent={selection.intent}
                        formatPrice={formatPrice}
                        onCopyLink={copyShareableLink}
                        onBack={prevStep}
                        packageId={selection.packageId}
                        garageDoorId={selection.garageDoorId}
                        zipCode={selection.zipCode}
                        includeUtilityFees={selection.includeUtilityFees}
                        includePermitsCosts={selection.includePermitsCosts}
                        onUtilityFeesChange={setIncludeUtilityFees}
                        onPermitsCostsChange={setIncludePermitsCosts}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Buyer-Facing Pricing Panel (Desktop) - Only for steps 4+ */}
              {/* Step 4 forces supply_only display for MOD/XMOD comparison */}
              {!isMobile && (
                <div className="hidden lg:block">
                  <div className="sticky top-32">
                    <BuyerPricingDisplay
                      breakdown={displayPricing.buyerFacingBreakdown}
                      flags={pricingFlags}
                      variant="full"
                      showPlaceholder={false}
                      onSwitchToInstalled={
                        // Only show upsell on Step 5+ when in supply_only mode
                        currentStep >= 5 && selection.servicePackage === 'supply_only' 
                          ? () => setServicePackage('delivered_installed')
                          : undefined
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Single-column centered layout for steps 1-3
            <div className="max-w-4xl mx-auto">
              
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
                      buildIntent={selection.intent}
                      zipCode={selection.zipCode}
                      address={selection.address}
                      locationKnown={selection.locationKnown}
                      onZipCodeChange={setZipCode}
                      onAddressChange={setAddress}
                      onLocationKnownChange={setLocationKnown}
                      onNext={nextStep}
                      onBack={prevStep}
                    />
                  )}
                  
                  {currentStep === 3 && (
                    <StepModel
                      selectedModelSlug={selection.modelSlug}
                      onSelectModel={handleModelSelect}
                      onNext={nextStep}
                      onBack={prevStep}
                      showUpdatedIndicator={modelJustChanged}
                      onUndo={handleUndoModelChange}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </main>
        
        {/* Mobile Pricing Bar - Only show on steps 4+ */}
        {/* Step 4 forces supply_only display for MOD/XMOD comparison */}
        {isMobile && showPricingRail && (
          <BuyerPricingDisplay
            breakdown={displayPricing.buyerFacingBreakdown}
            flags={pricingFlags}
            variant="mobile"
            showPlaceholder={false}
            onSwitchToInstalled={
              // Only show upsell on Step 5+ when in supply_only mode
              currentStep >= 5 && selection.servicePackage === 'supply_only' 
                ? () => setServicePackage('delivered_installed')
                : undefined
            }
          />
        )}
      </div>
    </>
  );
}
