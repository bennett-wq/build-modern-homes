import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Section, CalloutCard, Container } from "@/components/marketing";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { brandMessaging } from "@/content/brandMessaging";

export default function Mission() {
  return (
    <Layout>
      <SEO 
        title={brandMessaging.meta.mission.title} 
        description={brandMessaging.meta.mission.description} 
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
              Our Mission
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.05]">
              {brandMessaging.mission.pageTitle}
            </h1>
          </motion.div>
        </Container>
      </section>

      {/* Opening */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="prose-constrain-lg mx-auto"
        >
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
            {brandMessaging.mission.opening}
          </p>
        </motion.div>
      </Section>

      {/* Promise */}
      <Section background="muted" spacing="default">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <CalloutCard variant="quote">
            {brandMessaging.mission.promise}
          </CalloutCard>
        </motion.div>
      </Section>

      {/* Belief */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="prose-constrain-lg mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-6">
            What we believe
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {brandMessaging.mission.belief}
          </p>
        </motion.div>
      </Section>

      <Container className="py-0">
        <Separator className="max-w-2xl mx-auto" />
      </Container>

      {/* Method */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="prose-constrain-lg mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-6">
            How we do it
          </h2>
          <CalloutCard variant="bordered">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {brandMessaging.mission.method}
            </p>
          </CalloutCard>
        </motion.div>
      </Section>

      {/* Closing */}
      <section className="py-20 sm:py-24 lg:py-32 bg-primary">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-primary-foreground tracking-tight">
              {brandMessaging.mission.closing}
            </p>
          </motion.div>
        </Container>
      </section>
    </Layout>
  );
}
