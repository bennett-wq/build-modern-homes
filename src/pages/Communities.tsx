// Communities — map-led discovery shell.
// Premium proptech-style surface for selecting a BaseMod community before
// lot/model selection. Uses schematic regional map (not parcel-accurate); will
// upgrade to live Mapbox once verified coordinates / GeoJSON land.
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  Bell,
  Building2,
  Home,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FinancingBadge } from '@/components/financing/FinancingBadge';
import { AppraisalBadge } from '@/components/appraisal/AppraisalBadge';
import { developments, Development } from '@/data/developments';
import { useLotsBySlug } from '@/hooks/useLots';
import { CommunityMapPanel } from '@/components/communities/CommunityMapPanel';
import { cn } from '@/lib/utils';
import {
  buildHref as buildHrefHelper,
  sitePlanHref as sitePlanHrefHelper,
  communityDetailHref,
} from '@/lib/communityRoutes';
import { deriveDbInventory, type CommunityInventory } from '@/lib/communityInventory';

// Base all-in price (default Hawthorne XMOD) for community pricing calculation
const BASE_ALL_IN_PRICE = 253649;

interface CommunityMetrics extends CommunityInventory {
  startingAllIn: number | null;
}

function useCommunityMetrics(slug: string): { metrics: CommunityMetrics; isLoading: boolean } {
  const { lots, isLoading } = useLotsBySlug(slug);
  const metrics = useMemo<CommunityMetrics>(() => {
    const inv = deriveDbInventory(lots);
    // Prefer the Ready-Now entry price so "From $X all-in" reflects what's
    // buyable today, not cheaper future-phase inventory. Falls back to overall
    // available pricing for communities without explicit Ready-Now timing.
    const entryPremium = inv.startingReadyNowPremium ?? inv.startingPremium;
    return {
      ...inv,
      startingAllIn: entryPremium != null ? BASE_ALL_IN_PRICE + entryPremium : null,
    };
  }, [lots]);
  return { metrics, isLoading };
}

function statusLabel(status: Development['status']) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/15">
          Active
        </Badge>
      );
    case 'coming-soon':
      return (
        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
          Coming soon
        </Badge>
      );
    case 'sold-out':
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Sold out
        </Badge>
      );
    default:
      return null;
  }
}

// All community CTAs route through /preview/* while SHOW_COMMUNITIES=false so
// internal review can click the full buyer journey end-to-end. Centralized in
// src/lib/communityRoutes.ts; flip `preview: false` once the public surface
// is enabled.
const getCommunityBuildPath = (
  development?: Pick<Development, 'slug' | 'status'> | null,
) => buildHrefHelper(development ?? null, { preview: true });

const getCommunitySitePlanPath = (
  development?: Pick<Development, 'slug' | 'status'> | null,
) => sitePlanHrefHelper(development ?? null, { preview: true });

// Compact list-row for the rail.
function CommunityListItem({
  development,
  isSelected,
  onSelect,
}: {
  development: Development;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}) {
  const { metrics } = useCommunityMetrics(development.slug);
  const isActive = development.status === 'active';

  return (
    <button
      type="button"
      onClick={() => onSelect(development.slug)}
      aria-pressed={isSelected}
      className={cn(
        'w-full text-left rounded-lg border p-4 transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? 'border-accent bg-accent/5 shadow-sm'
          : 'border-border bg-background hover:border-accent/40 hover:bg-secondary/50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">
              {development.name}
            </h3>
            {statusLabel(development.status)}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {development.city}, {development.state}
          </p>
        </div>
      </div>

      {isActive && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {/* Lead with ready-now (buyable today); show total available across
              phases as secondary so we never present future-phase lots as
              ready-to-buy. */}
          {metrics.readyNowCount > 0 && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              {metrics.readyNowCount} ready now
            </span>
          )}
          <span>
            {metrics.availableCount} {metrics.availableCount === 1 ? 'lot' : 'lots'} total
          </span>
          {metrics.startingAllIn && (
            <span>From ${metrics.startingAllIn.toLocaleString()} all-in</span>
          )}
        </div>
      )}
    </button>
  );
}

