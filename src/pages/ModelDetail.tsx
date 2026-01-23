import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Ruler, 
  BedDouble, 
  Bath, 
  Maximize, 
  CheckCircle, 
  Building, 
  Settings2, 
  FileText, 
  Download, 
  Phone,
  Home,
  Truck,
  ClipboardCheck,
  Hammer,
  Factory,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Palette,
  Users,
  Package,
  Wrench
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { homeModels, HomeModel } from "@/data/models";
import { getModelHeroImage } from "@/lib/model-images";
import { INCLUSIONS_COPY } from "@/content/inclusionsCopy";

// Model-specific data for highlights and layout options
const modelData: Record<string, {
  tagline: string;
  footprint: string;
  highlights: string[];
  layoutOptions: string[];
  foundationType: string;
  badges: string[];
  buyerBullets: string[];
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
    badges: ["CrossMod® compatible", "Modular available", "Garage + porch ready"],
    buyerBullets: [
      "Designed for curb appeal with a site-built garage + porch",
      "Delivered & installed — estimate varies by site conditions",
      "Financing & appraisal support available",
    ],
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
    badges: ["CrossMod® compatible", "Modular available", "Best Value"],
    buyerBullets: [
      "Efficient footprint ideal for narrow lots",
      "Delivered & installed — estimate varies by site conditions",
      "Financing & appraisal support available",
    ],
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
    badges: ["CrossMod® compatible", "Modular available", "Family Favorite"],
    buyerBullets: [
      "Four bedrooms in a compact, efficient footprint",
      "Delivered & installed — estimate varies by site conditions",
      "Financing & appraisal support available",
    ],
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
    badges: ["CrossMod® compatible", "Modular available"],
    buyerBullets: [
      "Modern design with flexible exterior options",
      "Delivered & installed — estimate varies by site conditions",
      "Financing & appraisal support available",
    ],
  },
  laurel: {
    tagline: "Efficient, thoughtfully designed three-bedroom home with flexible garage options.",
    footprint: "32' x 48'",
    highlights: [
      "Efficient 1,065 sq ft with smart circulation",
      "Three bedrooms and two full baths",
      "Flexible garage configurations available",
      "Ideal for first-time buyers and downsizers",
    ],
    layoutOptions: [
      "No Garage (base configuration)",
      "Two-Car Garage with Two Doors",
      "Two-Car Garage with Single Modern Door",
    ],
    foundationType: "Slab or crawl foundation (site-specific)",
    badges: ["CrossMod® compatible", "Most Affordable"],
    buyerBullets: [
      "Flexible garage options to match your site",
      "Delivered & installed — estimate varies by site conditions",
      "Financing & appraisal support available",
    ],
  },
  cypress: {
    tagline: "Most compact CrossMod design — ideal for narrow lots and ADU applications.",
    footprint: "16' x 66'",
    highlights: [
      "Efficient 990 sq ft in ultra-compact footprint",
      "Two bedrooms plus flexible den/office",
      "Open-concept living with smart circulation",
      "Perfect for narrow lots and ADU applications",
    ],
    layoutOptions: [
      "Flex room as office or den",
      "Open living and kitchen core",
    ],
    foundationType: "Slab or crawl foundation (site-specific)",
    badges: ["CrossMod® only", "Most Compact"],
    buyerBullets: [
      "Ultra-compact footprint for narrow or ADU sites",
      "Delivered & installed — estimate varies by site conditions",
      "Financing & appraisal support available",
    ],
  },
};

// Models with floor plan PDFs available
const modelsWithFloorPlans = ["hawthorne", "belmont", "aspen", "keeneland", "laurel", "cypress"];

// Process steps
const processSteps = [
  { icon: Home, title: "Pick your location", description: "Choose your lot or tell us where you're building" },
  { icon: Palette, title: "Choose model + exterior", description: "Select your home design and exterior package" },
  { icon: ClipboardCheck, title: "Confirm site conditions", description: "We review your site and finalize options" },
  { icon: FileText, title: "Permit + site prep", description: "Handle permits and prepare your foundation" },
  { icon: Factory, title: "Factory build", description: "Your home is precision-built in our factory" },
  { icon: Truck, title: "Delivery & set", description: "Transport and professional installation" },
  { icon: ShieldCheck, title: "Final walkthrough", description: "Complete on-site work and hand over keys" },
];

