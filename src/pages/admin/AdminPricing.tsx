// ============================================================================
// Admin Pricing Dashboard
// Manage pricing configs with draft/publish workflow
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { usePricingConfig } from '@/state/usePricingConfig';
import { supabase } from '@/integrations/supabase/client';
import { getLocalPricingConfig } from '@/data/pricing/localConfig';
import type { PricingConfigData, PricingConfigRecord } from '@/data/pricing/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  LogOut, 
  Save, 
  Upload, 
  History, 
  DollarSign,
  AlertCircle,
  Check,
  RefreshCw,
  FileText,
  Clock
} from 'lucide-react';

interface ConfigVersion {
  id: string;
  label: string | null;
  status: 'draft' | 'published' | 'archived';
  effective_at: string | null;
  created_at: string;
}

export default function AdminPricing() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAdminAuth();
  const { pricingConfig, pricingSource, refreshPricing } = usePricingConfig();

  const [activeTab, setActiveTab] = useState('editor');
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [currentDraft, setCurrentDraft] = useState<PricingConfigData | null>(null);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Load versions and current draft
  const loadVersions = useCallback(async () => {
    setIsLoadingVersions(true);
    try {
      const { data, error } = await supabase
        .from('pricing_configs')
        .select('id, label, status, effective_at, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Type the data properly
      const typedVersions: ConfigVersion[] = (data || []).map((row: {
        id: string;
        label: string | null;
        status: string;
        effective_at: string | null;
        created_at: string;
      }) => ({
        id: row.id,
        label: row.label,
        status: row.status as 'draft' | 'published' | 'archived',
        effective_at: row.effective_at,
        created_at: row.created_at,
      }));

      setVersions(typedVersions);

      // Find existing draft
      const existingDraft = typedVersions.find(v => v.status === 'draft');
      if (existingDraft) {
        await loadDraft(existingDraft.id);
      }
    } catch (err) {
      console.error('Failed to load versions:', err);
      setError('Failed to load pricing versions');
    } finally {
      setIsLoadingVersions(false);
    }
  }, []);

  const loadDraft = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('pricing_configs')
        .select('id, label, config')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setDraftId(data.id);
        setDraftLabel(data.label || '');
        setCurrentDraft(data.config as unknown as PricingConfigData);
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadVersions();
    }
  }, [user, isAdmin, loadVersions]);

  // Create draft from current published or local config
  const handleCreateDraft = () => {
    const baseConfig = pricingSource === 'remote' 
      ? pricingConfig 
      : getLocalPricingConfig();
    
    setCurrentDraft({ ...baseConfig });
    setDraftLabel(`Draft ${new Date().toLocaleDateString()}`);
    setDraftId(null);
    setError(null);
    setSuccessMessage(null);
  };

  // Save draft to database
  const handleSaveDraft = async () => {
    if (!currentDraft || !user) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (draftId) {
        // Update existing draft
        const { error } = await supabase
          .from('pricing_configs')
          .update({
            config: JSON.parse(JSON.stringify(currentDraft)),
            label: draftLabel || null,
          })
          .eq('id', draftId);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('pricing_configs')
          .insert({
            config: JSON.parse(JSON.stringify(currentDraft)),
            label: draftLabel || null,
            status: 'draft',
            created_by: user.id,
          })
          .select('id')
          .single();

        if (error) throw error;
        setDraftId(data.id);
      }

      setSuccessMessage('Draft saved successfully');
      await loadVersions();
    } catch (err) {
      console.error('Failed to save draft:', err);
      setError('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish draft
  const handlePublish = async () => {
    if (!draftId || !currentDraft) return;

    setIsPublishing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Archive all existing published configs
      const { error: archiveError } = await supabase
        .from('pricing_configs')
        .update({ status: 'archived' })
        .eq('status', 'published');

      if (archiveError) throw archiveError;

      // Publish the draft
      const { error: publishError } = await supabase
        .from('pricing_configs')
        .update({
          status: 'published',
          effective_at: new Date().toISOString(),
        })
        .eq('id', draftId);

      if (publishError) throw publishError;

      // Refresh the public pricing
      await refreshPricing();

      setSuccessMessage('Published successfully! Live pricing updated.');
      setCurrentDraft(null);
      setDraftId(null);
      setDraftLabel('');
      await loadVersions();
    } catch (err) {
      console.error('Failed to publish:', err);
      setError('Failed to publish. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Update a model's base price
  const handleModelPriceChange = (modelSlug: string, buildType: string, foundationType: string, field: 'baseHomePrice' | 'deliveryInstallAllowance', value: number) => {
    if (!currentDraft) return;

    setCurrentDraft(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        models: prev.models.map(model => {
          if (model.slug !== modelSlug) return model;
          return {
            ...model,
            pricing: model.pricing.map(p => {
              if (p.buildType !== buildType || p.foundationType !== foundationType) return p;
              return { ...p, [field]: value };
            }),
          };
        }),
      };
    });
  };

  // Update site costs
  const handleSiteCostChange = (field: keyof PricingConfigData['siteCosts'], value: number) => {
    if (!currentDraft) return;
    setCurrentDraft(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        siteCosts: { ...prev.siteCosts, [field]: value },
      };
    });
  };

  // Update markups
  const handleMarkupChange = (field: keyof PricingConfigData['markups'], value: number) => {
    if (!currentDraft) return;
    setCurrentDraft(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        markups: { ...prev.markups, [field]: value },
      };
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const publishedVersion = versions.find(v => v.status === 'published');

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Pricing Admin</h1>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => refreshPricing()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Status Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Published</p>
                  <p className="font-medium">
                    {publishedVersion 
                      ? publishedVersion.label || `Version ${publishedVersion.id.slice(0, 8)}`
                      : 'None (using local fallback)'}
                  </p>
                </div>
                {publishedVersion?.effective_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Effective Since</p>
                    <p className="font-medium">
                      {new Date(publishedVersion.effective_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={pricingSource === 'remote' ? 'default' : 'secondary'}>
                  {pricingSource === 'remote' ? 'Remote Config Active' : 'Local Fallback'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <Check className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="editor" className="gap-2">
              <FileText className="h-4 w-4" />
              Draft Editor
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Version History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            {!currentDraft ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Draft</CardTitle>
                  <CardDescription>
                    Start editing pricing by creating a draft from the current published configuration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleCreateDraft}>
                    Create Draft from Published
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Draft Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Draft Editor</CardTitle>
                        <CardDescription>
                          Edit pricing values below. Changes are not live until published.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          onClick={handleSaveDraft}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-1" />
                          )}
                          Save Draft
                        </Button>
                        <Button 
                          onClick={handlePublish}
                          disabled={isPublishing || !draftId}
                        >
                          {isPublishing ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-1" />
                          )}
                          Publish
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="draftLabel">Draft Label</Label>
                        <Input
                          id="draftLabel"
                          value={draftLabel}
                          onChange={(e) => setDraftLabel(e.target.value)}
                          placeholder="e.g., January 2026 Update"
                        />
                      </div>
                      <div>
                        <Label>Version</Label>
                        <p className="text-sm text-muted-foreground mt-2">
                          {currentDraft.version}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Model Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Model Base Pricing</CardTitle>
                    <CardDescription>
                      Factory base prices before markups
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentDraft.models.map(model => (
                      <div key={model.slug} className="space-y-3">
                        <h4 className="font-medium">{model.name}</h4>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {model.pricing.map((p, idx) => (
                            <div key={idx} className="p-3 border rounded-lg space-y-2">
                              <p className="text-sm text-muted-foreground">
                                {p.buildType === 'xmod' ? 'CrossMod' : 'Modular'} / {p.foundationType}
                              </p>
                              <div>
                                <Label className="text-xs">Base Price</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                  <Input
                                    type="number"
                                    value={p.baseHomePrice}
                                    onChange={(e) => handleModelPriceChange(
                                      model.slug,
                                      p.buildType,
                                      p.foundationType,
                                      'baseHomePrice',
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="pl-7"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Delivery Allowance</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                  <Input
                                    type="number"
                                    value={p.deliveryInstallAllowance}
                                    onChange={(e) => handleModelPriceChange(
                                      model.slug,
                                      p.buildType,
                                      p.foundationType,
                                      'deliveryInstallAllowance',
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="pl-7"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Site Costs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Site Costs</CardTitle>
                    <CardDescription>
                      Baseline site work and installation costs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <Label>Baseline</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={currentDraft.siteCosts.baseline}
                            onChange={(e) => handleSiteCostChange('baseline', parseInt(e.target.value) || 0)}
                            className="pl-7"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Buffer</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={currentDraft.siteCosts.buffer}
                            onChange={(e) => handleSiteCostChange('buffer', parseInt(e.target.value) || 0)}
                            className="pl-7"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Crane</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={currentDraft.siteCosts.crane}
                            onChange={(e) => handleSiteCostChange('crane', parseInt(e.target.value) || 0)}
                            className="pl-7"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Home Set</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={currentDraft.siteCosts.homeSet}
                            onChange={(e) => handleSiteCostChange('homeSet', parseInt(e.target.value) || 0)}
                            className="pl-7"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Markups */}
                <Card>
                  <CardHeader>
                    <CardTitle>Markup Percentages</CardTitle>
                    <CardDescription>
                      Retail markups applied to buyer-facing prices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label>Dealer Markup (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(currentDraft.markups.dealerMarkupPct * 100).toFixed(0)}
                          onChange={(e) => handleMarkupChange('dealerMarkupPct', (parseFloat(e.target.value) || 0) / 100)}
                        />
                      </div>
                      <div>
                        <Label>Installer Markup (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(currentDraft.markups.installerMarkupPct * 100).toFixed(0)}
                          onChange={(e) => handleMarkupChange('installerMarkupPct', (parseFloat(e.target.value) || 0) / 100)}
                        />
                      </div>
                      <div>
                        <Label>Developer Markup (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(currentDraft.markups.developerMarkupPct * 100).toFixed(0)}
                          onChange={(e) => handleMarkupChange('developerMarkupPct', (parseFloat(e.target.value) || 0) / 100)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Previous pricing configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingVersions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : versions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pricing versions yet. Create your first draft to get started.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {versions.map(version => (
                      <div 
                        key={version.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {version.label || `Version ${version.id.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(version.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            version.status === 'published' 
                              ? 'default' 
                              : version.status === 'draft' 
                                ? 'secondary' 
                                : 'outline'
                          }
                        >
                          {version.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