// Detail panel for the currently selected community.
function CommunityDetail({ development }: { development: Development }) {
  const { metrics } = useCommunityMetrics(development.slug);
  const isActive = development.status === 'active';
  const hasImage = !!development.sitePlanImagePath;
  const buildPath = getCommunityBuildPath(development);
  const sitePlanPath = getCommunitySitePlanPath(development);
  const availableLotsCount = metrics.availableCount;

  return (
    <motion.div
      key={development.slug}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-border bg-background overflow-hidden"
    >
      <div className="relative aspect-[16/9] bg-muted">
        {hasImage ? (
          <img
            src={development.sitePlanImagePath}
            alt={`${development.name} site plan preview`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute right-3 top-3">{statusLabel(development.status)}</div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-accent" />
          {development.city}, {development.state}
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {development.name}
        </h2>
        {development.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {development.description}
          </p>
        )}

        {/* Metrics row */}
        {isActive && (
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-lg border border-border bg-secondary/40 p-3">
            <Metric label="Total lots" value={metrics.availableCount.toString()} />
            <Metric
              label="Ready now"
              value={metrics.readyNowCount > 0 ? metrics.readyNowCount.toString() : '—'}
            />
            <Metric
              label="From"
              value={metrics.startingAllIn ? `$${(metrics.startingAllIn / 1000).toFixed(0)}k` : '—'}
              hint="all-in"
            />
          </div>
        )}

        {/* CTAs */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {buildPath ? (
            <>
              <Button asChild className="flex-1">
                <a href={buildPath}>
                  <Home className="mr-2 h-4 w-4" />
                  Get all-in price
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to={communityDetailHref(development, { preview: true })}>View community</Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" className="flex-1">
              <Link to={communityDetailHref(development, { preview: true })}>
                <Bell className="mr-2 h-4 w-4" />
                Join interest list
              </Link>
            </Button>
          )}
        </div>

        {/* Secondary: lot-level deep link into existing site-plan route */}
        {sitePlanPath && (
          <div className="mt-3">
            <a
              key={`${development.slug}-siteplan`}
              href={sitePlanPath}
              data-testid="community-siteplan-link"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              Preview {metrics.readyNowCount > 0
                ? `${metrics.readyNowCount} ready-now`
                : `${availableLotsCount} available`}{' '}
              {availableLotsCount === 1 ? 'lot' : 'lots'}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* Future-incentives placeholder */}
        {isActive && (
          <p className="mt-4 flex items-start gap-2 rounded-md border border-dashed border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
            <span>Financing and incentive review comes next in your build flow.</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold text-foreground">
        {value}
        {hint && (
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">{hint}</span>
        )}
      </div>
    </div>
  );
}

export default function Communities() {
  const ordered = useMemo(() => {
    const rank = (s: Development['status']) =>
      s === 'active' ? 0 : s === 'coming-soon' ? 1 : 2;
    return [...developments].sort((a, b) => rank(a.status) - rank(b.status));
  }, []);

  const firstActive = ordered.find((d) => d.status === 'active') ?? ordered[0];
  const [selectedSlug, setSelectedSlug] = useState<string>(firstActive?.slug ?? '');
  const selected = ordered.find((d) => d.slug === selectedSlug) ?? firstActive;

  // Keep selection stable if the dataset changes.
  useEffect(() => {
    if (!ordered.find((d) => d.slug === selectedSlug) && firstActive) {
      setSelectedSlug(firstActive.slug);
    }
  }, [ordered, selectedSlug, firstActive]);

  const activeCount = ordered.filter((d) => d.status === 'active').length;

  const mapCommunities = useMemo(
    () =>
      ordered.map((d) => ({
        slug: d.slug,
        name: d.name,
        city: d.city,
        state: d.state,
        status: d.status,
      })),
    [ordered],
  );

  const isSelectedActive = selected?.status === 'active';
  const selectedBuildPath = getCommunityBuildPath(selected);
  const selectedSitePlanPath = getCommunitySitePlanPath(selected);

  // Smooth-scroll the mobile detail into view when selection changes via the rail.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 1024) return;
    const el = document.getElementById('community-detail-mobile');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedSlug]);

  return (
    <Layout>
      {/* Compact hero */}
      <section className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="hidden sm:flex items-center gap-2 text-accent mb-2">
                <Building2 size={18} />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Community discovery
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  Communities
                </h1>
                <Badge className="bg-accent/10 text-accent border-accent/20">
                  {activeCount} Active
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Choose a community to see available lots and your all-in price.
              </p>
            </div>
            <div className="hidden flex-col gap-1 text-right text-xs text-muted-foreground sm:flex">
              <FinancingBadge variant="inline" />
              <AppraisalBadge variant="inline" />
            </div>
          </div>
        </div>
      </section>

      {/* Discovery shell */}
      <section className="container mx-auto px-4 pt-6 pb-24 lg:px-8 lg:py-10 lg:pb-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Map panel — first on mobile, left on desktop */}
          <div className="order-1 lg:order-1 lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <CommunityMapPanel
                communities={mapCommunities}
                selectedSlug={selectedSlug}
                onSelect={setSelectedSlug}
                className="aspect-[16/10] lg:aspect-[5/4]"
              />
              {selected && (
                <div id="community-detail-mobile" className="mt-4 lg:hidden scroll-mt-20">
                  <CommunityDetail development={selected} />
                </div>
              )}
            </div>
          </div>

          {/* Rail — list + detail on desktop */}
          <div className="order-2 lg:order-2 lg:col-span-5">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between px-1">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  All communities
                </h2>
                <span className="text-xs text-muted-foreground">
                  {ordered.length} total
                </span>
              </div>
              <div className="space-y-2">
                {ordered.map((d) => (
                  <CommunityListItem
                    key={d.slug}
                    development={d}
                    isSelected={d.slug === selectedSlug}
                    onSelect={setSelectedSlug}
                  />
                ))}
              </div>
            </div>

            {selected && (
              <div className="mt-6 hidden lg:block">
                <CommunityDetail development={selected} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA for the selected active community */}
      {selected && isSelectedActive && selectedBuildPath && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
          <div className="container mx-auto flex flex-col gap-1.5 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-muted-foreground">
                  {selected.city}, {selected.state}
                </div>
                <div className="truncate text-sm font-semibold text-foreground">
                  {selected.name}
                </div>
              </div>
              <a
                key={selected.slug}
                href={selectedBuildPath}
                className={cn(buttonVariants({ size: 'sm' }), 'flex-shrink-0')}
                aria-label={`Get all-in price for ${selected.name}`}
                data-testid="selected-community-sticky-cta"
              >
                Get all-in price
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </div>
            {selectedSitePlanPath && (
              <a
                key={`${selected.slug}-sticky-siteplan`}
                href={selectedSitePlanPath}
                data-testid="selected-community-sticky-siteplan"
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-accent hover:underline"
              >
                View site plan →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Own-land CTA */}
      <section className="border-t border-border bg-primary py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <h2 className="text-2xl font-semibold text-primary-foreground sm:text-3xl">
            Have your own land?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/70 sm:text-base">
            Build a BaseMod home on your own property. Get a quote and we'll walk you
            through your options.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/build">
              Get a quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

