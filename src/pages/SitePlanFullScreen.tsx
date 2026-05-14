import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bell, MapPin } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FixedSitePlanViewer } from '@/components/siteplan/FixedSitePlanViewer';
import { FixedSitePlanEditor } from '@/components/siteplan/FixedSitePlanEditor';
import { LotListPanel } from '@/components/siteplan/LotListPanel';
import { LotDetailsPanel } from '@/components/siteplan/LotDetailsPanel';
import { MapboxLotPicker } from '@/components/siteplan/MapboxLotPicker';
import { adaptDbLots } from '@/components/siteplan/lot-adapter';
import { getDevelopmentBySlug } from '@/data/developments';
import { grandHavenLots, grandHavenPhases, Lot } from '@/data/lots/grand-haven';
import { stJamesBayLots } from '@/data/lots/st-james-bay';
import { ypsilantiLots } from '@/data/lots/ypsilanti';
import { useLotsBySlug } from '@/hooks/useLots';
import { useDevelopments } from '@/hooks/useDevelopments';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { isPreviewPath, communitiesHref as communitiesHrefHelper, buildHref } from '@/lib/communityRoutes';
import { deriveStaticInventory } from '@/lib/communityInventory';
import type { Development as DbDevelopment, Lot as DbLot } from '@/types/database';

// Slugs with both an active development AND existing static lot data.
// Mirror src/data/lots/*.ts; adding a new lots file requires updating this map.
const LOTS_BY_SLUG: Record<string, Lot[]> = {
  'grand-haven': grandHavenLots,
  'st-james-bay': stJamesBayLots,
  ypsilanti: ypsilantiLots,
};

