import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { SitePlanViewer } from '@/components/siteplan/SitePlanViewer';
import { SitePlanEditor } from '@/components/siteplan/SitePlanEditor';
import { LotDetailsPanel } from '@/components/siteplan/LotDetailsPanel';
import { getDevelopmentBySlug } from '@/data/developments';
import { grandHavenLots, Lot } from '@/data/lots/grand-haven';
import { useIsMobile } from '@/hooks/use-mobile';

export default function GrandHavenSitePlan() {
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === '1';
  const isMobile = useIsMobile();
  
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [lots, setLots] = useState<Lot[]>(grandHavenLots);

  const development = getDevelopmentBySlug('grand-haven');

  const handleSelectLot = (lot: Lot | null) => {
    setSelectedLot(lot);
  };

  if (!development) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold">Development not found</h1>
        </div>
      </Layout>
    );
  }

  // Editor Mode
  if (isEditMode) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Editor Header */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/developments/grand-haven/site-plan" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-foreground">Site Plan Editor</h1>
              <p className="text-sm text-muted-foreground">Grand Haven Development</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/developments/grand-haven/site-plan">Exit Editor</Link>
          </Button>
        </div>
        
        {/* Editor Content */}
        <SitePlanEditor
          sitePlanImagePath={development.sitePlanImagePath}
          initialLots={lots}
          onLotsChange={setLots}
          className="flex-1"
        />
      </div>
    );
  }

  // Normal Viewing Mode
  return (
    <Layout>
      {/* Header */}
      <section className="bg-secondary py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                to="/development"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Development
              </Link>
              <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
                {development.name} Site Plan
              </h1>
              <p className="text-muted-foreground mt-1">
                Click on a lot to view details and request information
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/developments/grand-haven/site-plan?edit=1">
                Open Editor
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Site Plan Viewer */}
      <section className="relative">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-card rounded-xl border border-border overflow-hidden"
            style={{ height: isMobile ? '60vh' : '75vh' }}
          >
            <SitePlanViewer
              sitePlanImagePath={development.sitePlanImagePath}
              lots={lots}
              onSelectLot={handleSelectLot}
              selectedLotId={selectedLot?.id ?? null}
              className="h-full"
            />
            
            {/* Details Panel */}
            {selectedLot && (
              <LotDetailsPanel
                lot={selectedLot}
                developmentSlug={development.slug}
                onClose={() => setSelectedLot(null)}
                isMobile={isMobile}
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              About Grand Haven Lots
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our Grand Haven development features 18 carefully planned lots, each with unique characteristics 
              and views. All lots come with utilities and infrastructure already in place, ready for your 
              BaseMod home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/contact?development=grand-haven">Schedule a Site Visit</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/models">Browse Home Models</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
