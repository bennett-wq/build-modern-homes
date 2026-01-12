import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, MapPin, Home, CheckCircle, Info } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDevelopmentBySlug } from "@/data/developments";
import { grandHavenLots, Lot, getLotSummary } from "@/data/lots/grand-haven";

/**
 * SITE PLAN COMPONENT
 * 
 * This component displays an interactive site plan with clickable lots.
 * 
 * HOW TO ADD LOT DATA FOR A NEW DEVELOPMENT:
 * 1. Create a new file at src/data/lots/<development-slug>.ts
 * 2. Export an array of Lot objects (see src/data/lots/grand-haven.ts for example)
 * 3. Import and use the lot data in this component's getLotData function
 * 
 * HOW TO UPDATE LOT COORDINATES:
 * 1. Open the site plan image in an image editor
 * 2. Note the pixel coordinates for each lot center
 * 3. Convert to percentages: (pixel / image dimension) * 100
 * 4. Update the position.x and position.y values in the lot data file
 */

const statusColors = {
  available: 'bg-green-500',
  reserved: 'bg-yellow-500',
  sold: 'bg-red-500'
};

const statusLabels = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold'
};

function getLotData(slug: string): Lot[] {
  // Add lot data imports for other developments here
  switch (slug) {
    case 'grand-haven':
      return grandHavenLots;
    default:
      return [];
  }
}

export default function SitePlan() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const development = getDevelopmentBySlug(slug || '');
  const lots = getLotData(slug || '');
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  if (!development) {
    return (
      <Layout>
        <Section>
          <div className="text-center py-16">
            <h1 className="text-2xl font-semibold mb-4">Development Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The development you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/developments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Developments
              </Link>
            </Button>
          </div>
        </Section>
      </Layout>
    );
  }

  const summary = slug === 'grand-haven' ? getLotSummary() : { available: 0, reserved: 0, sold: 0, total: 0 };

  const handleLotClick = (lot: Lot) => {
    setSelectedLot(lot);
  };

  const handleRequestInfo = () => {
    if (selectedLot) {
      const message = `I'm interested in Lot ${selectedLot.number} at the ${development.name}, ${development.state} development. Please send me more information about this lot and available home models.`;
      navigate(`/contact?development=${slug}&lot=${selectedLot.number}&message=${encodeURIComponent(message)}`);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-12 lg:py-16 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to={`/developments/${slug}`} 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {development.name}
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2">
                  {development.name} Site Plan
                </h1>
                <p className="text-muted-foreground">
                  Click on a lot to view details and request information.
                </p>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-6 bg-background rounded-lg px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors.available}`} />
                  <span className="text-sm text-muted-foreground">Available ({summary.available})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors.reserved}`} />
                  <span className="text-sm text-muted-foreground">Reserved ({summary.reserved})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors.sold}`} />
                  <span className="text-sm text-muted-foreground">Sold ({summary.sold})</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Site Plan */}
      <Section className="pb-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          {/* Map Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden border border-border relative">
              {development.sitePlanImage ? (
                <img 
                  src={development.sitePlanImage} 
                  alt={`${development.name} site plan`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center text-muted-foreground">
                    <MapPin size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Site plan image coming soon</p>
                  </div>
                </div>
              )}
              
              {/* Lot Pins */}
              {lots.map((lot) => (
                <button
                  key={lot.id}
                  onClick={() => handleLotClick(lot)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                    selectedLot?.id === lot.id ? 'scale-125 z-10' : 'z-0'
                  }`}
                  style={{
                    left: `${lot.position.x}%`,
                    top: `${lot.position.y}%`
                  }}
                  aria-label={`Lot ${lot.number} - ${statusLabels[lot.status]}`}
                >
                  <div className={`w-8 h-8 rounded-full ${statusColors[lot.status]} flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white`}>
                    {lot.number}
                  </div>
                </button>
              ))}
            </div>
            
            <p className="mt-4 text-sm text-muted-foreground text-center">
              <Info size={14} className="inline mr-1" />
              Click on any lot marker to view details
            </p>
          </motion.div>

          {/* Lot Detail Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              {selectedLot ? (
                <motion.div
                  key={selectedLot.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-lg border border-border shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-semibold text-foreground">
                        Lot {selectedLot.number}
                      </h3>
                      <button 
                        onClick={() => setSelectedLot(null)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X size={20} className="text-muted-foreground" />
                      </button>
                    </div>
                    
                    <Badge className={`${statusColors[selectedLot.status]} text-white mb-4`}>
                      {statusLabels[selectedLot.status]}
                    </Badge>
                    
                    <div className="space-y-4 mb-6">
                      {selectedLot.acres && (
                        <div>
                          <p className="text-sm text-muted-foreground">Lot Size</p>
                          <p className="text-lg font-medium text-foreground">{selectedLot.acres} acres</p>
                        </div>
                      )}
                      
                      {selectedLot.price && (
                        <div>
                          <p className="text-sm text-muted-foreground">Lot Price</p>
                          <p className="text-lg font-medium text-accent">${selectedLot.price.toLocaleString()}</p>
                        </div>
                      )}
                      
                      {selectedLot.features && selectedLot.features.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Features</p>
                          <div className="space-y-1">
                            {selectedLot.features.map((feature) => (
                              <div key={feature} className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-accent" />
                                <span className="text-sm text-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {selectedLot.status === 'available' ? (
                      <Button 
                        onClick={handleRequestInfo}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Request Info on This Lot
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : selectedLot.status === 'reserved' ? (
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          This lot is currently reserved. Contact us to join the waitlist.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          This lot has been sold.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-lg border border-border shadow-lg p-8 text-center"
                >
                  <Home size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Select a Lot
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any lot marker on the site plan to view details and availability.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-2xl font-semibold text-foreground">{summary.total}</p>
                <p className="text-xs text-muted-foreground">Total Lots</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-2xl font-semibold text-accent">{summary.available}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 text-center">
                <p className="text-2xl font-semibold text-muted-foreground">{summary.sold + summary.reserved}</p>
                <p className="text-xs text-muted-foreground">Sold/Reserved</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Browse Models CTA */}
      <Section className="bg-secondary pt-8">
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl lg:text-3xl font-semibold mb-4 text-foreground">
              Find Your Perfect Home
            </h2>
            <p className="text-muted-foreground mb-6">
              Browse our collection of CrossMod® home models, each available with customizable 
              exterior options through our Design Studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-charcoal-light text-primary-foreground">
                <Link to="/models">
                  Browse Home Models
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link to="/design-studio">Open Design Studio</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
}
