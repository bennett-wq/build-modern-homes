import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Home, BedDouble, Bath, Maximize, CheckCircle, PencilRuler, ChevronLeft, ChevronRight, FileText, Ruler, Settings2, Building } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { homeModels } from "@/data/models";
import { getModelHeroImage } from "@/lib/model-images";

// Aspen model images
import aspenHero from "@/assets/homes/aspen-hero.png";
import aspenExterior01 from "@/assets/homes/aspen-exterior-01.png";

// Belmont model images
import belmontHero from "@/assets/homes/belmont-hero.png";
import belmontExterior01 from "@/assets/homes/belmont-exterior-01.png";

// Galleries (using available images, duplicated for 6-image gallery)
const aspenGallery = [
  aspenHero,
  aspenExterior01,
  aspenHero,
  aspenExterior01,
  aspenHero,
  aspenExterior01,
];

const belmontGallery = [
  belmontHero,
  belmontExterior01,
  belmontHero,
  belmontExterior01,
  belmontHero,
  belmontExterior01,
];

const features = [
  "Factory-built CrossMod® construction",
  "Site-built garage designed by BaseMod",
  "Site-built covered porch",
  "Curated exterior materials and colors",
  "Energy-efficient design",
  "Modern open floor plan"
];

export default function ModelDetail() {
  const { modelId } = useParams<{ modelId: string }>();
  const model = homeModels.find(m => m.slug === modelId);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get gallery for specific models (model-specific galleries)
  const getModelGallery = () => {
    switch (modelId) {
      case "aspen":
        return aspenGallery;
      case "belmont":
        return belmontGallery;
      default:
        return null;
    }
  };
  const gallery = getModelGallery();
  
  // Use the canonical hero image helper (single source of truth)
  const heroImage = getModelHeroImage(model);

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
      {/* Hero Image Section */}
      <section className="relative w-full h-[260px] md:h-[420px] overflow-hidden">
        <img 
          src={heroImage} 
          alt={`The ${model.name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Hero content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 lg:px-8 pb-8 md:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link 
                to="/models" 
                className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Models
              </Link>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-2">
                The {model.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Maximize size={18} />
                  <span className="font-medium text-sm md:text-base">{model.sqft.toLocaleString()} sq ft</span>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble size={18} />
                  <span className="font-medium text-sm md:text-base">{model.beds} Bed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath size={18} />
                  <span className="font-medium text-sm md:text-base">{model.baths} Bath</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <Section className="bg-background">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {model.description.split('\n\n').map((paragraph, index) => (
              <p 
                key={index} 
                className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Model-specific: Floor Plans & Plan Details Section */}
      {(modelId === "hawthorne" || modelId === "belmont") && (
        <Section className="bg-secondary/50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Floor Plans CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10 p-6 bg-background rounded-lg border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">Floor Plans</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Download the complete floor plan documentation for the {model.name} model.
                  </p>
                </div>
                <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <a 
                    href={`/floorplans/${modelId}/${modelId}-floorplan.pdf`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Floor Plans (PDF)
                  </a>
                </Button>
              </div>

              {/* Hawthorne Plan Details Grid */}
              {modelId === "hawthorne" && (
                <div className="grid md:grid-cols-3 gap-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Ruler className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold text-foreground">Plan Details</h4>
                      </div>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          1,620 sq ft
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Base Layout: 3 Bedrooms · 2 Bathrooms
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Footprint: 32' x 64'
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings2 className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold text-foreground">Flexible Layout Options</h4>
                      </div>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          3 Bed · 3 Bath option
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          2 Bed · Office / Den option
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          2 or 3 Bedroom configurations available
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Building className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold text-foreground">Build Types</h4>
                      </div>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          CrossMod® (HUD-code) or Modular (IRC-code)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Basement or slab foundation (site-specific)
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Belmont Plan Details Grid */}
              {modelId === "belmont" && (
                <div className="grid md:grid-cols-3 gap-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Ruler className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold text-foreground">Plan Details</h4>
                      </div>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          2,100 sq ft
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Base Layout: 4 Bedrooms · 2.5 Bathrooms
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Footprint: 32' x 60'
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings2 className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold text-foreground">Flexible Layout Options</h4>
                      </div>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          4 Bed · 2.5 Bath option
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          3 Bed · Office / Den option
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Dedicated home office configurations
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Building className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold text-foreground">Build Types</h4>
                      </div>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          CrossMod® (HUD-code) or Modular (IRC-code)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Basement or slab foundation (site-specific)
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </div>
        </Section>
      )}

      {/* Image Gallery - Only for Aspen */}
      {gallery && (
        <Section>
          <div className="max-w-5xl mx-auto">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[16/10] mb-4 rounded-lg overflow-hidden bg-muted"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  src={gallery[selectedImageIndex]}
                  alt={`The ${model.name} - View ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              {/* Navigation arrows */}
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-foreground" />
              </button>
              
              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm text-foreground">
                {selectedImageIndex + 1} / {gallery.length}
              </div>
            </motion.div>
            
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-6 gap-2">
              {gallery.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-[4/3] rounded-md overflow-hidden transition-all ${
                    selectedImageIndex === index 
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-background" 
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Floor Plan & Details */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Floor Plan Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center border border-border">
              <div className="text-center text-muted-foreground">
                <Home size={80} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Floor Plan Image</p>
                <p className="text-sm">The {model.name}</p>
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Key Specifications</h2>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Square Footage</p>
                    <p className="text-xl font-semibold text-foreground">{model.sqft.toLocaleString()} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bedrooms</p>
                    <p className="text-xl font-semibold text-foreground">{model.beds}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bathrooms</p>
                    <p className="text-xl font-semibold text-foreground">{model.baths}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Starting From</p>
                    <p className="text-xl font-semibold text-accent">${model.price.toLocaleString()}*</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground mb-8">
              *Starting price is an estimate and may vary based on lot selection, exterior options, 
              and site conditions. See our Pricing page for full details.
            </p>

            <h3 className="text-lg font-semibold mb-4 text-foreground">What's Included</h3>
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-charcoal-light text-primary-foreground">
                <Link to="/design-studio">
                  <PencilRuler className="mr-2 h-4 w-4" />
                  Design This Home
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link to="/contact">
                  Request Info
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Construction Explanation */}
      <Section className="bg-secondary">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold mb-6 text-foreground">
              How It's Built
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              The {model.name} is built using CrossMod® construction—the home is factory-built 
              in a controlled environment to ensure consistent quality and precision. Once 
              delivered to your lot, our team constructs a custom-designed garage and covered 
              porch on-site, seamlessly integrating them with the home for a traditional, 
              cohesive appearance.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 text-left">
                  <h4 className="font-semibold mb-2 text-foreground">Factory-Built Home</h4>
                  <p className="text-sm text-muted-foreground">
                    Built in a climate-controlled facility for precision construction, 
                    faster completion, and consistent quality.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-left">
                  <h4 className="font-semibold mb-2 text-foreground">Site-Built Components</h4>
                  <p className="text-sm text-muted-foreground">
                    Garage and porch designed by BaseMod and constructed on-site, 
                    with curated finishes and materials.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* CTA */}
      <Section dark>
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold mb-6 text-primary-foreground">
              Ready to Make The {model.name} Yours?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Schedule a call with our team to discuss pricing, lot availability, 
              and customization options.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/contact">
                Schedule a Design & Pricing Call
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
}
