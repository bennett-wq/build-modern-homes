// ============================================================================
// PremiumLotCard Component
// Tier-1 proptech-grade lot selection card with pricing preview
// ============================================================================

import { memo, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Trees, Sparkles, Clock, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnimatedPriceCompact } from '@/components/ui/animated-price';
import { cn } from '@/lib/utils';
import type { Lot as StaticLot } from '@/data/lots/grand-haven';
import type { Lot as DbLot } from '@/types/database';

// Support both static and DB lot types
type LotType = StaticLot | (DbLot & { availability?: string; phase?: number });

interface PremiumLotCardProps {
  lot: LotType;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  estimatedAllIn?: number; // Optional all-in price preview
  className?: string;
}

// Helper to get lot properties regardless of type
function getLotLabel(lot: LotType): string {
  if ('label' in lot) return lot.label;
  return lot.lot_number;
}

function getLotId(lot: LotType): string | number {
  return lot.id;
}

function getLotPremium(lot: LotType): number | undefined {
  return lot.premium ?? undefined;
}

function getLotAcreage(lot: LotType): number | undefined {
  if ('acreage' in lot && typeof lot.acreage === 'number') return lot.acreage;
  return undefined;
}

function getLotAvailability(lot: LotType): string | undefined {
  if ('availability' in lot) return lot.availability;
  return undefined;
}

function getLotPhase(lot: LotType): number | undefined {
  if ('phase' in lot) return lot.phase;
  return undefined;
}

function getLotNotes(lot: LotType): string | undefined {
  if ('notes' in lot && lot.notes) return lot.notes;
  return undefined;
}

// Status styling
const STATUS_CONFIG = {
  available: {
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    glow: 'shadow-emerald-500/20',
    label: 'Available',
  },
  reserved: {
    badge: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400',
    dot: 'bg-amber-500',
    glow: 'shadow-amber-500/20',
    label: 'Reserved',
  },
  sold: {
    badge: 'bg-gray-500/10 text-gray-500 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400',
    dot: 'bg-gray-400',
    glow: '',
    label: 'Sold',
  },
  pending: {
    badge: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400',
    dot: 'bg-blue-500',
    glow: 'shadow-blue-500/20',
    label: 'Pending',
  },
};

// Availability badge styling
function getAvailabilityBadge(availability: string | undefined) {
  if (!availability) return null;
  
  if (availability === 'Now') {
    return {
      icon: Sparkles,
      label: 'Available Now',
      className: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm',
      pulse: true,
    };
  }
  
  return {
    icon: Clock,
    label: availability,
    className: 'bg-muted text-muted-foreground border-border',
    pulse: false,
  };
}

export const PremiumLotCard = memo(forwardRef<HTMLButtonElement, PremiumLotCardProps>(
  function PremiumLotCard(
    {
      lot,
      isSelected,
      isHovered,
      onClick,
      onMouseEnter,
      onMouseLeave,
      estimatedAllIn,
      className,
    },
    ref
  ) {
    const status = lot.status;
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.available;
    const label = getLotLabel(lot);
    const premium = getLotPremium(lot);
    const acreage = getLotAcreage(lot);
    const availability = getLotAvailability(lot);
    const phase = getLotPhase(lot);
    const notes = getLotNotes(lot);
    const availabilityBadge = getAvailabilityBadge(availability);
    
    const isAvailable = status === 'available';
    const isPhase1 = phase === 1;
    const isPremiumLot = (acreage ?? 0) > 10;

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        disabled={status === 'sold'}
        className={cn(
          'w-full text-left p-4 rounded-xl border transition-all duration-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'group relative overflow-hidden',
          isSelected
            ? 'bg-accent/10 border-accent shadow-lg ' + statusConfig.glow
            : isHovered
            ? 'bg-muted/80 border-border shadow-md'
            : 'bg-card border-border/50 hover:border-border hover:shadow-sm',
          status === 'sold' && 'opacity-50 cursor-not-allowed',
          className
        )}
        whileHover={{ scale: status !== 'sold' ? 1.01 : 1 }}
        whileTap={{ scale: status !== 'sold' ? 0.99 : 1 }}
        transition={{ duration: 0.15 }}
        aria-selected={isSelected}
        aria-label={`${label}, ${statusConfig.label}${acreage ? `, ${acreage} acres` : ''}${premium ? `, $${premium.toLocaleString()}` : ''}`}
      >
        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center"
          >
            <Check className="h-4 w-4 text-accent-foreground" />
          </motion.div>
        )}

        {/* Phase 1 / Available Now highlight */}
        {isPhase1 && isAvailable && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        )}

        {/* Content */}
        <div className="flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                statusConfig.dot,
                isSelected && 'ring-2 ring-offset-2 ring-offset-card',
                isSelected && statusConfig.glow,
                availability === 'Now' && 'animate-pulse'
              )} />
              <span className="font-semibold text-foreground text-base">{label}</span>
              {isPremiumLot && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-400 border-amber-200">
                  Estate
                </Badge>
              )}
            </div>
            
            <Badge
              variant="outline"
              className={cn('text-xs font-medium shrink-0', statusConfig.badge)}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Availability badge */}
          {availabilityBadge && (
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs font-medium', availabilityBadge.className)}>
                <availabilityBadge.icon className={cn('h-3 w-3 mr-1', availabilityBadge.pulse && 'animate-pulse')} />
                {availabilityBadge.label}
              </Badge>
              {phase && phase > 1 && (
                <span className="text-xs text-muted-foreground">Phase {phase}</span>
              )}
            </div>
          )}

          {/* Details row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {acreage && (
              <div className="flex items-center gap-1.5">
                <Trees className="h-3.5 w-3.5" />
                <span>{acreage} acres</span>
              </div>
            )}
            {premium !== undefined && (
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <AnimatedPriceCompact value={premium} />
              </div>
            )}
          </div>

          {/* All-in price preview (when hovering or selected) */}
          {estimatedAllIn !== undefined && isAvailable && (isSelected || isHovered) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-border/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Est. All-In Price</span>
                <span className="text-sm font-semibold text-foreground">
                  <AnimatedPriceCompact value={estimatedAllIn} />
                </span>
              </div>
            </motion.div>
          )}

          {/* Unavailable message */}
          {status !== 'available' && status !== 'sold' && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Join the waitlist for this lot</span>
            </div>
          )}
        </div>
      </motion.button>
    );
  }
));
