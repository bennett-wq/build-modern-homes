// Dynamic Development Detail Page
// Renders based on :slug param from URL
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, TreePine, Car, ShoppingBag, Waves, Sun, ArrowRight, Bell, Building2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Section, SectionHeader } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { InteractiveSitePlan } from '@/components/siteplan/InteractiveSitePlan';
import { getDevelopmentBySlug } from '@/data/developments';
import { useState } from 'react';

// Icon mapping for dynamic icons from data
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Waves,
  TreePine,
  Car,
  ShoppingBag,
  Sun,
  MapPin,
};

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

// Default content for developments without custom data
const defaultLocationHighlights = [
  { icon: 'MapPin', title: 'Prime Location', description: 'Conveniently located with easy access to local amenities.' },
  { icon: 'TreePine', title: 'Natural Setting', description: 'Surrounded by beautiful natural landscapes.' },
  { icon: 'ShoppingBag', title: 'Nearby Shopping', description: 'Close to shopping, dining, and entertainment.' },
  { icon: 'Car', title: 'Easy Access', description: 'Convenient access to major highways and routes.' },
];

const defaultFeatures = [
  { icon: 'Sun', title: 'Thoughtfully Planned', description: 'Each lot is carefully designed for optimal living.' },
  { icon: 'TreePine', title: 'Community Spaces', description: 'Integrated green spaces for community connection.' },
  { icon: 'MapPin', title: 'Improved Lots', description: 'All lots include utilities and infrastructure.' },
];

function ComingSoonContent({ development }: { development: ReturnType<typeof getDevelopmentBySlug> }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to a backend
    setSubmitted(true);
  };

  if (!development) return null;

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
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-accent">
                <MapPin size={20} />
                <span className="text-sm font-medium uppercase tracking-wider">Coming Soon</span>
              </div>
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                Coming Soon
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              {development.name},<br />{development.state}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {development.description || `A new BaseMod community is coming to ${development.city}. Join our interest list to be the first to know when lots become available.`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interest Form Section */}
      <Section>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Bell className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Be the First to Know
            </h2>
            <p className="text-muted-foreground text-lg">
              Join our interest list and we'll notify you when lot selection opens for {development.name}.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {submitted ? (
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">You're on the list!</h3>
                  <p className="text-muted-foreground">
                    We'll email you as soon as {development.name} lots become available.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Button type="submit" className="whitespace-nowrap">
                        <Bell className="mr-2 h-4 w-4" />
                        Join Interest List
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </Section>

      {/* Placeholder Content */}
      <Section className="bg-secondary">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Building2, title: 'Premium Lots', description: 'Carefully selected locations with excellent positioning.' },
            { icon: MapPin, title: 'Great Location', description: `Ideally situated in ${development.city}, ${development.state}.` },
            { icon: Sun, title: 'Modern Living', description: 'Designed for contemporary lifestyles and comfort.' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-border">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Browse Other Developments */}
      <Section>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Ready to Build Now?
          </h2>
          <p className="text-muted-foreground mb-6">
            Check out our active developments with lots available today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/developments">
                View All Developments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/models">
                Browse Home Models
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </Layout>
  );
}

function ActiveDevelopmentContent({ development }: { development: NonNullable<ReturnType<typeof getDevelopmentBySlug>> }) {
  const locationHighlights = development.locationHighlights || defaultLocationHighlights;
  const developmentFeatures = development.features || defaultFeatures;

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
            <div className="flex items-center gap-2 text-accent mb-4">
              <MapPin size={20} />
              <span className="text-sm font-medium uppercase tracking-wider">The Development</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              {development.name},<br />{development.state}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {development.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Site Plan */}
      <Section>
        <SectionHeader
          title="Community Site Plan"
          subtitle="Click on any lot to view details and request information."
        />
        <InteractiveSitePlan developmentSlug={development.slug} />
      </Section>

      {/* Development Features */}
      <Section className="bg-secondary">
        <SectionHeader
          title="A Community Designed with Care"
          subtitle="Every aspect of our development is planned to enhance your living experience."
        />
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {developmentFeatures.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || MapPin;
            return (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-border hover:border-accent/50 transition-colors duration-300">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                      <IconComponent className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      {/* Location Highlights */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-foreground">
              Why {development.city}?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {development.city} offers the perfect blend of small-town charm and natural beauty. 
              It's an ideal place to call home.
            </p>
            
            <div className="space-y-6">
              {locationHighlights.map((highlight, index) => {
                const IconComponent = iconMap[highlight.icon] || MapPin;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{highlight.title}</h4>
                      <p className="text-muted-foreground text-sm">{highlight.description}</p>
                    </div>
                  </motion.div>
                );
              })}
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
              <Waves size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">Location Map / Aerial Image</p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Lot Information */}
      <Section dark>
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-primary-foreground">
              Homes on Improved Lots
            </h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed mb-8">
              Each BaseMod home is built on a fully improved lot within our planned development. 
              This means all infrastructure—utilities, roads, and site preparation—is already 
              complete, streamlining the building process and ensuring a cohesive community appearance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/60">
                <Link to="/models">
                  Browse Home Models
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link to={`/contact?development=${development.slug}`}>
                  Inquire About Lots
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
}

export default function DevelopmentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const development = slug ? getDevelopmentBySlug(slug) : undefined;

  if (!development) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold mb-4 text-foreground">Development not found</h1>
          <p className="text-muted-foreground mb-6">The development you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/developments">Browse All Developments</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Render different content based on status
  if (development.status === 'coming-soon' || development.status === 'sold-out') {
    return <ComingSoonContent development={development} />;
  }

  return <ActiveDevelopmentContent development={development} />;
}
