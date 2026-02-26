import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export interface AcquisitionFilterState {
  municipality: string;
  minScore: number;
  reviewStatus: string;
  recommendedAction: string;
  sortBy: string;
  searchQuery: string;
}

interface AcquisitionFiltersProps {
  filters: AcquisitionFilterState;
  onFilterChange: (filters: AcquisitionFilterState) => void;
  municipalities: string[];
}

export function AcquisitionFilters({ filters, onFilterChange, municipalities }: AcquisitionFiltersProps) {
  const update = (partial: Partial<AcquisitionFilterState>) =>
    onFilterChange({ ...filters, ...partial });

  const reset = () =>
    onFilterChange({
      municipality: 'all',
      minScore: 0,
      reviewStatus: 'all',
      recommendedAction: 'all',
      sortBy: 'score_desc',
      searchQuery: '',
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search address or MLS#..."
        value={filters.searchQuery}
        onChange={e => update({ searchQuery: e.target.value })}
        className="w-56"
      />

      <Select value={filters.municipality} onValueChange={v => update({ municipality: v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Municipality" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Municipalities</SelectItem>
          {municipalities.map(m => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(filters.minScore)} onValueChange={v => update({ minScore: Number(v) })}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Min Score" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Any Score</SelectItem>
          <SelectItem value="40">40+ (Monitor)</SelectItem>
          <SelectItem value="60">60+ (Contact)</SelectItem>
          <SelectItem value="80">80+ (Acquire)</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.reviewStatus} onValueChange={v => update({ reviewStatus: v })}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="unreviewed">Unreviewed</SelectItem>
          <SelectItem value="reviewing">Reviewing</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="passed">Passed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.recommendedAction} onValueChange={v => update({ recommendedAction: v })}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          <SelectItem value="acquire_direct">Acquire Direct</SelectItem>
          <SelectItem value="contact_seller">Contact Seller</SelectItem>
          <SelectItem value="monitor">Monitor</SelectItem>
          <SelectItem value="pass">Pass</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.sortBy} onValueChange={v => update({ sortBy: v })}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="score_desc">Score (High-Low)</SelectItem>
          <SelectItem value="score_asc">Score (Low-High)</SelectItem>
          <SelectItem value="price_asc">Price (Low-High)</SelectItem>
          <SelectItem value="price_desc">Price (High-Low)</SelectItem>
          <SelectItem value="dom_desc">Days on Market</SelectItem>
          <SelectItem value="margin_desc">Margin Potential</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
        <RotateCcw className="h-3.5 w-3.5 mr-1" />
        Reset
      </Button>
    </div>
  );
}