// FAQs
const faqs = [
  {
    question: "What affects final installed price?",
    answer: "Site conditions drive cost. Key variables include foundation type (crawl/basement), driveway length, utility run length, clearing/grading, permit requirements, and finish selections. Our Build & Price tool gives an estimate, then we confirm with a site review.",
  },
  {
    question: "How long does the process take?",
    answer: "Factory build time averages about ~78 days for many homes. Total timeline depends on permits and site work, but our platform is designed to compress the schedule by running site prep and factory production in parallel. You'll receive a project timeline with your quote.",
  },
  {
    question: "What site conditions can change cost?",
    answer: "Long driveways, long water/sewer runs, tree clearing, poor drainage, steep slopes, and special township/city requirements can change cost. We flag these early so there are no surprises.",
  },
  {
    question: "Can I customize finishes?",
    answer: "Yes. Choose from curated exterior packages and interior upgrade options. Final selections are confirmed during design.",
  },
  {
    question: "Do you build in my county?",
    answer: "We're expanding market by market. Start a Build & Price estimate and we'll confirm availability for your site.",
  },
];

// Build path options
const buildPathOptions = [
  {
    title: "Turnkey",
    subtitle: "Delivered & Installed",
    description: "We manage the process end-to-end: site prep coordination, delivery, set, and completion.",
    cta: "Build & Price",
    intent: "turnkey",
  },
  {
    title: "Builder/GC Assist",
    subtitle: "We Supply, You Build",
    description: "We supply the home and coordinate delivery/set. Your GC handles site work and finishes.",
    cta: "Request Builder Quote",
    intent: "builder",
  },
  {
    title: "Supply-Only",
    subtitle: "Home Kit Delivery",
    description: "We supply the home package for qualified builders and owner-builders. You handle site work and install with a qualified crew.",
    cta: "Request Supply-Only Quote",
    intent: "supply-only",
  },
];

