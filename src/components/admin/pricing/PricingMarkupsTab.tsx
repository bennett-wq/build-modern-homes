import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Loader2, Percent, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PricingMarkup {
  id: string;
  name: string;
  dealer_markup_pct: number;
  installer_markup_pct: number;
  developer_markup_pct: number;
  is_default: boolean;
}

export function PricingMarkupsTab() {
  const queryClient = useQueryClient();
  const [localValues, setLocalValues] = useState<Record<string, number>>({});

  const { data: markups, isLoading, error } = useQuery({
    queryKey: ['admin-pricing-markups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_markups')
        .select('*')
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data as PricingMarkup[];
    },
  });

  const defaultMarkup = markups?.find(m => m.is_default);

  // Sync local values when data loads
  useEffect(() => {
    if (defaultMarkup) {
      setLocalValues({
        dealer: defaultMarkup.dealer_markup_pct,
        installer: defaultMarkup.installer_markup_pct,
        developer: defaultMarkup.developer_markup_pct,
      });
    }
  }, [defaultMarkup]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: number }) => {
      const { error } = await supabase
        .from('pricing_markups')
        .update({ [field]: value })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-markups'] });
      toast.success('Markup updated');
    },
    onError: () => {
      toast.error('Failed to update markup');
    },
  });

  const handleSliderChange = (field: string, value: number[]) => {
    setLocalValues(prev => ({ ...prev, [field.split('_')[0]]: value[0] }));
  };

  const handleSliderCommit = async (field: string, value: number[]) => {
    if (defaultMarkup) {
      await updateMutation.mutateAsync({ id: defaultMarkup.id, field, value: value[0] });
    }
  };

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
        <p>Failed to load markup data. Please try again.</p>
      </div>
    );
  }

  if (!defaultMarkup) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No default markup configuration found.</p>
      </div>
    );
  }

  const dealerPercent = (localValues.dealer || defaultMarkup.dealer_markup_pct) * 100;
  const installerPercent = (localValues.installer || defaultMarkup.installer_markup_pct) * 100;
  const developerPercent = (localValues.developer || defaultMarkup.developer_markup_pct) * 100;

  // Example calculations
  const exampleFactoryPrice = 100000;
  const exampleRetailPrice = exampleFactoryPrice * (1 + (localValues.dealer || defaultMarkup.dealer_markup_pct));
  
  const exampleSiteworkBase = 86767;
  const exampleSiteworkRetail = exampleSiteworkBase * 1.1 * (1 + (localValues.installer || defaultMarkup.installer_markup_pct));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            <CardTitle>Markup Percentages</CardTitle>
          </div>
          <CardDescription>
            These markups are applied to calculate retail prices from base costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Dealer Markup */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Dealer Markup</Label>
                <p className="text-sm text-muted-foreground">Applied to factory home price</p>
              </div>
              <div className="text-2xl font-bold text-primary">{dealerPercent.toFixed(0)}%</div>
            </div>
            <Slider
              value={[localValues.dealer || defaultMarkup.dealer_markup_pct]}
              onValueChange={(v) => handleSliderChange('dealer_markup_pct', v)}
              onValueCommit={(v) => handleSliderCommit('dealer_markup_pct', v)}
              min={0}
              max={0.5}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Installer Markup */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Installer Markup</Label>
                <p className="text-sm text-muted-foreground">Applied to sitework baseline (after 10% buffer)</p>
              </div>
              <div className="text-2xl font-bold text-primary">{installerPercent.toFixed(0)}%</div>
            </div>
            <Slider
              value={[localValues.installer || defaultMarkup.installer_markup_pct]}
              onValueChange={(v) => handleSliderChange('installer_markup_pct', v)}
              onValueCommit={(v) => handleSliderCommit('installer_markup_pct', v)}
              min={0}
              max={0.5}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Developer Markup */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Developer Markup</Label>
                <p className="text-sm text-muted-foreground">Applied to community/development builds only</p>
              </div>
              <div className="text-2xl font-bold text-primary">{developerPercent.toFixed(0)}%</div>
            </div>
            <Slider
              value={[localValues.developer || defaultMarkup.developer_markup_pct]}
              onValueChange={(v) => handleSliderChange('developer_markup_pct', v)}
              onValueCommit={(v) => handleSliderCommit('developer_markup_pct', v)}
              min={0}
              max={0.2}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>20%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="bg-muted/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Live Preview</CardTitle>
          </div>
          <CardDescription>
            See how markups affect pricing in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Home price example */}
          <div className="bg-background rounded-lg p-4 border space-y-2">
            <h4 className="font-medium">Home Package Example</h4>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Factory Base:</span>
              <span>${exampleFactoryPrice.toLocaleString()}</span>
              <span className="text-muted-foreground">×</span>
              <span>{(1 + (localValues.dealer || defaultMarkup.dealer_markup_pct)).toFixed(2)}</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-bold text-primary">${Math.round(exampleRetailPrice).toLocaleString()}</span>
              <span className="text-muted-foreground">(Retail)</span>
            </div>
          </div>

          {/* Sitework example */}
          <div className="bg-background rounded-lg p-4 border space-y-2">
            <h4 className="font-medium">Sitework Allowance Example</h4>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted-foreground">Baseline:</span>
              <span>${exampleSiteworkBase.toLocaleString()}</span>
              <span className="text-muted-foreground">× 1.10 (buffer) ×</span>
              <span>{(1 + (localValues.installer || defaultMarkup.installer_markup_pct)).toFixed(2)}</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-bold text-primary">${Math.round(exampleSiteworkRetail).toLocaleString()}</span>
              <span className="text-muted-foreground">(Allowance)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
