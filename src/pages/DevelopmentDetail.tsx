import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Home, Waves, TreePine, ShoppingBag, Car, Sun, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDevelopmentBySlug } from "@/data/developments";

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

const iconMap: Record<string, React.ElementType> = {
  waves: Waves,
  trees: TreePine,
  'shopping-bag': ShoppingBag,
  car: Car,
  sun: Sun,
  home: Home,
  'map-pin': MapPin
};

const statusLabels = {
  'coming-soon': 'Coming Soon',
  'selling': 'Now Selling',
  'sold-out': 'Sold Out'
};

export default function DevelopmentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const development = getDevelopmentBySlug(slug || '');

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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-secondary overflow-hidden">
        {development.heroImage && (
          <div className="absolute inset-0 z-0">
            <img 
              src={development.heroImage} 
              alt={`${development.name}, ${development.state}`}
              className="w-full h-full object-cover opacity-20"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/80" />
          </div>
        )}
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to="/developments" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Developments
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={20} className="text-accent" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {development.city}, {development.state}
              </span>
              <Badge className={
                development.status === 'selling' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-muted text-muted-foreground'
              }>
                {statusLabels[development.status]}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              {development.name}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {development.longDescription}
            </p>
            
            {development.status === 'selling' && (
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link to={`/developments/${slug}/site-plan`}>
                    View Site Plan & Lots
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Link to="/models">Browse Home Models</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Site Plan Preview (for selling developments) */}
      {development.status === 'selling' && (
        <Section>
          <SectionHeader
            title="Community Site Plan"
            subtitle={`Explore available lots in our ${development.name} development.`}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Link 
              to={`/developments/${slug}/site-plan`}
              className="block aspect-[16/9] bg-muted rounded-lg overflow-hidden border border-border hover:border-accent transition-colors group"
            >
              {development.sitePlanImage ? (
                <img 
                  src={development.sitePlanImage} 
                  alt={`${development.name} site plan`}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MapPin size={80} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">Interactive Site Plan</p>
                    <p className="text-sm">Click to explore lot availability</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button className="bg-accent text-accent-foreground">
                    Explore Lots
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
            
            {development.totalLots && (
              <div className="mt-4 flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-semibold text-foreground">{development.totalLots}</p>
                  <p className="text-sm text-muted-foreground">Total Lots</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-semibold text-accent">{development.availableLots}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            )}
          </motion.div>
        </Section>
      )}

      {/* Location Highlights */}
      {development.highlights && development.highlights.length > 0 && (
        <Section className="bg-secondary">
          <SectionHeader
            title={`Why ${development.city}?`}
            subtitle="Discover what makes this location special."
          />

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {development.highlights.map((highlight, index) => {
              const Icon = iconMap[highlight.icon] || MapPin;
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full border-border hover:border-accent/50 transition-colors duration-300">
                    <CardContent className="pt-6 pb-6 px-6">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">{highlight.title}</h3>
                      <p className="text-sm text-muted-foreground">{highlight.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </Section>
      )}

      {/* Development Features */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-foreground">
              A Community Designed with Care
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Every aspect of our {development.name} development is planned to enhance your 
              living experience, from lot orientation to community amenities.
            </p>
            
            <div className="space-y-4">
              {[
                "Thoughtfully planned lots for privacy and natural light",
                "All infrastructure and utilities already in place",
                "Community green spaces and walking paths",
                "Curated home designs for neighborhood cohesion",
                "Modern CrossMod® construction standards"
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
              <Sun size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">Community Amenities</p>
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
              {development.status === 'selling' 
                ? `Ready to Call ${development.name} Home?`
                : `Interested in ${development.name}?`
              }
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              {development.status === 'selling'
                ? "Schedule a call to discuss lot availability and pricing."
                : "Join our interest list to be notified when this development launches."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {development.status === 'selling' && (
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to={`/developments/${slug}/site-plan`}>
                    View Available Lots
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to={`/contact?development=${slug}`}>
                  {development.status === 'selling' ? 'Schedule a Call' : 'Join Interest List'}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
}