export default function ModelDetail() {
  const { modelId } = useParams<{ modelId: string }>();
  const model = homeModels.find(m => m.slug === modelId);
  const heroImage = getModelHeroImage(model);
  const data = modelId ? modelData[modelId] : null;
  const hasFloorPlan = modelId ? modelsWithFloorPlans.includes(modelId) : false;
  const pdfPath = modelId ? `/floorplans/${modelId}/${modelId}-floorplan.pdf` : "";

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [modelId]);

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

  const scrollToFloorPlan = () => {
    document.getElementById('floor-plan-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      {/* A) Hero Section - Premium, above the fold */}
      <section className="relative w-full min-h-[480px] md:min-h-[560px] overflow-hidden">
        <img 
          src={heroImage} 
          alt={`The ${model.name} exterior`}
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 lg:px-8 pb-10 md:pb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl"
            >
              <Link 
                to="/models" 
                className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors duration-200 mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Models
              </Link>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-4">
                The {model.name}
              </h1>
              
              {/* Badges */}
              {data && data.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {data.badges.map((badge, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Key stats row */}
              <div className="flex flex-wrap gap-4 text-white/90 text-sm md:text-base mb-6">
                <span className="flex items-center gap-1.5">
                  <Maximize className="h-4 w-4" />
                  {model.sqft.toLocaleString()} sq ft
                </span>
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" />
                  {model.beds} bed
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" />
                  {model.baths} bath
                </span>
                {data && (
                  <span className="flex items-center gap-1.5">
                    <Ruler className="h-4 w-4" />
                    {data.footprint}
                  </span>
                )}
              </div>
              
              {/* Buyer bullets */}
              {data && data.buyerBullets.length > 0 && (
                <ul className="space-y-1.5 mb-8">
                  {data.buyerBullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-2 text-white/80 text-sm">
                      <CheckCircle className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
                  <Link to={`/build?model=${model.slug}`}>
                    Build & Price
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                {hasFloorPlan && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/50 text-white bg-white/10 hover:bg-white/20"
                    onClick={scrollToFloorPlan}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Floor Plan
                  </Button>
                )}
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="border-white/50 text-white bg-white/10 hover:bg-white/20"
                >
                  <Link to="/contact">
                    <Phone className="mr-2 h-4 w-4" />
                    Talk to Us
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* B) Quick Overview */}
      <Section className="bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-6">
              Overview
            </h2>
            
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

      {/* C) Floor Plan Section */}
      {hasFloorPlan && (
        <Section id="floor-plan-section" className="bg-secondary/30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <FileText className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-3">
              Floor Plan
            </h2>
            <p className="text-muted-foreground mb-2">
              Download the complete floor plan for the {model.name}.
            </p>
            {data && (
              <p className="text-sm text-muted-foreground mb-6">
                Dimensions: {data.footprint}
              </p>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="outline">
                <a href={pdfPath} target="_blank" rel="noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  View Floor Plan (PDF)
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

      {/* D) Plan Details + Layout Options */}
      <Section className="bg-background">
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

            {/* Build Types */}
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

      {/* NEW: Choose Your Build Path */}
      <Section className="bg-accent/5 border-t border-b border-accent/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2 text-center">
            Choose Your Build Path
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto text-sm">
            Whether you want turnkey delivery or prefer to manage your own build, we have options.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {buildPathOptions.map((option, index) => {
              const icons = [Truck, Users, Package];
              const Icon = icons[index];
              return (
                <Card key={option.intent} className="bg-card hover:border-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{option.title}</h3>
                    <p className="text-xs text-accent font-medium uppercase tracking-wide mb-3">{option.subtitle}</p>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{option.description}</p>
                    <Button asChild size="sm" variant={index === 0 ? "default" : "outline"} className="w-full">
                      <Link to={`/build?model=${model?.slug || ''}&intent=${option.intent}`}>
                        {option.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-6">
            Availability and final scope depend on site conditions and local requirements.
          </p>
        </motion.div>
      </Section>

      {/* E) What's Included - Trust Builder */}
      <Section className="bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2 text-center">
            What's Included
          </h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            {INCLUSIONS_COPY.accordion.includedNote}
          </p>
          
          <Accordion type="single" collapsible className="space-y-2">
            {INCLUSIONS_COPY.accordion.categories.map((category) => (
              <AccordionItem 
                key={category.key} 
                value={category.key}
                className="bg-card border border-border rounded-lg px-4"
              >
                <AccordionTrigger className="text-foreground font-medium hover:no-underline">
                  {category.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pb-2">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <p className="text-xs text-muted-foreground text-center mt-6">
            Final specifications confirmed in written quote.
          </p>
        </motion.div>
      </Section>

      {/* F) The Process */}
      <Section className="bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2 text-center">
            The Process
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto text-sm">
            Our platform streamlines design selections, quoting, financing support, and project tracking.
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.slice(0, 4).map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">Step {index + 1}</div>
                  <h3 className="font-medium text-foreground text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-6 mt-6 max-w-3xl mx-auto">
              {processSteps.slice(4).map((step, index) => (
                <div key={index + 4} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">Step {index + 5}</div>
                  <h3 className="font-medium text-foreground text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* G) Financing & Appraisals */}
      <Section className="bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <ShieldCheck className="h-10 w-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-4">
            Financing & Appraisals
          </h2>
          <ul className="space-y-3 text-left max-w-md mx-auto mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground text-sm">Conventional financing eligible (where applicable)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground text-sm">Appraisal support and documentation provided</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground text-sm">Permanent foundation + site-built features designed for neighborhood fit</span>
            </li>
          </ul>
          <Button asChild variant="outline">
            <Link to="/how-it-works">
              Learn More About Financing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </Section>

      {/* H) FAQs */}
      <Section className="bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <HelpCircle className="h-10 w-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-card border border-border rounded-lg px-4"
              >
                <AccordionTrigger className="text-foreground font-medium hover:no-underline text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-sm pb-2">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </Section>

      {/* Bottom CTA Band */}
      <Section className="bg-primary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground tracking-tight mb-4">
            Get an estimate in minutes
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-8">
            Design your {model.name} and see a preliminary estimate for your site.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to={`/build?model=${model.slug}`}>
                Build & Price
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/contact">
                <Phone className="mr-2 h-4 w-4" />
                Talk to Us
              </Link>
            </Button>
          </div>
        </motion.div>
      </Section>
    </Layout>
  );
}

// Helper component for plan details
function PlanDetailItem({ 
  label, 
  value, 
  note 
}: { 
  label: string; 
  value: string; 
  note?: string;
}) {
  return (
    <li className="flex justify-between items-start">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="text-right">
        <span className="text-foreground text-sm font-medium">{value}</span>
        {note && (
          <span className="block text-xs text-muted-foreground">{note}</span>
        )}
      </div>
    </li>
  );
}