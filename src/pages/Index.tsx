import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home, Palette, ClipboardCheck, MapPin, Ruler, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { homeModels } from "@/data/models";
import { getModelHeroImage } from "@/lib/model-images";
import hawthornHomepage from "@/assets/homes/hawthorn-homepage.png";

// Featured models - show first 3
const featuredModels = homeModels.slice(0, 3);

// Trust chips data
const trustChips = [
  "Financing-ready pathways",
  "Appraisal-minded design",
  "CrossMod® or IRC Modular",
  "Licensed brokerage in MI & IL",
];

// Start here cards
const startCards = [
  {
    icon: MapPin,
    title: "Choose a Community Lot",
    description: "Browse BaseMod communities and available lots.",
    cta: "Browse Developments",
    href: "/developments",
  },
  {
    icon: Home,
    title: "Explore Home Models",
    description: "Compare plans, options, and build types.",
    cta: "View Models",
    href: "/models",
  },
  {
    icon: FileCheck,
    title: "Financing & Appraisals",
    description: "Designed to support conventional financing and appraisals.",
    cta: "Learn More",
    href: "/contact?topic=financing-appraisals",
  },
];

// How it works steps
const steps = [
  {
    number: "01",
    title: "Choose a plan",
    description: "Browse models and compare layouts",
  },
  {
    number: "02",
    title: "Design the exterior",
    description: "Curated packages + options",
  },
  {
    number: "03",
    title: "Review & schedule",
    description: "Confirm next steps and pricing",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section - Apple-minimal */}
      <section className="relative min-h-[85vh] flex items-center bg-primary overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src={hawthornHomepage}
            alt="Modern BaseMod home exterior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Eyebrow */}
              <div className="mb-6">
                <span className="text-accent font-medium tracking-wide text-sm">
                  BaseMod Homes
                </span>
                <span className="text-primary-foreground/50 text-sm ml-3">
                  Michigan • Illinois
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground leading-[1.1] tracking-tight mb-6">
                Modern homes.
                <br />
                Predictable process.
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-lg leading-relaxed">
                Compare plans, choose curated exteriors, and move from interest to a build-ready next step—fast.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Button asChild size="lg">
                  <Link to="/developments">
                    Start a Build
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
                >
                  <Link to="/models">Explore Models</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link to="/contact">Talk to a Specialist</Link>
                </Button>
              </div>

              {/* Trust chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {trustChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-foreground/10 text-primary-foreground/70 border border-primary-foreground/10"
                  >
                    {chip}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Start Here Section */}
      <Section className="bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
              Start here.
            </h2>
            <p className="text-muted-foreground text-lg">
              Pick a path—we'll guide the rest.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {startCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={card.href}
                  className="group block h-full p-6 bg-card rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-200">
                    <card.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {card.description}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-accent group-hover:gap-2 transition-all duration-200">
                    {card.cta}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Featured Models Section */}
      <Section className="bg-secondary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
            Featured models
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Modern floor plans designed for efficiency and livability.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredModels.map((model, index) => {
            const heroImage = getModelHeroImage(model);
            return (
              <motion.div
                key={model.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={`/models/${model.slug}`}
                  className="group block bg-card rounded-xl border border-border overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all duration-200"
                >
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    <img
                      src={heroImage}
                      alt={`${model.name} exterior`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-muted">
                            <svg class="w-12 h-12 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      {model.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                      <span>{model.sqft.toLocaleString()} sq ft</span>
                      <span className="text-border">•</span>
                      <span>{model.beds} bed</span>
                      <span className="text-border">•</span>
                      <span>{model.baths} bath</span>
                    </div>
                    <span className="inline-flex items-center text-sm font-medium text-accent group-hover:gap-2 transition-all duration-200">
                      View Details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Button asChild variant="outline" size="lg">
            <Link to="/models">
              View All Models
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </Section>

      {/* How It Works Section */}
      <Section className="bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">
              How it works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-light text-accent/40 mb-3">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center text-muted-foreground"
          >
            Clear next steps, fast guidance, and a confident path to build.
          </motion.p>
        </div>
      </Section>

      {/* Final CTA Section */}
      <Section className="bg-primary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground tracking-tight mb-4">
            Ready to start?
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-8">
            Browse communities, explore models, or talk to our team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/developments">
                Start a Build
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </Section>
    </Layout>
  );
};

export default Index;
