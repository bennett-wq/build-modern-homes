// Lot List Panel - searchable, filterable lot directory
import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Lot, LotStatus } from '@/data/lots/grand-haven';

interface LotListPanelProps {
  lots: Lot[];
  selectedLotId: number | null;
  hoveredLotId: number | null;
  onSelectLot: (lot: Lot) => void;
  onHoverLot: (lotId: number | null) => void;
  className?: string;
  style?: React.CSSProperties;
}

const STATUS_STYLES: Record<LotStatus, { badge: string; dot: string; label: string }> = {
  available: {
    badge: 'bg-green-500/10 text-green-600 border-green-200',
    dot: 'bg-green-500',
    label: 'Available',
  },
  reserved: {
    badge: 'bg-amber-500/10 text-amber-600 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Reserved',
  },
  sold: {
    badge: 'bg-gray-500/10 text-gray-500 border-gray-200',
    dot: 'bg-gray-400',
    label: 'Sold',
  },
};

type FilterOption = 'all' | 'available' | 'reserved' | 'sold';

export function LotListPanel({
  lots,
  selectedLotId,
  hoveredLotId,
  onSelectLot,
  onHoverLot,
  className,
  style,
}: LotListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all');

  const filteredLots = useMemo(() => {
    return lots.filter(lot => {
      // Search filter
      const matchesSearch = lot.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.id.toString().includes(searchQuery);

      // Status filter
      const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [lots, searchQuery, statusFilter]);

  const counts = useMemo(() => ({
    all: lots.length,
    available: lots.filter(l => l.status === 'available').length,
    reserved: lots.filter(l => l.status === 'reserved').length,
    sold: lots.filter(l => l.status === 'sold').length,
  }), [lots]);

  const filterOptions: { value: FilterOption; label: string; shortLabel: string }[] = [
    { value: 'all', label: `All (${counts.all})`, shortLabel: 'All' },
    { value: 'available', label: `Available (${counts.available})`, shortLabel: `${counts.available}` },
    { value: 'reserved', label: `Reserved (${counts.reserved})`, shortLabel: `${counts.reserved}` },
    { value: 'sold', label: `Sold (${counts.sold})`, shortLabel: `${counts.sold}` },
  ];

  const handleKeyDown = useCallback((e: React.KeyboardEvent, lot: Lot) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectLot(lot);
    }
  }, [onSelectLot]);

  return (
    <div className={cn('flex flex-col h-full bg-card', className)} style={style}>
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3 shrink-0">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          Lot Directory
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search lots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 transition-shadow focus:shadow-sm"
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
                'h-7 text-xs px-2.5 transition-all duration-200',
                statusFilter === option.value && 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm'
              )}
              onClick={() => setStatusFilter(option.value)}
              aria-pressed={statusFilter === option.value}
            >
              {option.value === 'all' ? option.label : (
                <>
                  <span className="sm:hidden">{option.shortLabel}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Lot List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1" role="listbox" aria-label="Available lots">
          {filteredLots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No lots match your search
            </div>
          ) : (
            filteredLots.map(lot => {
              const statusStyle = STATUS_STYLES[lot.status];
              const isSelected = lot.id === selectedLotId;
              const isHovered = lot.id === hoveredLotId;

              return (
                <motion.button
                  key={lot.id}
                  onClick={() => onSelectLot(lot)}
                  onMouseEnter={() => onHoverLot(lot.id)}
                  onMouseLeave={() => onHoverLot(null)}
                  onFocus={() => onHoverLot(lot.id)}
                  onBlur={() => onHoverLot(null)}
                  onKeyDown={(e) => handleKeyDown(e, lot)}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`${lot.label}, ${statusStyle.label}${lot.acreage ? `, ${lot.acreage} acres` : ''}`}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    isSelected
                      ? 'bg-accent/10 border-accent shadow-sm'
                      : isHovered
                      ? 'bg-muted/80 border-border'
                      : 'bg-background border-transparent hover:border-border hover:bg-muted/50',
                    lot.status === 'sold' && 'opacity-60'
                  )}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full transition-transform duration-200',
                        statusStyle.dot,
                        (isSelected || isHovered) && 'scale-125'
                      )} />
                      <span className="font-medium text-foreground">{lot.label}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-xs font-medium', statusStyle.badge)}
                    >
                      {statusStyle.label}
                    </Badge>
                  </div>
                  {lot.acreage && (
                    <p className="text-xs text-muted-foreground mt-1 ml-5">
                      {lot.acreage} acres
                    </p>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/30 shrink-0">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Legend</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-xs text-muted-foreground">Sold</span>
          </div>
        </div>
      </div>
    </div>
  );
}
