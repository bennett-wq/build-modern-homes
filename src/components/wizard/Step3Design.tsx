// Step 3: Design Your Exterior - package and garage door selection with live preview
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Palette, DoorOpen, Check, Eye, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';
import { exteriorPackages, garageDoors, ExteriorPackage, GarageDoor } from '@/data/packages';
import { getDevelopmentBySlug } from '@/data/developments';
import { 
  hawthornePackages, 
  hawthorneGarages, 
  getHawthorneExteriorImage, 
  getHawthorneFallbackImage, 
  getHawthorneHeroImage,
  getHawthorneHeroWithGarage,
  isPhotoBasedModel,
  normalizeModelSlug,
  HawthornePackage,
  HawthorneGarage 
} from '@/data/hawthorne-exteriors';
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
  
  // Get the appropriate packages/garages based on model
  const allPackages = usePhotoPreview ? hawthornePackages : exteriorPackages;
  const garages = usePhotoPreview ? hawthorneGarages : garageDoors;
  
  // Filter packages if development has ARB restrictions
  const packages = isArbCommunity 
    ? allPackages.filter(p => arbReadyPackages.includes(p.id))
    : allPackages;
  
  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const selectedDoor = garages.find(d => d.id === selectedGarageDoorId);
  const canProceed = selectedPackageId && selectedGarageDoorId;

  const [activeTab, setActiveTab] = useState<string>('package');
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [showAppraisalDrawer, setShowAppraisalDrawer] = useState(false);

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
            Design Your Exterior
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isArbCommunity ? 'ARB-ready packages curated for community standards' : 'Choose your package and garage door style'}
          </p>
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
        'flex-1 overflow-hidden',
        isMobile ? 'flex flex-col' : 'flex'
      )}>
        {/* Live Preview */}
        <div className={cn(
          'bg-gradient-to-b from-muted to-muted/50 flex items-center justify-center p-6 sm:p-8',
          isMobile ? 'h-56 shrink-0' : 'flex-1'
        )}>
          {usePhotoPreview ? (
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

        {/* Selection Panel */}
        <div className={cn(
          'bg-background border-l border-border overflow-hidden flex flex-col',
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
                <span>Package</span>
                {selectedPackageId && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="garage" 
                className="flex items-center gap-2 data-[state=active]:shadow-sm"
              >
                <DoorOpen className="h-4 w-4" />
                <span>Garage</span>
                {selectedGarageDoorId && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="package" className="flex-1 overflow-auto p-4 mt-0">
              <div className="grid gap-3">
                {usePhotoPreview ? (
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
            </TabsContent>

            <TabsContent value="garage" className="flex-1 overflow-auto p-4 mt-0">
              <div className="grid gap-3">
                {usePhotoPreview ? (
                  hawthorneGarages.map((door) => (
                    <HawthorneGarageCard
                      key={door.id}
                      door={door}
                      isSelected={door.id === selectedGarageDoorId}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-4 border-t border-border bg-card shrink-0">
        <AnimatePresence mode="wait">
          {canProceed ? (
            <motion.div
              key="proceed"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                {selectedPackage && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                    <div 
                      className="w-4 h-4 rounded-sm border border-border shadow-sm"
                      style={{ backgroundColor: 'primaryColor' in selectedPackage ? selectedPackage.primaryColor : selectedPackage.sidingColor }}
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
                      style={{ backgroundColor: selectedDoor.color }}
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
              <Button 
                onClick={onNext} 
                className="shrink-0"
              >
                Review Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="incomplete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-2"
            >
              <p className="text-muted-foreground text-sm">
                Select {!selectedPackageId && 'an exterior package'}
                {!selectedPackageId && !selectedGarageDoorId && ' and '}
                {!selectedGarageDoorId && 'a garage door'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
  
  // Compute target image based on selections
  const targetImage = useMemo(() => {
    if (!packageId) return getHawthorneHeroImage();
    if (!garageId) return getHawthorneFallbackImage(packageId);
    return getHawthorneExteriorImage(packageId, garageId);
  }, [packageId, garageId]);

  // Get all package IDs for preloading adjacent
  const packageIds = useMemo(() => hawthornePackages.map(p => p.id), []);
  
  // Preload strategy: current package both garages + adjacent packages + hero variants
  useEffect(() => {
    const toPreload: string[] = [];
    
    // Always preload hero variants
    toPreload.push(getHawthorneHeroImage());
    toPreload.push(getHawthorneHeroWithGarage('standard'));
    toPreload.push(getHawthorneHeroWithGarage('black-industrial'));
    
    if (packageId) {
      // Both garage variants for current package
      toPreload.push(getHawthorneExteriorImage(packageId, 'standard'));
      toPreload.push(getHawthorneExteriorImage(packageId, 'black-industrial'));
      
      // Adjacent packages (prev/next) with current garage
      const currentIdx = packageIds.indexOf(packageId);
      if (currentIdx > 0) {
        const prevPkg = packageIds[currentIdx - 1];
        toPreload.push(getHawthorneExteriorImage(prevPkg, garageId || 'standard'));
      }
      if (currentIdx < packageIds.length - 1) {
        const nextPkg = packageIds[currentIdx + 1];
        toPreload.push(getHawthorneExteriorImage(nextPkg, garageId || 'standard'));
      }
    }
    
    // Preload all without blocking
    toPreload.forEach(src => {
      if (!imageCache.has(src)) {
        preloadImage(src);
      }
    });
  }, [packageId, garageId, packageIds]);

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
      className="w-full max-w-lg relative"
    >
      {/* Fixed aspect ratio container - prevents layout jumps */}
      <div className="relative w-full aspect-[16/10] bg-muted rounded-lg overflow-hidden shadow-lg">
        {/* Always show the current image (stale-while-revalidate) */}
        <img
          src={displayedSrc}
          alt={`Hawthorne exterior with ${packageId || 'default'} package and ${garageId || 'standard'} garage`}
          className="w-full h-full object-contain"
          width={640}
          height={400}
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
              <span className="text-[10px] text-muted-foreground">Loading...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        <span>Photo Preview</span>
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
      className="w-full max-w-md"
    >
      <svg 
        viewBox="0 0 400 280" 
        className="w-full h-auto filter drop-shadow-lg"
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
      
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
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
          <p className="text-xs text-muted-foreground truncate">{package_.description}</p>
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

// Garage door card for Hawthorne model
interface HawthorneGarageCardProps {
  door: HawthorneGarage;
  isSelected: boolean;
  onSelect: () => void;
}

function HawthorneGarageCard({ door, isSelected, onSelect }: HawthorneGarageCardProps) {
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
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground text-sm">{door.name}</p>
            {door.isUpgrade && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                Upgrade
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{door.description}</p>
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
          <p className="text-xs text-muted-foreground truncate">{package_.description}</p>
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
          <p className="text-xs text-muted-foreground truncate">{door.description}</p>
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
