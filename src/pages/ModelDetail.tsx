import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Ruler, BedDouble, Bath, Maximize, CheckCircle, Building, Settings2, FileText, Download, Phone } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { homeModels, HomeModel } from "@/data/models";
import { getModelHeroImage } from "@/lib/model-images";

// Model-specific data for highlights and layout options
const modelData: Record<string, {
  tagline: string;
  footprint: string;
  highlights: string[];
  layoutOptions: string[];
  foundationType: string;
}> = {
  hawthorne: {
    tagline: "Modern barndominium-inspired design with architectural flow and flexible layouts.",
    footprint: "32' x 64'",
    highlights: [
      "Open-concept kitchen and living area",
      "Generous primary suite with en-suite bath",
      "Modern barndominium-inspired aesthetic",
      "Smart circulation throughout",
    ],
    layoutOptions: [
      "3 Bed · 3 Bath option",
      "2 Bed · Office / Den option",
      "2 or 3 Bedroom configurations available",
    ],
    foundationType: "Basement or slab foundation (site-specific)",
  },
  belmont: {
    tagline: "Compact efficiency meets strong livability—ideal for narrow lots and tighter setbacks.",
    footprint: "32' x 60'",
    highlights: [
      "Strong open-concept living core",
      "Designed for narrow lots and infill sites",
      "Three true bedrooms with two full baths",
      "Future-proof upgrade path without footprint change",
    ],
    layoutOptions: [
      "Optional third bathroom (utility room conversion; site/plumbing dependent)",
      "Designed for tight setbacks / narrow-lot fit",
    ],
    foundationType: "Basement or slab foundation (site-specific)",
  },
  aspen: {
    tagline: "Maximum bedroom count in a compact footprint—versatile and efficient.",
    footprint: "32' x 60'",
    highlights: [
      "Four true bedrooms in 1,620 sq ft",
      "Open-concept living and kitchen core",
      "Excellent for narrow lots and infill sites",
      "Smart circulation keeps bedrooms private",
    ],
    layoutOptions: [
      "3 Bedroom + Office configuration",
      "Optional butler's pantry",
      "Optional third bathroom",
      "Highly efficient layout for tighter setbacks",
    ],
    foundationType: "Crawl or basement foundation (site-specific)",
  },
  keeneland: {
    tagline: "Cost-effective modern design with strong livability and creative exterior potential.",
    footprint: "32' x 58'",
    highlights: [
      "Efficient 1,635 sq ft open floor plan",
      "Well-suited for lots with tighter setbacks",
      "Ideal for Board-and-Batten and modern exteriors",
      "Attainable price point with premium feel",
    ],
    layoutOptions: [
      "Open-concept living core maximizes usable space",
      "Versatile for creative exterior treatments",
    ],
    foundationType: "Slab or basement foundation (site-specific)",
  },
  maple: {
    tagline: "Expansive living with a flexible bonus room and covered porch.",
    footprint: "32' x 68'",
    highlights: [
      "Expansive kitchen with island",
      "Covered porch for outdoor living",
      "Flexible bonus room",
      "1,950 sq ft of well-designed space",
    ],
    layoutOptions: [
      "Bonus room can be office, playroom, or 4th bedroom",
      "Open entertaining spaces",
    ],
    foundationType: "Basement or slab foundation (site-specific)",
  },
  birch: {
    tagline: "Balanced design with split-bedroom layout and open entertaining spaces.",
    footprint: "32' x 62'",
    highlights: [
      "Split-bedroom layout for privacy",
      "Open entertaining spaces",
      "Well-balanced 1,750 sq ft design",
      "Three bedrooms with two full baths",
    ],
    layoutOptions: [
      "Split-bedroom configuration for added privacy",
      "Open-concept living and dining",
    ],
    foundationType: "Basement or slab foundation (site-specific)",
  },
};

// Models with floor plan PDFs available
const modelsWithFloorPlans = ["hawthorne", "belmont", "aspen", "keeneland"];

