import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PriceEditCell } from './PriceEditCell';
import { toast } from 'sonner';
import { Loader2, Sparkles, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UpgradeOption {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  category: string;
  base_price: number;
  is_active: boolean;
  applies_to_build_types: string[] | null;
}

interface ExteriorPackage {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  upgrade_price: number;
  is_active: boolean;
  siding_color_hex: string | null;
  accent_color_hex: string | null;
}

const categoryLabels: Record<string, string> = {
  floor_plan: 'Floor Plan',
  exterior: 'Exterior',
  garage: 'Garage',
  foundation: 'Foundation',
};

export function PricingUpgradesTab() {
  const queryClient = useQueryClient();

  // Fetch upgrade options
  const { data: upgrades, isLoading: loadingUpgrades } = useQuery({
    queryKey: ['admin-upgrade-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upgrade_options')
        .select('*')
        .order('category')
        .order('display_order');
      
      if (error) throw error;
      return data as UpgradeOption[];
    },
  });

  // Fetch exterior packages
  const { data: exteriorPackages, isLoading: loadingExteriors } = useQuery({
    queryKey: ['admin-exterior-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exterior_packages')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as ExteriorPackage[];
    },
  });

  // Update upgrade option
  const updateUpgradeMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: number | boolean }) => {
      const { error } = await supabase
        .from('upgrade_options')
        .update({ [field]: value })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-upgrade-options'] });
      toast.success('Upgrade option updated');
    },
    onError: () => {
      toast.error('Failed to update upgrade option');
    },
  });

  // Update exterior package
  const updateExteriorMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: number | boolean }) => {
      const { error } = await supabase
        .from('exterior_packages')
        .update({ [field]: value })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exterior-packages'] });
      toast.success('Exterior package updated');
    },
    onError: () => {
      toast.error('Failed to update exterior package');
    },
  });

  const isLoading = loadingUpgrades || loadingExteriors;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group upgrades by category
  const upgradesByCategory = upgrades?.reduce((acc, upgrade) => {
    const cat = upgrade.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(upgrade);
    return acc;
  }, {} as Record<string, UpgradeOption[]>) || {};

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upgrades">
        <TabsList>
          <TabsTrigger value="upgrades" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Upgrade Options
          </TabsTrigger>
          <TabsTrigger value="exteriors" className="gap-2">
            <Palette className="h-4 w-4" />
            Exterior Packages
          </TabsTrigger>
        </TabsList>

        {/* Upgrade Options Tab */}
        <TabsContent value="upgrades" className="space-y-6 mt-6">
          {Object.entries(upgradesByCategory).map(([category, categoryUpgrades]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base">{categoryLabels[category] || category}</CardTitle>
                <CardDescription>
                  {categoryUpgrades.length} option{categoryUpgrades.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Option</TableHead>
                      <TableHead>Applies To</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryUpgrades.map((upgrade) => (
                      <TableRow key={upgrade.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{upgrade.label}</div>
                            {upgrade.description && (
                              <div className="text-sm text-muted-foreground">{upgrade.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {upgrade.applies_to_build_types && upgrade.applies_to_build_types.length > 0 ? (
                            <div className="flex gap-1">
                              {upgrade.applies_to_build_types.map(type => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">All</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <PriceEditCell
                            value={upgrade.base_price}
                            onSave={async (value) => {
                              await updateUpgradeMutation.mutateAsync({ id: upgrade.id, field: 'base_price', value });
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={upgrade.is_active}
                            onCheckedChange={(checked) => {
                              updateUpgradeMutation.mutate({ id: upgrade.id, field: 'is_active', value: checked });
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          {Object.keys(upgradesByCategory).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No upgrade options found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Exterior Packages Tab */}
        <TabsContent value="exteriors" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Exterior Color Packages</CardTitle>
              </div>
              <CardDescription>
                Pre-defined color combinations for home exteriors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Colors</TableHead>
                    <TableHead className="text-right">Upgrade Price</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exteriorPackages?.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          {pkg.description && (
                            <div className="text-sm text-muted-foreground">{pkg.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {pkg.siding_color_hex && (
                            <div 
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: pkg.siding_color_hex }}
                              title="Siding"
                            />
                          )}
                          {pkg.accent_color_hex && (
                            <div 
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: pkg.accent_color_hex }}
                              title="Accent"
                            />
                          )}
                          {!pkg.siding_color_hex && !pkg.accent_color_hex && (
                            <span className="text-muted-foreground text-sm">No colors set</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <PriceEditCell
                          value={pkg.upgrade_price}
                          onSave={async (value) => {
                            await updateExteriorMutation.mutateAsync({ id: pkg.id, field: 'upgrade_price', value });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={pkg.is_active}
                          onCheckedChange={(checked) => {
                            updateExteriorMutation.mutate({ id: pkg.id, field: 'is_active', value: checked });
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(!exteriorPackages || exteriorPackages.length === 0) && (
                <div className="py-12 text-center text-muted-foreground">
                  No exterior packages found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
