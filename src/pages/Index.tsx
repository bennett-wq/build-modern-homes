import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { models } from "@/data/pricing-config";
import hawthornHomepage from "@/assets/homes/hawthorn-homepage.png";
import { brandMessaging } from "@/content/brandMessaging";

// Featured models (first 4 with valid pricing)
const featuredModels = models.filter(m => m.pricing.xmod).slice(0, 4);

const Index = () => {
  return (
    <Layout>
      {/* Hero Section - Stripe/Airbnb minimal */}
      <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.08] tracking-tight mb-6">
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
                <Button asChild size="lg" className="h-12 px-8 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-shadow">
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

            {/* Right: Hero Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-elegant">
                <img
                  src={hawthornHomepage}
                  alt="Modern BaseMod home exterior"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-24 lg:py-32 bg-background border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6">
              {brandMessaging.home.sections.why.headline}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {brandMessaging.home.sections.why.body}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 bg-secondary/50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-10">
              {brandMessaging.home.sections.howItWorks.headline}
            </h2>
            <ul className="space-y-4 text-left max-w-xl mx-auto">
              {brandMessaging.home.sections.howItWorks.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4 text-center">
            {brandMessaging.home.sections.whatWeBuild.headline}
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-lg mx-auto">
            {brandMessaging.home.sections.whatWeBuild.body}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {featuredModels.map((model) => (
              <Link
                key={model.slug}
                to={`/models/${model.slug}`}
                className="group block"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-4">
                  <img
                    src={model.heroImage || "/images/models/placeholders/hero-placeholder.svg"}
                    alt={`${model.name} exterior`}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/models/placeholders/hero-placeholder.svg";
                    }}
                  />
                </div>
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
        </div>
      </section>

      {/* Differentiators - 3 cards */}
      <section className="py-24 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground text-center mb-16">
            {brandMessaging.home.sections.differentiators.headline}
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {brandMessaging.home.sections.differentiators.cards.map((card) => (
              <div
                key={card.title}
                className="p-8 lg:p-10 bg-card rounded-2xl border border-border"
              >
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="py-24 lg:py-32 bg-background border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6">
              {brandMessaging.home.sections.closing.headline}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {brandMessaging.home.sections.closing.body}
            </p>
            <p className="text-lg font-medium text-foreground">
              {brandMessaging.home.sections.closing.closingLine}
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA Strip */}
      <section className="py-20 lg:py-24 bg-primary">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary-foreground mb-8">
            Ready to see your price?
          </h2>
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-base font-medium rounded-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-md hover:shadow-lg transition-all"
          >
            <Link to="/build">
              Get a Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
