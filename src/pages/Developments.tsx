import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Home, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { developments } from "@/data/developments";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const statusLabels = {
  'coming-soon': 'Coming Soon',
  'selling': 'Now Selling',
  'sold-out': 'Sold Out'
};

const statusColors = {
  'coming-soon': 'bg-muted text-muted-foreground',
  'selling': 'bg-accent text-accent-foreground',
  'sold-out': 'bg-charcoal text-white'
};

export default function Developments() {
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
              Our Communities
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              BaseMod Developments
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Discover our thoughtfully planned communities across the country. 
              Each development features modern CrossMod® homes on improved lots, 
              designed for how people live today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Developments Grid */}
      <Section>
        <SectionHeader
          title="Explore Our Communities"
          subtitle="From Michigan's coastal towns to Florida's Gulf Coast, find your perfect BaseMod community."
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {developments.map((development) => (
            <motion.div key={development.slug} variants={fadeInUp}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card group h-full flex flex-col">
                <div className="aspect-[16/10] bg-muted flex items-center justify-center relative overflow-hidden">
                  {development.heroImage ? (
                    <img 
                      src={development.heroImage} 
                      alt={`${development.name}, ${development.state} community`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback to placeholder if image doesn't load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`text-center text-muted-foreground ${development.heroImage ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center bg-muted`}>
                    <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs">{development.city}, {development.state}</p>
                  </div>
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={statusColors[development.status]}>
                      {statusLabels[development.status]}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin size={16} className="text-accent" />
                    <span className="text-sm">{development.city}, {development.state}</span>
                  </div>
                  
                  <h3 className="text-2xl font-semibold mb-3 text-foreground">
                    {development.name}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 flex-1">
                    {development.shortDescription}
                  </p>
                  
                  {/* Features */}
                  {development.features && (
                    <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border">
                      {development.features.slice(0, 3).map((feature) => (
                        <span 
                          key={feature}
                          className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Lot availability */}
                  {development.totalLots && development.availableLots !== undefined && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-accent">{development.availableLots}</span> of {development.totalLots} lots available
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    asChild 
                    className="w-full bg-primary hover:bg-charcoal-light text-primary-foreground"
                    disabled={development.status === 'sold-out'}
                  >
                    <Link to={`/developments/${development.slug}`}>
                      {development.status === 'coming-soon' ? 'Learn More' : 'Explore Community'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Why BaseMod */}
      <Section className="bg-secondary">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-foreground">
              Why Choose a BaseMod Community?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Every BaseMod development is thoughtfully planned to create connected, 
              walkable neighborhoods with modern homes at attainable prices.
            </p>
            
            <div className="space-y-4">
              {[
                "Improved lots with all infrastructure complete",
                "CrossMod® homes with site-built garages and porches",
                "Curated exterior designs for neighborhood cohesion",
                "Green spaces and community amenities",
                "Faster construction timelines",
                "Attainable pricing without sacrificing quality"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-border"
          >
            <div className="text-center text-muted-foreground">
              <Home size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">Community Lifestyle Image</p>
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
              Ready to Find Your Community?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Contact us to learn more about available lots and homes in our developments.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
}
