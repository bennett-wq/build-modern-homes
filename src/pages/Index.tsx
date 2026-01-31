import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Section, SectionHeader, FeatureCard, CTASection, CalloutCard, Container } from "@/components/marketing";
import { models } from "@/data/pricing-config";
import hawthornHomepage from "@/assets/homes/hawthorn-homepage.png";
import { brandMessaging } from "@/content/brandMessaging";

// Featured models (first 4 with valid pricing)
const featuredModels = models.filter(m => m.pricing.xmod).slice(0, 4);

// Parse "how it works" bullets into title + body
const howItWorksSteps = brandMessaging.home.sections.howItWorks.bullets.map((bullet, index) => {
  const colonIndex = bullet.indexOf(':');
  if (colonIndex > -1) {
    return {
      title: bullet.substring(0, colonIndex).trim(),
      body: bullet.substring(colonIndex + 1).trim(),
    };
  }
  return { title: `Step ${index + 1}`, body: bullet };
});

// Map differentiator icons
const differentiatorIcons = [CheckCircle, Clock, Sparkles];

const Index = () => {
  return (
    <Layout>
      <SEO 
        title={brandMessaging.meta.home.title} 
        description={brandMessaging.meta.home.description} 
      />
      
      {/* Hero Section - Premium Two-Column */}
      <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-radial bg-subtle-grid opacity-50" />
        
        <Container className="relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <div className="max-w-xl">
              <Badge 
                variant="secondary" 
                className="mb-6 text-xs font-medium tracking-wider uppercase px-3 py-1.5"
              >
                Built for real life
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.05] tracking-tight mb-6">
                {brandMessaging.home.hero.headline}
              </h1>

              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-4 max-w-md">
                {brandMessaging.home.hero.subhead}
              </p>

              <p className="text-sm text-muted-foreground/70 mb-8 max-w-md">
                {brandMessaging.home.hero.trustLine}
              </p>

              {/* CTA Row */}
              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="h-12 px-8 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <Link to="/build">
                    {brandMessaging.home.hero.primaryCta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Link 
                  to="/models" 
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {brandMessaging.home.hero.secondaryCta}
                </Link>
              </div>
            </div>

            {/* Right: Product Preview Card */}
            <div className="relative">
              <Card className="overflow-hidden border-border shadow-elegant">
                {/* Gradient header band */}
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
                  <p className="text-sm font-medium text-primary-foreground/80">Your BaseMod Home</p>
                </div>
                
                {/* Hero image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={hawthornHomepage}
                    alt="Modern BaseMod home exterior"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Value rows */}
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <div className="flex items-center gap-3 px-6 py-4">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-sm text-foreground font-medium">Installed Estimate</span>
                      <span className="ml-auto text-xs text-muted-foreground">Clear pricing upfront</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-sm text-foreground font-medium">Timeline Clarity</span>
                      <span className="ml-auto text-xs text-muted-foreground">Faster than traditional</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-sm text-foreground font-medium">Curb Appeal</span>
                      <span className="ml-auto text-xs text-muted-foreground">Site-built aesthetics</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Why We Exist Section */}
      <Section background="default" className="border-t border-border">
        <div className="max-w-3xl mx-auto">
          <CalloutCard variant="quote" className="mb-8">
            {brandMessaging.home.sections.why.headline}
          </CalloutCard>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center mb-8">
            {brandMessaging.home.sections.why.body}
          </p>
          
          <CalloutCard variant="highlight">
            Ownership creates stewardship.
          </CalloutCard>
        </div>
      </Section>

      {/* How It Works - Step Cards */}
      <Section background="muted">
        <SectionHeader 
          title={brandMessaging.home.sections.howItWorks.headline}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorksSteps.map((step, index) => (
            <FeatureCard
              key={index}
              variant="numbered"
              number={index + 1}
              title={step.title.charAt(0).toUpperCase() + step.title.slice(1)}
              body={step.body}
            />
          ))}
        </div>
      </Section>

      {/* What We Build */}
      <Section background="default">
        <SectionHeader 
          title={brandMessaging.home.sections.whatWeBuild.headline}
          subtitle={brandMessaging.home.sections.whatWeBuild.body}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredModels.map((model) => (
            <Link
              key={model.slug}
              to={`/models/${model.slug}`}
              className="group block"
            >
              <Card className="overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-1">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={model.heroImage || "/images/models/placeholders/hero-placeholder.svg"}
                    alt={`${model.name} exterior`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/models/placeholders/hero-placeholder.svg";
                    }}
                  />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {model.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {model.sqft.toLocaleString()} sq ft · {model.beds} bed · {model.baths} bath
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-accent group-hover:gap-2 transition-all">
                    Learn More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/models" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all homes →
          </Link>
        </div>
      </Section>

      {/* Differentiators - Premium Cards */}
      <Section background="muted">
        <SectionHeader 
          title={brandMessaging.home.sections.differentiators.headline}
        />

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {brandMessaging.home.sections.differentiators.cards.map((card, index) => (
            <FeatureCard
              key={card.title}
              icon={differentiatorIcons[index]}
              title={card.title}
              body={card.body}
            />
          ))}
        </div>
      </Section>

      {/* Closing Section */}
      <Section background="default" className="border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight mb-6">
            {brandMessaging.home.sections.closing.headline}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {brandMessaging.home.sections.closing.body}
          </p>
          <p className="text-xl font-semibold text-foreground">
            {brandMessaging.home.sections.closing.closingLine}
          </p>
        </div>
      </Section>

      {/* Footer CTA Band */}
      <CTASection
        headline="Ready to see your price?"
        primaryCta={{ label: "Get a Quote", href: "/build" }}
        variant="dark"
      />
    </Layout>
  );
};

export default Index;
