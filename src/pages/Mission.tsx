import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function Mission() {
  return (
    <Layout>
      {/* Hero/Opening Section - White */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.08] tracking-tight mb-8">
              The housing market failed a generation. We're building the fix.
            </h1>
            
            <div className="space-y-8 text-lg text-muted-foreground leading-relaxed-lg max-w-2xl">
              <p>
                Here's the math: there are millions of families earning enough to afford a mortgage who still can't buy a home. Not because they're not ready—because the system isn't.
              </p>
              <p>
                Traditional homebuilding is slow, expensive, opaque, and wildly inconsistent. It works fine if you have time, cash, and tolerance for chaos. For everyone else? It's a wall.
              </p>
              <p>
                Meanwhile, an entire generation has been pushed into permanent renting. Not by choice—by exclusion. And every year they wait, the gap gets wider. The wealth doesn't build. The roots don't form. The communities don't hold.
              </p>
              <p>
                This isn't a market correction waiting to happen. It's a structural failure that requires a structural fix.
              </p>
              <p className="text-foreground font-medium">
                That's why we exist.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We're Here To Do - Warm Cream */}
      <section className="py-24 lg:py-32 bg-warm-cream">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-8">
              What we're here to do
            </h2>
            
            <div className="space-y-8 text-lg text-muted-foreground leading-relaxed-lg">
              <p>
                BaseMod exists to make homeownership systematically attainable—not through subsidies or shortcuts, but through better infrastructure.
              </p>
              <p>
                We're building the system the housing market should have had all along: transparent pricing, reliable timelines, quality that doesn't depend on which crew shows up, and a process designed to scale.
              </p>
              <p>
                This isn't charity. It's not disruption for disruption's sake. It's correction—applied at the infrastructure level, where it actually compounds.
              </p>
              <p className="text-foreground font-medium">
                The families who should be homeowners? They're not a niche. They're the mass market that got left behind. We're going to meet them.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pull Quote Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.blockquote 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border-l-4 border-accent pl-8 max-w-2xl mx-auto"
          >
            <p className="text-2xl lg:text-3xl text-foreground font-medium">
              "This isn't charity. It's correction."
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* What We Believe - White */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-8">
              What we believe
            </h2>
            
            <div className="space-y-8 text-lg text-muted-foreground leading-relaxed-lg">
              <p className="text-xl text-foreground font-medium">
                Ownership is infrastructure.
              </p>
              <p>
                When people own their homes, they own a stake in their neighborhoods. They fix things. They show up. They plan in decades instead of lease cycles. That's not soft—it's structural. Ownership creates rootedness. Rootedness creates investment. Investment creates communities that compound instead of churn.
              </p>
              <p>
                The inverse is also true. When ownership disappears, so does stake. People check out. They stop caring about the block, the school, the town. Pride becomes transactional. Communities become fragile.
              </p>
              <p>
                We've watched this happen for twenty years. We don't think it's inevitable.
              </p>
              <p className="text-foreground font-medium">
                Scale the path to ownership, and you scale the foundation of stable communities. That's not a tagline—that's the math. And we're here to prove it works.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How We're Built - Warm Cream */}
      <section className="py-24 lg:py-32 bg-warm-cream">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              How we're built
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed-lg mb-10">
              We're not a tech company cosplaying as a builder. We're not a builder with a website. We're an infrastructure company for housing—built from scratch to deliver at scale.
            </p>
            
            <ul className="space-y-6 mb-10">
              <li className="flex items-start gap-4">
                <span className="w-2 h-2 rounded-full bg-accent mt-3 flex-shrink-0" />
                <p className="text-lg text-muted-foreground leading-relaxed-lg">
                  <span className="text-foreground font-medium">A digital platform that makes the process legible:</span> pricing, timelines, and progress you can actually see—without chasing anyone down.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-2 h-2 rounded-full bg-accent mt-3 flex-shrink-0" />
                <p className="text-lg text-muted-foreground leading-relaxed-lg">
                  <span className="text-foreground font-medium">Manufacturing partnerships built for volume:</span> consistent quality, predictable timelines, purchasing power that bends the cost curve.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-2 h-2 rounded-full bg-accent mt-3 flex-shrink-0" />
                <p className="text-lg text-muted-foreground leading-relaxed-lg">
                  <span className="text-foreground font-medium">Accountable site execution:</span> delivery and installation that's scoped, managed, and owned—because most builders fail in the last mile.
                </p>
              </li>
            </ul>
            
            <p className="text-lg text-foreground font-medium leading-relaxed-lg">
              The result: homes that cost less, arrive faster, and hold up better. Not because of magic. Because of systems designed to work at ten thousand homes, not ten.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Closing Section - Dark */}
      <section className="py-24 lg:py-32 bg-primary">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-8">
              This is the decade housing gets rebuilt.
            </h2>
            
            <div className="space-y-8 text-lg text-primary-foreground/80 leading-relaxed-lg mb-10">
              <p>
                The demand is there. The families are ready. The old system can't meet them—and it never will.
              </p>
              <p>
                What's been missing is infrastructure: a way to deliver quality homes, at accessible prices, with transparent processes, at genuine scale. Not pilot projects. Not waitlists. A real path that works for the mass market.
              </p>
              <p>
                That's what we're building. One home at a time. One community at a time. Until the path to ownership is open again for everyone who's ready to walk it.
              </p>
              <p className="text-primary-foreground font-medium">
                The housing market failed a generation. We're not waiting for someone else to fix it.
              </p>
              <p className="text-xl text-primary-foreground font-semibold">
                This is the work. And we're just getting started.
              </p>
            </div>
            
            <Button
              asChild
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:shadow-xl"
              style={{ boxShadow: '0 0 20px rgba(184, 134, 11, 0.3)' }}
            >
              <Link to="/build">
                Design Your Home
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
