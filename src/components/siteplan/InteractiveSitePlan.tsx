import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SitePlanViewer } from '@/components/siteplan/SitePlanViewer';
import { LotDetailsPanel } from '@/components/siteplan/LotDetailsPanel';
import { Button } from '@/components/ui/button';
import { Maximize2, ArrowRight } from 'lucide-react';
import { getDevelopmentBySlug } from '@/data/developments';
import { grandHavenLots, Lot } from '@/data/lots/grand-haven';
import { useIsMobile } from '@/hooks/use-mobile';

interface InteractiveSitePlanProps {
  developmentSlug?: string;
  className?: string;
}

export function InteractiveSitePlan({
  developmentSlug = 'grand-haven',
  className,
}: InteractiveSitePlanProps) {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const isMobile = useIsMobile();

  const development = getDevelopmentBySlug(developmentSlug);
  
  // Get lots based on development
  const lots = useMemo(() => {
    // For now, only grand-haven has lots data
    if (developmentSlug === 'grand-haven') {
      return grandHavenLots;
    }
    return [];
  }, [developmentSlug]);

  if (!development) {
    return null;
  }

  const handleSelectLot = (lot: Lot | null) => {
    setSelectedLot(lot);
  };

  const availableLots = lots.filter(l => l.status === 'available').length;
  const reservedLots = lots.filter(l => l.status === 'reserved').length;
  const soldLots = lots.filter(l => l.status === 'sold').length;

  return (
    <div className={className}>
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{availableLots}</span> Available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{reservedLots}</span> Reserved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{soldLots}</span> Sold
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/developments/${developmentSlug}/site-plan`}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Link>
        </Button>
      </div>

      {/* Site Plan Viewer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative bg-card rounded-xl border border-border overflow-hidden"
        style={{ height: isMobile ? '50vh' : '65vh' }}
      >
        <SitePlanViewer
          sitePlanImagePath={development.sitePlanImagePath}
          lots={lots}
          onSelectLot={handleSelectLot}
          selectedLotId={selectedLot?.id ?? null}
          className="h-full"
        />
        
        {/* Details Panel */}
        {selectedLot && (
          <LotDetailsPanel
            lot={selectedLot}
            developmentSlug={development.slug}
            onClose={() => setSelectedLot(null)}
            isMobile={isMobile}
          />
        )}
      </motion.div>

      {/* Quick Action */}
      <div className="mt-4 flex justify-center">
        <Button asChild variant="link" className="text-accent">
          <Link to="/contact?development=grand-haven">
            Have questions about these lots?
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
