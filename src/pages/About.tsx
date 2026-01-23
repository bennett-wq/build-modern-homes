import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Target, Zap, Shield, Heart, Users, Building } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

const values = [
  {
    icon: Target,
    title: "Design-Forward",
    description: "Every detail is intentional. We curate materials, colors, and finishes to create homes that feel modern yet timeless."
  },
  {
    icon: Zap,
    title: "Efficient Process",
    description: "Factory construction paired with expert site work means faster timelines without sacrificing quality."
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "CrossMod® standards ensure your home meets or exceeds traditional site-built construction requirements."
  },
  {
    icon: Heart,
    title: "Attainable Ownership",
    description: "Smart building methods allow us to offer premium homes at prices that make ownership achievable."
  }
];

const timeline = [
  {
    step: "01",
    title: "Explore & Design",
    description: "Browse models, use our Design Studio to customize your exterior, and schedule a consultation."
  },
  {
    step: "02",
    title: "Reserve Your Lot",
    description: "Select your preferred lot in our Grand Haven development and secure it with a reservation deposit."
  },
  {
    step: "03",
    title: "Finalize Details",
    description: "Confirm all specifications, finalize financing, and approve your complete home package."
  },
  {
    step: "04",
    title: "Construction Begins",
    description: "Your home is built in the factory while site work and garage/porch construction begins on your lot."
  },
  {
    step: "05",
    title: "Delivery & Completion",
    description: "Home is delivered, set, and finished. Site-built components are completed and integrated."
  },
  {
    step: "06",
    title: "Move In",
    description: "Final inspections complete, keys handed over, and you're home in Grand Haven."
  }
];

export default function About() {
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
              About BaseMod
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              Building Better,<br />Thoughtfully
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              BaseMod is a developer-led housing platform focused on delivering 
              design-forward, efficient, and attainable homes. We combine the 
              precision of factory construction with custom site-built finishing 
              to create communities that stand apart.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-foreground">
              Our Approach
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Traditional home building is slow, expensive, and often inconsistent. 
              We saw an opportunity to do better by partnering with industry-leading 
              CrossMod® home manufacturers and adding our own design-focused 
              site-built components.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              The result? Homes that look and feel like premium site-built construction, 
              delivered faster and more affordably. Each BaseMod home features a custom-designed 
              garage and porch built on-site, along with carefully curated exterior materials 
              and colors that ensure a cohesive, architectural aesthetic.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We don't just build homes—we develop communities. Our Grand Haven development 
              is designed with walkability, thoughtful lot placement, and shared green spaces 
              that foster connection among neighbors.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-border"
          >
            <div className="text-center text-muted-foreground">
              <Building size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">Team / Process Image</p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Values */}
      <Section className="bg-secondary">
        <SectionHeader
          title="What We Stand For"
          subtitle="The principles that guide every BaseMod home and community."
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {values.map((value, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full border-border hover:border-accent/50 transition-colors duration-300">
                <CardContent className="pt-8 pb-6 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                    <value.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Partnership */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Users className="h-12 w-12 text-accent mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-foreground">
              Built with Industry-Leading Partners
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Our manufacturing partners are industry leaders in CrossMod® and modular 
              home construction, bringing decades of experience in precision factory 
              production. Their commitment to quality and innovation aligns perfectly 
              with our vision for attainable, design-forward housing.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Together, we're redefining what's possible in residential development—combining 
              factory efficiency with custom craftsmanship to deliver homes that exceed expectations.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Process Timeline */}
      <Section className="bg-secondary">
        <SectionHeader
          title="The BaseMod Process"
          subtitle="From exploration to move-in, here's how we make homeownership happen."
        />

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                <div className="flex flex-col">
                  <span className="text-5xl font-bold text-accent/20 mb-2">{item.step}</span>
                  <h4 className="text-lg font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
              Ready to Learn More?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Whether you're ready to start or just exploring, we'd love to tell you 
              more about BaseMod and our Grand Haven development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/models">
                  Explore Home Models
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
}
