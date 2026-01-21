// How It Works Page - Explains the build process
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Home, Palette, ClipboardCheck, Calendar, FileCheck, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: "01",
    icon: Home,
    title: "Choose Your Model",
    description: "Browse our collection of modern floor plans. Each model is designed for efficiency, livability, and strong curb appeal.",
    details: [
      "Compare square footage and layouts",
      "See available bedroom configurations",
      "Understand build type options (CrossMod® or Modular)",
    ],
  },
  {
    number: "02",
    icon: Palette,
    title: "Design Your Exterior",
    description: "Select from curated exterior packages that include siding, trim, roofing, and garage doors—all designed to work together.",
    details: [
      "Pre-coordinated color and material packages",
      "Multiple garage door style options",
      "Professional exterior rendering preview",
    ],
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Get Your Quote",
    description: "Receive a transparent, itemized quote that shows exactly what's included. No hidden fees, no surprises.",
    details: [
      "Clear pricing breakdown",
      "All-in pricing for community builds",
      "Delivery and installation estimates",
    ],
  },
  {
    number: "04",
    icon: Calendar,
    title: "Schedule & Plan",
    description: "Work with our team to finalize details, secure financing, and set your build timeline.",
    details: [
      "Connect with lender partners if needed",
      "Finalize site-specific requirements",
      "Confirm delivery and installation schedule",
    ],
  },
  {
    number: "05",
    icon: FileCheck,
    title: "Build & Move In",
    description: "Your home is built in a controlled factory environment, then delivered and installed on your site.",
    details: [
      "Factory-built for quality and speed",
      "Professional on-site installation",
      "Final walkthrough and handoff",
    ],
  },
];

const benefits = [
  {
    title: "Faster Build Times",
    description: "Factory construction means your home is built in weeks, not months.",
  },
  {
    title: "Consistent Quality",
    description: "Controlled environment ensures precision and minimizes weather delays.",
  },
  {
    title: "Transparent Pricing",
    description: "Know your costs upfront with itemized, buyer-facing quotes.",
  },
  {
    title: "Modern Designs",
    description: "Contemporary floor plans with strong curb appeal and livability.",
  },
];

export default function HowItWorks() {
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
            <span className="inline-block text-accent font-medium text-sm tracking-wide mb-4">
              The BaseMod Process
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              How It Works
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              From first click to move-in day—a clear, guided path to your new home.
            </p>
            <Button asChild size="lg">
              <Link to="/build">
                Get a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <Section className="bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
              Your Build Journey
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Five clear steps from interest to move-in.
            </p>
          </motion.div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="grid md:grid-cols-[120px_1fr] gap-6 md:gap-8"
                >
                  {/* Step Number */}
                  <div className="flex md:flex-col items-center md:items-start gap-4">
                    <div className="text-5xl md:text-6xl font-light text-accent/30">
                      {step.number}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <StepIcon className="w-6 h-6 text-accent" />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section className="bg-secondary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Why BaseMod?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Factory-built homes with a guided, transparent process.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-primary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-8">
            Get your personalized quote in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/build">
                Get a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
            >
              <Link to="/models">Browse Homes</Link>
            </Button>
          </div>
        </motion.div>
      </Section>
    </Layout>
  );
}