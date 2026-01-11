import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home, BedDouble, Bath, Maximize } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const homeModels = [
  {
    id: "aspen",
    name: "Aspen",
    sqft: 1850,
    beds: 3,
    baths: 2,
    price: 285000,
    description: "A thoughtfully designed 3-bedroom home with an open-concept living area and spacious primary suite."
  },
  {
    id: "belmont",
    name: "Belmont",
    sqft: 2100,
    beds: 4,
    baths: 2.5,
    price: 325000,
    description: "Our largest model featuring 4 bedrooms, a dedicated home office, and generous living spaces."
  },
  {
    id: "cedar",
    name: "Cedar",
    sqft: 1650,
    beds: 3,
    baths: 2,
    price: 265000,
    description: "An efficient floor plan that maximizes every square foot with smart design choices."
  },
  {
    id: "hawthorn",
    name: "Hawthorn",
    sqft: 1450,
    beds: 2,
    baths: 2,
    price: 245000,
    description: "Perfect for downsizers or first-time buyers, offering comfort in a compact footprint."
  },
  {
    id: "maple",
    name: "Maple",
    sqft: 1950,
    beds: 3,
    baths: 2.5,
    price: 305000,
    description: "Features an expansive kitchen, covered porch, and flexible bonus room."
  },
  {
    id: "birch",
    name: "Birch",
    sqft: 1750,
    beds: 3,
    baths: 2,
    price: 275000,
    description: "A balanced design with split-bedroom layout and open entertaining spaces."
  }
];

export default function Models() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-accent font-medium text-sm uppercase tracking-wider mb-4">
              Home Collection
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              BaseMod Home Models
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Explore our collection of CrossMod® homes, each featuring factory-built precision 
              and site-built garages and porches designed by BaseMod.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Models Grid */}
      <Section>
        <SectionHeader
          title="Choose Your Floor Plan"
          subtitle="Each model is available with customizable exterior options through our Design Studio."
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {homeModels.map((model, index) => (
            <motion.div key={model.id} variants={fadeInUp}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card group h-full flex flex-col">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden">
                  <div className="text-center text-muted-foreground">
                    <Home size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Exterior Image</p>
                  </div>
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                </div>
                <CardContent className="p-6 flex flex-col flex-1">
                  <h3 className="text-2xl font-semibold mb-2 text-foreground">The {model.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">{model.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-1.5">
                      <Maximize size={16} className="text-accent" />
                      <span>{model.sqft.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BedDouble size={16} className="text-accent" />
                      <span>{model.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath size={16} className="text-accent" />
                      <span>{model.baths} Baths</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                      <p className="text-xl font-semibold text-accent">
                        ${model.price.toLocaleString()}
                      </p>
                    </div>
                    <Button asChild className="bg-primary hover:bg-charcoal-light text-primary-foreground">
                      <Link to={`/models/${model.id}`}>
                        View Floor Plan
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* CrossMod Explanation */}
      <Section className="bg-secondary">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-foreground">
              What is a CrossMod® Home?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              CrossMod® homes are factory-built to meet or exceed site-built construction 
              standards. Built in a controlled environment, they offer consistent quality, 
              faster completion times, and enhanced energy efficiency.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              BaseMod enhances each CrossMod® home with custom-designed, site-built garages 
              and porches, curated garage doors, and carefully selected exterior materials 
              and colors—creating a seamless, traditional appearance.
            </p>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
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
            className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-border order-1 lg:order-2"
          >
            <div className="text-center text-muted-foreground">
              <Home size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">CrossMod® Construction Diagram</p>
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
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-primary-foreground">
              Customize Your Exterior
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Use our Design Studio to explore siding colors, shingle options, 
              and garage door styles for any model.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/design-studio">
                Open Design Studio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
}
