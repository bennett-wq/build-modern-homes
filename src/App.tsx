import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { usePricingConfig } from "@/state/usePricingConfig";
import { SHOW_COMMUNITIES } from "@/config/featureFlags";
import { RouteChangeScrollUnlock } from "@/components/RouteChangeScrollUnlock";
import Index from "./pages/Index";
import Developments from "./pages/Developments";
import DevelopmentDetail from "./pages/DevelopmentDetail";
import Models from "./pages/Models";
import ModelDetail from "./pages/ModelDetail";
import Communities from "./pages/Communities";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DesignStudio from "./pages/DesignStudio";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SitePlanFullScreen from "./pages/SitePlanFullScreen";
import BuildWizard from "./pages/BuildWizard";
import Mission from "./pages/Mission";
import Configurator from "./pages/Configurator";
import QuoteSummary from "./pages/QuoteSummary";
import SecureBankConnect from "./pages/SecureBankConnect";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLeads from "./pages/admin/AdminLeads";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to initialize pricing on app load
function PricingInitializer() {
  const refreshPricing = usePricingConfig((state) => state.refreshPricing);
  
  useEffect(() => {
    // Load published pricing from database on app start
    refreshPricing();
  }, [refreshPricing]);
  
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PricingInitializer />
      <BrowserRouter>
        <RouteChangeScrollUnlock />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/build" element={<Configurator />} />
          {SHOW_COMMUNITIES ? (
            <>
              <Route path="/communities" element={<Communities />} />
              <Route path="/developments" element={<Developments />} />
              <Route path="/developments/:slug" element={<DevelopmentDetail />} />
              <Route path="/developments/:slug/site-plan" element={<SitePlanFullScreen />} />
              <Route path="/developments/:slug/build" element={<BuildWizard />} />
              <Route path="/development" element={<Navigate to="/developments" replace />} />
            </>
          ) : (
            <>
              <Route path="/communities" element={<Navigate to="/" replace />} />
              <Route path="/developments" element={<Navigate to="/" replace />} />
              <Route path="/developments/*" element={<Navigate to="/" replace />} />
              <Route path="/development" element={<Navigate to="/" replace />} />
            </>
          )}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/models" element={<Models />} />
          <Route path="/models/:modelId" element={<ModelDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/design-studio" element={<DesignStudio />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/quote/:quoteId" element={<QuoteSummary />} />
          {/* Secure bank connection (opens in popup/new tab) */}
          <Route path="/secure-bank-connect" element={<SecureBankConnect />} />
          {/* Admin routes (not in public nav) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/pricing" element={<AdminPricing />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
