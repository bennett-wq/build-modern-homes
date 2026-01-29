import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceEditCell } from './PriceEditCell';
import { toast } from 'sonner';
import { Loader2, Home, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ModelPricingRow {
  id: string;
  model_id: string;
  model_name: string;
  model_slug: string;
  beds: number;
  baths: number;
  sqft: number;
  build_type: 'xmod' | 'mod';
  foundation_type: string;
  base_home_price: number;
  quote_number: string | null;
  quote_date: string | null;
  effective_from: string;
}

export function PricingHomePricesTab() {
  const queryClient = useQueryClient();

  const { data: pricing, isLoading, error } = useQuery({
    queryKey: ['admin-model-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_pricing')
        .select(`
          id,
          model_id,
          build_type,
          foundation_type,
          base_home_price,
          quote_number,
          quote_date,
          effective_from,
          models!inner (
            name,
            slug,
            beds,
            baths,
            sqft
          )
        `)
        .eq('is_current', true)
        .order('build_type');

      if (error) throw error;
      
      return (data || []).map((row: any) => ({
        id: row.id,
        model_id: row.model_id,
        model_name: row.models.name,
        model_slug: row.models.slug,
        beds: row.models.beds,
        baths: row.models.baths,
        sqft: row.models.sqft,
        build_type: row.build_type,
        foundation_type: row.foundation_type,
        base_home_price: Number(row.base_home_price),
        quote_number: row.quote_number,
        quote_date: row.quote_date,
        effective_from: row.effective_from,
      })) as ModelPricingRow[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, base_home_price }: { id: string; base_home_price: number }) => {
      const { error } = await supabase
        .from('model_pricing')
        .update({ base_home_price })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-model-pricing'] });
      toast.success('Price updated successfully');
    },
    onError: (err) => {
      console.error('Failed to update price:', err);
      toast.error('Failed to update price');
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
        <p>Failed to load pricing data. Please try again.</p>
      </div>
    );
  }

  // Group by model
  const modelGroups = pricing?.reduce((acc, row) => {
    if (!acc[row.model_slug]) {
      acc[row.model_slug] = {
        name: row.model_name,
        slug: row.model_slug,
        beds: row.beds,
        baths: row.baths,
        sqft: row.sqft,
        xmod: null as ModelPricingRow | null,
        mod: null as ModelPricingRow | null,
      };
    }
    if (row.build_type === 'xmod') {
      acc[row.model_slug].xmod = row;
    } else {
      acc[row.model_slug].mod = row;
    }
    return acc;
  }, {} as Record<string, { name: string; slug: string; beds: number; baths: number; sqft: number; xmod: ModelPricingRow | null; mod: ModelPricingRow | null }>);

  const models = Object.values(modelGroups || {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <CardTitle>Home Base Prices</CardTitle>
          </div>
          <CardDescription>
            Factory base prices before markups. Click any price to edit. Prices are applied with a 20% dealer markup for retail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-center">Beds</TableHead>
                <TableHead className="text-center">Baths</TableHead>
                <TableHead className="text-center">Sqft</TableHead>
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 ml-auto">
                        Factory-Built (XMod)
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">CrossMod certified factory-built home. Uses standard foundation.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 ml-auto">
                        Modular (Mod)
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Site-built certified modular home. May qualify for basement upgrade.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right">Quote #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.slug}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {model.name}
                      {model.xmod && !model.mod && (
                        <Badge variant="outline" className="text-xs">XMod Only</Badge>
                      )}
                      {!model.xmod && model.mod && (
                        <Badge variant="outline" className="text-xs">Mod Only</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{model.beds}</TableCell>
                  <TableCell className="text-center">{model.baths}</TableCell>
                  <TableCell className="text-center">{model.sqft.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {model.xmod ? (
                      <PriceEditCell
                        value={model.xmod.base_home_price}
                        onSave={async (value) => {
                          await updateMutation.mutateAsync({ id: model.xmod!.id, base_home_price: value });
                        }}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {model.mod ? (
                      <PriceEditCell
                        value={model.mod.base_home_price}
                        onSave={async (value) => {
                          await updateMutation.mutateAsync({ id: model.mod!.id, base_home_price: value });
                        }}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {model.xmod?.quote_number || model.mod?.quote_number || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Retail Price Preview */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Retail Price Formula</CardTitle>
          <CardDescription>
            How base prices become retail prices shown to buyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-background rounded-lg px-4 py-2 border">
              <span className="text-muted-foreground">Factory Base</span>
              <span className="mx-2">×</span>
              <span className="font-medium">1.20</span>
              <span className="mx-2">=</span>
              <span className="font-medium text-primary">Retail Home Price</span>
            </div>
            <div className="text-muted-foreground">
              Example: $97,087 × 1.20 = <span className="font-medium text-foreground">$116,504</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
