import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Compass, Building2, Clock, Repeat, Users, Shield, DollarSign, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { models } from "@/data/pricing-config";
import hawthornHomepage from "@/assets/homes/hawthorn-homepage.png";

// Featured models (first 4 with valid pricing)
const featuredModels = models.filter(m => m.pricing.xmod).slice(0, 4);

// How it works - 4 steps
const steps = [
  { 
    number: "1", 
    title: "Clarity from day one",
    description: "See your installed price upfront. No weeks of calls. No 'it depends.' Real numbers before you commit.",
    icon: DollarSign,
  },
  { 
    number: "2", 
    title: "Designed for repeatability",
    description: "We standardize what should be standard. Quality stays consistent. Timelines stay real. Surprises stay rare.",
    icon: Repeat,
  },
  { 
    number: "3", 
    title: "Built with scale partners",
    description: "Manufacturing capacity and purchasing power that individual builders can't match. Lower costs. Fewer delays. No subcontractor roulette.",
    icon: Users,
  },
  { 
    number: "4", 
    title: "Accountable site execution",
    description: "The on-site work is scoped, managed, and owned—not left to chance. Because the last mile is where most builders fail.",
    icon: Shield,
  },
];

// What makes BaseMod different - 3 cards
const differentiators = [
  {
    title: "Truth in pricing",
    description: "See your all-in number before you commit. No mystery math. No budget blowups. Plan your life with real information.",
    icon: DollarSign,
  },
  {
    title: "Speed through systems",
    description: "Faster doesn't mean flimsy. It means organized. Precision-built, quality-controlled, delivered when we say we will.",
    icon: Zap,
  },
  {
    title: "Pride at every price point",
    description: "Great design shouldn't require a custom budget. Every family deserves a home they're proud to own—and we're proving it's possible.",
    icon: Heart,
  },
];

// Path cards
const pathCards = [
  {
    icon: MapPin,
    title: "Build on My Land",
    description: "Have land? We'll help you plan and build.",
    href: "/build?intent=my-land",
  },
  {
    icon: Compass,
    title: "Find Land to Build",
    description: "We'll help you find the right lot.",
    href: "/build?intent=find-land",
  },
  {
    icon: Building2,
    title: "Build in a Community",
    description: "Choose from curated BaseMod developments.",
    href: "/developments",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const Index = () => {
  return (
    <Layout>
      {/* Hero Section - Statement feel */}
      <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.08] tracking-tight mb-6">
                The path to ownership is broken.
                <br />
                <span className="text-muted-foreground">We're rebuilding it.</span>
              </h1>

              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-4 max-w-md">
                Millions of families are ready to buy. The system wasn't ready for them. Until now.
              </p>

              <p className="text-sm text-accent font-medium mb-8 max-w-md">
                150+ families. 3 communities. And we're just getting started.
              </p>

              {/* CTA Row */}
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="h-12 px-8 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <Link to="/build">
                    Design Your Home
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Link 
                  to="/models" 
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explore Models
                </Link>
              </div>
            </motion.div>

            {/* Right: Hero Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-elegant">
                <img
                  src={hawthornHomepage}
                  alt="Modern BaseMod home exterior"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why This Matters - Emotional core */}
      <section className="py-24 lg:py-32 bg-secondary/50">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-10">
              Why this matters
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Housing isn't just unaffordable. The entire path to getting there is broken.
              </p>
              <p>
                The process is slow. The pricing is opaque. The timelines are fiction. And at the end of it, millions of families who should be homeowners are still renting—not because they can't afford a mortgage, but because nobody built a system that actually works for them.
              </p>
              <p>
                Meanwhile, something bigger is breaking. When people can't own where they live, they stop investing in where they live. They stop showing up. They stop caring. Communities hollow out. Pride disappears. Neighborhoods become transactional instead of generational.
              </p>
              <p>
                This isn't just a housing problem. It's an ownership crisis. And it's only getting worse.
              </p>
              <p>
                But here's what we know: the demand is there. The families are ready. What's missing is a system that can meet them at scale—with clarity, speed, and pricing that doesn't require a trust fund.
              </p>
              <p className="text-foreground font-medium">
                That's what we're building. Not a better mousetrap. A new path.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We're Building */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-10">
              What we're building
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Beautiful homes that belong in real neighborhoods—delivered faster, priced clearer, and built to last.
              </p>
              <p>
                Modern modular doesn't mean temporary. It means precision. Climate-controlled production. Repeatable quality. Timelines that hold. BaseMod homes have site-built curb appeal with manufacturing-grade consistency.
              </p>
              <p className="text-foreground font-medium">
                Front porches you'll actually use. Kitchens built for the meals that matter. Bedrooms where your kids will grow up. This is housing for the life you're building—not the budget you've been stuck with.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - 4 steps */}
      <section className="py-24 lg:py-32 bg-secondary/50">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We rebuilt the homebuilding process from first click to front door—so it's faster, clearer, and actually works at scale.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-5"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes BaseMod Different - 3 cards */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground">
              What makes BaseMod different
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {differentiators.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 lg:p-10 bg-card rounded-2xl border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Homes */}
      <section className="py-24 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              Browse homes
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Modern designs built for efficiency and curb appeal.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {featuredModels.map((model, index) => (
              <motion.div
                key={model.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
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
              </motion.div>
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

      {/* Choose Your Path - 3 cards */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              Choose your path
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Whether you have land or need to find it — we'll guide you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pathCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={card.href}
                  className="group block p-8 lg:p-10 bg-card rounded-2xl border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-200 h-full"
                >
                  <card.icon className="w-6 h-6 text-accent mb-6" />
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {card.description}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-accent group-hover:gap-2 transition-all">
                    See Your Price
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Manifesto */}
      <section className="py-24 lg:py-32 bg-primary">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-semibold text-primary-foreground mb-10">
              This is bigger than houses
            </h2>
            
            {/* Pull quote */}
            <div className="border-l-4 border-accent pl-6 mb-10">
              <p className="text-2xl lg:text-3xl text-primary-foreground font-medium leading-snug">
                One home is a transaction. A thousand homes is infrastructure. Ten thousand homes is a movement.
              </p>
            </div>
            
            <div className="space-y-6 text-lg text-primary-foreground/80 leading-relaxed">
              <p>
                We're not here to help a few lucky families close. We're here to reopen the path to ownership for an entire generation that's been locked out.
              </p>
              <p>
                Because when people own where they live, they own how they live. They invest in their streets. They show up for their schools. They build neighborhoods that get stronger over time instead of hollowing out.
              </p>
              <p>
                That's not idealism. That's what happens when you give people a stake.
              </p>
              <p>
                A society that takes pride in its roots is a society that thrives. And it starts by building systems that can actually deliver—at scale, with dignity, for everyone who's ready.
              </p>
              <p className="text-primary-foreground font-medium text-xl">
                The families are ready. Now so is the system.
              </p>
            </div>
            
            <div className="mt-12">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base font-medium rounded-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-md hover:shadow-lg transition-all"
              >
                <Link to="/build">
                  Design Your Home
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