export default function SitePlanFullScreen() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isPreview = isPreviewPath(location.pathname);
  const routePrefix = isPreview ? '/preview/developments' : '/developments';
  const communitiesHref = communitiesHrefHelper({ preview: isPreview });
  const isEditMode = searchParams.get('edit') === '1';
  const isMobile = useIsMobile();

  const development = getDevelopmentBySlug(slug);
  const initialLots = useMemo<Lot[] | null>(
    () => (slug in LOTS_BY_SLUG ? LOTS_BY_SLUG[slug] : null),
    [slug],
  );

  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [hoveredLotId, setHoveredLotId] = useState<number | null>(null);
  const [staticLots, setStaticLots] = useState<Lot[]>(initialLots ?? []);
  // Grand Haven is the only slug with phased product structure today.
  // Default to Phase 1 (current/ready-now) so the existing Lot 15 build flow
  // is untouched. Phase 2 is the 22-lot future concept and renders a
  // coming-soon panel instead of mixed inventory.
  const isGrandHaven = slug === 'grand-haven';
  const [activePhase, setActivePhase] = useState<number>(1);

  // ---- Mapbox MVP gate (mirrors InteractiveSitePlan): token + map_center + GeoJSON lots ----
  const { lots: dbLots } = useLotsBySlug(slug);
  const { developments: dbDevelopments } = useDevelopments();
  const dbDevelopment = useMemo<DbDevelopment | undefined>(
    () => dbDevelopments?.find((d) => d.slug === slug),
    [dbDevelopments, slug],
  );
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
  const adapted = useMemo(
    () => (canUseMapbox ? adaptDbLots(dbLots) : null),
    [canUseMapbox, dbLots],
  );
  const allLots: Lot[] = canUseMapbox && adapted ? adapted.displayLots : staticLots;
  // For Grand Haven, only show lots whose phase matches the active phase tab.
  // Lots without a phase value default to Phase 1 to preserve historical
  // behavior. For all other slugs, no filtering — every lot renders.
  const lots: Lot[] = isGrandHaven
    ? allLots.filter((l) => (l.phase ?? 1) === activePhase)
    : allLots;

  useEffect(() => {
    setSelectedLot((current) => {
      if (!current) return current;
      return lots.find((lot) => lot.id === current.id) ?? current;
    });
  }, [lots]);

  // Unknown development OR no static lots → friendly unavailable state.
  // Coming-soon communities (ann-arbor, chicago) intentionally land here:
  // no fake lots, no build CTA, just an interest-list path back to /preview/communities.
  if (!development || !initialLots || development.status !== 'active') {
    return (
      <Layout>
        <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <Link
            to={communitiesHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Communities
          </Link>
          <div className="max-w-xl">
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 mb-4">
              {development?.status === 'coming-soon' ? 'Coming soon' : 'Site plan unavailable'}
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-3">
              {development?.name ?? 'Community'} site plan isn’t live yet
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {development
                ? `We’re still finalizing lot data for ${development.name}, ${development.city}, ${development.state}. Join the interest list and we’ll send the parcel map and pricing the moment it’s ready.`
                : 'This community doesn’t have a published site plan yet.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link to={`/contact?development=${slug || 'general'}`}>
                  <Bell className="h-4 w-4 mr-2" />
                  Join interest list
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={communitiesHref}>Browse other communities</Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const handleSelectLot = useCallback((lot: Lot | null) => setSelectedLot(lot), []);
  const handleListSelectLot = useCallback((lot: Lot) => setSelectedLot(lot), []);

  // Editor Mode (admin-only deep link).
  if (isEditMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`${routePrefix}/${slug}/site-plan`} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-foreground">Site Plan Editor</h1>
              <p className="text-sm text-muted-foreground">{development.name} — Click to add polygon points</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`${routePrefix}/${slug}/site-plan`}>Exit Editor</Link>
          </Button>
        </div>

        <FixedSitePlanEditor
          sitePlanImagePath={development.sitePlanImagePath}
          initialLots={staticLots}
          onLotsChange={setStaticLots}
          className="flex-1"
        />
      </div>
    );
  }

  // Buyer-facing metrics (counts only — no fabricated price math).
  // Ready Now rule lives in src/lib/communityInventory.ts; never inferred
  // from status: 'available'.
  const inventory = deriveStaticInventory(lots);
  const availableCount = inventory.availableCount;
  const readyNowCount = inventory.readyNowCount;
  const selectedLotId =
    selectedLot && selectedLot.status !== 'sold' ? String(selectedLot.id) : null;
  const selectedBuildPath =
    buildHref(development, {
      preview: isPreview,
      lot: selectedLotId,
    }) ?? `${routePrefix}/${slug}/build`;

  return (
    <Layout>
      {/* Buyer-grade header — continuation from /preview/communities */}
      <section className="bg-secondary py-8 lg:py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <Link
            to={communitiesHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Communities
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/15">
                  Active
                </Badge>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {development.city}, {development.state}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
                {development.name}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Tap a lot on the plan or pick from the list to see acreage, phase, and any
                homesite premium. Then carry your selection into the build flow.
              </p>
              <dl className="flex flex-wrap gap-x-8 gap-y-3 mt-5">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Available</dt>
                  <dd className="text-xl font-semibold text-foreground">{availableCount}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Ready now</dt>
                  <dd className="text-xl font-semibold text-foreground">{readyNowCount}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Total lots</dt>
                  <dd className="text-xl font-semibold text-foreground">{lots.length}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <Button asChild size="lg">
                <a href={selectedBuildPath}>
                  Start your build
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={`${routePrefix}/${slug}`}>Community details</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          {isGrandHaven && (
            <div
              role="tablist"
              aria-label="Grand Haven phases"
              className="mb-4 flex flex-wrap gap-2"
            >
              {grandHavenPhases.map((p) => {
                const active = p.id === activePhase;
                return (
                  <button
                    key={p.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setActivePhase(p.id);
                      setSelectedLot(null);
                    }}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors',
                      active
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card text-foreground border-border hover:bg-secondary',
                    )}
                  >
                    <span className="font-medium">{p.label}</span>
                    <span className="text-xs opacity-80">· {p.availability}</span>
                  </button>
                );
              })}
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className={cn('flex', isMobile ? 'flex-col' : 'flex-row')}>
              <div
                className={cn('relative', isMobile ? 'w-full' : 'flex-1')}
                style={{ height: isMobile ? '60vh' : '75vh' }}
              >
                {canUseMapbox && dbDevelopment && adapted ? (
                  <MapboxLotPicker
                    development={dbDevelopment}
                    lots={dbLots}
                    selectedLotId={
                      selectedLot
                        ? [...adapted.uuidToNumericId.entries()].find(
                            ([, n]) => n === selectedLot.id,
                          )?.[0] ?? null
                        : null
                    }
                    filteredLotIds={new Set(dbLots.map((l) => l.id))}
                    onSelectLot={(dbLot: DbLot | null) => {
                      if (!dbLot) return setSelectedLot(null);
                      const numericId = adapted.uuidToNumericId.get(dbLot.id);
                      const display =
                        numericId != null
                          ? adapted.displayLots.find((l) => l.id === numericId)
                          : null;
                      setSelectedLot(display ?? null);
                    }}
                    onHoverLot={(uuid) => {
                      if (!uuid) return setHoveredLotId(null);
                      setHoveredLotId(adapted.uuidToNumericId.get(uuid) ?? null);
                    }}
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

                {selectedLot && (
                  <LotDetailsPanel
                    key={`lot-panel-${selectedBuildPath}`}
                    lot={selectedLot}
                    developmentSlug={development.slug}
                    onClose={() => setSelectedLot(null)}
                    isMobile={isMobile}
                    buildHref={selectedBuildPath}
                  />
                )}
              </div>

              {!isMobile && (
                <LotListPanel
                  lots={lots}
                  selectedLotId={selectedLot?.id ?? null}
                  hoveredLotId={hoveredLotId}
                  onSelectLot={handleListSelectLot}
                  onHoverLot={setHoveredLotId}
                  className="w-72 xl:w-80"
                  style={{ height: '75vh' }}
                />
              )}
            </div>

            {isMobile && (
              <LotListPanel
                lots={lots}
                selectedLotId={selectedLot?.id ?? null}
                hoveredLotId={hoveredLotId}
                onSelectLot={handleListSelectLot}
                onHoverLot={setHoveredLotId}
                className="border-l-0 border-t"
                style={{ height: '40vh' }}
              />
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              About {development.name} Lots
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {development.name} features {lots.length} carefully planned lots, each with unique
              characteristics. When you’re ready, carry your selection into the build flow to see
              your model, package, and all-in price.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href={selectedBuildPath}>
                  Start your build
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to={`/contact?development=${slug}`}>Schedule a site visit</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA — always derives from current slug; lot-aware label */}
      {isMobile && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button asChild className="w-full" size="lg">
            <a href={selectedBuildPath}>
              {selectedLot ? `Build on Lot ${selectedLot.label}` : 'Start your build'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      )}
      {isMobile && <div aria-hidden className="h-20" />}
    </Layout>
  );
}
