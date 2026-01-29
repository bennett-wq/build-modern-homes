// ============================================================================
// Admin Pricing Dashboard
// Intuitive tabbed interface for managing all pricing data
// ============================================================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminShell } from '@/components/admin/AdminShell';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, DollarSign, Home, MapPin, Wrench, Percent, Sparkles } from 'lucide-react';

import { PricingHomePricesTab } from '@/components/admin/pricing/PricingHomePricesTab';
import { PricingLotsTab } from '@/components/admin/pricing/PricingLotsTab';
import { PricingSiteworkTab } from '@/components/admin/pricing/PricingSiteworkTab';
import { PricingMarkupsTab } from '@/components/admin/pricing/PricingMarkupsTab';
import { PricingUpgradesTab } from '@/components/admin/pricing/PricingUpgradesTab';

export default function AdminPricing() {
  const navigate = useNavigate();
  const { user, isAdmin, hasAccess, isLoading: authLoading, signOut } = useAdminAuth();

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
      title="Pricing Console"
      description="Manage home prices, lot premiums, sitework costs, and markups"
      icon={<DollarSign className="h-5 w-5 text-primary" />}
      user={user}
      isAdmin={isAdmin}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        <Tabs defaultValue="home-prices" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="home-prices" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home Prices</span>
            </TabsTrigger>
            <TabsTrigger value="lots" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Lots</span>
            </TabsTrigger>
            <TabsTrigger value="sitework" className="gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Sitework</span>
            </TabsTrigger>
            <TabsTrigger value="markups" className="gap-2">
              <Percent className="h-4 w-4" />
              <span className="hidden sm:inline">Markups</span>
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Upgrades</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home-prices">
            <PricingHomePricesTab />
          </TabsContent>

          <TabsContent value="lots">
            <PricingLotsTab />
          </TabsContent>

          <TabsContent value="sitework">
            <PricingSiteworkTab />
          </TabsContent>

          <TabsContent value="markups">
            <PricingMarkupsTab />
          </TabsContent>

          <TabsContent value="upgrades">
            <PricingUpgradesTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
