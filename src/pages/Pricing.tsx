import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home, Hammer, MapPin, Wrench, HelpCircle, FileCheck, Scale, ClipboardCheck, Info } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Section, SectionHeader, FeatureCard, CTASection, Container } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { brandMessaging } from "@/content/brandMessaging";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

// Map pricing bullets to icons
const pricingBulletIcons = [FileCheck, Scale, ClipboardCheck];

const pricingComponents = [
  {
    icon: Home,
    title: "Base Home",
    description: "The factory-built home itself, including all interior finishes, appliances, and standard features.",
    note: "Starting from $180,000 - $260,000 depending on model"
  },
  {
    icon: MapPin,
    title: "Lot",
    description: "Your homesite within the Grand Haven development, fully improved with utilities and infrastructure.",
    note: "Starting from $55,000 - $85,000 depending on location"
  },
  {
    icon: Hammer,
    title: "Site-Built Garage & Porch",
    description: "Custom-designed garage and covered porch constructed on-site by BaseMod to complement your home.",
    note: "Starting from $35,000 - $55,000 depending on size"
  },
  {
    icon: Wrench,
    title: "Site Work",
    description: "Foundation, utility connections, driveway, landscaping allowance, and all required site preparation.",
    note: "Allowances included in package pricing"
  }
];

const pricingFaqs = [
  {
    question: "What does 'Starting from' mean?",
    answer: "Our starting prices represent the base configuration for each component. Final pricing depends on your specific lot selection, home model, exterior customizations, and any site-specific requirements. We provide detailed, personalized quotes during your design consultation."
  },
  {
    question: "Are there additional costs beyond the package price?",
    answer: "Package pricing includes the home, lot, garage/porch, and standard site work allowances. Additional costs may include upgraded exterior selections, premium lot locations, extended driveways, or special site conditions. All costs are disclosed before you commit."
  },
  {
    question: "What financing options are available?",
    answer: "BaseMod homes qualify for conventional mortgage financing, just like traditional site-built homes. We work with lenders experienced in factory-built construction and can provide referrals. FHA and VA financing may also be available."
  },
  {
    question: "When is payment required?",
    answer: "A reservation deposit secures your lot and locks in pricing. Additional deposits are structured throughout the build process. Financing typically closes upon completion. We'll provide a complete payment schedule during your consultation."
  },
  {
    question: "How long does the process take?",
    answer: "From reservation to move-in typically takes 4-6 months, significantly faster than traditional construction. Factory building reduces weather delays, and site-built components are completed while your home is being manufactured."
  }
];

const packageExamples = [
  {
    model: "Hawthorn",
    sqft: "1,450 sq ft",
    beds: "2 Bed / 2 Bath",
    starting: 245000
  },
  {
    model: "Cedar",
    sqft: "1,650 sq ft",
    beds: "3 Bed / 2 Bath",
    starting: 265000
  },
  {
    model: "Aspen",
    sqft: "1,850 sq ft",
    beds: "3 Bed / 2 Bath",
    starting: 285000
  },
  {
    model: "Belmont",
    sqft: "2,100 sq ft",
    beds: "4 Bed / 2.5 Bath",
    starting: 325000
  }
];

export default function Pricing() {
  return (
    <Layout>
      <SEO 
        title={brandMessaging.meta.pricing.title} 
        description={brandMessaging.meta.pricing.description} 
      />
      
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 lg:py-32 bg-secondary/40">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge 
              variant="secondary" 
              className="mb-6 text-xs font-medium tracking-wider uppercase px-3 py-1.5 bg-background"
            >
              Honest Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.05] mb-6">
              {brandMessaging.pricing.headline}
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              {brandMessaging.pricing.subhead}
            </p>
            
            {/* Pricing bullets as cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {brandMessaging.pricing.bullets.map((bullet, index) => {
                const Icon = pricingBulletIcons[index];
                return (
                  <Card key={index} className="bg-background/80 backdrop-blur-sm border-border">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-accent" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {bullet}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Pricing Components */}
      <Section>
        <SectionHeader
          title="What's Included in Your Package"
          subtitle="Every BaseMod home package includes these four components."
        />

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {pricingComponents.map((component, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <component.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{component.title}</CardTitle>
                      <p className="text-muted-foreground text-sm leading-relaxed">{component.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-accent font-medium">{component.note}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Package Examples */}
      <Section background="muted">
        <SectionHeader
          title="Estimated Package Pricing"
          subtitle="Starting prices for complete home packages in our Grand Haven development."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {packageExamples.map((pkg, index) => (
            <Card key={index} className="text-center hover:shadow-lg hover:border-accent/30 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-8 pb-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground">The {pkg.model}</h3>
                <p className="text-sm text-muted-foreground mb-1">{pkg.sqft}</p>
                <p className="text-sm text-muted-foreground mb-4">{pkg.beds}</p>
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                  <p className="text-2xl font-semibold text-accent">
                    ${pkg.starting.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Disclaimer Notice Card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10"
        >
          <Card className="bg-background border-border max-w-2xl mx-auto">
            <CardContent className="p-5 flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                All prices are estimates and subject to change based on lot selection, 
                exterior customizations, and site conditions. Request a personalized quote 
                for accurate pricing.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </Section>

      {/* FAQ Section */}
      <Section>
        <SectionHeader
          title="Pricing Questions"
          subtitle="Common questions about our pricing structure and process."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {pricingFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="flex items-center gap-3 text-foreground font-medium">
                    <HelpCircle size={18} className="text-accent flex-shrink-0" />
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pl-9 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </Section>

      {/* CTA */}
      <CTASection
        headline="Get Your Personalized Quote"
        body="Schedule a design and pricing call to receive detailed pricing based on your preferred model, lot, and customizations."
        primaryCta={{ label: "Schedule a Pricing Call", href: "/contact" }}
        variant="dark"
      />
    </Layout>
  );
}
