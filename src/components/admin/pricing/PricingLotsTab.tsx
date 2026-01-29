import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriceEditCell } from './PriceEditCell';
import { toast } from 'sonner';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Development {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  status: string;
}

interface LotRow {
  id: string;
  lot_number: string;
  status: 'available' | 'reserved' | 'sold' | 'pending';
  acreage: number | null;
  net_acreage: number | null;
  premium: number;
  notes: string | null;
  development_id: string;
}

const statusColors = {
  available: 'bg-green-100 text-green-800 border-green-200',
  reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  sold: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusLabels = {
  available: '🟢 Available',
  reserved: '🟡 Reserved',
  sold: '🔴 Sold',
  pending: '🔵 Pending',
};

export function PricingLotsTab() {
  const [selectedDevelopment, setSelectedDevelopment] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch developments
  const { data: developments, isLoading: loadingDevelopments } = useQuery({
    queryKey: ['admin-developments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developments')
        .select('id, name, slug, city, state, status')
        .order('name');
      
      if (error) throw error;
      return data as Development[];
    },
  });

  // Fetch lots for selected development
  const { data: lots, isLoading: loadingLots, error: lotsError } = useQuery({
    queryKey: ['admin-lots', selectedDevelopment],
    queryFn: async () => {
      if (!selectedDevelopment) return [];
      
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .eq('development_id', selectedDevelopment)
        .order('lot_number');
      
      if (error) throw error;
      return data as LotRow[];
    },
    enabled: !!selectedDevelopment,
  });

  // Update lot premium
  const updatePremiumMutation = useMutation({
    mutationFn: async ({ id, premium }: { id: string; premium: number }) => {
      const { error } = await supabase
        .from('lots')
        .update({ premium })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lots', selectedDevelopment] });
      toast.success('Lot premium updated');
    },
    onError: () => {
      toast.error('Failed to update lot premium');
    },
  });

  // Update lot status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LotRow['status'] }) => {
      const { error } = await supabase
        .from('lots')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lots', selectedDevelopment] });
      toast.success('Lot status updated');
    },
    onError: () => {
      toast.error('Failed to update lot status');
    },
  });

  const selectedDev = developments?.find(d => d.id === selectedDevelopment);
  
  // Summary stats
  const lotStats = lots ? {
    total: lots.length,
    available: lots.filter(l => l.status === 'available').length,
    minPremium: Math.min(...lots.filter(l => l.premium > 0).map(l => l.premium)) || 0,
    maxPremium: Math.max(...lots.map(l => l.premium)) || 0,
  } : null;

  if (loadingDevelopments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasDevelopments = developments && developments.length > 0;

  return (
    <div className="space-y-6">
      {!hasDevelopments ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No communities found in the database. The app is currently using local fallback data from code files.
            To manage lots here, the developments and lots need to be seeded into the database.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Development selector */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle>Lot Inventory</CardTitle>
              </div>
              <CardDescription>
                Manage lot premiums and availability by community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-72">
                  <Select
                    value={selectedDevelopment || ''}
                    onValueChange={setSelectedDevelopment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a community..." />
                    </SelectTrigger>
                    <SelectContent>
                      {developments.map((dev) => (
                        <SelectItem key={dev.id} value={dev.id}>
                          {dev.name} ({dev.city}, {dev.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedDev && (
                  <Badge variant={selectedDev.status === 'active' ? 'default' : 'secondary'}>
                    {selectedDev.status}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lot summary stats */}
          {lotStats && lots && lots.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{lotStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Lots</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-600">{lotStats.available}</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">
                    {lotStats.minPremium > 0 ? `$${lotStats.minPremium.toLocaleString()}` : '$0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Min Premium</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">
                    ${lotStats.maxPremium.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Max Premium</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lots table */}
          {selectedDevelopment && (
            <Card>
              <CardContent className="pt-6">
                {loadingLots ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : lotsError ? (
                  <div className="text-center py-12 text-destructive">
                    Failed to load lots
                  </div>
                ) : lots && lots.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No lots found for this development
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lot #</TableHead>
                        <TableHead className="text-center">Acreage</TableHead>
                        <TableHead className="text-right">Premium</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lots?.map((lot) => (
                        <TableRow key={lot.id}>
                          <TableCell className="font-medium">{lot.lot_number}</TableCell>
                          <TableCell className="text-center">
                            {lot.acreage ? `${lot.acreage.toFixed(2)} ac` : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <PriceEditCell
                              value={lot.premium}
                              onSave={async (value) => {
                                await updatePremiumMutation.mutateAsync({ id: lot.id, premium: value });
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Select
                              value={lot.status}
                              onValueChange={(value) => {
                                updateStatusMutation.mutate({ id: lot.id, status: value as LotRow['status'] });
                              }}
                            >
                              <SelectTrigger className={`w-36 ${statusColors[lot.status]}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">{statusLabels.available}</SelectItem>
                                <SelectItem value="reserved">{statusLabels.reserved}</SelectItem>
                                <SelectItem value="pending">{statusLabels.pending}</SelectItem>
                                <SelectItem value="sold">{statusLabels.sold}</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                            {lot.notes || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
