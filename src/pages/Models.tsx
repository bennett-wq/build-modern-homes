import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home as HomeIcon, Ruler, BedDouble, Bath, AlertCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { homeModels } from "@/data/models";
import { getModelHeroImage, HERO_PLACEHOLDER } from "@/lib/model-images";
import { calculateFullPricing, defaultBuildSelection, type BuildSelection } from "@/hooks/usePricingEngine";
import { getDefaultZone, getModelBySlug, type BuildType } from "@/data/pricing-config";
import { getPricingModeLabel } from "@/lib/pricing-mode-utils";

// Trust chips - same as homepage
const trustChips = [
  "Financing-ready pathways",
  "Appraisal-aligned specs",
  "Curated exterior packages",
  "Guided build experience",
];

export default function Models() {
  return (
    <Layout>
      {/* Hero Section - Apple-minimal matching homepage */}
      <section className="relative py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Eyebrow */}
              <span className="inline-block text-accent font-medium text-sm tracking-wide mb-4">
                Home Models
              </span>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
                Find the plan that fits.
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                Compare footprints, layouts, and build types—then take the next step.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Button asChild size="lg">
                  <Link to="/build">
                    Get a Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/communities">Browse Communities</Link>
                </Button>
              </div>

              {/* Trust chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {trustChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"
                  >
                    {chip}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Models Grid - Apple-minimal catalog */}
      <Section className="bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
            All Models
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Modern floor plans designed for efficiency and livability.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homeModels.map((model, index) => (
            <ModelCard key={model.slug} model={model} index={index} />
          ))}
        </div>
      </Section>

      {/* CrossMod Explanation - Refined */}
      <Section className="bg-secondary">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <span className="inline-block text-accent font-medium text-sm tracking-wide mb-4">
              Build Types
            </span>
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-foreground tracking-tight">
              What is a CrossMod® Home?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              CrossMod® homes are factory-built to meet or exceed site-built construction 
              standards. Built in a controlled environment, they offer consistent quality, 
              faster completion times, and enhanced energy efficiency.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              BaseMod enhances each home with custom-designed, site-built garages 
              and porches, curated garage doors, and carefully selected exterior materials—creating 
              a seamless, traditional appearance.
            </p>
            <Button asChild variant="outline">
              <Link to="/about">
                Learn More About BaseMod
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="aspect-square bg-muted rounded-xl flex items-center justify-center border border-border order-1 lg:order-2"
          >
            <div className="text-center text-muted-foreground">
              <HomeIcon size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">CrossMod® Construction Diagram</p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Final CTA - Matching homepage */}
      <Section className="bg-primary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground tracking-tight mb-4">
            Ready to get your price?
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-8">
            Design your home and see a real estimate in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/build">
                Get a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </Section>
    </Layout>
  );
}

// Format price helper
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Model Card Component - Premium, scannable with buyer-facing pricing
interface ModelCardProps {
  model: typeof homeModels[0];
  index: number;
}

function ModelCard({ model, index }: ModelCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const heroImage = getModelHeroImage(model);

  // Calculate buyer-facing pricing for the model
  // Uses delivered_installed as default teaser pricing mode
  const buyerPricing = useMemo(() => {
    const pricingModel = getModelBySlug(model.slug);
    if (!pricingModel) return null;

    // Get the first available build type for "starting from" pricing
    const buildType: BuildType = pricingModel.buildTypes[0] || 'xmod';
    
    // Use delivered_installed as the default pricing mode for /models teasers
    const selection: BuildSelection = {
      ...defaultBuildSelection,
      modelSlug: model.slug,
      buildType,
      pricingMode: 'delivered_installed', // Canonical default for model cards
      includeUtilityFees: false,  // Show base price without optional fees
      includePermitsCosts: false,
    };
    
    const zone = getDefaultZone();
    return calculateFullPricing(selection, pricingModel, zone);
  }, [model.slug]);

  const handleGetQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to /build with model preselected
    window.location.href = `/build?model=${model.slug}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all duration-200">
        {/* Image Container - Links to detail - aspect-video for premium 16:9 feel */}
        <Link to={`/models/${model.slug}`}>
          <div className="aspect-video bg-muted overflow-hidden relative rounded-t-2xl">
            {/* Skeleton loader */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse" />
            )}
            
            <img
              src={heroImage}
              alt={`${model.name} exterior`}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.currentTarget;
                // Dev-only warning for missing assets
                if (import.meta.env.DEV && target.src !== HERO_PLACEHOLDER) {
                  console.warn(`[Models] Missing hero image for "${model.slug}": ${heroImage}`);
                }
                // Single fallback to SVG placeholder
                if (target.src !== HERO_PLACEHOLDER) {
                  target.src = HERO_PLACEHOLDER;
                }
              }}
            />
          </div>
        </Link>

        {/* Content */}
        <div className="p-5">
          <Link to={`/models/${model.slug}`}>
            <h3 className="text-xl font-semibold text-card-foreground mb-3 hover:text-accent transition-colors">
              {model.name}
            </h3>
          </Link>

          {/* Spec chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-sm text-muted-foreground">
              <Ruler className="w-3.5 h-3.5" />
              {model.sqft.toLocaleString()} sq ft
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-sm text-muted-foreground">
              <BedDouble className="w-3.5 h-3.5" />
              {model.beds} bed
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-sm text-muted-foreground">
              <Bath className="w-3.5 h-3.5" />
              {model.baths} bath
            </span>
          </div>

          {/* Buyer-facing pricing */}
          <div className="mb-4 space-y-1">
            {buyerPricing?.hasPricing ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Starting from {formatPrice(buyerPricing.buyerFacingBreakdown.startingFromPrice)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getPricingModeLabel(buyerPricing.pricingMode)}
                </p>
                {buyerPricing.freightPending && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Freight pending
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Contact for pricing
              </p>
            )}
          </div>

          {/* CTAs - Get Quote primary, View Details secondary */}
          <div className="flex gap-2">
            <Button onClick={handleGetQuote} size="sm" className="flex-1">
              Get Quote
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link to={`/models/${model.slug}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
