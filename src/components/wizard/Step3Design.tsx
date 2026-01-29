// Step 3: Design Your Exterior - package and garage door selection with live preview
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Palette, DoorOpen, Check, Eye, ShieldCheck, ClipboardCheck, Sparkles, Info, HelpCircle } from 'lucide-react';
import { WizardStickyFooter, WizardFooterSpacer } from '@/components/wizard/WizardStickyFooter';
import { EXTERIOR_COPY, getPackageDescription, getGarageDescription } from '@/content/exteriorMicrocopy';
import { exteriorPackages, garageDoors, ExteriorPackage, GarageDoor } from '@/data/packages';
import { getDevelopmentBySlug } from '@/data/developments';
import { 
  hawthornePackages, 
  hawthorneGarages, 
  hawthorneExteriorVariantImages,
  hawthorneDefaultPackageId,
  hawthorneDefaultGarageId,
  getHawthorneExteriorImage, 
  getHawthorneFallbackImage, 
  getHawthorneHeroImage,
  getHawthorneHeroWithGarage,
  getAllHawthorneVariantImages,
  getAvailableGaragesForPackage,
  hasVariantImage,
  isPhotoBasedModel,
  normalizeModelSlug,
  HawthornePackage,
  HawthorneGarage 
} from '@/data/hawthorne-exteriors';
import { 
  aspenPackages, 
  getAspenPackageImage,
  getAspenHeroImage,
  AspenPackage 
} from '@/data/aspen-exteriors';
import { 
  belmontPackages, 
  getBelmontPackageImage,
  getBelmontHeroImage,
  BelmontPackage,
  FALLBACK_SWATCHES 
} from '@/data/belmont-exteriors';
import {
  keenelandPackages,
  keenelandGarages,
  getKeenelandExteriorImage,
  getKeenelandHeroImage,
  getAllKeenelandRenderImages,
  hasKeenelandVariant,
  KeenelandPackage,
  KeenelandGarage,
} from '@/data/keeneland-exteriors';
import { FinancingModal } from '@/components/financing/FinancingModal';
import { AppraisalInfoDrawer } from '@/components/appraisal/AppraisalBadge';
import { cn } from '@/lib/utils';

interface Step3DesignProps {
  selectedPackageId: string | null;
  selectedGarageDoorId: string | null;
  onSelectPackage: (id: string) => void;
  onSelectGarageDoor: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  isMobile: boolean;
  // For financing modal
  developmentSlug?: string;
  lotId?: number | null;
  modelSlug?: string | null;
}

