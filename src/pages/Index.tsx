import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home, Palette, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import hawthornHomepage from "@/assets/homes/hawthorn-homepage.png";

const features = [
  {
    icon: Home,
    title: "Factory-Built Precision",
    description: "CrossMod® homes built with exceptional quality control in a climate-controlled factory environment."
  },
  {
    icon: Palette,
    title: "Curated Design Options",
    description: "Select from thoughtfully curated exterior colors, materials, and garage door styles."
  },
  {
    icon: MapPin,
    title: "Growing Communities",
    description: "Thoughtfully planned developments across the country, from Michigan to Florida."
  }
];

const highlights = [
  "Site-built garages and porches",
  "Premium exterior finishes",
  "Energy-efficient construction",
  "Modern open floor plans",
  "Quick build timelines",
  "Attainable pricing"
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-charcoal to-charcoal-dark overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-block text-wood font-medium tracking-wider uppercase text-sm mb-4">
                Modern Living, Attainable Pricing
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Modern Homes.
                <br />
                <span className="text-wood">Thoughtfully Built.</span>
                <br />
                Nationwide.
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-lg">
                BaseMod Developments creates thoughtfully planned communities featuring CrossMod® homes 
                with site-built garages and porches—quality, efficiency, and modern design at attainable prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-wood hover:bg-wood-dark text-white">
                  <Link to="/developments">
                    Explore Communities
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Link to="/models">View Home Models</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-wood hover:text-wood-dark hover:bg-wood/10">
                  <Link to="/design-studio">Design Your Exterior</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal-light shadow-2xl">
                <img 
                  src={hawthornHomepage} 
                  alt="BaseMod Hawthorn home exterior featuring cedar accents and modern design" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-wood/20 rounded-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-wood/30 rounded-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Section className="bg-cream">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              The BaseMod Difference
            </h2>
            <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
              We combine the precision of factory construction with custom site-built elements 
              to deliver homes that exceed expectations.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-14 h-14 bg-wood/10 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-wood" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">{feature.title}</h3>
              <p className="text-charcoal/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Highlights Section */}
      <Section className="bg-charcoal">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Quality Construction,
              <br />
              <span className="text-wood">Attainable Pricing</span>
            </h2>
            <p className="text-white/70 mb-8">
              Every BaseMod Home features a CrossMod® factory-built core enhanced with 
              BaseMod-designed, site-built garages and porches, creating a seamless blend 
              of efficiency and customization.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-wood flex-shrink-0" />
                  <span className="text-white/90">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal-light"
          >
            <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal-dark flex items-center justify-center">
              <div className="text-center p-8">
                <Home className="w-16 h-16 text-wood mx-auto mb-4" />
                <p className="text-white/60 text-sm">Home gallery placeholder</p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-cream">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-6">
            Ready to Design Your Home?
          </h2>
          <p className="text-lg text-charcoal/70 mb-8">
            Explore our collection of floor plans and customize your exterior 
            with our interactive Design Studio.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-charcoal hover:bg-charcoal-dark text-white">
              <Link to="/models">
                Browse Models
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-charcoal text-charcoal hover:bg-charcoal hover:text-white">
              <Link to="/contact">Schedule a Call</Link>
            </Button>
          </div>
        </motion.div>
      </Section>
    </Layout>
  );
};

export default Index;
