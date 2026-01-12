// Step 2: Pick a Model - grid of model cards with premium polish
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Home, BedDouble, Bath, Maximize, FileText, Check } from 'lucide-react';
import { homeModels, HomeModel } from '@/data/models';
import { cn } from '@/lib/utils';

interface Step2ModelProps {
  selectedModelSlug: string | null;
  onSelectModel: (slug: string) => void;
  onNext: () => void;
  onBack: () => void;
  isMobile: boolean;
}

export function Step2Model({
  selectedModelSlug,
  onSelectModel,
  onNext,
  onBack,
  isMobile,
}: Step2ModelProps) {
  const selectedModel = homeModels.find(m => m.slug === selectedModelSlug);

  const handleSelect = useCallback((slug: string) => {
    onSelectModel(slug);
  }, [onSelectModel]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Pick Your Model
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose from our CrossMod® home collection
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

      {/* Models Grid */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className={cn(
          'grid gap-4',
          isMobile ? 'grid-cols-1' : 'grid-cols-2 xl:grid-cols-3'
        )}>
          {homeModels.map((model, index) => (
            <motion.div
              key={model.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
            >
              <ModelCard
                model={model}
                isSelected={model.slug === selectedModelSlug}
                onSelect={() => handleSelect(model.slug)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-4 border-t border-border bg-card shrink-0">
        <AnimatePresence mode="wait">
          {selectedModel ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Home className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">The {selectedModel.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedModel.sqft.toLocaleString()} sq ft • {selectedModel.beds} bed • {selectedModel.baths} bath
                  </p>
                </div>
              </div>
              <Button 
                onClick={onNext} 
                className="shrink-0"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-2"
            >
              <p className="text-muted-foreground text-sm">Select a model to continue</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ModelCardProps {
  model: HomeModel;
  isSelected: boolean;
  onSelect: () => void;
}

function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

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
      {/* Image with skeleton loading */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {/* Skeleton */}
        {!imageLoaded && model.heroImage && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {model.heroImage ? (
          <img 
            src={model.heroImage} 
            alt={`The ${model.name} home exterior`}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              'group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg"
            >
              <Check className="h-5 w-5 text-accent-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg">The {model.name} — Floor Plan</DialogTitle>
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
