// ============================================================================
// Selections (/selections and /selections/:quoteId)
// ----------------------------------------------------------------------------
// POST-QUOTE, quote-linked review experience. This is NOT part of the
// conversion funnel and must never sit before or inside it:
//
//   - /selections/:quoteId loads a SAVED quote snapshot (getQuoteRequestById)
//     and lets the buyer review + request a final-quote review. It never
//     creates a quote from blank data.
//   - /selections with no quoteId is NOT a conversion step. It shows a gentle
//     "start with a quote" empty state that points back into the funnel.
//
// Pricing here is the budgetary snapshot captured at quote time — clearly
// "not a final bid." No live store reads, no Mapbox dependency.
// ============================================================================

import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Palette,
  Layers,
  ArrowLeft,
  ArrowRight,
  Pencil,
  Check,
  ClipboardList,
  MapPin,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BuyerPricingDisplay, type BuyerPricingFlags } from '@/components/pricing/BuyerPricingDisplay';
import { getQuoteRequestById, type QuoteRequest } from '@/types/quote-request';
import { getPricingModeLabel } from '@/lib/pricing-mode-utils';
import { SHOW_COMMUNITIES } from '@/config/featureFlags';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function buildTypeLabel(buildType?: string): string | null {
  if (buildType === 'xmod') return 'CrossMod®';
  if (buildType === 'mod') return 'Modular';
  return buildType ? buildType.toUpperCase() : null;
}

function SelectionRow({ label, value, pending }: { label: string; value: string; pending?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={
          pending
            ? 'text-sm text-right text-muted-foreground italic'
            : 'text-sm font-medium text-right text-foreground'
        }
      >
        {value}
      </span>
    </div>
  );
}

// Gentle, non-conversion empty state for /selections (no quote id).
function SelectionsEmptyState() {
  return (
    <Layout>
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="max-w-xl">
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 mb-4">
            Selections
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-3">
            Your selections live with your quote
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Once you request a quote, you'll get a link to review and finalize your selections here —
            model, exterior, upgrades, and a preliminary estimate, all in one place. Start a build to
            get your quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg">
              <Link to="/build">
                Start your build
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function SelectionsNotFound() {
  return (
    <Layout>
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="max-w-lg text-center mx-auto">
          <AlertCircle className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground mb-2">Selections not found</h1>
          <p className="text-muted-foreground mb-6">
            This selections link may have expired or is invalid. Saved quotes live on this device.
          </p>
          <Button asChild>
            <Link to="/build">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start a build
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

function SavedSelections({ quote }: { quote: QuoteRequest }) {
  const sel = quote.selection;
  const breakdown = quote.buyerFacingBreakdown;
  const upgrades = breakdown?.optionDetails ?? [];
  const modelName = sel.modelName ?? null;
  const typeLabel = buildTypeLabel(sel.buildType);

  // Community-backed quotes return to the community build flow; otherwise /build.
  // Public route only when communities are live, else the preview route.
  const editHref = quote.communityDetails?.developmentSlug
    ? `${SHOW_COMMUNITIES ? '/developments' : '/preview/developments'}/${quote.communityDetails.developmentSlug}/build`
    : '/build';

  const pricingFlags: BuyerPricingFlags = quote.pricingFlags || {
    freightPending: false,
    basementSelectedRequiresQuote: false,
    estimateConfidence: 'medium',
    hasPricing: !!breakdown,
    pricingMode: quote.pricingMode,
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-secondary py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground hover:text-foreground">
            <Link to={editHref}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to build
            </Link>
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-accent mb-2">
                <ClipboardList size={18} />
                <span className="text-xs font-medium uppercase tracking-wider">Your selections</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                {modelName ? `The ${modelName}` : 'Your build'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Quote #{quote.id} · {getPricingModeLabel(quote.pricingMode)}
              </p>
            </div>
            <Badge variant="outline" className="self-start sm:self-auto">Preliminary</Badge>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {(sel.developmentName || sel.lotLabel) && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      Community &amp; lot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-border">
                    {sel.developmentName && <SelectionRow label="Community" value={sel.developmentName} />}
                    {sel.lotLabel && <SelectionRow label="Lot" value={sel.lotLabel} />}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="h-5 w-5 text-primary" />
                  Home &amp; build
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <SelectionRow label="Model" value={modelName ?? 'Not selected'} pending={!modelName} />
                <SelectionRow label="Build type" value={typeLabel ?? 'Not selected'} pending={!typeLabel} />
                <SelectionRow label="Service" value={getPricingModeLabel(quote.pricingMode)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-primary" />
                  Exterior
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <SelectionRow
                  label="Exterior package"
                  value={sel.packageName ?? (sel.packageId ? 'Selected · confirmed in your final quote' : 'Not selected')}
                  pending={!!sel.packageId && !sel.packageName}
                />
                <SelectionRow
                  label="Garage door"
                  value={sel.garageDoorName ?? (sel.garageDoorId ? 'Selected · confirmed in your final quote' : 'Not selected')}
                  pending={!!sel.garageDoorId && !sel.garageDoorName}
                />
                <p className="pt-3 text-xs text-muted-foreground">
                  Some exterior options vary by plan/series. Final availability confirmed in your formal quote.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="h-5 w-5 text-primary" />
                  Upgrades &amp; add-ons
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upgrades.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {upgrades.map((opt, i) => (
                      <li key={`${opt.name}-${i}`} className="flex items-center justify-between gap-4 py-2">
                        <span className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="h-3.5 w-3.5 text-accent" />
                          {opt.name}
                        </span>
                        <span className="text-sm font-medium text-foreground">{formatPrice(opt.price)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No upgrades selected.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pricing + actions */}
          <div className="space-y-6">
            {breakdown ? (
              <BuyerPricingDisplay breakdown={breakdown} flags={pricingFlags} variant="full" />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-1">Pricing pending</h3>
                  <p className="text-sm text-muted-foreground">
                    A detailed estimate will be provided during your consultation.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-5 space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link to="/contact">
                    <Building2 className="mr-2 h-4 w-4" />
                    Request final-quote review
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to={editHref}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit selections
                  </Link>
                </Button>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  This is a preliminary, budgetary snapshot captured with your quote — not a contract or
                  final bid. Final pricing and option availability are confirmed in a written quote after
                  site and source review.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default function Selections() {
  const { quoteId } = useParams<{ quoteId?: string }>();

  if (!quoteId) {
    return <SelectionsEmptyState />;
  }

  const quote = getQuoteRequestById(quoteId);
  if (!quote) {
    return <SelectionsNotFound />;
  }

  return <SavedSelections quote={quote} />;
}
