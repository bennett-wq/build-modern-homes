import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, TreePine, Car, ShoppingBag, Waves, Sun, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InteractiveSitePlan } from "@/components/siteplan/InteractiveSitePlan";
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

const locationHighlights = [
  {
    icon: Waves,
    title: "Lake Michigan Access",
    description: "Minutes from beautiful beaches and the iconic Grand Haven pier."
  },
  {
    icon: TreePine,
    title: "Natural Beauty",
    description: "Surrounded by parks, trails, and Michigan's stunning natural landscape."
  },
  {
    icon: ShoppingBag,
    title: "Downtown Walkability",
    description: "Close to Grand Haven's charming downtown shops and restaurants."
  },
  {
    icon: Car,
    title: "Easy Commuting",
    description: "Convenient access to major routes connecting to Holland and Grand Rapids."
  }
];

const developmentFeatures = [
  {
    icon: Sun,
    title: "Thoughtfully Planned Lots",
    description: "Each lot is sized and oriented to maximize natural light and privacy between homes."
  },
  {
    icon: TreePine,
    title: "Community Green Spaces",
    description: "Integrated green spaces and walking paths create a connected neighborhood feel."
  },
  {
    icon: MapPin,
    title: "Improved Infrastructure",
    description: "All lots come with utilities, roads, and site work already completed."
  }
];

export default function Development() {
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
              Grand Haven,<br />Michigan
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              A planned residential community featuring BaseMod Homes on improved lots, 
              designed for modern living in one of Michigan's most desirable coastal towns.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Site Plan */}
      <Section>
        <SectionHeader
          title="Community Site Plan"
          subtitle="Click on any lot to view details and request information. Zoom and pan to explore."
        />
        
        <InteractiveSitePlan developmentSlug="grand-haven" />
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
          {developmentFeatures.map((feature, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full border-border hover:border-accent/50 transition-colors duration-300">
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
              Why Grand Haven?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Grand Haven offers the perfect blend of small-town charm and natural beauty. 
              Known for its stunning sunsets, vibrant downtown, and welcoming community, 
              it's an ideal place to call home.
            </p>
            
            <div className="space-y-6">
              {locationHighlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <highlight.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{highlight.title}</h4>
                    <p className="text-muted-foreground text-sm">{highlight.description}</p>
                  </div>
                </motion.div>
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
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/models">
                  Browse Home Models
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/contact">
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
