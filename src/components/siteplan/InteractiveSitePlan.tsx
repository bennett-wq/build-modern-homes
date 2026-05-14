import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FixedSitePlanViewer } from '@/components/siteplan/FixedSitePlanViewer';
import { LotListPanel } from '@/components/siteplan/LotListPanel';
import { LotDetailsPanel } from '@/components/siteplan/LotDetailsPanel';
import { MapboxLotPicker } from '@/components/siteplan/MapboxLotPicker';
import { adaptDbLots } from '@/components/siteplan/lot-adapter';
import { Button } from '@/components/ui/button';
import { Maximize2, List, X } from 'lucide-react';
import { getDevelopmentBySlug } from '@/data/developments';
import { grandHavenLots, Lot } from '@/data/lots/grand-haven';
import { stJamesBayLots } from '@/data/lots/st-james-bay';
import { ypsilantiLots } from '@/data/lots/ypsilanti';
import { useLotsBySlug } from '@/hooks/useLots';
import { useDevelopments } from '@/hooks/useDevelopments';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Development as DbDevelopment, Lot as DbLot } from '@/types/database';

interface InteractiveSitePlanProps {
  developmentSlug?: string;
  className?: string;
}

export function InteractiveSitePlan({
  developmentSlug = 'grand-haven',
  className,
}: InteractiveSitePlanProps) {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [hoveredLotId, setHoveredLotId] = useState<number | null>(null);
  const [showMobileList, setShowMobileList] = useState(false);
  const isMobile = useIsMobile();

  const development = getDevelopmentBySlug(developmentSlug);

  // Static lots (legacy image-xy)
  const staticLots = useMemo<Lot[]>(() => {
    if (developmentSlug === 'grand-haven') return grandHavenLots;
    if (developmentSlug === 'st-james-bay') return stJamesBayLots;
    if (developmentSlug === 'ypsilanti') return ypsilantiLots;
    return [];
  }, [developmentSlug]);

  // DB lots (UUID + GeoJSON when present)
  const { lots: dbLots } = useLotsBySlug(developmentSlug);
  const { developments: dbDevelopments } = useDevelopments();
  const dbDevelopment = useMemo<DbDevelopment | undefined>(
    () => dbDevelopments?.find((d) => d.slug === developmentSlug),
    [dbDevelopments, developmentSlug],
  );

  // Mode selector — auto-upgrades only when token + map_center + GeoJSON lots exist.
  const canUseMapbox = useMemo(() => {
    const hasToken = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);
    const hasCenter =
      typeof dbDevelopment?.map_center_lng === 'number' &&
      typeof dbDevelopment?.map_center_lat === 'number';
    const hasGeoJsonLots = dbLots.some(
      (l) => l.polygon_coordinates?.type === 'Polygon',
    );
    return hasToken && hasCenter && hasGeoJsonLots;
  }, [dbDevelopment, dbLots]);
  const mode: 'mapbox' | 'image' = canUseMapbox ? 'mapbox' : 'image';

  // Adapter (only meaningful in mapbox mode).
  const adapted = useMemo(
    () => (mode === 'mapbox' ? adaptDbLots(dbLots) : null),
    [mode, dbLots],
  );

  const lots: Lot[] = mode === 'mapbox' && adapted ? adapted.displayLots : staticLots;

  // Mapbox handler — translates DB lot into the display lot the panels expect.
  const handleMapboxSelect = useCallback(
    (dbLot: DbLot | null) => {
      if (!dbLot || !adapted) {
        setSelectedLot(null);
        return;
      }
      const numericId = adapted.uuidToNumericId.get(dbLot.id);
      const display = numericId != null ? adapted.displayLots.find((l) => l.id === numericId) : null;
      setSelectedLot(display ?? null);
      if (isMobile) setShowMobileList(false);
    },
    [adapted, isMobile],
  );

  const handleMapboxHover = useCallback(
    (uuid: string | null) => {
      if (!uuid || !adapted) {
        setHoveredLotId(null);
        return;
      }
      setHoveredLotId(adapted.uuidToNumericId.get(uuid) ?? null);
    },
    [adapted],
  );

  // Filter set (no filter UI yet — pass all DB ids).
  const filteredLotIds = useMemo(
    () => new Set(dbLots.map((l) => l.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbLots.map((l) => l.id).sort().join(',')],
  );

  if (!development) {
    return null;
  }

  const handleSelectLot = (lot: Lot | null) => {
    setSelectedLot(lot);
    if (isMobile) {
      setShowMobileList(false);
    }
  };

  const handleListSelectLot = (lot: Lot) => {
    setSelectedLot(lot);
    if (isMobile) {
      setShowMobileList(false);
    }
  };

  const availableLots = lots.filter(l => l.status === 'available').length;
  const reservedLots = lots.filter(l => l.status === 'reserved').length;
  const soldLots = lots.filter(l => l.status === 'sold').length;

  // Selected lot id translated back to UUID for Mapbox feature-state.
  const selectedUuid =
    mode === 'mapbox' && adapted && selectedLot
      ? [...adapted.uuidToNumericId.entries()].find(([, n]) => n === selectedLot.id)?.[0] ?? null
      : null;

  return (
    <div className={className}>
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 sm:gap-6 text-sm">
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
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMobileList(!showMobileList)}
            >
              <List className="h-4 w-4 mr-2" />
              Lot List
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/developments/${developmentSlug}/site-plan`}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Full Screen
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className={cn(
          'flex',
          isMobile ? 'flex-col' : 'flex-row'
        )}>
          {/* Site Plan Viewer */}
          <div 
            className={cn(
              'relative',
              isMobile ? 'w-full' : 'flex-1'
            )}
            style={{ 
              height: isMobile ? '50vh' : '65vh',
              minHeight: isMobile ? '350px' : '500px'
            }}
          >
            {mode === 'mapbox' && dbDevelopment ? (
              <MapboxLotPicker
                development={dbDevelopment}
                lots={dbLots}
                selectedLotId={selectedUuid}
                filteredLotIds={filteredLotIds}
                onSelectLot={handleMapboxSelect}
                onHoverLot={handleMapboxHover}
                className="h-full"
              />
            ) : (
              <FixedSitePlanViewer
                sitePlanImagePath={development.sitePlanImagePath}
                lots={lots}
                onSelectLot={handleSelectLot}
                selectedLotId={selectedLot?.id ?? null}
                hoveredLotId={hoveredLotId}
                onHoverLot={setHoveredLotId}
                className="h-full"
              />
            )}
            
            {/* Details Panel (overlay) */}
            {selectedLot && (
              <LotDetailsPanel
                lot={selectedLot}
                developmentSlug={development.slug}
                onClose={() => setSelectedLot(null)}
                isMobile={isMobile}
              />
            )}
          </div>

          {/* Lot List Panel - Desktop only */}
          {!isMobile && (
            <LotListPanel
              lots={lots}
              selectedLotId={selectedLot?.id ?? null}
              hoveredLotId={hoveredLotId}
              onSelectLot={handleListSelectLot}
              onHoverLot={setHoveredLotId}
              className="w-72 xl:w-80"
              style={{ height: '65vh', minHeight: '500px' }}
            />
          )}
        </div>

        {/* Mobile Lot List Sheet */}
        {isMobile && showMobileList && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl shadow-xl border-t border-border"
            style={{ height: '60vh' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setShowMobileList(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <LotListPanel
              lots={lots}
              selectedLotId={selectedLot?.id ?? null}
              hoveredLotId={hoveredLotId}
              onSelectLot={handleListSelectLot}
              onHoverLot={setHoveredLotId}
              className="h-full border-l-0"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Quick Action */}
      <div className="mt-4 flex justify-center">
        <Button asChild variant="link" className="text-accent">
          <Link to={`/contact?development=${developmentSlug}`}>
            Have questions about these lots?
          </Link>
        </Button>
      </div>
    </div>
  );
}
