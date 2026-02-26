import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminShell } from '@/components/admin/AdminShell';
import { AcquisitionStats } from '@/components/homematch/tab3/AcquisitionStats';
import { AcquisitionFilters, type AcquisitionFilterState } from '@/components/homematch/tab3/AcquisitionFilters';
import { AcquisitionTable } from '@/components/homematch/tab3/AcquisitionTable';
import { AcquisitionDetailDrawer } from '@/components/homematch/tab3/AcquisitionDetailDrawer';
import { mockListings, mockAcquisitionScores } from '@/data/homematch/mock-acquisition-data';
import { Badge } from '@/components/ui/badge';
import { Loader2, Target } from 'lucide-react';

const MUNICIPALITIES = [...new Set(mockListings.map(l => l.municipality))].sort();

export default function AdminAcquisition() {
  const navigate = useNavigate();
  const { user, isAdmin, hasAccess, isLoading: authLoading, signOut } = useAdminAuth();

  const [filters, setFilters] = useState<AcquisitionFilterState>({
    municipality: 'all',
    minScore: 0,
    reviewStatus: 'all',
    recommendedAction: 'all',
    sortBy: 'score_desc',
    searchQuery: '',
  });

  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!authLoading && (!user || !hasAccess)) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, hasAccess, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  // Filter and sort listings
  const filteredData = useMemo(() => {
    let listings = [...mockListings];
    let scores = [...mockAcquisitionScores];

    // Filter by municipality
    if (filters.municipality !== 'all') {
      listings = listings.filter(l => l.municipality === filters.municipality);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      listings = listings.filter(
        l => l.address.toLowerCase().includes(q) || l.mls_number.toLowerCase().includes(q)
      );
    }

    // Filter scores to match remaining listings
    const listingIds = new Set(listings.map(l => l.id));
    scores = scores.filter(s => listingIds.has(s.listing_id));

    // Filter by min score
    if (filters.minScore > 0) {
      scores = scores.filter(s => s.total_score >= filters.minScore);
      const scoredIds = new Set(scores.map(s => s.listing_id));
      listings = listings.filter(l => scoredIds.has(l.id));
    }

    // Filter by review status
    if (filters.reviewStatus !== 'all') {
      scores = scores.filter(s => s.review_status === filters.reviewStatus);
      const scoredIds = new Set(scores.map(s => s.listing_id));
      listings = listings.filter(l => scoredIds.has(l.id));
    }

    // Filter by recommended action
    if (filters.recommendedAction !== 'all') {
      scores = scores.filter(s => s.recommended_action === filters.recommendedAction);
      const scoredIds = new Set(scores.map(s => s.listing_id));
      listings = listings.filter(l => scoredIds.has(l.id));
    }

    // Sort
    const getScore = (id: string) => scores.find(s => s.listing_id === id);
    switch (filters.sortBy) {
      case 'score_desc':
        listings.sort((a, b) => (getScore(b.id)?.total_score || 0) - (getScore(a.id)?.total_score || 0));
        break;
      case 'score_asc':
        listings.sort((a, b) => (getScore(a.id)?.total_score || 0) - (getScore(b.id)?.total_score || 0));
        break;
      case 'price_asc':
        listings.sort((a, b) => a.list_price - b.list_price);
        break;
      case 'price_desc':
        listings.sort((a, b) => b.list_price - a.list_price);
        break;
      case 'dom_desc':
        listings.sort((a, b) => b.days_on_market - a.days_on_market);
        break;
      case 'margin_desc':
        listings.sort(
          (a, b) => (getScore(b.id)?.margin_potential_score || 0) - (getScore(a.id)?.margin_potential_score || 0)
        );
        break;
    }

    return { listings, scores };
  }, [filters]);

  const handleSelectListing = (listingId: string) => {
    setSelectedListingId(listingId);
    setDrawerOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  return (
    <AdminShell
      title="Acquisition Intelligence"
      description="Expired and withdrawn vacant land — scored for acquisition opportunity"
      icon={<Target className="h-5 w-5 text-primary" />}
      user={user}
      isAdmin={isAdmin}
      onSignOut={handleSignOut}
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">Tab 3</Badge>
          <Badge variant="outline" className="text-xs">Mock Data</Badge>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1400px]">
        {/* Stats */}
        <AcquisitionStats listings={filteredData.listings} scores={filteredData.scores} />

        {/* Filters */}
        <AcquisitionFilters
          filters={filters}
          onFilterChange={setFilters}
          municipalities={MUNICIPALITIES}
        />

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredData.listings.length} of {mockListings.length} opportunities
        </p>

        {/* Table */}
        <AcquisitionTable
          listings={filteredData.listings}
          scores={filteredData.scores}
          onSelectListing={handleSelectListing}
          selectedListingId={selectedListingId}
        />

        {/* Detail Drawer */}
        <AcquisitionDetailDrawer
          listingId={selectedListingId}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </AdminShell>
  );
}
