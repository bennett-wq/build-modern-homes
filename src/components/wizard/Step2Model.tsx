// Step 2: Pick a Model - grid of model cards with premium polish
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BedDouble, Bath, Maximize, FileText, Check, ShieldCheck, Home as HomeIcon } from 'lucide-react';
import { homeModels, HomeModel } from '@/data/models';
import { getDevelopmentBySlug } from '@/data/developments';
import { normalizeModelSlug } from '@/data/hawthorne-exteriors';
import { FinancingSidebarModule, FinancingModal } from '@/components/financing/FinancingModal';
import { AppraisalInfoLink, AppraisalSidebarModule } from '@/components/appraisal/AppraisalBadge';
import { WizardStickyFooter, WizardFooterSpacer } from '@/components/wizard/WizardStickyFooter';
import { getModelHeroImage, HERO_PLACEHOLDER } from '@/lib/model-images';
import { cn } from '@/lib/utils';

interface Step2ModelProps {
  selectedModelSlug: string | null;
  onSelectModel: (slug: string) => void;
  onNext: () => void;
  onBack: () => void;
  isMobile: boolean;
  // For financing modal
  developmentSlug?: string;
  lotId?: number | null;
}

export function Step2Model({
  selectedModelSlug,
  onSelectModel,
  onNext,
  onBack,
  isMobile,
  developmentSlug,
  lotId,
}: Step2ModelProps) {
  // Get development to check for conforming model restrictions
  const development = developmentSlug ? getDevelopmentBySlug(developmentSlug) : null;
  const conformingModels = development?.conformingModels;
  
  // Filter models if development has conforming restrictions
  const displayModels = useMemo(() => {
    if (conformingModels && conformingModels.length > 0) {
      return homeModels.filter(m => conformingModels.includes(m.slug));
    }
    return homeModels;
  }, [conformingModels]);
  
  // Normalize the selected slug for comparison
  const normalizedSelectedSlug = normalizeModelSlug(selectedModelSlug);
  const selectedModel = homeModels.find(m => m.slug === normalizedSelectedSlug);
  const [showFinancingModal, setShowFinancingModal] = useState(false);

  const handleSelect = useCallback((slug: string) => {
    onSelectModel(slug);
  }, [onSelectModel]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Pick Your Model
          </h2>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-muted-foreground">
              {conformingModels ? 'Showing conforming plans approved for this development' : 'Choose from our CrossMod® home collection'}
            </p>
            <span className="text-muted-foreground/30">•</span>
            <AppraisalInfoLink />
          </div>
        </div>
      </div>

      {/* Models Grid - scrollable with safe bottom padding */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className={cn(
          'grid gap-4',
          isMobile ? 'grid-cols-1' : 'grid-cols-2 xl:grid-cols-3'
        )}>
          {displayModels.map((model, index) => (
            <motion.div
              key={model.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
            >
              <ModelCard
                model={model}
                isSelected={model.slug === normalizedSelectedSlug}
                onSelect={() => handleSelect(model.slug)}
                isConforming={conformingModels?.includes(model.slug)}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Sidebar Modules - shown on desktop */}
        {!isMobile && (
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <FinancingSidebarModule onOpenModal={() => setShowFinancingModal(true)} />
            <AppraisalSidebarModule />
          </div>
        )}

        {/* Safe bottom padding for sticky footer */}
        <WizardFooterSpacer />
      </div>

      {/* Sticky Footer */}
      <WizardStickyFooter
        onBack={onBack}
        onContinue={onNext}
        canContinue={!!selectedModelSlug}
        continueLabel="Continue"
      >
        {selectedModel && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <HomeIcon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">The {selectedModel.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedModel.sqft.toLocaleString()} sq ft • {selectedModel.beds} bed • {selectedModel.baths} bath
              </p>
            </div>
          </div>
        )}
      </WizardStickyFooter>

      {/* Financing Modal */}
      <FinancingModal
        open={showFinancingModal}
        onOpenChange={setShowFinancingModal}
        developmentSlug={developmentSlug}
        lotId={lotId}
        modelSlug={selectedModelSlug}
      />
    </div>
  );
}

interface ModelCardProps {
  model: HomeModel;
  isSelected: boolean;
  onSelect: () => void;
  isConforming?: boolean;
}

function ModelCard({ model, isSelected, onSelect, isConforming }: ModelCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use canonical hero image path from model-images utility
  const heroImage = getModelHeroImage(model);

  return (
    <Card 
      className={cn(
        'overflow-hidden cursor-pointer group transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isSelected 
          ? 'ring-2 ring-accent border-accent shadow-lg' 
          : 'hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5'
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
      aria-label={`Select The ${model.name} - ${model.sqft} square feet, ${model.beds} bedrooms, ${model.baths} bathrooms`}
    >
      {/* Image with skeleton loading - aspect-video for premium 16:9 feel */}
      <div className="aspect-video bg-muted relative overflow-hidden rounded-t-2xl">
        {/* Loading skeleton - no layout shift */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse" />
        )}
        
        <img 
          src={heroImage} 
          alt={`The ${model.name} home exterior`}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            'group-hover:scale-105',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Single fallback to SVG placeholder
            const target = e.currentTarget;
            if (target.src !== HERO_PLACEHOLDER) {
              target.src = HERO_PLACEHOLDER;
            }
          }}
          loading="lazy"
        />
        
        {/* Selection indicator - pointer-events-none so it never blocks clicks */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg pointer-events-none"
            >
              <Check className="h-5 w-5 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Conforming badge */}
        {isConforming && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <Badge className="bg-green-600 text-white border-0 text-xs font-medium shadow-md">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Conforming
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground text-base">The {model.name}</h3>
          <Badge variant="secondary" className="text-xs font-medium shrink-0">
            ${model.price.toLocaleString()}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {model.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5">
            <Maximize className="h-3.5 w-3.5" />
            {model.sqft.toLocaleString()} sf
          </span>
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5" />
            {model.beds} bed
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5" />
            {model.baths} ba
          </span>
        </div>

        <Dialog>
          <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full transition-colors hover:bg-accent/5"
            >
              <FileText className="mr-2 h-3.5 w-3.5" />
              View Floor Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="text-lg">The {model.name} — Floor Plan</DialogTitle>
              <DialogDescription className="sr-only">
                View the floor plan details for The {model.name} home model
              </DialogDescription>
            </DialogHeader>
            <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {model.floorplanImage ? (
                <img 
                  src={model.floorplanImage} 
                  alt={`${model.name} floor plan`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Floor plan coming soon</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-xl font-semibold text-foreground">{model.sqft.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">sq ft</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-xl font-semibold text-foreground">{model.beds}</p>
                <p className="text-xs text-muted-foreground mt-1">bedrooms</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-xl font-semibold text-foreground">{model.baths}</p>
                <p className="text-xs text-muted-foreground mt-1">bathrooms</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
