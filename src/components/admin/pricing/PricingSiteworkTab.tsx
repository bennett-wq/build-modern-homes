import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceEditCell } from './PriceEditCell';
import { toast } from 'sonner';
import { Loader2, Wrench, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PricingZone {
  id: string;
  name: string;
  slug: string;
  baseline_total: number;
  on_site_portion: number;
  home_set_cost: number;
  crane_cost: number;
  contingency_buffer: number;
  permits_soft_costs: number;
  utility_authority_fees: number;
}

export function PricingSiteworkTab() {
  const queryClient = useQueryClient();

  const { data: zones, isLoading, error } = useQuery({
    queryKey: ['admin-pricing-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_zones')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as PricingZone[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: number }) => {
      const { error } = await supabase
        .from('pricing_zones')
        .update({ [field]: value })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-zones'] });
      toast.success('Sitework cost updated');
    },
    onError: () => {
      toast.error('Failed to update sitework cost');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Failed to load sitework data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle>Sitework Cost Zones</CardTitle>
          </div>
          <CardDescription>
            Regional baseline costs for site preparation and installation. These are applied with a 20% installer markup and 10% contingency buffer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {zones && zones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No pricing zones configured. Add a zone to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 ml-auto">
                          On-Site Work
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Foundation, utilities, grading, and site preparation costs</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-right">Home Set</TableHead>
                  <TableHead className="text-right">Crane</TableHead>
                  <TableHead className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 ml-auto">
                          Baseline Total
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Sum of on-site, home set, and crane costs before markups</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-right">Buffer</TableHead>
                  <TableHead className="text-right">Permits</TableHead>
                  <TableHead className="text-right">Utility Fees</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones?.map((zone) => {
                  const bufferAmount = zone.baseline_total * zone.contingency_buffer;
                  return (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell className="text-right">
                        <PriceEditCell
                          value={zone.on_site_portion}
                          onSave={async (value) => {
                            await updateMutation.mutateAsync({ id: zone.id, field: 'on_site_portion', value });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <PriceEditCell
                          value={zone.home_set_cost}
                          onSave={async (value) => {
                            await updateMutation.mutateAsync({ id: zone.id, field: 'home_set_cost', value });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <PriceEditCell
                          value={zone.crane_cost}
                          onSave={async (value) => {
                            await updateMutation.mutateAsync({ id: zone.id, field: 'crane_cost', value });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <PriceEditCell
                          value={zone.baseline_total}
                          onSave={async (value) => {
                            await updateMutation.mutateAsync({ id: zone.id, field: 'baseline_total', value });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {(zone.contingency_buffer * 100).toFixed(0)}% (${bufferAmount.toLocaleString()})
                      </TableCell>
                      <TableCell className="text-right">
                        <PriceEditCell
                          value={zone.permits_soft_costs}
                          onSave={async (value) => {
                            await updateMutation.mutateAsync({ id: zone.id, field: 'permits_soft_costs', value });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <PriceEditCell
                          value={zone.utility_authority_fees}
                          onSave={async (value) => {
                            await updateMutation.mutateAsync({ id: zone.id, field: 'utility_authority_fees', value });
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Formula explanation */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Sitework Allowance Formula</CardTitle>
          <CardDescription>
            How sitework costs are calculated for buyer estimates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="bg-background rounded-lg px-3 py-2 border">
              <span className="text-muted-foreground">Baseline</span>
            </div>
            <span>+</span>
            <div className="bg-background rounded-lg px-3 py-2 border">
              <span className="text-muted-foreground">10% Buffer</span>
            </div>
            <span>=</span>
            <div className="bg-background rounded-lg px-3 py-2 border">
              <span className="font-medium">Adjusted Total</span>
            </div>
            <span>×</span>
            <div className="bg-background rounded-lg px-3 py-2 border">
              <span className="text-muted-foreground">1.20</span>
            </div>
            <span>=</span>
            <div className="bg-background rounded-lg px-3 py-2 border border-primary">
              <span className="font-medium text-primary">Sitework Allowance</span>
            </div>
          </div>
          {zones && zones[0] && (
            <div className="text-sm text-muted-foreground">
              Example ({zones[0].name}): ${zones[0].baseline_total.toLocaleString()} + 10% = ${(zones[0].baseline_total * 1.1).toLocaleString()} × 1.20 = 
              <span className="font-medium text-foreground ml-1">
                ${Math.round(zones[0].baseline_total * 1.1 * 1.2).toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