export default function ModelDetail() {
  const { modelId } = useParams<{ modelId: string }>();
  const model = homeModels.find(m => m.slug === modelId);
  const heroImage = getModelHeroImage(model);
  const data = modelId ? modelData[modelId] : null;
  const hasFloorPlan = modelId ? modelsWithFloorPlans.includes(modelId) : false;
  const pdfPath = modelId ? `/floorplans/${modelId}/${modelId}-floorplan.pdf` : "";

  if (!model) {
    return (
      <Layout>
        <Section>
          <div className="text-center py-16">
            <h1 className="text-2xl font-semibold mb-4">Model Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The model you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/models">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Models
              </Link>
            </Button>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 1) Hero Section - Apple-minimal */}
      <section className="relative w-full h-[260px] md:h-[420px] overflow-hidden">
        <img 
          src={heroImage} 
          alt={`The ${model.name} exterior`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        {/* Subtle gradient for readability - not heavy */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 lg:px-8 pb-8 md:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link 
                to="/models" 
                className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors duration-200 mb-4"
                aria-label="Back to all models"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Models
              </Link>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-2">
                The {model.name}
              </h1>
              
              {data && (
                <p className="text-white/80 text-base md:text-lg max-w-2xl">
                  {data.tagline}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2) Specs Row - Chips matching homepage */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <SpecChip icon={Maximize} label={`${model.sqft.toLocaleString()} sq ft`} />
            <SpecChip icon={BedDouble} label={`${model.beds} Bed`} />
            <SpecChip icon={Bath} label={`${model.baths} Bath`} />
            {data && <SpecChip icon={Ruler} label={data.footprint} />}
          </motion.div>
        </div>
      </section>

      {/* 3) Primary CTA Row */}
      <section className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link to="/developments">
                  Start a Build
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {hasFloorPlan && (
                <Button asChild size="lg" variant="outline">
                  <a href={pdfPath} target="_blank" rel="noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    View Floor Plans (PDF)
                  </a>
                </Button>
              )}
            </div>
            {hasFloorPlan && (
              <p className="text-xs text-muted-foreground">
                If the PDF doesn't open,{" "}
                <a 
                  href={pdfPath} 
                  download 
                  className="underline hover:text-accent transition-colors duration-200"
                >
                  click here to download
                </a>.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* 4) Overview + Highlights */}
      <Section className="bg-background">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-6">
              Overview
            </h2>
            
            {/* Keep only 2 paragraphs max */}
            <div className="space-y-4 mb-8">
              {model.description.split('\n\n').slice(0, 2).map((paragraph, index) => (
                <p 
                  key={index} 
                  className="text-muted-foreground text-base md:text-lg leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Highlights */}
            {data && data.highlights.length > 0 && (
              <div className="bg-secondary/50 rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Highlights</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {data.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </Section>

      {/* 5) Plan Details + Flexible Options */}
      <Section className="bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-8 text-center">
            Plan Details
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Specifications Card */}
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Specifications</h3>
                </div>
                <ul className="space-y-3">
                  <PlanDetailItem label="Square Footage" value={`${model.sqft.toLocaleString()} sq ft`} />
                  <PlanDetailItem label="Base Layout" value={`${model.beds} Bed · ${model.baths} Bath`} />
                  {data && <PlanDetailItem label="Footprint" value={data.footprint} />}
                  {model.price && (
                    <PlanDetailItem 
                      label="Starting From" 
                      value={`$${model.price.toLocaleString()}`} 
                      note="excludes land"
                    />
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Flexible Layout Options */}
            {data && data.layoutOptions.length > 0 && (
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold text-foreground">Layout Options</h3>
                  </div>
                  <ul className="space-y-2">
                    {data.layoutOptions.map((option, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                        {option}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 6) Build Types */}
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Build Types</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-muted-foreground text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    CrossMod® (HUD-code) or Modular (IRC-code)
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    {data ? data.foundationType : "Foundation type varies by site"}
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                  Build type and foundation depend on site conditions and local requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </Section>

      {/* Floor Plan Download Section - Only for models with PDFs */}
      {hasFloorPlan && (
        <Section className="bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <FileText className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
              Floor Plan Documentation
            </h2>
            <p className="text-muted-foreground mb-6">
              Download the complete floor plan for the {model.name} model.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="outline">
                <a href={pdfPath} target="_blank" rel="noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  View Floor Plans (PDF)
                </a>
              </Button>
              <Button asChild size="lg">
                <a href={pdfPath} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Floor Plan
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              If the PDF doesn't open,{" "}
              <a 
                href={pdfPath} 
                download 
                className="underline hover:text-accent transition-colors duration-200"
              >
                click here to download
              </a>.
            </p>
          </motion.div>
        </Section>
      )}

      {/* 7) Bottom CTA Band */}
      <Section className="bg-primary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground tracking-tight mb-4">
            Ready for next steps?
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-8">
            Get a quick consult on plan fit, budget assumptions, and timeline.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/contact">
                <Phone className="mr-2 h-4 w-4" />
                Schedule a Call
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
            >
              <Link to="/models">
                Explore More Models
              </Link>
            </Button>
          </div>
        </motion.div>
      </Section>
    </Layout>
  );
}

// Spec chip component - matches homepage trust chips style
function SpecChip({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-muted text-foreground border border-border">
      <Icon className="h-4 w-4 text-accent" />
      {label}
    </span>
  );
}

// Plan detail item component
function PlanDetailItem({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <li className="flex justify-between items-baseline gap-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground font-medium text-sm">
        {value}
        {note && <span className="text-muted-foreground font-normal text-xs ml-1">({note})</span>}
      </span>
    </li>
  );
}
