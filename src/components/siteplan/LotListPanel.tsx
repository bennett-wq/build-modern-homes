// ============================================================================
// Premium Lot List Panel
// World-class lot directory with pricing, phases, and availability
// ============================================================================

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PremiumLotCard } from '@/components/wizard/PremiumLotCard';
import { LotPricingBadge } from '@/components/wizard/LotPricingPreview';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Lot as StaticLot, LotStatus } from '@/data/lots/grand-haven';
import type { Lot as DbLot } from '@/types/database';

// Support both static and DB lot types
type LotType = StaticLot | (DbLot & { availability?: string; phase?: number });

interface LotListPanelProps {
  lots: LotType[];
  selectedLotId: number | null;
  hoveredLotId: number | null;
  onSelectLot: (lot: LotType) => void;
  onHoverLot: (lotId: number | null) => void;
  className?: string;
  style?: React.CSSProperties;
  isLoading?: boolean;
  // Pricing context for all-in estimates
  baseHomePackage?: number;
  baseSitework?: number;
  baseFeesAllowance?: number;
}

type FilterOption = 'all' | 'available' | 'phase-1' | 'reserved' | 'sold';

// Helper to get lot ID as string for comparison
function getLotIdString(lot: LotType): string {
  return String(lot.id);
}

function getLotPhase(lot: LotType): number | undefined {
  if ('phase' in lot) return lot.phase;
  return undefined;
}

function getLotPremium(lot: LotType): number {
  return lot.premium ?? 0;
}

function getLotLabel(lot: LotType): string {
  if ('label' in lot) return lot.label;
  return lot.lot_number;
}

function getLotAvailability(lot: LotType): string | undefined {
  if ('availability' in lot) return lot.availability;
  return undefined;
}

export function LotListPanel({
  lots,
  selectedLotId,
  hoveredLotId,
  onSelectLot,
  onHoverLot,
  className,
  style,
  isLoading = false,
  baseHomePackage = 129485, // Default Hawthorne XMOD
  baseSitework = 114533,
  baseFeesAllowance = 9631,
}: LotListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all');

  // Calculate all-in estimate for a lot
  const calculateAllIn = useCallback((lot: LotType): number => {
    const premium = getLotPremium(lot);
    return baseHomePackage + baseSitework + baseFeesAllowance + premium;
  }, [baseHomePackage, baseSitework, baseFeesAllowance]);

  const filteredLots = useMemo(() => {
    return lots.filter(lot => {
      // Search filter
      const label = getLotLabel(lot);
      const matchesSearch = label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(lot.id).includes(searchQuery);

      // Status filter
      const phase = getLotPhase(lot);
      let matchesStatus = true;
      
      switch (statusFilter) {
        case 'available':
          matchesStatus = lot.status === 'available';
          break;
        case 'phase-1':
          matchesStatus = phase === 1 && lot.status === 'available';
          break;
        case 'reserved':
          matchesStatus = lot.status === 'reserved';
          break;
        case 'sold':
          matchesStatus = lot.status === 'sold';
          break;
        default:
          matchesStatus = true;
      }

      return matchesSearch && matchesStatus;
    });
  }, [lots, searchQuery, statusFilter]);

  // Sort: Phase 1 first, then by lot number/label
  const sortedLots = useMemo(() => {
    return [...filteredLots].sort((a, b) => {
      const phaseA = getLotPhase(a) ?? 99;
      const phaseB = getLotPhase(b) ?? 99;
      if (phaseA !== phaseB) return phaseA - phaseB;
      
      const labelA = getLotLabel(a);
      const labelB = getLotLabel(b);
      return labelA.localeCompare(labelB, undefined, { numeric: true });
    });
  }, [filteredLots]);

  const counts = useMemo(() => ({
    all: lots.length,
    available: lots.filter(l => l.status === 'available').length,
    phase1: lots.filter(l => getLotPhase(l) === 1 && l.status === 'available').length,
    reserved: lots.filter(l => l.status === 'reserved').length,
    sold: lots.filter(l => l.status === 'sold').length,
  }), [lots]);

  const filterOptions: { value: FilterOption; label: string; count: number; highlight?: boolean }[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'phase-1', label: 'Available Now', count: counts.phase1, highlight: true },
    { value: 'available', label: 'Available', count: counts.available },
    { value: 'reserved', label: 'Reserved', count: counts.reserved },
    { value: 'sold', label: 'Sold', count: counts.sold },
  ];

  // Price range summary
  const priceRange = useMemo(() => {
    const availableLots = lots.filter(l => l.status === 'available' && getLotPremium(l) > 0);
    if (availableLots.length === 0) return null;
    
    const premiums = availableLots.map(l => getLotPremium(l));
    const minPremium = Math.min(...premiums);
    const maxPremium = Math.max(...premiums);
    
    return {
      min: baseHomePackage + baseSitework + baseFeesAllowance + minPremium,
      max: baseHomePackage + baseSitework + baseFeesAllowance + maxPremium,
    };
  }, [lots, baseHomePackage, baseSitework, baseFeesAllowance]);

  return (
    <div className={cn('flex flex-col h-full bg-card', className)} style={style}>
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            Select Your Lot
          </h3>
          {counts.phase1 > 0 && (
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              {counts.phase1} Available Now
            </Badge>
          )}
        </div>

        {/* Price range indicator */}
        {priceRange && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
            <TrendingUp className="h-4 w-4 text-accent shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">All-in prices from </span>
              <span className="font-semibold text-foreground">
                ${priceRange.min.toLocaleString()}
              </span>
              <span className="text-muted-foreground"> to </span>
              <span className="font-semibold text-foreground">
                ${priceRange.max.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search lots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 transition-shadow focus:shadow-md bg-background"
            aria-label="Search lots"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {filterOptions.map(option => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 text-xs px-3 transition-all duration-200',
                statusFilter === option.value && option.highlight && 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0',
                statusFilter === option.value && !option.highlight && 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm'
              )}
              onClick={() => setStatusFilter(option.value)}
              aria-pressed={statusFilter === option.value}
            >
              {option.label}
              <span className="ml-1 opacity-70">({option.count})</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Lot List - native scroll for better mobile support */}
      <div 
        className="flex-1 overflow-auto min-h-0" 
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="p-3 space-y-2" role="listbox" aria-label="Available lots">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))
          ) : sortedLots.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm font-medium">
                No lots match your search
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            sortedLots.map(lot => {
              const lotIdStr = getLotIdString(lot);
              const isSelected = String(selectedLotId) === lotIdStr;
              const isHovered = String(hoveredLotId) === lotIdStr;
              const estimatedAllIn = calculateAllIn(lot);

              return (
                <PremiumLotCard
                  key={lotIdStr}
                  lot={lot}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onClick={() => onSelectLot(lot)}
                  onMouseEnter={() => onHoverLot(typeof lot.id === 'number' ? lot.id : Number(lot.id))}
                  onMouseLeave={() => onHoverLot(null)}
                  estimatedAllIn={estimatedAllIn}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30 shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{sortedLots.length} lot{sortedLots.length !== 1 ? 's' : ''} shown</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span>Sold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
