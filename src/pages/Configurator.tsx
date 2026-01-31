// ============================================================================
// /build - Buyer Configurator Wizard
// Multi-step build configuration with live pricing
// Enhanced with intelligent preselection and resume capability
// Now using unified ConfiguratorStore for state management
// 
// LAYOUT ARCHITECTURE:
// - Steps 1-3 (Intent, Location, Model): Single-column centered layout, no pricing rail
// - Steps 4-7 (Build Type, Floor Plan, Exterior, Summary): Two-column with pricing rail
// ============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfiguratorStore, type BuildIntent as StoreIntent } from '@/state/useConfiguratorStore';
import { useConfiguratorPricing } from '@/hooks/useConfiguratorPricing';
import type { BuildIntent } from '@/data/pricing-config';
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
import { WizardFooterSpacer, WizardStickyFooter } from '@/components/wizard/WizardStickyFooter';
import { getModelBySlug } from '@/data/pricing-config';
import { brandMessaging } from '@/content/brandMessaging';

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
  
  // Use unified Zustand store
  const {
    // Selections
    intent,
    location,
    modelSlug,
    buildType,
    servicePackage,
    exteriorPackageId,
    garageDoorId,
    selectedOptionIds,
    includeUtilityFees,
    includePermitsCosts,
    // Step management
    currentStep,
    // Actions
    initDirectFlow,
    setIntent,
    setLocation,
    setModel,
    setBuildType,
    setServicePackage,
    setExteriorPackage,
    setGarageDoor,
    setFeeToggles,
    toggleOption,
    goToStep,
    nextStep,
    prevStep,
    resetSelections,
    getShareableUrl,
    hasSelections,
  } = useConfiguratorStore();
  
  // Parse URL search params for shareable links
  const [searchParams] = useSearchParams();
  
  // Initialize direct flow on mount
  useEffect(() => {
    initDirectFlow();
  }, [initDirectFlow]);
  
  // Hydrate store from URL params (shareable link support)
  useEffect(() => {
    const urlModel = searchParams.get('model');
    const urlType = searchParams.get('type') as 'xmod' | 'mod' | null;
    const urlPackage = searchParams.get('package');
    const urlGarage = searchParams.get('garage');
    const urlZip = searchParams.get('zip');
    
    // If URL has a model param, hydrate the store
    if (urlModel && urlModel !== modelSlug) {
      setModel(null, urlModel);
    }
    
    // Hydrate build type if provided
    if (urlType && (urlType === 'xmod' || urlType === 'mod') && urlType !== buildType) {
      setBuildType(urlType);
    }
    
    // Hydrate exterior package
    if (urlPackage && urlPackage !== exteriorPackageId) {
      setExteriorPackage(urlPackage);
    }
    
    // Hydrate garage door
    if (urlGarage && urlGarage !== garageDoorId) {
      setGarageDoor(urlGarage);
    }
    
    // Hydrate zip code
    if (urlZip && urlZip !== location.zipCode) {
      setLocation({ zipCode: urlZip });
    }
    
    // If URL has selections, skip to appropriate step
    if (urlModel) {
      if (urlType && urlPackage) {
        goToStep(8); // Go to summary if fully configured
      } else if (urlType) {
        goToStep(5); // Go to service package if build type selected
      } else {
        goToStep(4); // Go to build type if model selected
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Resume prompt state (simplified - store handles persistence)
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [pendingResumeState, setPendingResumeState] = useState<{ modelSlug: string | null; currentStep: number } | null>(null);
  
  // Check for saved state on mount (only if not coming from URL params)
  useEffect(() => {
    const urlModel = searchParams.get('model');
    // Don't show resume prompt if URL params are being used
    if (!urlModel && hasSelections() && currentStep === 1) {
      setPendingResumeState({ modelSlug, currentStep: 3 }); // Resume at model step
      setShowResumePrompt(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const resumeSavedState = useCallback(() => {
    setShowResumePrompt(false);
    if (modelSlug) {
      goToStep(3); // Go to model step
    }
  }, [modelSlug, goToStep]);
  
  const startFresh = useCallback(() => {
    resetSelections();
    setShowResumePrompt(false);
  }, [resetSelections]);
  
  // Get current model config
  const currentModel = modelSlug ? getModelBySlug(modelSlug) : null;
  
  // Use unified pricing engine via adapter
  const mainPricing = useConfiguratorPricing({
    modelSlug,
    buildType,
    servicePackage,
    selectedOptionIds,
    includeUtilityFees,
    includePermitsCosts,
    zipCode: location.zipCode,
    locationKnown: location.known,
  });
  
  // Step 4 override: Force supply_only pricing for MOD/XMOD comparison DISPLAY ONLY
  const step4Pricing = useConfiguratorPricing({
    modelSlug,
    buildType,
    servicePackage: 'supply_only',
    selectedOptionIds,
    includeUtilityFees,
    includePermitsCosts,
    zipCode: location.zipCode,
    locationKnown: location.known,
  });
  
  // Compute effective pricing mode:
  // - Step 4 (Build Type): ALWAYS show supply_only for MOD/XMOD comparison
  // - Step 5+: Use the actual selected service package
  const isStep4 = currentStep === 4;
  const displayPricing = isStep4 ? step4Pricing : mainPricing;
  
  // Track previous model for undo functionality
  const previousModelRef = useRef<string | null>(null);
  // Track model change for inline feedback (non-blocking)
  const [modelJustChanged, setModelJustChanged] = useState(false);
  
  // Build buyer-facing pricing flags
  // CRITICAL: For Step 4, use the step4 override; for all other steps, use the actual selection
  const pricingFlags: BuyerPricingFlags = {
    ...displayPricing.flags,
    // This is the key fix: Step 4 shows supply_only, Step 5+ uses actual selection
    pricingMode: isStep4 ? 'supply_only' : mainPricing.pricing.pricingMode,
  };
  
  // Determine if we should show the pricing rail
  // Only show on steps 4+ when there's meaningful pricing context
  const showPricingRail = currentStep >= 4;
  
  // Handle model selection - immediate, non-blocking inline feedback
  const handleModelSelect = useCallback((slug: string) => {
    const prevSlug = modelSlug;
    const prevModel = prevSlug ? getModelBySlug(prevSlug) : null;
    const newModel = getModelBySlug(slug);
    
    // Store previous for undo
    previousModelRef.current = prevSlug;
    
    // Immediately update model (store handles clearing dependent selections)
    setModel(null, slug);
    
    // Trigger inline feedback if changing models (no toast)
    if (prevModel && newModel && prevSlug !== slug) {
      setModelJustChanged(true);
    }
  }, [modelSlug, setModel]);
  
  // Undo model change handler
  const handleUndoModelChange = useCallback(() => {
    if (previousModelRef.current) {
      setModel(null, previousModelRef.current);
      setModelJustChanged(false);
    }
  }, [setModel]);
  
  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);
  
  // Auto-select build type if only one available
  useEffect(() => {
    if (currentStep === 4 && currentModel && currentModel.buildTypes.length === 1) {
      if (!buildType) {
        setBuildType(currentModel.buildTypes[0]);
      }
    }
  }, [currentStep, currentModel, buildType, setBuildType]);
  
  // Wrapped handlers for step components
  const handleSetPackageId = useCallback((id: string | null) => {
    setExteriorPackage(id);
  }, [setExteriorPackage]);
  
  const handleSetGarageDoorId = useCallback((id: string | null) => {
    setGarageDoor(id);
  }, [setGarageDoor]);
  
  // Location handlers
  const handleZipCodeChange = useCallback((zipCode: string) => {
    setLocation({ zipCode });
  }, [setLocation]);
  
  const handleAddressChange = useCallback((address: string) => {
    setLocation({ address });
  }, [setLocation]);
  
  const handleLocationKnownChange = useCallback((known: boolean) => {
    setLocation({ known });
  }, [setLocation]);
  
  // Fee toggle handlers
  const handleUtilityFeesChange = useCallback((value: boolean) => {
    setFeeToggles({ utility: value });
  }, [setFeeToggles]);
  
  const handlePermitsCostsChange = useCallback((value: boolean) => {
    setFeeToggles({ permits: value });
  }, [setFeeToggles]);
  
  // Floor plan option check
  const isFloorPlanOptionSelected = useCallback((optionId: string) => {
    return selectedOptionIds.includes(optionId);
  }, [selectedOptionIds]);
  
  // Copy shareable link - return the URL as a promise
  const copyShareableLink = useCallback(async (): Promise<string> => {
    const url = getShareableUrl();
    await navigator.clipboard.writeText(url);
    return url;
  }, [getShareableUrl]);
  
  // Map store intent type to component's expected type
  const mapIntent = (storeIntent: StoreIntent): BuildIntent | null => {
    if (storeIntent === 'own-land') return 'my-land';
    if (storeIntent === 'find-land') return 'find-land';
    if (storeIntent === 'basemod-community') return 'basemod-community';
    return null;
  };
  
  const handleSetIntent = useCallback((componentIntent: BuildIntent) => {
    // Map component intent back to store type
    let storeIntent: StoreIntent = null;
    if (componentIntent === 'my-land') storeIntent = 'own-land';
    else if (componentIntent === 'find-land') storeIntent = 'find-land';
    else if (componentIntent === 'basemod-community') storeIntent = 'basemod-community';
    setIntent(storeIntent);
  }, [setIntent]);
  
  return (
    <>
      {/* Resume Prompt Overlay */}
      <ResumePrompt
        isOpen={showResumePrompt}
        savedModelSlug={pendingResumeState?.modelSlug}
        savedStep={pendingResumeState?.currentStep || 1}
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
                <p className="text-xs text-muted-foreground">{brandMessaging.build.headerSubline}</p>
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
                    {currentStep === 4 && (
                      currentModel ? (
                        <StepBuildType
                          model={currentModel}
                          selectedBuildType={buildType}
                          onSelectBuildType={setBuildType}
                          onNext={nextStep}
                          onBack={prevStep}
                        />
                      ) : (
                        <div className="max-w-2xl mx-auto space-y-6">
                          <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                              Build Type
                            </h2>
                            <p className="text-muted-foreground">
                              We couldn't load your model selection. Go back and pick a model to continue.
                            </p>
                          </div>

                          <div className="rounded-xl border border-border bg-card p-5">
                            <p className="text-sm text-muted-foreground">
                              This is a failsafe so nobody gets stranded if state is missing or a refresh happens mid-flow.
                            </p>
                          </div>

                          <WizardFooterSpacer />
                          <WizardStickyFooter
                            onBack={() => goToStep(3)}
                            onContinue={() => goToStep(3)}
                            canContinue={true}
                            continueLabel="Back to Model"
                            showReassurance={false}
                          />
                        </div>
                      )
                    )}
                    
                    {currentStep === 5 && (
                      <StepServicePackage
                        selectedPackage={servicePackage}
                        onSelectPackage={setServicePackage}
                        onNext={nextStep}
                        onBack={prevStep}
                        hasLotSelected={false}
                      />
                    )}
                    
                    {currentStep === 6 && currentModel && buildType && (
                      <StepFloorPlan
                        model={currentModel}
                        buildType={buildType}
                        isOptionSelected={isFloorPlanOptionSelected}
                        onToggleOption={toggleOption}
                        onNext={nextStep}
                        onBack={prevStep}
                      />
                    )}
                    
                    {currentStep === 7 && currentModel && (
                      <Step3Design
                        selectedPackageId={exteriorPackageId}
                        selectedGarageDoorId={garageDoorId}
                        onSelectPackage={handleSetPackageId}
                        onSelectGarageDoor={handleSetGarageDoorId}
                        onNext={nextStep}
                        onBack={prevStep}
                        isMobile={isMobile}
                        modelSlug={modelSlug}
                      />
                    )}
                    
                    {currentStep === 8 && currentModel && buildType && (
                      <StepSummary
                        model={currentModel}
                        buildType={buildType}
                        breakdown={mainPricing.breakdown as any}
                        exteriorSelection={null}
                        intent={mapIntent(intent)}
                        formatPrice={mainPricing.formatPrice}
                        onCopyLink={copyShareableLink}
                        onBack={prevStep}
                        packageId={exteriorPackageId}
                        garageDoorId={garageDoorId}
                        zipCode={location.zipCode}
                        includeUtilityFees={includeUtilityFees}
                        includePermitsCosts={includePermitsCosts}
                        onUtilityFeesChange={handleUtilityFeesChange}
                        onPermitsCostsChange={handlePermitsCostsChange}
                        servicePackage={servicePackage}
                        selectedOptionIds={selectedOptionIds}
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
                      breakdown={displayPricing.breakdown}
                      flags={pricingFlags}
                      variant="full"
                      showPlaceholder={false}
                      onSwitchToInstalled={
                        // Show upsell ONLY when:
                        // 1. On Step 4 (always supply_only display, but user hasn't chosen yet)
                        // 2. On Step 5+ AND user has explicitly selected supply_only
                        // Never show if user selected delivered_installed
                        isStep4 
                          ? undefined // Step 4 doesn't show upsell - they haven't made service choice yet
                          : (servicePackage === 'supply_only' 
                              ? () => setServicePackage('delivered_installed')
                              : undefined)
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
                      selectedIntent={mapIntent(intent)}
                      onSelectIntent={handleSetIntent}
                      onNext={nextStep}
                    />
                  )}
                  
                  {currentStep === 2 && (
                    <StepLocation
                      buildIntent={mapIntent(intent)}
                      zipCode={location.zipCode}
                      address={location.address}
                      locationKnown={location.known}
                      onZipCodeChange={handleZipCodeChange}
                      onAddressChange={handleAddressChange}
                      onLocationKnownChange={handleLocationKnownChange}
                      onNext={nextStep}
                      onBack={prevStep}
                    />
                  )}
                  
                  {currentStep === 3 && (
                    <StepModel
                      selectedModelSlug={modelSlug}
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
            breakdown={displayPricing.breakdown}
            flags={pricingFlags}
            variant="mobile"
            showPlaceholder={false}
            onSwitchToInstalled={
              // Same logic as desktop: no upsell on Step 4, only on Step 5+ if supply_only selected
              isStep4 
                ? undefined 
                : (servicePackage === 'supply_only' 
                    ? () => setServicePackage('delivered_installed')
                    : undefined)
            }
          />
        )}
      </div>
    </>
  );
}
