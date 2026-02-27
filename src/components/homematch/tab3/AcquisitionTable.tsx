import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScoreBadge } from '../shared/ScoreBadge';
import { ModelFitBadge } from '../shared/ModelFitBadge';
import { ActionBadge } from '../shared/ActionBadge';
import { PriceDisplay } from '../shared/PriceDisplay';
import type { MockMlsListing, MockAcquisitionScore, MockModelFit } from '@/hooks/useAcquisitionData';
import { getFittingModelsCountFromData } from '@/hooks/useAcquisitionData';

interface AcquisitionTableProps {
  listings: MockMlsListing[];
  scores: MockAcquisitionScore[];
  modelFits: MockModelFit[];
  onSelectListing: (listingId: string) => void;
  selectedListingId: string | null;
}

export function AcquisitionTable({ listings, scores, modelFits, onSelectListing, selectedListingId }: AcquisitionTableProps) {
  const getScore = (listingId: string) => scores.find(s => s.listing_id === listingId);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Score</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Municipality</TableHead>
            <TableHead className="text-right">List Price</TableHead>
            <TableHead className="text-right">DOM</TableHead>
            <TableHead>Models</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map(listing => {
            const score = getScore(listing.id);
            const fitsCount = getFittingModelsCountFromData(modelFits, listing.id);
            if (!score) return null;

            return (
              <TableRow
                key={listing.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedListingId === listing.id ? 'bg-muted' : ''
                }`}
                onClick={() => onSelectListing(listing.id)}
              >
                <TableCell>
                  <ScoreBadge score={score.total_score} size="sm" />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{listing.address}</span>
                    <span className="text-xs text-muted-foreground">{listing.mls_number}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{listing.municipality}</span>
                </TableCell>
                <TableCell className="text-right">
                  <PriceDisplay amount={listing.list_price} size="sm" />
                  {listing.list_price < listing.original_list_price && (
                    <span className="text-xs text-red-500 line-through block">
                      ${(listing.original_list_price / 1000).toFixed(0)}K
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-medium">{listing.days_on_market}</span>
                </TableCell>
                <TableCell>
                  <ModelFitBadge fittingCount={fitsCount} />
                </TableCell>
                <TableCell>
                  <ActionBadge action={score.recommended_action} />
                </TableCell>
                <TableCell>
                  <StatusDot status={score.review_status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    unreviewed: { color: 'bg-gray-400', label: 'Unreviewed' },
    reviewing: { color: 'bg-blue-500', label: 'Reviewing' },
    approved: { color: 'bg-green-500', label: 'Approved' },
    passed: { color: 'bg-gray-300', label: 'Passed' },
    acquired: { color: 'bg-purple-500', label: 'Acquired' },
  };
  const c = config[status] || config.unreviewed;

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${c.color}`} />
      <span className="text-xs text-muted-foreground">{c.label}</span>
    </div>
  );
}
