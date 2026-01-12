// Step 3: Design Your Exterior - package and garage door selection with live preview
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Palette, DoorOpen, Check, Eye } from 'lucide-react';
import { exteriorPackages, garageDoors, ExteriorPackage, GarageDoor } from '@/data/packages';
import { cn } from '@/lib/utils';

interface Step3DesignProps {
  selectedPackageId: string | null;
  selectedGarageDoorId: string | null;
  onSelectPackage: (id: string) => void;
  onSelectGarageDoor: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  isMobile: boolean;
}

export function Step3Design({
  selectedPackageId,
  selectedGarageDoorId,
  onSelectPackage,
  onSelectGarageDoor,
  onNext,
  onBack,
  isMobile,
}: Step3DesignProps) {
  const selectedPackage = exteriorPackages.find(p => p.id === selectedPackageId);
  const selectedDoor = garageDoors.find(d => d.id === selectedGarageDoorId);
  const canProceed = selectedPackageId && selectedGarageDoorId;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Design Your Exterior</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your exterior package and garage door style
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
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
          'bg-muted flex items-center justify-center p-8',
          isMobile ? 'h-64' : 'flex-1'
        )}>
          <ExteriorPreview 
            package_={selectedPackage} 
            garageDoor={selectedDoor}
          />
        </div>

        {/* Selection Panel */}
        <div className={cn(
          'bg-background border-l border-border overflow-auto',
          isMobile ? 'flex-1' : 'w-96'
        )}>
          <Tabs defaultValue="package" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="package" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Package
              </TabsTrigger>
              <TabsTrigger value="garage" className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                Garage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="package" className="flex-1 overflow-auto p-4 mt-0">
              <div className="grid gap-3">
                {exteriorPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    package_={pkg}
                    isSelected={pkg.id === selectedPackageId}
                    onSelect={() => onSelectPackage(pkg.id)}
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
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4 border-t border-border bg-card"
      >
        {canProceed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedPackage && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: selectedPackage.sidingColor }}
                  />
                  <span className="text-sm text-foreground">{selectedPackage.name}</span>
                </div>
              )}
              {selectedDoor && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: selectedDoor.color }}
                  />
                  <span className="text-sm text-foreground">{selectedDoor.name}</span>
                </div>
              )}
            </div>
            <Button onClick={onNext} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Review Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-muted-foreground text-sm">
              Select {!selectedPackageId && 'an exterior package'}
              {!selectedPackageId && !selectedGarageDoorId && ' and '}
              {!selectedGarageDoorId && 'a garage door'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Live exterior preview SVG
interface ExteriorPreviewProps {
  package_?: ExteriorPackage;
  garageDoor?: GarageDoor;
}

function ExteriorPreview({ package_, garageDoor }: ExteriorPreviewProps) {
  const siding = package_?.sidingColor || 'hsl(0, 0%, 80%)';
  const trim = package_?.trimColor || 'hsl(0, 0%, 100%)';
  const roof = package_?.roofColor || 'hsl(0, 0%, 40%)';
  const garage = garageDoor?.color || 'hsl(0, 0%, 50%)';

  return (
    <motion.div
      key={`${package_?.id}-${garageDoor?.id}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <svg viewBox="0 0 400 280" className="w-full h-auto drop-shadow-xl">
        {/* Sky/Background */}
        <rect x="0" y="0" width="400" height="280" fill="hsl(200, 30%, 95%)" />
        
        {/* Ground */}
        <rect x="0" y="230" width="400" height="50" fill="hsl(120, 20%, 65%)" />
        
        {/* Main House Body */}
        <rect x="60" y="120" width="200" height="110" fill={siding} />
        
        {/* Garage Extension */}
        <rect x="260" y="140" width="80" height="90" fill={siding} />
        
        {/* Main Roof */}
        <polygon points="50,120 160,50 270,120" fill={roof} />
        
        {/* Garage Roof */}
        <polygon points="250,140 300,100 350,140" fill={roof} />
        
        {/* Trim - Main */}
        <rect x="58" y="118" width="204" height="4" fill={trim} />
        <rect x="58" y="226" width="204" height="4" fill={trim} />
        
        {/* Trim - Garage */}
        <rect x="258" y="138" width="84" height="4" fill={trim} />
        <rect x="258" y="226" width="84" height="4" fill={trim} />
        
        {/* Front Door */}
        <rect x="140" y="170" width="40" height="60" fill={trim} />
        <rect x="145" y="175" width="30" height="50" fill="hsl(25, 40%, 35%)" />
        <circle cx="170" cy="200" r="3" fill="hsl(45, 80%, 50%)" />
        
        {/* Windows - Main */}
        <rect x="80" y="145" width="40" height="50" fill={trim} rx="2" />
        <rect x="84" y="149" width="32" height="42" fill="hsl(200, 30%, 80%)" />
        <line x1="100" y1="149" x2="100" y2="191" stroke={trim} strokeWidth="2" />
        
        <rect x="200" y="145" width="40" height="50" fill={trim} rx="2" />
        <rect x="204" y="149" width="32" height="42" fill="hsl(200, 30%, 80%)" />
        <line x1="220" y1="149" x2="220" y2="191" stroke={trim} strokeWidth="2" />
        
        {/* Windows - Upper */}
        <rect x="125" y="75" width="30" height="35" fill={trim} rx="2" />
        <rect x="128" y="78" width="24" height="29" fill="hsl(200, 30%, 80%)" />
        <line x1="140" y1="78" x2="140" y2="107" stroke={trim} strokeWidth="2" />
        
        {/* Garage Door */}
        <rect x="275" y="165" width="50" height="65" fill={garage} rx="2" />
        
        {/* Garage Door Details based on style */}
        {garageDoor?.style === 'carriage' && (
          <>
            <rect x="278" y="170" width="20" height="25" fill="none" stroke={trim} strokeWidth="1" opacity="0.6" />
            <rect x="302" y="170" width="20" height="25" fill="none" stroke={trim} strokeWidth="1" opacity="0.6" />
            <line x1="288" y1="205" x2="288" y2="225" stroke={trim} strokeWidth="1" opacity="0.4" />
            <line x1="312" y1="205" x2="312" y2="225" stroke={trim} strokeWidth="1" opacity="0.4" />
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
            <line x1="275" y1="192" x2="325" y2="192" stroke={trim} strokeWidth="1" opacity="0.3" />
            <line x1="275" y1="210" x2="325" y2="210" stroke={trim} strokeWidth="1" opacity="0.3" />
          </>
        )}
        {garageDoor?.style === 'traditional' && (
          <>
            <line x1="275" y1="185" x2="325" y2="185" stroke={trim} strokeWidth="1" opacity="0.3" />
            <line x1="275" y1="205" x2="325" y2="205" stroke={trim} strokeWidth="1" opacity="0.3" />
            <rect x="280" y="168" width="40" height="12" fill="none" stroke={trim} strokeWidth="1" opacity="0.2" />
          </>
        )}
        
        {/* Driveway */}
        <rect x="260" y="230" width="95" height="50" fill="hsl(0, 0%, 75%)" />
        
        {/* Walkway */}
        <rect x="152" y="230" width="16" height="50" fill="hsl(0, 0%, 75%)" />
        
        {/* Chimney */}
        <rect x="200" y="60" width="20" height="40" fill={siding} />
        <rect x="198" y="55" width="24" height="8" fill={roof} />
      </svg>
      
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
        <Eye className="h-3 w-3" />
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
        isSelected 
          ? 'ring-2 ring-accent border-accent' 
          : 'hover:border-accent/50'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Color swatches */}
        <div className="flex gap-1">
          <div 
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: package_.sidingColor }}
            title="Siding"
          />
          <div 
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: package_.trimColor }}
            title="Trim"
          />
          <div 
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: package_.roofColor }}
            title="Roof"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{package_.name}</p>
          <p className="text-xs text-muted-foreground truncate">{package_.description}</p>
        </div>
        
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <Check className="h-4 w-4 text-accent-foreground" />
          </div>
        )}
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
        isSelected 
          ? 'ring-2 ring-accent border-accent' 
          : 'hover:border-accent/50'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Door preview */}
        <div 
          className="w-12 h-10 rounded border border-border flex items-center justify-center"
          style={{ backgroundColor: door.color }}
        >
          <DoorOpen className="h-5 w-5 text-white/60" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{door.name}</p>
          <p className="text-xs text-muted-foreground truncate">{door.description}</p>
        </div>
        
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <Check className="h-4 w-4 text-accent-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
