import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Home, BedDouble, Bath, Maximize, CheckCircle, PencilRuler } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { homeModels } from "./Models";

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
  const model = homeModels.find(m => m.id === modelId);

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
      {/* Hero / Overview */}
      <section className="relative py-24 lg:py-32 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to="/models" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Models
            </Link>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-4">
              The {model.name}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
              {model.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Maximize size={20} className="text-accent" />
                <span className="font-medium">{model.sqft.toLocaleString()} sq ft</span>
              </div>
              <div className="flex items-center gap-2">
                <BedDouble size={20} className="text-accent" />
                <span className="font-medium">{model.beds} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath size={20} className="text-accent" />
                <span className="font-medium">{model.baths} Bathrooms</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

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
