// Step 2: Pick a Model - grid of model cards
import { motion } from 'framer-motion';
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export function Step2Model({
  selectedModelSlug,
  onSelectModel,
  onNext,
  onBack,
  isMobile,
}: Step2ModelProps) {
  const selectedModel = homeModels.find(m => m.slug === selectedModelSlug);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Pick Your Model</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose from our collection of CrossMod® homes
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Models Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className={cn(
          'grid gap-4',
          isMobile ? 'grid-cols-1' : 'grid-cols-2 xl:grid-cols-3'
        )}>
          {homeModels.map((model, index) => (
            <motion.div
              key={model.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ModelCard
                model={model}
                isSelected={model.slug === selectedModelSlug}
                onSelect={() => onSelectModel(model.slug)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4 border-t border-border bg-card"
      >
        {selectedModel ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">The {selectedModel.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedModel.sqft.toLocaleString()} sq ft • {selectedModel.beds} bed • {selectedModel.baths} bath
                </p>
              </div>
            </div>
            <Button onClick={onNext} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-muted-foreground text-sm">Select a model to continue</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface ModelCardProps {
  model: HomeModel;
  isSelected: boolean;
  onSelect: () => void;
}

function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  return (
    <Card 
      className={cn(
        'overflow-hidden cursor-pointer transition-all duration-200 group',
        isSelected 
          ? 'ring-2 ring-accent border-accent shadow-lg' 
          : 'hover:shadow-md hover:border-accent/50'
      )}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {model.heroImage ? (
          <img 
            src={model.heroImage} 
            alt={`The ${model.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <Check className="h-5 w-5 text-accent-foreground" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground">The {model.name}</h3>
          <Badge variant="secondary" className="text-xs">
            ${model.price.toLocaleString()}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{model.description}</p>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Maximize className="h-3 w-3" />
            {model.sqft.toLocaleString()} sf
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="h-3 w-3" />
            {model.beds} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3 w-3" />
            {model.baths} ba
          </span>
        </div>

        <Dialog>
          <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="w-full">
              <FileText className="mr-2 h-3 w-3" />
              View Floor Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>The {model.name} - Floor Plan</DialogTitle>
            </DialogHeader>
            <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
              {model.floorplanImage ? (
                <img 
                  src={model.floorplanImage} 
                  alt={`${model.name} floor plan`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Floor plan coming soon</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-lg font-semibold text-foreground">{model.sqft.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">sq ft</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-lg font-semibold text-foreground">{model.beds}</p>
                <p className="text-xs text-muted-foreground">bedrooms</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-lg font-semibold text-foreground">{model.baths}</p>
                <p className="text-xs text-muted-foreground">bathrooms</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
