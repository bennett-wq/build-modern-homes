import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScoreBadge } from '../shared/ScoreBadge';
import { ModelFitBadge } from '../shared/ModelFitBadge';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';
import { ActionBadge } from '../shared/ActionBadge';
import { PriceDisplay, PriceRangeDisplay } from '../shared/PriceDisplay';
import {
  getListingById,
  getModelFitsForListing,
  getAcquisitionScore,
  getZoningForMunicipality,
  type MockModelFit,
} from '@/data/homematch/mock-acquisition-data';
import { MapPin, Calendar, TrendingDown, Ruler, Home, DollarSign } from 'lucide-react';

interface AcquisitionDetailDrawerProps {
  listingId: string | null;
  open: boolean;
  onClose: () => void;
}

export function AcquisitionDetailDrawer({ listingId, open, onClose }: AcquisitionDetailDrawerProps) {
  if (!listingId) return null;

  const listing = getListingById(listingId);
  const score = getAcquisitionScore(listingId);
  const modelFits = getModelFitsForListing(listingId);
  const zoning = listing ? getZoningForMunicipality(listing.municipality) : undefined;

  if (!listing || !score) return null;

  const fittingModels = modelFits.filter(f => f.fit_status !== 'no_fit');
  const nonFittingModels = modelFits.filter(f => f.fit_status === 'no_fit');
  const priceDropPct = listing.original_list_price > listing.list_price
    ? ((listing.original_list_price - listing.list_price) / listing.original_list_price * 100).toFixed(0)
    : null;

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-lg">{listing.address}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {listing.city}, {listing.state} {listing.zip_code} — {listing.municipality}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{listing.mls_number}</p>
            </div>
            <ScoreBadge score={score.total_score} size="lg" />
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Lot Overview */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lot Overview
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Lot Size" value={`${listing.lot_acres} ac (${listing.lot_sqft.toLocaleString()} sqft)`} />
              <InfoRow label="Frontage" value={`${listing.frontage_ft} ft`} />
              <InfoRow label="Depth" value={`${listing.depth_ft} ft`} />
              <InfoRow label="Topography" value={listing.topography.replace('_', ' ')} />
              <InfoRow label="Water" value={listing.water} />
              <InfoRow label="Sewer" value={listing.sewer} />
              <InfoRow label="Gas" value={listing.gas} />
              <InfoRow label="Electric" value={listing.electric ? 'Yes' : 'No'} />
            </div>
          </section>

          <Separator />

          {/* MLS History */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              MLS History
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Status" value={listing.status.toUpperCase()} />
              <InfoRow label="Days on Market" value={`${listing.days_on_market} days`} />
              <InfoRow label="List Date" value={listing.list_date} />
              <InfoRow label="Expired/Withdrawn" value={listing.expiration_date} />
              <div className="col-span-2 flex items-center gap-4">
                <PriceDisplay amount={listing.list_price} label="Current Price" />
                {listing.list_price < listing.original_list_price && (
                  <>
                    <PriceDisplay amount={listing.original_list_price} label="Original Price" />
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">-{priceDropPct}%</span>
                    </div>
                  </>
                )}
              </div>
              <InfoRow label="Listing Agent" value={listing.listing_agent_name} />
              <InfoRow label="Office" value={listing.listing_office} />
              <InfoRow label="Co-op Commission" value={listing.coop_commission} />
            </div>
            {listing.description && (
              <p className="text-xs text-muted-foreground mt-2 italic">"{listing.description}"</p>
            )}
          </section>

          <Separator />

          {/* Score Breakdown */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Score Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              <ScoreDimension
                label="Seller Motivation"
                score={score.seller_motivation_score}
                maxScore={25}
                factors={[
                  `${listing.days_on_market} days on market`,
                  priceDropPct ? `${priceDropPct}% price reduction` : 'No price reduction',
                ]}
              />
              <ScoreDimension
                label="Lot Viability"
                score={score.lot_viability_score}
                maxScore={25}
                factors={[
                  `${fittingModels.length} models fit`,
                  `Zoning: ${zoning?.confidence || 'unknown'}`,
                  `Utilities: ${listing.water}`,
                ]}
              />
              <ScoreDimension
                label="Margin Potential"
                score={score.margin_potential_score}
                maxScore={25}
                factors={[
                  `Comp support: ${(score.score_factors.margin_potential as Record<string, unknown>).comp_support as string}`,
                ]}
              />
              <ScoreDimension
                label="Market Strength"
                score={score.market_strength_score}
                maxScore={25}
                factors={[
                  listing.municipality,
                  `Activity: ${(score.score_factors.market_strength as Record<string, unknown>).activity as string}`,
                ]}
              />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <ActionBadge action={score.recommended_action} />
              {score.recommended_offer && (
                <span className="text-sm">
                  Suggested offer: <span className="font-semibold">${score.recommended_offer.toLocaleString()}</span>
                </span>
              )}
            </div>
          </section>

          <Separator />

          {/* Zoning Verification */}
          {zoning && (
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Zoning Verification — {zoning.district_code} {zoning.district_name}
                <ConfidenceBadge confidence={zoning.confidence} />
              </h3>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-medium">Requirement</th>
                      <th className="text-right p-2 font-medium">Standard</th>
                      <th className="text-right p-2 font-medium">This Lot</th>
                      <th className="text-center p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ZoningRow
                      label="Min Lot Width"
                      standard={`${zoning.min_lot_width_ft} ft`}
                      actual={`${listing.frontage_ft} ft`}
                      passes={listing.frontage_ft >= zoning.min_lot_width_ft}
                    />
                    <ZoningRow
                      label="Min Lot Depth"
                      standard={`${zoning.min_lot_depth_ft} ft`}
                      actual={`${listing.depth_ft} ft`}
                      passes={listing.depth_ft >= zoning.min_lot_depth_ft}
                    />
                    <ZoningRow
                      label="Min Lot Area"
                      standard={`${zoning.min_lot_area_sqft.toLocaleString()} sqft`}
                      actual={`${listing.lot_sqft.toLocaleString()} sqft`}
                      passes={listing.lot_sqft >= zoning.min_lot_area_sqft}
                    />
                    <ZoningRow
                      label="Front Setback"
                      standard={`${zoning.front_setback_ft} ft`}
                      actual="—"
                      passes={true}
                      isSetback
                    />
                    <ZoningRow
                      label="Side Setback (each)"
                      standard={`${zoning.side_setback_ft} ft`}
                      actual="—"
                      passes={true}
                      isSetback
                    />
                    <ZoningRow
                      label="Rear Setback"
                      standard={`${zoning.rear_setback_ft} ft`}
                      actual="—"
                      passes={true}
                      isSetback
                    />
                    <ZoningRow
                      label="Max Coverage"
                      standard={`${zoning.max_lot_coverage_pct}%`}
                      actual="Per model"
                      passes={true}
                    />
                    <ZoningRow
                      label="Max Height"
                      standard={`${zoning.max_height_ft} ft`}
                      actual="All models comply"
                      passes={true}
                    />
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Buildable envelope: {(listing.frontage_ft - zoning.side_setback_ft * 2).toFixed(0)}ft wide x{' '}
                {(listing.depth_ft - zoning.front_setback_ft - zoning.rear_setback_ft).toFixed(0)}ft deep
              </p>
            </section>
          )}

          <Separator />

          {/* Model Fit Cards */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Model Fit Analysis
              <ModelFitBadge fittingCount={fittingModels.length} />
            </h3>
            <div className="space-y-2">
              {fittingModels.map(fit => (
                <FittingModelCard key={`${fit.model_slug}-${fit.build_type}`} fit={fit} />
              ))}
              {nonFittingModels.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    {nonFittingModels.length} models don't fit — click to view
                  </summary>
                  <div className="space-y-1 mt-2">
                    {nonFittingModels.map(fit => (
                      <NonFittingModelCard key={`${fit.model_slug}-${fit.build_type}`} fit={fit} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </section>

          <Separator />

          {/* Pricing */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Best Deal Economics
            </h3>
            {fittingModels[0] && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lot (asking)</span>
                      <span>${fittingModels[0].lot_price.toLocaleString()}</span>
                    </div>
                    {score.recommended_offer && (
                      <div className="flex justify-between text-green-700">
                        <span>Lot (suggested offer)</span>
                        <span>${score.recommended_offer.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Home ({fittingModels[0].model_name})</span>
                      <span>${fittingModels[0].home_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Site Work (est.)</span>
                      <span>${fittingModels[0].site_work_low.toLocaleString()} – ${fittingModels[0].site_work_high.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total Delivered</span>
                      <PriceRangeDisplay
                        low={fittingModels[0].total_delivered_low}
                        high={fittingModels[0].total_delivered_high}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Disclaimers */}
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Zoning information provided as reference. Verify with local municipality before purchase.
            Total delivered price is estimated. Final pricing confirmed after site evaluation.
            Lot listing data from MLS. Contact listing agent for current availability.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Sub-components ──────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium capitalize">{value}</p>
    </div>
  );
}

function ScoreDimension({
  label,
  score,
  maxScore,
  factors,
}: {
  label: string;
  score: number;
  maxScore: number;
  factors: string[];
}) {
  const pct = (score / maxScore) * 100;
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">{label}</span>
          <span className="text-xs font-bold">{score}/{maxScore}</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ul className="mt-1.5 space-y-0.5">
          {factors.map((f, i) => (
            <li key={i} className="text-[10px] text-muted-foreground">• {f}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ZoningRow({
  label,
  standard,
  actual,
  passes,
  isSetback,
}: {
  label: string;
  standard: string;
  actual: string;
  passes: boolean;
  isSetback?: boolean;
}) {
  return (
    <tr className="border-t">
      <td className="p-2 text-muted-foreground">{label}</td>
      <td className="p-2 text-right">{standard}</td>
      <td className="p-2 text-right">{actual}</td>
      <td className="p-2 text-center">
        {isSetback ? (
          <span className="text-xs text-muted-foreground">Applied</span>
        ) : passes ? (
          <span className="text-green-600">✅</span>
        ) : (
          <span className="text-red-600">❌</span>
        )}
      </td>
    </tr>
  );
}

function FittingModelCard({ fit }: { fit: MockModelFit }) {
  const badge = fit.fit_status === 'fits'
    ? { bg: 'bg-green-50 border-green-200', text: 'Fits' }
    : { bg: 'bg-yellow-50 border-yellow-200', text: 'Tight Fit' };

  return (
    <Card className={`${badge.bg} border`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-sm">{fit.model_name}</span>
            <Badge variant="outline" className="ml-2 text-[10px]">{fit.build_type.toUpperCase()}</Badge>
            <Badge variant="outline" className="ml-1 text-[10px]">{badge.text}</Badge>
          </div>
          <span className="text-sm font-bold">
            ${fit.total_delivered_low.toLocaleString()}
          </span>
        </div>
        <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
          <span>Width margin: {fit.width_margin_ft.toFixed(0)}ft</span>
          <span>Depth margin: {fit.depth_margin_ft.toFixed(0)}ft</span>
          <span>Coverage: {fit.coverage_pct.toFixed(1)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

function NonFittingModelCard({ fit }: { fit: MockModelFit }) {
  return (
    <div className="px-3 py-2 bg-muted/30 rounded text-xs text-muted-foreground flex justify-between">
      <span>
        {fit.model_name} <span className="text-[10px]">({fit.build_type.toUpperCase()})</span>
      </span>
      <span className="italic">{fit.fit_reason}</span>
    </div>
  );
}