export function Step3Design({
  selectedPackageId,
  selectedGarageDoorId,
  onSelectPackage,
  onSelectGarageDoor,
  onNext,
  onBack,
  isMobile,
  developmentSlug,
  lotId,
  modelSlug,
}: Step3DesignProps) {
  const normalizedModel = normalizeModelSlug(modelSlug);
  const usePhotoPreview = isPhotoBasedModel(modelSlug);
  
  // Get development to check for ARB package restrictions
  const development = developmentSlug ? getDevelopmentBySlug(developmentSlug) : null;
  const arbReadyPackages = development?.arbReadyPackages;
  const isArbCommunity = arbReadyPackages && arbReadyPackages.length > 0;
  
  // Determine model type for package/garage selection
  const isAspen = normalizedModel === 'aspen';
  const isHawthorne = normalizedModel === 'hawthorne';
  const isBelmont = normalizedModel === 'belmont';
  const isKeeneland = normalizedModel === 'keeneland';
  
  // Get the appropriate packages/garages based on model
  const allPackages = isKeeneland
    ? keenelandPackages
    : isAspen 
      ? aspenPackages 
      : isBelmont 
        ? belmontPackages
        : (isHawthorne ? hawthornePackages : exteriorPackages);
  const garages = isKeeneland 
    ? keenelandGarages 
    : isHawthorne 
      ? hawthorneGarages 
      : garageDoors;
  
  // Filter packages if development has ARB restrictions
  const packages = isArbCommunity 
    ? allPackages.filter(p => arbReadyPackages.includes(p.id))
    : allPackages;
  
  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const selectedDoor = garages.find(d => d.id === selectedGarageDoorId);
  
  // Allow proceed with package only - garage is optional (auto-select first available as fallback)
  const canProceed = !!selectedPackageId && !!selectedGarageDoorId;

  const [activeTab, setActiveTab] = useState<string>('package');
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [showAppraisalDrawer, setShowAppraisalDrawer] = useState(false);

  // Auto-select first garage door if none selected when entering step
  useEffect(() => {
    if (!selectedGarageDoorId && garages.length > 0) {
      // Auto-select the first non-upgrade garage option, or just the first one
      const defaultGarage = garages.find(g => !('isUpgrade' in g && g.isUpgrade)) || garages[0];
      if (defaultGarage) {
        onSelectGarageDoor(defaultGarage.id);
      }
    }
  }, [selectedGarageDoorId, garages, onSelectGarageDoor]);

  // Auto-switch to garage tab when package is selected
  const handleSelectPackage = useCallback((id: string) => {
    onSelectPackage(id);
    if (!selectedGarageDoorId) {
      setTimeout(() => setActiveTab('garage'), 150);
    }
  }, [onSelectPackage, selectedGarageDoorId]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
              {EXTERIOR_COPY.step.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isArbCommunity ? EXTERIOR_COPY.step.arbSubtitle : EXTERIOR_COPY.step.subtitle}
            </p>
            {EXTERIOR_COPY.step.helper && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                {EXTERIOR_COPY.step.helper}
              </p>
            )}
            {isArbCommunity && development?.arbGuidelinesUrl && (
              <a 
                href={development.arbGuidelinesUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent hover:underline mt-1 inline-block"
              >
                View ARB Guidelines →
              </a>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        </div>
        {/* Trust & Financing compact strip */}
        <TrustFinancingStrip 
          onOpenFinancing={() => setShowFinancingModal(true)}
          onOpenAppraisal={() => setShowAppraisalDrawer(true)}
        />
      </div>

      {/* Content */}
      <div className={cn(
        'flex-1 overflow-hidden min-h-0',
        isMobile ? 'flex flex-col' : 'flex'
      )}>
        {/* Live Preview - full-bleed hero container */}
        <div className={cn(
          'bg-gradient-to-b from-muted/30 to-muted/10 flex items-center justify-center p-3 sm:p-4',
          isMobile ? 'h-56 shrink-0' : 'flex-1 min-h-0'
        )}>
          {isKeeneland ? (
            <KeenelandPhotoPreview 
              packageId={selectedPackageId} 
              garageId={selectedGarageDoorId}
            />
          ) : isAspen ? (
            <AspenPhotoPreview packageId={selectedPackageId} />
          ) : isBelmont ? (
            <BelmontPhotoPreview packageId={selectedPackageId} />
          ) : isHawthorne ? (
            <HawthornePhotoPreview
              packageId={selectedPackageId}
              garageId={selectedGarageDoorId}
            />
          ) : (
            <ExteriorPreview 
              package_={selectedPackage as ExteriorPackage} 
              garageDoor={selectedDoor as GarageDoor}
            />
          )}
        </div>

        {/* Selection Panel - ensure proper scroll on mobile */}
        <div className={cn(
          'bg-background border-l border-border overflow-hidden flex flex-col min-h-0',
          isMobile ? 'flex-1' : 'w-96 shrink-0'
        )}>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="h-full flex flex-col"
          >
            <TabsList className="grid grid-cols-2 mx-4 mt-4 shrink-0">
              <TabsTrigger 
                value="package" 
                className="flex items-center gap-2 data-[state=active]:shadow-sm"
              >
                <Palette className="h-4 w-4" />
                <span>{EXTERIOR_COPY.tabs.package.label}</span>
                {selectedPackageId && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="garage" 
                className="flex items-center gap-2 data-[state=active]:shadow-sm"
              >
                <DoorOpen className="h-4 w-4" />
                <span>{EXTERIOR_COPY.tabs.garage.label}</span>
                {selectedGarageDoorId && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="package" className="flex-1 overflow-auto p-4 mt-0 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Package tab helper + swatch legend */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{EXTERIOR_COPY.tabs.package.helper}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                        <span>{EXTERIOR_COPY.swatches.legend}</span>
                        <HelpCircle className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px]">
                      <p className="font-medium text-xs mb-1">{EXTERIOR_COPY.swatches.tooltipTitle}</p>
                      <p className="text-xs text-muted-foreground">{EXTERIOR_COPY.swatches.tooltipBody}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid gap-3">
                {isKeeneland ? (
                  keenelandPackages.map((pkg) => (
                    <KeenelandPackageCard
                      key={pkg.id}
                      package_={pkg}
                      isSelected={pkg.id === selectedPackageId}
                      onSelect={() => handleSelectPackage(pkg.id)}
                    />
                  ))
                ) : isAspen ? (
                  aspenPackages.map((pkg) => (
                    <AspenPackageCard
                      key={pkg.id}
                      package_={pkg}
                      isSelected={pkg.id === selectedPackageId}
                      onSelect={() => handleSelectPackage(pkg.id)}
                    />
                  ))
                ) : isBelmont ? (
                  belmontPackages.map((pkg) => (
                    <BelmontPackageCard
                      key={pkg.id}
                      package_={pkg}
                      isSelected={pkg.id === selectedPackageId}
                      onSelect={() => handleSelectPackage(pkg.id)}
                    />
                  ))
                ) : isHawthorne ? (
                  hawthornePackages.map((pkg) => (
                    <HawthornePackageCard
                      key={pkg.id}
                      package_={pkg}
                      isSelected={pkg.id === selectedPackageId}
                      onSelect={() => handleSelectPackage(pkg.id)}
                    />
                  ))
                ) : (
                  exteriorPackages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      package_={pkg}
                      isSelected={pkg.id === selectedPackageId}
                      onSelect={() => handleSelectPackage(pkg.id)}
                    />
                  ))
                )}
              </div>
              {/* Safe bottom padding for sticky footer */}
              <WizardFooterSpacer />
            </TabsContent>

            <TabsContent value="garage" className="flex-1 overflow-auto p-4 mt-0 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Garage tab helper */}
              <p className="text-xs text-muted-foreground mb-3">{EXTERIOR_COPY.tabs.garage.helper}</p>
              <div className="grid gap-3">
                {isKeeneland ? (
                  keenelandGarages.map((door) => (
                    <KeenelandGarageCard
                      key={door.id}
                      door={door}
                      isSelected={door.id === selectedGarageDoorId}
                      isAvailable={!selectedPackageId || hasKeenelandVariant(selectedPackageId, door.id)}
                      onSelect={() => onSelectGarageDoor(door.id)}
                    />
                  ))
                ) : isAspen ? (
                  // Aspen doesn't have photo-based garage variants - use standard doors
                  garageDoors.map((door) => (
                    <GarageDoorCard
                      key={door.id}
                      door={door}
                      isSelected={door.id === selectedGarageDoorId}
                      onSelect={() => onSelectGarageDoor(door.id)}
                    />
                  ))
                ) : isHawthorne ? (
                  hawthorneGarages.map((door) => (
                    <HawthorneGarageCard
                      key={door.id}
                      door={door}
                      isSelected={door.id === selectedGarageDoorId}
                      isAvailable={!selectedPackageId || hasVariantImage(selectedPackageId, door.id)}
                      onSelect={() => onSelectGarageDoor(door.id)}
                    />
                  ))
                ) : (
                  garageDoors.map((door) => (
                    <GarageDoorCard
                      key={door.id}
                      door={door}
                      isSelected={door.id === selectedGarageDoorId}
                      onSelect={() => onSelectGarageDoor(door.id)}
                    />
                  ))
                )}
              </div>
              {/* Safe bottom padding for sticky footer */}
              <WizardFooterSpacer />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sticky Footer */}
      <WizardStickyFooter
        onBack={onBack}
        onContinue={onNext}
        canContinue={!!canProceed}
        continueLabel="Review Your Build"
        pulseOnReady={`${selectedPackageId}-${selectedGarageDoorId}`}
      >
        {/* Selection summary */}
        {(selectedPackage || selectedDoor) && (
          <div className="flex items-center gap-3">
            {selectedPackage && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                <div 
                  className="w-4 h-4 rounded-sm border border-border shadow-sm"
                  style={{ 
                    backgroundColor: 'swatches' in selectedPackage 
                      ? selectedPackage.swatches[0] 
                      : 'primaryColor' in selectedPackage 
                        ? selectedPackage.primaryColor 
                        : selectedPackage.sidingColor 
                  }}
                />
                <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
                  {selectedPackage.name}
                </span>
              </div>
            )}
            {selectedDoor && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                <div 
                  className="w-4 h-4 rounded-sm border border-border shadow-sm"
                  style={{ 
                    backgroundColor: 'color' in selectedDoor 
                      ? selectedDoor.color 
                      : 'swatches' in selectedDoor && selectedDoor.swatches 
                        ? selectedDoor.swatches[0] 
                        : '#666666'
                  }}
                />
                <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
                  {selectedDoor.name}
                </span>
                {'isUpgrade' in selectedDoor && selectedDoor.isUpgrade && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Upgrade
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </WizardStickyFooter>

      {/* Financing Modal */}
      <FinancingModal
        open={showFinancingModal}
        onOpenChange={setShowFinancingModal}
        developmentSlug={developmentSlug}
        lotId={lotId}
        modelSlug={normalizedModel}
        packageId={selectedPackageId}
        garageDoorId={selectedGarageDoorId}
      />

      {/* Appraisal Drawer */}
      <AppraisalInfoDrawer
        open={showAppraisalDrawer}
        onOpenChange={setShowAppraisalDrawer}
      />
    </div>
  );
}

// Compact Trust & Financing strip with pill buttons
interface TrustFinancingStripProps {
  onOpenFinancing: () => void;
  onOpenAppraisal: () => void;
}

function TrustFinancingStrip({ onOpenFinancing, onOpenAppraisal }: TrustFinancingStripProps) {
  return (
    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/50">
      <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">Trust & Support:</span>
      <button
        onClick={onOpenFinancing}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
          'bg-secondary border border-border text-foreground',
          'hover:bg-secondary/80 hover:border-border/80 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5 text-accent" />
        Financing
      </button>
      <button
        onClick={onOpenAppraisal}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
          'bg-secondary border border-border text-foreground',
          'hover:bg-secondary/80 hover:border-border/80 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
      >
        <ClipboardCheck className="h-3.5 w-3.5 text-accent" />
        Appraisals
      </button>
    </div>
  );
}

// In-memory image cache - persists across re-renders
const imageCache = new Map<string, 'loading' | 'loaded' | 'failed'>();
const failedImages = new Set<string>();

// Preload an image and update cache
function preloadImage(src: string): Promise<boolean> {
  if (imageCache.get(src) === 'loaded') return Promise.resolve(true);
  if (failedImages.has(src)) return Promise.resolve(false);
  
  return new Promise((resolve) => {
    const img = new Image();
    imageCache.set(src, 'loading');
    
    img.onload = () => {
      imageCache.set(src, 'loaded');
      resolve(true);
    };
    img.onerror = () => {
      imageCache.set(src, 'failed');
      failedImages.add(src);
      resolve(false);
    };
    img.src = src;
  });
}

// Photo-based preview for Hawthorne model with caching, debouncing, and stale-while-revalidate
interface HawthornePhotoPreviewProps {
  packageId: string | null;
  garageId: string | null;
}

function HawthornePhotoPreview({ packageId, garageId }: HawthornePhotoPreviewProps) {
  const isDev = import.meta.env.DEV;
  
  // Stale-while-revalidate: keep showing last good image
  const [displayedSrc, setDisplayedSrc] = useState<string>(getHawthorneHeroImage());
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Refs for debouncing and abort control
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingAbortRef = useRef<boolean>(false);
  const currentGarageRef = useRef<string | null>(garageId);
  
  // Keep garage ref updated for fallback logic
  useEffect(() => {
    currentGarageRef.current = garageId;
  }, [garageId]);
  
  // Compute target image based on selections using new variant system
  const targetImage = useMemo(() => {
    if (!packageId) return getHawthorneHeroImage();
    if (!garageId) return getHawthorneFallbackImage(packageId);
    return getHawthorneExteriorImage(packageId, garageId);
  }, [packageId, garageId]);

  // Preload ALL Hawthorne variant images once
  useEffect(() => {
    const allVariants = getAllHawthorneVariantImages();
    allVariants.forEach(src => {
      if (!imageCache.has(src)) {
        preloadImage(src);
      }
    });
    // Also preload hero
    if (!imageCache.has(getHawthorneHeroImage())) {
      preloadImage(getHawthorneHeroImage());
    }
  }, []);

  // Improved fallback chain: package+garage → hero+garage → hero
  const resolveWithFallback = useCallback((failedSrc: string, pkgId: string | null, grgId: string | null) => {
    const tryFallbacks = async () => {
      // Fallback 1: hero with same garage (e.g., hero__black-industrial.webp)
      if (grgId && grgId !== 'standard') {
        const heroWithGarage = getHawthorneHeroWithGarage(grgId);
        if (heroWithGarage !== failedSrc) {
          const cached = imageCache.get(heroWithGarage);
          if (cached === 'loaded') {
            if (isDev) console.log(`[Hawthorne] → Fallback hero+garage: ${heroWithGarage}`);
            setDisplayedSrc(heroWithGarage);
            setIsTransitioning(false);
            return;
          }
          if (!failedImages.has(heroWithGarage)) {
            const success = await preloadImage(heroWithGarage);
            if (success && !loadingAbortRef.current) {
              if (isDev) console.log(`[Hawthorne] → Loaded hero+garage: ${heroWithGarage}`);
              setDisplayedSrc(heroWithGarage);
              setIsTransitioning(false);
              return;
            }
          }
        }
      }
      
      // Fallback 2: plain hero
      const hero = getHawthorneHeroImage();
      if (isDev) console.log(`[Hawthorne] → Hero fallback: ${hero}`);
      setDisplayedSrc(hero);
      setIsTransitioning(false);
    };
    
    tryFallbacks();
  }, [isDev]);

  // Debounced image loading with fast fallback
  useEffect(() => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Abort any in-progress load
    loadingAbortRef.current = true;
    
    // If target is already cached and loaded, swap instantly
    if (imageCache.get(targetImage) === 'loaded') {
      setDisplayedSrc(targetImage);
      setIsTransitioning(false);
      return;
    }
    
    // If target is known to be failed, go straight to fallback chain
    if (failedImages.has(targetImage)) {
      resolveWithFallback(targetImage, packageId, garageId);
      return;
    }
    
    // Debounce: wait 150ms before committing to load
    debounceTimerRef.current = setTimeout(() => {
      loadingAbortRef.current = false;
      setIsTransitioning(true);
      
      if (isDev) {
        console.log(`[Hawthorne] Loading: ${targetImage}`);
      }
      
      // Try to load with 250ms timeout for fast failure
      const loadPromise = preloadImage(targetImage);
      const timeoutPromise = new Promise<boolean>((resolve) => 
        setTimeout(() => resolve(false), 250)
      );
      
      Promise.race([loadPromise, timeoutPromise]).then((success) => {
        if (loadingAbortRef.current) return; // Aborted by newer selection
        
        if (success && imageCache.get(targetImage) === 'loaded') {
          if (isDev) console.log(`[Hawthorne] ✓ Loaded: ${targetImage}`);
          setDisplayedSrc(targetImage);
          setIsTransitioning(false);
        } else {
          if (isDev) console.warn(`[Hawthorne] ✗ Failed/timeout: ${targetImage}`);
          resolveWithFallback(targetImage, packageId, garageId);
        }
      });
    }, 150);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [targetImage, packageId, garageId, isDev, resolveWithFallback]);

  // Handle image load success (for non-cached loads)
  const handleImageLoad = useCallback(() => {
    imageCache.set(displayedSrc, 'loaded');
    setIsTransitioning(false);
  }, [displayedSrc]);

  // Handle image error (safety net)
  const handleImageError = useCallback(() => {
    if (isDev) console.error(`[Hawthorne] Image element error: ${displayedSrc}`);
    failedImages.add(displayedSrc);
    imageCache.set(displayedSrc, 'failed');
    // Use current garage from ref for accurate fallback
    resolveWithFallback(displayedSrc, packageId, currentGarageRef.current);
  }, [displayedSrc, packageId, resolveWithFallback, isDev]);

  return (
    <motion.div
      initial={{ opacity: 0.8, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full h-full flex flex-col"
    >
      {/* Full-bleed hero container */}
      <div className="relative flex-1 w-full bg-muted rounded-xl overflow-hidden shadow-lg">
        {/* Image fills the container */}
        <img
          src={displayedSrc}
          alt={`Hawthorne exterior with ${packageId || 'default'} package and ${garageId || 'standard'} garage`}
          className="absolute inset-0 w-full h-full object-cover object-center"
          decoding="async"
          loading="eager"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Subtle loading overlay - doesn't hide the image */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full"
            >
              <div className="w-3 h-3 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              <span className="text-[10px] text-muted-foreground">{EXTERIOR_COPY.preview.loading}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground shrink-0">
        <Eye className="h-3.5 w-3.5" />
        <span>{EXTERIOR_COPY.preview.label}</span>
      </div>
    </motion.div>
  );
}

// Photo-based preview for Aspen model with crossfade transitions
interface AspenPhotoPreviewProps {
  packageId: string | null;
}

function AspenPhotoPreview({ packageId }: AspenPhotoPreviewProps) {
  const [displayedSrc, setDisplayedSrc] = useState<string>(getAspenHeroImage());
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);
  const preloadCacheRef = useRef<Set<string>>(new Set());
  
  // Target image based on package selection
  const targetImage = useMemo(() => getAspenPackageImage(packageId), [packageId]);
  
  // Preload all Aspen package images once
  useEffect(() => {
    aspenPackages.forEach((pkg) => {
      if (!preloadCacheRef.current.has(pkg.previewImage)) {
        const img = new Image();
        img.onload = () => preloadCacheRef.current.add(pkg.previewImage);
        img.src = pkg.previewImage;
      }
    });
  }, []);
  
  // Handle package changes with crossfade
  useEffect(() => {
    if (targetImage === displayedSrc) return;
    
    // Check if already preloaded
    if (preloadCacheRef.current.has(targetImage)) {
      setDisplayedSrc(targetImage);
      return;
    }
    
    // Load new image with transition
    setIsLoading(true);
    const img = new Image();
    img.onload = () => {
      preloadCacheRef.current.add(targetImage);
      setDisplayedSrc(targetImage);
      setIsLoading(false);
    };
    img.onerror = () => {
      // Silent fallback to hero
      if (import.meta.env.DEV) {
        console.warn(`[Aspen] Failed to load: ${targetImage}`);
      }
      setDisplayedSrc(getAspenHeroImage());
      setIsLoading(false);
    };
    img.src = targetImage;
  }, [targetImage, displayedSrc]);
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  const handleImageError = useCallback(() => {
    if (import.meta.env.DEV) {
      console.warn(`[Aspen] Image element error: ${displayedSrc}`);
    }
    setDisplayedSrc(getAspenHeroImage());
  }, [displayedSrc]);

  return (
    <motion.div
      initial={{ opacity: 0.8, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full h-full flex flex-col"
    >
      <div className="relative flex-1 w-full bg-muted rounded-xl overflow-hidden shadow-lg">
        {/* Crossfade container */}
        <AnimatePresence mode="wait">
          <motion.img
            key={displayedSrc}
            src={displayedSrc}
            alt={`Aspen exterior with ${packageId || 'classic-navy'} package`}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </AnimatePresence>
        
        {/* Subtle loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground shrink-0">
        <Eye className="h-3.5 w-3.5" />
        <span>{EXTERIOR_COPY.preview.label}</span>
      </div>
    </motion.div>
  );
}

// Live exterior preview SVG - for non-Hawthorne models
interface ExteriorPreviewProps {
  package_?: ExteriorPackage;
  garageDoor?: GarageDoor;
}

function ExteriorPreview({ package_, garageDoor }: ExteriorPreviewProps) {
  const siding = package_?.sidingColor || 'hsl(0, 0%, 80%)';
  const trim = package_?.trimColor || 'hsl(0, 0%, 100%)';
  const roof = package_?.roofColor || 'hsl(0, 0%, 40%)';
  const garage = garageDoor?.color || 'hsl(0, 0%, 50%)';

  // Memoize the key to prevent unnecessary re-renders
  const previewKey = useMemo(() => 
    `${package_?.id || 'none'}-${garageDoor?.id || 'none'}`,
    [package_?.id, garageDoor?.id]
  );

  return (
    <motion.div
      key={previewKey}
      initial={{ opacity: 0.8, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full h-full flex flex-col items-center justify-center max-w-2xl mx-auto"
    >
      <div className="w-full rounded-xl overflow-hidden shadow-lg bg-gradient-to-b from-sky-100 to-white">
        <svg 
          viewBox="0 0 400 280" 
          className="w-full h-auto"
          role="img"
          aria-label="Home exterior preview showing selected colors"
        >
        {/* Sky/Background */}
        <rect x="0" y="0" width="400" height="280" fill="hsl(200, 30%, 95%)" />
        
        {/* Ground */}
        <rect x="0" y="230" width="400" height="50" fill="hsl(120, 20%, 65%)" />
        
        {/* Main House Body - smooth color transition */}
        <motion.rect 
          x="60" y="120" width="200" height="110" 
          initial={false}
          animate={{ fill: siding }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Garage Extension */}
        <motion.rect 
          x="260" y="140" width="80" height="90" 
          initial={false}
          animate={{ fill: siding }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Main Roof */}
        <motion.polygon 
          points="50,120 160,50 270,120" 
          initial={false}
          animate={{ fill: roof }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Garage Roof */}
        <motion.polygon 
          points="250,140 300,100 350,140" 
          initial={false}
          animate={{ fill: roof }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Trim - Main */}
        <motion.rect 
          x="58" y="118" width="204" height="4" 
          initial={false}
          animate={{ fill: trim }}
          transition={{ duration: 0.2 }}
        />
        <motion.rect 
          x="58" y="226" width="204" height="4" 
          initial={false}
          animate={{ fill: trim }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Trim - Garage */}
        <motion.rect 
          x="258" y="138" width="84" height="4" 
          initial={false}
          animate={{ fill: trim }}
          transition={{ duration: 0.2 }}
        />
        <motion.rect 
          x="258" y="226" width="84" height="4" 
          initial={false}
          animate={{ fill: trim }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Front Door */}
        <motion.rect 
          x="140" y="170" width="40" height="60" 
          initial={false}
          animate={{ fill: trim }}
          transition={{ duration: 0.2 }}
        />
        <rect x="145" y="175" width="30" height="50" fill="hsl(25, 40%, 35%)" />
        <circle cx="170" cy="200" r="3" fill="hsl(45, 80%, 50%)" />
        
        {/* Windows - Main */}
        <motion.rect 
          x="80" y="145" width="40" height="50" rx="2"
          initial={false}
          animate={{ fill: trim }}
          transition={{ duration: 0.2 }}
        />
        <rect x="84" y="149" width="32" height="42" fill="hsl(200, 30%, 80%)" />
        <motion.line 
          x1="100" y1="149" x2="100" y2="191" 
          strokeWidth="2"
          initial={false}
          animate={{ stroke: trim }}
          transition={{ duration: 0.2 }}
        />
        
        <motion.rect 
          x="200" y="145" width="40" height="50" rx="2"
          initial={false}
          animate={{ fill: trim }}
          transition={{ duration: 0.2 }}
        />
        <rect x="204" y="149" width="32" height="42" fill="hsl(200, 30%, 80%)" />
        <motion.line 
          x1="220" y1="149" x2="220" y2="191" 
          strokeWidth="2"
          initial={false}
          animate={{ stroke: trim }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Windows - Upper */}
        <motion.rect 
          x="125" y="75" width="30" height="35" rx="2"
          initial={false}
          animate={{ fill: trim }}
          transition={{ duration: 0.2 }}
        />
        <rect x="128" y="78" width="24" height="29" fill="hsl(200, 30%, 80%)" />
        <motion.line 
          x1="140" y1="78" x2="140" y2="107" 
          strokeWidth="2"
          initial={false}
          animate={{ stroke: trim }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Garage Door */}
        <motion.rect 
          x="275" y="165" width="50" height="65" rx="2"
          initial={false}
          animate={{ fill: garage }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Garage Door Details based on style */}
        {garageDoor?.style === 'carriage' && (
          <>
            <motion.rect 
              x="278" y="170" width="20" height="25" fill="none" strokeWidth="1" opacity="0.6"
              initial={false}
              animate={{ stroke: trim }}
              transition={{ duration: 0.2 }}
            />
            <motion.rect 
              x="302" y="170" width="20" height="25" fill="none" strokeWidth="1" opacity="0.6"
              initial={false}
              animate={{ stroke: trim }}
              transition={{ duration: 0.2 }}
            />
            <motion.line 
              x1="288" y1="205" x2="288" y2="225" strokeWidth="1" opacity="0.4"
              initial={false}
              animate={{ stroke: trim }}
              transition={{ duration: 0.2 }}
            />
            <motion.line 
              x1="312" y1="205" x2="312" y2="225" strokeWidth="1" opacity="0.4"
              initial={false}
              animate={{ stroke: trim }}
              transition={{ duration: 0.2 }}
            />
          </>
        )}
        {garageDoor?.style === 'modern' && (
          <>
            <rect x="278" y="168" width="44" height="20" fill="hsl(200, 30%, 85%)" opacity="0.5" />
            <line x1="275" y1="195" x2="325" y2="195" stroke="hsl(0,0%,60%)" strokeWidth="0.5" />
            <line x1="275" y1="210" x2="325" y2="210" stroke="hsl(0,0%,60%)" strokeWidth="0.5" />
          </>
        )}
        {garageDoor?.style === 'craftsman' && (
          <>
            <rect x="280" y="168" width="14" height="18" fill="hsl(200, 30%, 80%)" />
            <rect x="298" y="168" width="14" height="18" fill="hsl(200, 30%, 80%)" />
            <motion.line 
              x1="275" y1="192" x2="325" y2="192" strokeWidth="1" opacity="0.3"
              initial={false}
              animate={{ stroke: trim }}
              transition={{ duration: 0.2 }}
            />
            <motion.line 
              x1="275" y1="210" x2="325" y2="210" strokeWidth="1" opacity="0.3"
              initial={false}
              animate={{ stroke: trim }}
              transition={{ duration: 0.2 }}
            />
          </>
        )}
        {garageDoor?.style === 'traditional' && (
          <>
            <motion.line 
              x1="275" y1="185" x2="325" y2="185" strokeWidth="1" opacity="0.3"
              initial={false}
              animate={{ stroke: trim }}
              transition={{ duration: 0.2 }}
            />
            <motion.line 
              x1="275" y1="205" x2="325" y2="205" strokeWidth="1" opacity="0.3"
              initial={false}
              animate={{ stroke: trim }}
              transition={{ duration: 0.2 }}
            />
            <motion.rect 
              x="280" y="168" width="40" height="12" fill="none" strokeWidth="1" opacity="0.2"
              initial={false}
              animate={{ stroke: trim }}
              transition={{ duration: 0.2 }}
            />
          </>
        )}
        
        {/* Driveway */}
        <rect x="260" y="230" width="95" height="50" fill="hsl(0, 0%, 75%)" />
        
        {/* Walkway */}
        <rect x="152" y="230" width="16" height="50" fill="hsl(0, 0%, 75%)" />
        
        {/* Chimney */}
        <motion.rect 
          x="200" y="60" width="20" height="40"
          initial={false}
          animate={{ fill: siding }}
          transition={{ duration: 0.2 }}
        />
        <motion.rect 
          x="198" y="55" width="24" height="8"
          initial={false}
          animate={{ fill: roof }}
          transition={{ duration: 0.2 }}
        />
        </svg>
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground shrink-0">
        <Eye className="h-3.5 w-3.5" />
        <span>Live Preview</span>
      </div>
    </motion.div>
  );
}

// Package card for Hawthorne model
interface HawthornePackageCardProps {
  package_: HawthornePackage;
  isSelected: boolean;
  onSelect: () => void;
}

function HawthornePackageCard({ package_, isSelected, onSelect }: HawthornePackageCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isSelected 
          ? 'ring-2 ring-accent border-accent shadow-md' 
          : 'hover:border-accent/40 hover:shadow-sm'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${package_.name} exterior package`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Color swatches */}
        <div className="flex gap-1">
          <div 
            className="w-8 h-8 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: package_.primaryColor }}
            title="Primary"
          />
          <div 
            className="w-8 h-8 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: package_.secondaryColor }}
            title="Secondary"
          />
          <div 
            className="w-8 h-8 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: package_.accentColor }}
            title="Accent"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{package_.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {getPackageDescription(package_.id, package_.description)}
          </p>
        </div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0"
            >
              <Check className="h-4 w-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Package card for Aspen model
interface AspenPackageCardProps {
  package_: AspenPackage;
  isSelected: boolean;
  onSelect: () => void;
}

function AspenPackageCard({ package_, isSelected, onSelect }: AspenPackageCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isSelected 
          ? 'ring-2 ring-accent border-accent shadow-md' 
          : 'hover:border-accent/40 hover:shadow-sm'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${package_.name} exterior package`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Color swatches */}
        <div className="flex gap-1">
          <div 
            className="w-8 h-8 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: package_.primaryColor }}
            title="Primary"
          />
          <div 
            className="w-8 h-8 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: package_.secondaryColor }}
            title="Secondary"
          />
          <div 
            className="w-8 h-8 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: package_.accentColor }}
            title="Accent"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{package_.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {getPackageDescription(package_.id, package_.description)}
          </p>
        </div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0"
            >
              <Check className="h-4 w-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Photo-based preview for Belmont model with crossfade transitions
interface BelmontPhotoPreviewProps {
  packageId: string | null;
}

function BelmontPhotoPreview({ packageId }: BelmontPhotoPreviewProps) {
  const [displayedSrc, setDisplayedSrc] = useState<string>(getBelmontHeroImage());
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);
  const preloadCacheRef = useRef<Set<string>>(new Set());
  
  // Target image based on package selection
  const targetImage = useMemo(() => getBelmontPackageImage(packageId), [packageId]);
  
  // Preload all Belmont package images once
  useEffect(() => {
    belmontPackages.forEach((pkg) => {
      if (!preloadCacheRef.current.has(pkg.previewImage)) {
        const img = new Image();
        img.onload = () => preloadCacheRef.current.add(pkg.previewImage);
        img.src = pkg.previewImage;
      }
    });
  }, []);
  
  // Handle package changes with crossfade
  useEffect(() => {
    if (targetImage === displayedSrc) return;
    
    // Check if already preloaded
    if (preloadCacheRef.current.has(targetImage)) {
      setDisplayedSrc(targetImage);
      return;
    }
    
    // Load new image with transition
    setIsLoading(true);
    const img = new Image();
    img.onload = () => {
      preloadCacheRef.current.add(targetImage);
      setDisplayedSrc(targetImage);
      setIsLoading(false);
    };
    img.onerror = () => {
      // Silent fallback to hero
      if (import.meta.env.DEV) {
        console.warn(`[Belmont] Failed to load: ${targetImage}`);
      }
      setDisplayedSrc(getBelmontHeroImage());
      setIsLoading(false);
    };
    img.src = targetImage;
  }, [targetImage, displayedSrc]);
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  const handleImageError = useCallback(() => {
    if (import.meta.env.DEV) {
      console.warn(`[Belmont] Image element error: ${displayedSrc}`);
    }
    setDisplayedSrc(getBelmontHeroImage());
  }, [displayedSrc]);

  return (
    <motion.div
      initial={{ opacity: 0.8, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full h-full flex flex-col"
    >
      <div className="relative flex-1 w-full bg-muted rounded-xl overflow-hidden shadow-lg">
        {/* Crossfade container */}
        <AnimatePresence mode="wait">
          <motion.img
            key={displayedSrc}
            src={displayedSrc}
            alt={`Belmont exterior with ${packageId || 'modern-charcoal'} package`}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </AnimatePresence>
        
        {/* Subtle loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground shrink-0">
        <Eye className="h-3.5 w-3.5" />
        <span>{EXTERIOR_COPY.preview.label}</span>
      </div>
    </motion.div>
  );
}

// Package card for Belmont model
interface BelmontPackageCardProps {
  package_: BelmontPackage;
  isSelected: boolean;
  onSelect: () => void;
}

function BelmontPackageCard({ package_, isSelected, onSelect }: BelmontPackageCardProps) {
  // Use data-driven swatches with fallback
  const swatches = package_.swatches || FALLBACK_SWATCHES;
  const swatchLabels = ['Primary color', 'Secondary color', 'Accent color'];
  
  // Check if a color is light (for border contrast adjustment)
  const isLightColor = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.75;
  };
  
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isSelected 
          ? 'ring-2 ring-accent border-accent shadow-md' 
          : 'hover:border-accent/40 hover:shadow-sm'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${package_.name} exterior package`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Color swatches from package data */}
        <div className="flex gap-1">
          {swatches.map((color, index) => (
            <div 
              key={index}
              className="w-8 h-8 rounded-md shadow-sm"
              style={{ 
                backgroundColor: color,
                border: isLightColor(color) 
                  ? '1px solid rgba(0,0,0,0.15)' 
                  : '1px solid rgba(0,0,0,0.10)'
              }}
              aria-label={swatchLabels[index]}
              title={swatchLabels[index]}
            />
          ))}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{package_.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {getPackageDescription(package_.id, package_.description)}
          </p>
        </div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0"
            >
              <Check className="h-4 w-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Photo-based preview for Keeneland model with theme + garage variant support
interface KeenelandPhotoPreviewProps {
  packageId: string | null;
  garageId: string | null;
}

function KeenelandPhotoPreview({ packageId, garageId }: KeenelandPhotoPreviewProps) {
  const [displayedSrc, setDisplayedSrc] = useState<string>(getKeenelandHeroImage());
  const [isLoading, setIsLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const preloadCacheRef = useRef<Set<string>>(new Set());
  
  // Target image based on package + garage selection
  const targetImage = useMemo(() => getKeenelandExteriorImage(packageId, garageId), [packageId, garageId]);
  
  // Check if current combo has exact match
  const hasExactMatch = useMemo(() => {
    if (!packageId || !garageId) return true;
    return hasKeenelandVariant(packageId, garageId);
  }, [packageId, garageId]);
  
  // Preload all Keeneland render images once
  useEffect(() => {
    getAllKeenelandRenderImages().forEach((src) => {
      if (!preloadCacheRef.current.has(src)) {
        const img = new Image();
        img.onload = () => preloadCacheRef.current.add(src);
        img.src = src;
      }
    });
  }, []);
  
  // Handle package/garage changes with crossfade
  useEffect(() => {
    if (targetImage === displayedSrc) {
      setShowComingSoon(!hasExactMatch && !!packageId && !!garageId);
      return;
    }
    
    // Check if already preloaded
    if (preloadCacheRef.current.has(targetImage)) {
      setDisplayedSrc(targetImage);
      setShowComingSoon(!hasExactMatch && packageId && garageId ? true : false);
      return;
    }
    
    // Load new image with transition
    setIsLoading(true);
    const img = new Image();
    img.onload = () => {
      preloadCacheRef.current.add(targetImage);
      setDisplayedSrc(targetImage);
      setIsLoading(false);
      setShowComingSoon(!hasExactMatch && packageId && garageId ? true : false);
    };
    img.onerror = () => {
      // Silent fallback to hero
      if (import.meta.env.DEV) {
        console.warn(`[Keeneland] Failed to load: ${targetImage}`);
      }
      setDisplayedSrc(getKeenelandHeroImage());
      setIsLoading(false);
      setShowComingSoon(true);
    };
    img.src = targetImage;
  }, [targetImage, displayedSrc, hasExactMatch, packageId, garageId]);
  
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  const handleImageError = useCallback(() => {
    if (import.meta.env.DEV) {
      console.warn(`[Keeneland] Image element error: ${displayedSrc}`);
    }
    setDisplayedSrc(getKeenelandHeroImage());
  }, [displayedSrc]);

  return (
    <motion.div
      initial={{ opacity: 0.8, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full h-full flex flex-col"
    >
      <div className="relative flex-1 w-full bg-muted rounded-xl overflow-hidden shadow-lg">
        {/* Crossfade container */}
        <AnimatePresence mode="wait">
          <motion.img
            key={displayedSrc}
            src={displayedSrc}
            alt={`Keeneland exterior with ${packageId || 'modern-charcoal'} package and ${garageId || 'standard'} garage`}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </AnimatePresence>
        
        {/* Subtle loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {/* Coming soon note for missing combos */}
        <AnimatePresence>
          {showComingSoon && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur-sm rounded-md px-3 py-2 flex items-center gap-2"
            >
              <Info className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                {EXTERIOR_COPY.preview.unavailable}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground shrink-0">
        <Eye className="h-3.5 w-3.5" />
        <span>{EXTERIOR_COPY.preview.label}</span>
      </div>
    </motion.div>
  );
}

// Package card for Keeneland model
interface KeenelandPackageCardProps {
  package_: KeenelandPackage;
  isSelected: boolean;
  onSelect: () => void;
}

function KeenelandPackageCard({ package_, isSelected, onSelect }: KeenelandPackageCardProps) {
  const swatches = package_.swatches;
  const swatchLabels = ['Siding color', 'Stone/accent color', 'Trim color'];
  
  // Check if a color is light (for border contrast adjustment)
  const isLightColor = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.75;
  };
  
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isSelected 
          ? 'ring-2 ring-accent border-accent shadow-md' 
          : 'hover:border-accent/40 hover:shadow-sm'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${package_.name} exterior package`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Color swatches from package data */}
        <div className="flex gap-1">
          {swatches.map((color, index) => (
            <div 
              key={index}
              className="w-8 h-8 rounded-md shadow-sm"
              style={{ 
                backgroundColor: color,
                border: isLightColor(color) 
                  ? '1px solid rgba(0,0,0,0.15)' 
                  : '1px solid rgba(0,0,0,0.10)'
              }}
              aria-label={swatchLabels[index]}
              title={swatchLabels[index]}
            />
          ))}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{package_.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {getPackageDescription(package_.id, package_.description)}
          </p>
        </div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0"
            >
              <Check className="h-4 w-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Garage door card for Keeneland model with availability support
interface KeenelandGarageCardProps {
  door: KeenelandGarage;
  isSelected: boolean;
  isAvailable: boolean;
  onSelect: () => void;
}

function KeenelandGarageCard({ door, isSelected, isAvailable, onSelect }: KeenelandGarageCardProps) {
  const handleClick = () => {
    // Always allow selection, even if no exact render exists
    onSelect();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isSelected
          ? 'ring-2 ring-accent border-accent shadow-md' 
          : 'hover:border-accent/40 hover:shadow-sm'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-label={`Select ${door.name} garage door`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Door preview with swatches */}
        <div className="flex gap-1">
          {door.swatches ? (
            door.swatches.map((color, index) => (
              <div 
                key={index}
                className="w-6 h-10 rounded-md border border-border shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))
          ) : (
            <div 
              className="w-12 h-10 rounded-md border border-border flex items-center justify-center shadow-sm bg-muted"
            >
              <DoorOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground text-sm">{door.name}</p>
            {!isAvailable && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                Preview N/A
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {getGarageDescription(door.id, door.description)}
          </p>
        </div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0"
            >
              <Check className="h-4 w-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
interface HawthorneGarageCardProps {
  door: HawthorneGarage;
  isSelected: boolean;
  isAvailable: boolean;
  onSelect: () => void;
}

function HawthorneGarageCard({ door, isSelected, isAvailable, onSelect }: HawthorneGarageCardProps) {
  const handleClick = () => {
    if (isAvailable) {
      onSelect();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isAvailable) {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
        isSelected && isAvailable
          ? 'ring-2 ring-accent border-accent shadow-md' 
          : isAvailable 
            ? 'hover:border-accent/40 hover:shadow-sm'
            : 'bg-muted/50'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-disabled={!isAvailable}
      aria-label={`Select ${door.name} garage door${!isAvailable ? ' (not available for this package)' : ''}`}
      title={!isAvailable ? 'Not available for this package' : undefined}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Door preview */}
        <div 
          className={cn(
            'w-12 h-10 rounded-md border border-border flex items-center justify-center shadow-sm',
            !isAvailable && 'opacity-50'
          )}
          style={{ backgroundColor: door.color }}
        >
          <DoorOpen className="h-5 w-5 text-white/60" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              'font-medium text-sm',
              isAvailable ? 'text-foreground' : 'text-muted-foreground'
            )}>{door.name}</p>
            {door.isUpgrade && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                Upgrade
              </Badge>
            )}
            {!isAvailable && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                N/A
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {isAvailable ? getGarageDescription(door.id, door.description) : 'Not available for selected package'}
          </p>
        </div>
        
        <AnimatePresence>
          {isSelected && isAvailable && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0"
            >
              <Check className="h-4 w-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Original package card for non-Hawthorne models
interface PackageCardProps {
  package_: ExteriorPackage;
  isSelected: boolean;
  onSelect: () => void;
}

function PackageCard({ package_, isSelected, onSelect }: PackageCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isSelected 
          ? 'ring-2 ring-accent border-accent shadow-md' 
          : 'hover:border-accent/40 hover:shadow-sm'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${package_.name} exterior package`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Color swatches */}
        <div className="flex gap-1">
          <div 
            className="w-8 h-8 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: package_.sidingColor }}
            title="Siding"
          />
          <div 
            className="w-8 h-8 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: package_.trimColor }}
            title="Trim"
          />
          <div 
            className="w-8 h-8 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: package_.roofColor }}
            title="Roof"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{package_.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {getPackageDescription(package_.id, package_.description)}
          </p>
        </div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0"
            >
              <Check className="h-4 w-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Original garage door card for non-Hawthorne models
interface GarageDoorCardProps {
  door: GarageDoor;
  isSelected: boolean;
  onSelect: () => void;
}

function GarageDoorCard({ door, isSelected, onSelect }: GarageDoorCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isSelected 
          ? 'ring-2 ring-accent border-accent shadow-md' 
          : 'hover:border-accent/40 hover:shadow-sm'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${door.name} garage door`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Door preview */}
        <div 
          className="w-12 h-10 rounded-md border border-border flex items-center justify-center shadow-sm"
          style={{ backgroundColor: door.color }}
        >
          <DoorOpen className="h-5 w-5 text-white/60" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{door.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {getGarageDescription(door.id, door.description)}
          </p>
        </div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0"
            >
              <Check className="h-4 w-4 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
