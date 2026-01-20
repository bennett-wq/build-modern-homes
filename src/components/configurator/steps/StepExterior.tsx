// ============================================================================
// Step 6: Exterior Style
// ============================================================================

import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Info, Minus, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { exteriorConfig, type ModelConfig, getPlygremUpgradePrice } from '@/data/pricing-config';
import type { ExteriorSelection } from '@/hooks/usePricingEngine';
import { cn } from '@/lib/utils';

interface StepExteriorProps {
  model: ModelConfig;
  exteriorSelection: ExteriorSelection;
  onUpdateExterior: (updates: Partial<ExteriorSelection>) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function StepExterior({
  model,
  exteriorSelection,
  onUpdateExterior,
  onNext,
  onBack,
}: StepExteriorProps) {
  const sidingUpgradePrice = getPlygremUpgradePrice(model.length);
  const selectedSiding = exteriorConfig.sidingColors.find(c => c.id === exteriorSelection.sidingColorId);
  
  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          Choose Your Exterior Style
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Select colors and options to personalize your home's curb appeal.
        </motion.p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Siding Colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Siding Color</h3>
            {selectedSiding?.isUpgrade && (
              <span className="text-sm text-accent flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                +{formatPrice(sidingUpgradePrice)} upgrade
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Standard Colors */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Standard (no upcharge)</p>
              <div className="flex flex-wrap gap-3">
                {exteriorConfig.sidingColors.filter(c => !c.isUpgrade).map(color => (
                  <ColorSwatch
                    key={color.id}
                    color={color.hex}
                    name={color.name}
                    isSelected={exteriorSelection.sidingColorId === color.id}
                    onClick={() => onUpdateExterior({ sidingColorId: color.id })}
                  />
                ))}
              </div>
            </div>
            
            {/* Upgrade Colors */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Upgrade (+{formatPrice(sidingUpgradePrice)} PlyGem siding)
              </p>
              <div className="flex flex-wrap gap-3">
                {exteriorConfig.sidingColors.filter(c => c.isUpgrade).map(color => (
                  <ColorSwatch
                    key={color.id}
                    color={color.hex}
                    name={color.name}
                    isSelected={exteriorSelection.sidingColorId === color.id}
                    onClick={() => onUpdateExterior({ sidingColorId: color.id })}
                    isUpgrade
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Shingle Colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Shingle Color</h3>
          <div className="flex flex-wrap gap-3">
            {exteriorConfig.shingleColors.map(color => (
              <ColorSwatch
                key={color.id}
                color={color.hex}
                name={color.name}
                isSelected={exteriorSelection.shingleColorId === color.id}
                onClick={() => onUpdateExterior({ shingleColorId: color.id })}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Door Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Front Door Style</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {exteriorConfig.doorStyles.map(door => (
              <button
                key={door.id}
                onClick={() => onUpdateExterior({ doorStyleId: door.id })}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all duration-200',
                  'hover:border-accent/50',
                  exteriorSelection.doorStyleId === door.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card',
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-foreground">{door.name}</span>
                  {exteriorSelection.doorStyleId === door.id && (
                    <Check className="w-4 h-4 text-accent" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{door.description}</p>
                {door.price > 0 ? (
                  <span className="text-sm text-accent">+{formatPrice(door.price)}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Included</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Additional Options</h3>
          <div className="space-y-4">
            {/* Black Fascia Package */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div>
                <Label className="text-base font-medium text-foreground cursor-pointer">
                  Black Fascia + Drip Edge + Soffit
                </Label>
                <p className="text-sm text-muted-foreground">Premium black exterior trim package</p>
                <p className="text-sm text-accent mt-1">
                  +{formatPrice(exteriorConfig.options.find(o => o.id === 'black-fascia-package')?.price || 0)}
                </p>
              </div>
              <Switch
                checked={exteriorSelection.blackFasciaPackage}
                onCheckedChange={(checked) => onUpdateExterior({ blackFasciaPackage: checked })}
              />
            </div>
            
            {/* Black Exterior Doors */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="text-base font-medium text-foreground">
                    Black Exterior Doors
                  </Label>
                  <p className="text-sm text-muted-foreground">Replace white doors with black finish</p>
                </div>
                <QuantitySelector
                  value={exteriorSelection.blackExteriorDoorCount}
                  min={0}
                  max={4}
                  onChange={(value) => onUpdateExterior({ blackExteriorDoorCount: value })}
                />
              </div>
              <p className="text-sm text-accent">
                {formatPrice(exteriorConfig.options.find(o => o.id === 'black-exterior-door')?.price || 0)} each
              </p>
            </div>
            
            {/* Storm Doors */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="text-base font-medium text-foreground">
                    Storm Doors (White)
                  </Label>
                  <p className="text-sm text-muted-foreground">Shipped loose for installation</p>
                </div>
                <QuantitySelector
                  value={exteriorSelection.stormDoorCount}
                  min={0}
                  max={3}
                  onChange={(value) => onUpdateExterior({ stormDoorCount: value })}
                />
              </div>
              <p className="text-sm text-accent">
                {formatPrice(exteriorConfig.options.find(o => o.id === 'storm-door')?.price || 0)} each
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-2 p-4 rounded-xl bg-muted/30 border border-border"
        >
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Some exterior options vary by plan/series. Final availability confirmed in formal quote.
          </p>
        </motion.div>
      </div>
      
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center justify-between pt-4 max-w-4xl mx-auto"
      >
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={onNext}>
          Review Summary
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}

// Color Swatch Component
function ColorSwatch({
  color,
  name,
  isSelected,
  onClick,
  isUpgrade = false,
}: {
  color: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
  isUpgrade?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-200',
        isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : 'hover:ring-2 hover:ring-border',
      )}
    >
      <div
        className="w-12 h-12 rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground whitespace-nowrap">{name}</span>
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-accent-foreground" />
        </div>
      )}
      {isUpgrade && !isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </button>
  );
}

// Quantity Selector Component
function QuantitySelector({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          'w-8 h-8 rounded-lg border border-border flex items-center justify-center transition-colors',
          value <= min
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-muted',
        )}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-8 text-center font-medium text-foreground">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          'w-8 h-8 rounded-lg border border-border flex items-center justify-center transition-colors',
          value >= max
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-muted',
        )}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

export default StepExterior;
