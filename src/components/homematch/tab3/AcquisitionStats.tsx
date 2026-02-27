import { Card, CardContent } from '@/components/ui/card';
import type { MockAcquisitionScore, MockMlsListing } from '@/hooks/useAcquisitionData';

interface AcquisitionStatsProps {
  listings: MockMlsListing[];
  scores: MockAcquisitionScore[];
}

export function AcquisitionStats({ listings, scores }: AcquisitionStatsProps) {
  const totalOpportunities = scores.length;
  const avgScore = scores.length
    ? Math.round(scores.reduce((sum, s) => sum + s.total_score, 0) / scores.length)
    : 0;

  const acquireCount = scores.filter(s => s.recommended_action === 'acquire_direct').length;

  // Top municipality by score
  const municipalityCounts: Record<string, { count: number; totalScore: number }> = {};
  scores.forEach(score => {
    const listing = listings.find(l => l.id === score.listing_id);
    if (!listing) return;
    if (!municipalityCounts[listing.municipality]) {
      municipalityCounts[listing.municipality] = { count: 0, totalScore: 0 };
    }
    municipalityCounts[listing.municipality].count++;
    municipalityCounts[listing.municipality].totalScore += score.total_score;
  });
  const topMunicipality = Object.entries(municipalityCounts)
    .sort(([, a], [, b]) => (b.totalScore / b.count) - (a.totalScore / a.count))[0];

  // Estimated pipeline value (sum of recommended offers)
  const pipelineValue = scores
    .filter(s => s.recommended_offer)
    .reduce((sum, s) => sum + (s.recommended_offer || 0), 0);

  const stats = [
    {
      label: 'Total Opportunities',
      value: totalOpportunities.toString(),
      subtext: `${acquireCount} recommended to acquire`,
    },
    {
      label: 'Avg Score',
      value: avgScore.toString(),
      subtext: avgScore >= 60 ? 'Above threshold' : 'Below threshold',
    },
    {
      label: 'Top Municipality',
      value: topMunicipality ? topMunicipality[0].split(' ')[0] : '—',
      subtext: topMunicipality ? `${topMunicipality[1].count} lots, avg ${Math.round(topMunicipality[1].totalScore / topMunicipality[1].count)} score` : '',
    },
    {
      label: 'Est. Pipeline Value',
      value: pipelineValue > 0
        ? `$${(pipelineValue / 1000).toFixed(0)}K`
        : '—',
      subtext: `${scores.filter(s => s.recommended_offer).length} actionable lots`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
