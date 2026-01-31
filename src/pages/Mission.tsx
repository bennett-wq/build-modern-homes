import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { brandMessaging } from "@/content/brandMessaging";

export default function Mission() {
  return (
    <Layout>
      <SEO 
        title={brandMessaging.meta.mission.title} 
        description={brandMessaging.meta.mission.description} 
      />
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
              Our Mission
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              {brandMessaging.mission.pageTitle}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Opening */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
              {brandMessaging.mission.opening}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Promise */}
      <section className="py-20 lg:py-28 bg-secondary/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
              {brandMessaging.mission.promise}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Belief */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              What we believe
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {brandMessaging.mission.belief}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Method */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              How we do it
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {brandMessaging.mission.method}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-24 lg:py-32 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-2xl md:text-3xl font-semibold text-primary-foreground">
              {brandMessaging.mission.closing}
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
