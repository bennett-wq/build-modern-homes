// Step 3: Design Your Exterior - package and garage door selection with live preview
import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Palette, DoorOpen, Check, Eye, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';
import { exteriorPackages, garageDoors, ExteriorPackage, GarageDoor } from '@/data/packages';
import { 
  hawthornePackages, 
  hawthorneGarages, 
  getHawthorneExteriorImage, 
  getHawthorneFallbackImage, 
  getHawthorneHeroImage,
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
  
  // Get the appropriate packages/garages based on model
  const packages = usePhotoPreview ? hawthornePackages : exteriorPackages;
  const garages = usePhotoPreview ? hawthorneGarages : garageDoors;
  
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
              Choose your package and garage door style
            </p>
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

// Photo-based preview for Hawthorne model
interface HawthornePhotoPreviewProps {
  packageId: string | null;
  garageId: string | null;
}

function HawthornePhotoPreview({ packageId, garageId }: HawthornePhotoPreviewProps) {
  const [imageSrc, setImageSrc] = useState<string>(getHawthorneHeroImage());
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackLevel, setFallbackLevel] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);
  const isDev = import.meta.env.DEV;

  // Compute target image based on selections
  const targetImage = useMemo(() => {
    if (!packageId) return getHawthorneHeroImage();
    if (!garageId) return getHawthorneFallbackImage(packageId);
    return getHawthorneExteriorImage(packageId, garageId);
  }, [packageId, garageId]);

  // Preload next likely images
  useEffect(() => {
    if (packageId) {
      // Preload both garage variants for the selected package
      const preloadImages = [
        getHawthorneExteriorImage(packageId, 'standard'),
        getHawthorneExteriorImage(packageId, 'black-industrial'),
      ];
      preloadImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [packageId]);

  // Update image when target changes
  useEffect(() => {
    if (targetImage !== imageSrc) {
      setIsLoading(true);
      setFallbackLevel(0);
      setUsedFallback(false);
      setImageSrc(targetImage);
    }
  }, [targetImage]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    const currentSrc = imageSrc;
    
    // Log failed image path for debugging
    console.warn(`[Hawthorne Preview] Image failed to load: ${currentSrc}`);
    
    // Fallback chain: exact combo → package+standard → hero
    if (fallbackLevel === 0 && packageId) {
      const fallback1 = getHawthorneFallbackImage(packageId);
      console.log(`[Hawthorne Preview] Trying fallback 1: ${fallback1}`);
      setFallbackLevel(1);
      setImageSrc(fallback1);
    } else if (fallbackLevel === 1) {
      const heroFallback = getHawthorneHeroImage();
      console.log(`[Hawthorne Preview] Trying hero fallback: ${heroFallback}`);
      setFallbackLevel(2);
      setUsedFallback(true);
      setImageSrc(heroFallback);
    } else {
      // Final fallback loaded or failed
      console.error(`[Hawthorne Preview] All fallbacks failed`);
      setIsLoading(false);
    }
  }, [fallbackLevel, packageId, imageSrc]);

  const previewKey = `${packageId || 'none'}-${garageId || 'none'}`;

  return (
    <motion.div
      key={previewKey}
      initial={{ opacity: 0.8, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full max-w-lg relative"
    >
      {/* Fixed aspect ratio container - prevents layout jumps */}
      <div className="relative w-full aspect-[16/10] bg-muted rounded-lg overflow-hidden shadow-lg">
        {/* Skeleton loader */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actual image */}
        <motion.img
          src={imageSrc}
          alt={`Hawthorne exterior with ${packageId || 'default'} package and ${garageId || 'standard'} garage`}
          className={cn(
            "w-full h-full object-contain",
            isLoading && "opacity-0"
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Dev-only fallback indicator */}
        {isDev && usedFallback && !isLoading && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-amber-500/90 text-white text-[10px] font-mono rounded">
            Fallback: hero.webp
          </div>
        )}
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
