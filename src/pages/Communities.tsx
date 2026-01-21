// Communities Listing Page - Entry point for "Get All-In Price"
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Bell, Building2, DollarSign } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Section, SectionHeader } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FinancingBadge } from '@/components/financing/FinancingBadge';
import { AppraisalBadge } from '@/components/appraisal/AppraisalBadge';
import { developments, Development } from '@/data/developments';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function getStatusBadge(status: Development['status']) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/15">
          Active
        </Badge>
      );
    case 'coming-soon':
      return (
        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
          Coming Soon
        </Badge>
      );
    case 'sold-out':
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Sold Out
        </Badge>
      );
    default:
      return null;
  }
}

function CommunityCard({ development }: { development: Development }) {
  const navigate = useNavigate();
  const isActive = development.status === 'active';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasSitePlanImage = development.sitePlanImagePath && development.sitePlanImagePath.length > 0;
  
  const handleGetAllInPrice = () => {
    // Navigate to BuildWizard with community context
    navigate(`/developments/${development.slug}/build`);
  };
  
  return (
    <motion.div variants={fadeInUp}>
      <Card className={cn(
        'group h-full transition-all duration-300 border-border overflow-hidden',
        'hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
      )}>
        <CardContent className="p-0">
          {/* Card Image */}
          <div className="relative aspect-[16/10] bg-muted flex items-center justify-center border-b border-border overflow-hidden">
            {/* Skeleton loader */}
            {hasSitePlanImage && !imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            
            {hasSitePlanImage && !imageError ? (
              <img
                src={development.sitePlanImagePath}
                alt={`${development.name} site plan`}
                className={cn(
                  'w-full h-full object-cover transition-all duration-500',
                  'group-hover:scale-105',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <Building2 className="h-12 w-12 text-muted-foreground/30" />
            )}
            
            <div className="absolute top-3 right-3">
              {getStatusBadge(development.status)}
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-6">
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {development.city}, {development.state}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
              {development.name}
            </h3>
            
            {development.description && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                {development.description}
              </p>
            )}
            
            <div className="flex flex-col gap-2 pt-2">
              {isActive ? (
                <>
                  <Button onClick={handleGetAllInPrice} className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Get All-In Price
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/developments/${development.slug}`}>
                      View Community
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/developments/${development.slug}`}>
                    <Bell className="mr-2 h-4 w-4" />
                    Join Interest List
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Communities() {
  const activeDevelopments = developments.filter(d => d.status === 'active');
  const upcomingDevelopments = developments.filter(d => d.status === 'coming-soon');
  const soldOutDevelopments = developments.filter(d => d.status === 'sold-out');

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
              <Building2 size={20} />
              <span className="text-sm font-medium uppercase tracking-wider">Our Communities</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              BaseMod<br />Communities
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4">
              Explore our carefully planned residential communities across the Midwest. 
              Get an all-in price that includes your lot, home, and site work.
            </p>
            
            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row gap-3">
              <FinancingBadge variant="inline" className="text-muted-foreground" />
              <span className="hidden sm:inline text-muted-foreground/50">•</span>
              <AppraisalBadge variant="inline" className="text-muted-foreground" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Active Communities */}
      {activeDevelopments.length > 0 && (
        <Section>
          <SectionHeader
            title="Active Communities"
            subtitle="Lots available now — get your all-in price and start your build."
          />
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {activeDevelopments.map((dev) => (
              <CommunityCard key={dev.slug} development={dev} />
            ))}
          </motion.div>
        </Section>
      )}

      {/* Coming Soon */}
      {upcomingDevelopments.length > 0 && (
        <Section className="bg-secondary">
          <SectionHeader
            title="Coming Soon"
            subtitle="Join the interest list to be notified when lots become available."
          />
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {upcomingDevelopments.map((dev) => (
              <CommunityCard key={dev.slug} development={dev} />
            ))}
          </motion.div>
        </Section>
      )}

      {/* Sold Out */}
      {soldOutDevelopments.length > 0 && (
        <Section>
          <SectionHeader
            title="Completed Communities"
            subtitle="These communities are fully sold. View our active developments above."
          />
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {soldOutDevelopments.map((dev) => (
              <CommunityCard key={dev.slug} development={dev} />
            ))}
          </motion.div>
        </Section>
      )}

      {/* CTA Section */}
      <Section dark>
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-primary-foreground">
              Have Your Own Land?
            </h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed mb-8">
              You can also build a BaseMod home on your own property. 
              Get a quote and we'll help you understand your options.
            </p>
            <Button asChild size="lg">
              <Link to="/build">
                Get a Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
}