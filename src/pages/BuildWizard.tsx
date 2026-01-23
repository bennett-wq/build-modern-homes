// Build Wizard Page - Lot → Model → Design → Review flow
// Premium proptech-grade wizard with smooth transitions
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, Home, MapPin, Palette, ClipboardCheck, CheckCircle } from 'lucide-react';
import { getDevelopmentBySlug } from '@/data/developments';
import { grandHavenLots } from '@/data/lots/grand-haven';
import { stJamesBayLots } from '@/data/lots/st-james-bay';
import { getModelBySlug } from '@/data/models';
import { getPackageById, getGarageDoorById } from '@/data/packages';
import { 
  getHawthornePackageById, 
  getHawthorneGarageById, 
  isPhotoBasedModel,
  normalizeModelSlug 
} from '@/data/hawthorne-exteriors';
import { getAspenPackageById } from '@/data/aspen-exteriors';
import { getBelmontPackageById } from '@/data/belmont-exteriors';
import { useBuildSelection } from '@/hooks/useBuildSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePricingEngine, defaultBuildSelection, type BuildSelection } from '@/hooks/usePricingEngine';
import { derivePricingMode } from '@/lib/pricing-mode-utils';
import { Step1Lot } from '@/components/wizard/Step1Lot';
import { Step2Model } from '@/components/wizard/Step2Model';
import { Step3Design } from '@/components/wizard/Step3Design';
import { Step4Review } from '@/components/wizard/Step4Review';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, name: 'Pick a Lot', shortName: 'Lot', icon: MapPin },
  { id: 2, name: 'Pick a Model', shortName: 'Model', icon: Home },
  { id: 3, name: 'Design Exterior', shortName: 'Design', icon: Palette },
  { id: 4, name: 'Review', shortName: 'Review', icon: ClipboardCheck },
];

// Prevent layout shift during step transitions
const stepVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const stepTransition = {
  duration: 0.2,
  ease: 'easeOut' as const,
};

