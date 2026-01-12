// Step 3: Design Your Exterior - package and garage door selection with live preview
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Palette, DoorOpen, Check, Eye } from 'lucide-react';
import { exteriorPackages, garageDoors, ExteriorPackage, GarageDoor } from '@/data/packages';
import { FinancingSidebarModule, FinancingModal } from '@/components/financing/FinancingModal';
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
  const selectedPackage = exteriorPackages.find(p => p.id === selectedPackageId);
  const selectedDoor = garageDoors.find(d => d.id === selectedGarageDoorId);
  const canProceed = selectedPackageId && selectedGarageDoorId;

  const [activeTab, setActiveTab] = useState<string>('package');
  const [showFinancingModal, setShowFinancingModal] = useState(false);

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
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card flex items-center justify-between shrink-0">
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
          <ExteriorPreview 
            package_={selectedPackage} 
            garageDoor={selectedDoor}
          />
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
                {exteriorPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    package_={pkg}
                    isSelected={pkg.id === selectedPackageId}
                    onSelect={() => handleSelectPackage(pkg.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="garage" className="flex-1 overflow-auto p-4 mt-0">
              <div className="grid gap-3">
                {garageDoors.map((door) => (
                  <GarageDoorCard
                    key={door.id}
                    door={door}
                    isSelected={door.id === selectedGarageDoorId}
                    onSelect={() => onSelectGarageDoor(door.id)}
                  />
                ))}
              </div>
            </TabsContent>
            
            {/* Financing Module - in sidebar on desktop */}
            {!isMobile && (
              <div className="p-4 pt-0">
                <FinancingSidebarModule onOpenModal={() => setShowFinancingModal(true)} />
              </div>
            )}
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
                      style={{ backgroundColor: selectedPackage.sidingColor }}
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
        modelSlug={modelSlug}
        packageId={selectedPackageId}
        garageDoorId={selectedGarageDoorId}
      />
    </div>
  );
}

// Live exterior preview SVG - now with smoother transitions
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
