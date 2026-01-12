import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Lot, LotStatus } from '@/data/lots/grand-haven';

interface LotDetailsPanelProps {
  lot: Lot | null;
  developmentSlug: string;
  onClose: () => void;
  className?: string;
  isMobile?: boolean;
}

const STATUS_VARIANTS: Record<LotStatus, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
  available: { variant: 'default', label: 'Available' },
  reserved: { variant: 'secondary', label: 'Reserved' },
  sold: { variant: 'outline', label: 'Sold' },
};

export function LotDetailsPanel({
  lot,
  developmentSlug,
  onClose,
  className,
  isMobile = false,
}: LotDetailsPanelProps) {
  if (!lot) return null;

  const statusInfo = STATUS_VARIANTS[lot.status];
  const contactUrl = `/contact?development=${developmentSlug}&lot=${lot.id}`;
  const buildUrl = `/developments/${developmentSlug}/build?lot=${lot.id}`;
  const modelsUrl = `/models?development=${developmentSlug}&lot=${lot.id}`;

  const panelContent = (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{lot.label}</h3>
            <Badge
              variant={statusInfo.variant}
              className={cn(
                lot.status === 'available' && 'bg-green-500/10 text-green-600 border-green-200',
                lot.status === 'reserved' && 'bg-amber-500/10 text-amber-600 border-amber-200',
                lot.status === 'sold' && 'bg-gray-500/10 text-gray-500 border-gray-200'
              )}
            >
              {statusInfo.label}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Details */}
      <div className="space-y-4 flex-1">
        {lot.zoning && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Zoning</span>
            <span className="text-sm font-medium text-foreground">{lot.zoning}</span>
          </div>
        )}

        {lot.acreage && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Gross Acreage</span>
            <span className="text-sm font-medium text-foreground">{lot.acreage} ac</span>
          </div>
        )}

        {lot.netAcreage && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Net Acreage</span>
            <span className="text-sm font-medium text-foreground">{lot.netAcreage} ac</span>
          </div>
        )}

        {lot.premium && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Est. Homesite Premium</span>
            <span className="text-sm font-medium text-foreground">
              ${lot.premium.toLocaleString()}
            </span>
          </div>
        )}

        {lot.notes && (
          <div className="py-2">
            <span className="text-sm text-muted-foreground block mb-1">Notes</span>
            <p className="text-sm text-foreground">{lot.notes}</p>
          </div>
        )}
      </div>

      {/* CTAs */}
      {lot.status !== 'sold' && (
        <div className="pt-6 border-t border-border mt-auto space-y-3">
          <Button asChild className="w-full">
            <Link to={buildUrl}>
              <Home className="mr-2 h-4 w-4" />
              Build on This Lot
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to={contactUrl}>
              Request This Lot
            </Link>
          </Button>
          {lot.status === 'reserved' && (
            <p className="text-xs text-muted-foreground text-center">
              This lot is currently reserved. Submit a request to join the waitlist.
            </p>
          )}
        </div>
      )}

      {lot.status === 'sold' && (
        <div className="pt-6 border-t border-border mt-auto">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              This lot has been sold. View other available lots or{' '}
              <Link to="/contact" className="text-accent hover:underline">
                contact us
              </Link>{' '}
              to learn about upcoming opportunities.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile: Bottom sheet overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-xl border-t border-border max-h-[70vh] overflow-auto',
            className
          )}
        >
          {/* Handle */}
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mt-3" />
          {panelContent}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Desktop: Overlay side panel (absolute positioned, doesn't shift layout)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'absolute right-0 top-0 h-full w-80 bg-background border-l border-border shadow-xl z-30 overflow-auto',
          className
        )}
      >
        {panelContent}
      </motion.div>
    </AnimatePresence>
  );
}