export default function BuildWizard() {
  const { slug = 'grand-haven' } = useParams<{ slug: string }>();
  const isMobile = useIsMobile();
  const development = getDevelopmentBySlug(slug);
  
  const {
    selection,
    setLot,
    setModel,
    setPackage,
    setGarageDoor,
    getShareableUrl,
    getContactUrl,
    justSaved,
  } = useBuildSelection({ developmentSlug: slug });

  // Determine current step based on selections
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-advance to appropriate step based on URL params (only on mount)
  useEffect(() => {
    if (selection.garageDoorId && selection.packageId && selection.modelSlug && selection.lotId) {
      setCurrentStep(4);
    } else if (selection.packageId && selection.modelSlug && selection.lotId) {
      setCurrentStep(3);
    } else if (selection.modelSlug && selection.lotId) {
      setCurrentStep(3);
    } else if (selection.lotId) {
      setCurrentStep(1);
    }
  }, []);

  const lots = useMemo(() => {
    if (slug === 'grand-haven') return grandHavenLots;
    if (slug === 'st-james-bay') return stJamesBayLots;
    return [];
  }, [slug]);

  const selectedLot = lots.find(l => l.id === selection.lotId) || null;
  const normalizedModelSlug = normalizeModelSlug(selection.modelSlug);
  const selectedModel = normalizedModelSlug ? getModelBySlug(normalizedModelSlug) || null : null;
  
  // Determine model type for package/garage resolution
  const isHawthorne = normalizedModelSlug === 'hawthorne';
  const isAspen = normalizedModelSlug === 'aspen';
  const isBelmont = normalizedModelSlug === 'belmont';
  
  // Resolve selected package based on model type
  const selectedPackage = selection.packageId 
    ? (isHawthorne 
        ? getHawthornePackageById(selection.packageId)
        : isAspen 
          ? getAspenPackageById(selection.packageId)
          : isBelmont
            ? getBelmontPackageById(selection.packageId)
            : getPackageById(selection.packageId)) || null 
    : null;
  
  // Resolve garage door (Aspen uses standard doors, not Hawthorne-specific)
  const selectedGarageDoor = selection.garageDoorId 
    ? (isHawthorne 
        ? getHawthorneGarageById(selection.garageDoorId) 
        : getGarageDoorById(selection.garageDoorId)) || null 
    : null;

  // Derive correct pricing mode based on context
  // BuildWizard is always in a BaseMod Community context
  const derivedPricingMode = useMemo(() => {
    return derivePricingMode({
      buildIntent: 'basemod-community',
      hasLotSelected: selection.lotId !== null,
      servicePackage: 'delivered_installed', // Default for community
    });
  }, [selection.lotId]);

  // Build pricing selection for the engine
  const pricingSelection: BuildSelection = useMemo(() => ({
    ...defaultBuildSelection,
    modelSlug: normalizedModelSlug,
    buildType: 'xmod' as const, // Default to XMOD for community wizard
    pricingMode: derivedPricingMode,
    includeUtilityFees: true,
    includePermitsCosts: true,
  }), [normalizedModelSlug, derivedPricingMode]);

  // Get pricing from the engine
  const { pricing } = usePricingEngine(pricingSelection);

  // Build selection summary for quote forms
  const selectionSummary = useMemo(() => ({
    developmentSlug: development?.slug,
    developmentName: development?.name,
    lotId: selection.lotId ?? undefined,
    lotLabel: selectedLot?.label,
    modelSlug: normalizedModelSlug ?? undefined,
    modelName: selectedModel?.name,
    packageId: selection.packageId ?? undefined,
    packageName: selectedPackage?.name,
    garageDoorId: selection.garageDoorId ?? undefined,
    garageDoorName: selectedGarageDoor?.name,
  }), [development, selection, selectedLot, selectedModel, selectedPackage, selectedGarageDoor, normalizedModelSlug]);

  const goToStep = useCallback((step: number) => {
    if (step < currentStep || step === currentStep) {
      setCurrentStep(step);
    }
  }, [currentStep]);

  if (!development) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Development not found</h1>
          <Button asChild variant="outline">
            <Link to="/developments">Browse Developments</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header - sticky and stable */}
      <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="text-muted-foreground hover:text-foreground -ml-2"
              >
                <Link to={`/developments/${slug}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {isMobile ? 'Back' : development.name}
                </Link>
              </Button>
            </div>
            
            {/* Save indicator */}
            <AnimatePresence mode="wait">
              {justSaved && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 text-sm text-green-600"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Saved</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Step Indicators - consistent sizing */}
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Wizard progress">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              const isClickable = step.id <= currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    disabled={!isClickable}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Step ${step.id}: ${step.name}${isComplete ? ' (completed)' : ''}`}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isActive && 'bg-accent text-accent-foreground shadow-sm',
                      isComplete && 'bg-green-500/10 text-green-600 hover:bg-green-500/15 cursor-pointer',
                      !isActive && !isComplete && 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                    )}
                  >
                    {isComplete ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <StepIcon className={cn(
                        'h-4 w-4',
                        isActive ? 'text-accent-foreground' : 'text-current'
                      )} />
                    )}
                    <span className={cn(
                      'hidden sm:inline',
                      isMobile && 'sm:hidden'
                    )}>
                      {isMobile ? step.shortName : step.name}
                    </span>
                    {isMobile && (
                      <span className="sm:hidden text-xs">{step.shortName}</span>
                    )}
                  </button>
                  
                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      'w-4 sm:w-8 h-0.5 mx-0.5 sm:mx-1 rounded-full transition-colors duration-200',
                      currentStep > step.id ? 'bg-green-500' : 'bg-border'
                    )} />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content - fixed height prevents layout shift */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stepTransition}
              className="absolute inset-0"
            >
              <Step1Lot
                lots={lots}
                selectedLotId={selection.lotId}
                sitePlanImagePath={development.sitePlanImagePath}
                onSelectLot={setLot}
                onNext={() => setCurrentStep(2)}
                isMobile={isMobile}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stepTransition}
              className="absolute inset-0"
            >
              <Step2Model
                selectedModelSlug={selection.modelSlug}
                onSelectModel={setModel}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
                isMobile={isMobile}
                developmentSlug={slug}
                lotId={selection.lotId}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stepTransition}
              className="absolute inset-0"
            >
              <Step3Design
                selectedPackageId={selection.packageId}
                selectedGarageDoorId={selection.garageDoorId}
                onSelectPackage={setPackage}
                onSelectGarageDoor={setGarageDoor}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
                isMobile={isMobile}
                developmentSlug={slug}
                lotId={selection.lotId}
                modelSlug={selection.modelSlug}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stepTransition}
              className="absolute inset-0"
            >
              <Step4Review
                development={development}
                lot={selectedLot}
                model={selectedModel}
                package_={selectedPackage}
                garageDoor={selectedGarageDoor}
                contactUrl={getContactUrl()}
                shareableUrl={getShareableUrl()}
                onBack={() => setCurrentStep(3)}
                isMobile={isMobile}
                buyerFacingBreakdown={pricing.buyerFacingBreakdown}
                pricingFlags={{
                  freightPending: pricing.freightPending,
                  basementSelectedRequiresQuote: pricing.basementSelectedRequiresQuote,
                  estimateConfidence: pricing.estimateConfidence,
                  hasPricing: pricing.hasPricing,
                  pricingMode: pricing.pricingMode,
                }}
                selectionSummary={selectionSummary}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
