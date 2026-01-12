// Build Wizard Page - Lot → Model → Design → Review flow
import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { getDevelopmentBySlug } from '@/data/developments';
import { grandHavenLots } from '@/data/lots/grand-haven';
import { getModelBySlug } from '@/data/models';
import { getPackageById, getGarageDoorById } from '@/data/packages';
import { useBuildSelection } from '@/hooks/useBuildSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { Step1Lot } from '@/components/wizard/Step1Lot';
import { Step2Model } from '@/components/wizard/Step2Model';
import { Step3Design } from '@/components/wizard/Step3Design';
import { Step4Review } from '@/components/wizard/Step4Review';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, name: 'Pick a Lot' },
  { id: 2, name: 'Pick a Model' },
  { id: 3, name: 'Design Exterior' },
  { id: 4, name: 'Review' },
];

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
  } = useBuildSelection({ developmentSlug: slug });

  // Determine current step based on selections
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-advance to appropriate step based on URL params
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
    return [];
  }, [slug]);

  const selectedLot = lots.find(l => l.id === selection.lotId) || null;
  const selectedModel = selection.modelSlug ? getModelBySlug(selection.modelSlug) || null : null;
  const selectedPackage = selection.packageId ? getPackageById(selection.packageId) || null : null;
  const selectedGarageDoor = selection.garageDoorId ? getGarageDoorById(selection.garageDoorId) || null : null;

  if (!development) {
    return <div className="min-h-screen flex items-center justify-center">Development not found</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-semibold text-foreground">Build at {development.name}</h1>
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  disabled={step.id > currentStep}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
                    currentStep === step.id && 'bg-accent text-accent-foreground',
                    currentStep > step.id && 'bg-green-500/10 text-green-600 cursor-pointer hover:bg-green-500/20',
                    currentStep < step.id && 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                      {step.id}
                    </span>
                  )}
                  {!isMobile && <span>{step.name}</span>}
                </button>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    'w-8 h-0.5 mx-1',
                    currentStep > step.id ? 'bg-green-500' : 'bg-border'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <Step2Model
                selectedModelSlug={selection.modelSlug}
                onSelectModel={setModel}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
                isMobile={isMobile}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <Step3Design
                selectedPackageId={selection.packageId}
                selectedGarageDoorId={selection.garageDoorId}
                onSelectPackage={setPackage}
                onSelectGarageDoor={setGarageDoor}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
                isMobile={isMobile}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
