import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin, CheckCircle, Home, MapPinned, Palette, DoorOpen, ShieldCheck, Calendar, DollarSign } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { homeModels } from "./Models";
import { homeModels as modelsData } from "@/data/models";
import { exteriorPackages, garageDoors } from "@/data/packages";
import { developments } from "@/data/developments";

// Helper to format slug to display name
const formatSlug = (slug: string | null): string => {
  if (!slug) return '';
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

interface SelectionSummary {
  development: string | null;
  lot: string | null;
  model: string | null;
  package: string | null;
  garage: string | null;
}

export default function Contact() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Get all query params for pre-fill
  const selections: SelectionSummary = {
    development: searchParams.get('development'),
    lot: searchParams.get('lot'),
    model: searchParams.get('model'),
    package: searchParams.get('package'),
    garage: searchParams.get('garage'),
  };

  // Financing interest params
  const financingInterest = searchParams.get('financing_interest') === 'true';
  const intendedUse = searchParams.get('intended_use');
  const creditRange = searchParams.get('credit_range');
  const timeframe = searchParams.get('timeframe');

  // Check if we have any selections to display
  const hasSelections = Object.values(selections).some(v => v !== null) || financingInterest;

  // Resolve display names for selections
  const displayNames = useMemo(() => {
    const dev = developments.find(d => d.slug === selections.development);
    const model = modelsData.find(m => m.slug === selections.model);
    const pkg = exteriorPackages.find(p => p.id === selections.package);
    const garage = garageDoors.find(g => g.id === selections.garage);

    return {
      development: dev?.name || formatSlug(selections.development),
      lot: selections.lot ? `Lot ${selections.lot}` : null,
      model: model?.name || formatSlug(selections.model),
      package: pkg?.name || formatSlug(selections.package),
      garage: garage?.name || formatSlug(selections.garage),
    };
  }, [selections.development, selections.lot, selections.model, selections.package, selections.garage]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    model: "",
    message: ""
  });

  // Pre-fill message when selection params exist
  useEffect(() => {
    if (hasSelections) {
      const parts: string[] = [];
      
      if (displayNames.development) {
        parts.push(`the ${displayNames.development} development`);
      }
      if (displayNames.lot) {
        parts.push(displayNames.lot);
      }
      if (displayNames.model) {
        parts.push(`The ${displayNames.model} model`);
      }
      if (displayNames.package) {
        parts.push(`${displayNames.package} exterior package`);
      }
      if (displayNames.garage) {
        parts.push(`${displayNames.garage} garage door`);
      }

      if (parts.length > 0) {
        const summary = parts.join(', ');
        setFormData(prev => ({
          ...prev,
          message: `I'm interested in: ${summary}. Please contact me with more information and next steps.`
        }));
      }
    }
  }, [hasSelections, displayNames.development, displayNames.lot, displayNames.model, displayNames.package, displayNames.garage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission - will be replaced with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message Sent!",
      description: "We'll be in touch within 1-2 business days.",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <Layout>
        <Section className="min-h-[70vh] flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-3xl font-semibold mb-4 text-foreground">Thank You!</h1>
            <p className="text-muted-foreground text-lg mb-8">
              We've received your message and will be in touch within 1-2 business days 
              to schedule your design and pricing call.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ name: "", email: "", phone: "", model: "", message: "" });
              }}
              variant="outline"
            >
              Send Another Message
            </Button>
          </motion.div>
        </Section>
      </Layout>
    );
  }

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
              Get Started
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
              Let's Talk About<br />Your New Home
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Ready to explore your options? Fill out the form below and our team 
              will reach out to schedule a personalized design and pricing consultation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <Section>
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">
                  Schedule a Design & Pricing Call
                </h2>

                {/* Your Selections Summary Block */}
                {hasSelections && (
                  <div className="mb-8 p-4 bg-secondary rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                      Your Selections
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {displayNames.development && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPinned className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground">Development:</span>
                          <span className="font-medium text-foreground">{displayNames.development}</span>
                        </div>
                      )}
                      {displayNames.lot && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground">Lot:</span>
                          <span className="font-medium text-foreground">{displayNames.lot}</span>
                        </div>
                      )}
                      {displayNames.model && (
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground">Model:</span>
                          <span className="font-medium text-foreground">The {displayNames.model}</span>
                        </div>
                      )}
                      {displayNames.package && (
                        <div className="flex items-center gap-2 text-sm">
                          <Palette className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground">Package:</span>
                          <span className="font-medium text-foreground">{displayNames.package}</span>
                        </div>
                      )}
                      {displayNames.garage && (
                        <div className="flex items-center gap-2 text-sm">
                          <DoorOpen className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground">Garage:</span>
                          <span className="font-medium text-foreground">{displayNames.garage}</span>
                        </div>
                      )}
                      {financingInterest && (
                        <div className="flex items-center gap-2 text-sm col-span-full pt-2 border-t border-border/50">
                          <ShieldCheck className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground">Financing Interest:</span>
                          <span className="font-medium text-foreground">Yes — Conventional financing inquiry</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Hidden fields for selections */}
                  {selections.development && (
                    <input type="hidden" name="development" value={selections.development} />
                  )}
                  {selections.lot && (
                    <input type="hidden" name="lot" value={selections.lot} />
                  )}
                  {selections.model && (
                    <input type="hidden" name="model_selection" value={selections.model} />
                  )}
                  {selections.package && (
                    <input type="hidden" name="package" value={selections.package} />
                  )}
                  {selections.garage && (
                    <input type="hidden" name="garage" value={selections.garage} />
                  )}

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    {/* Only show model selector if no model was pre-selected */}
                    {!selections.model && (
                      <div className="space-y-2">
                        <Label htmlFor="model">Interested Model</Label>
                        <Select
                          value={formData.model}
                          onValueChange={(value) => handleChange("model", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="undecided">Not sure yet</SelectItem>
                            {homeModels.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                The {model.name} ({model.sqft.toLocaleString()} sq ft)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Tell us about your timeline, questions, or anything else..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Location</h4>
                    <p className="text-muted-foreground text-sm">
                      Grand Haven, Michigan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                    <a
                      href="tel:+1234567890"
                      className="text-muted-foreground text-sm hover:text-accent transition-colors"
                    >
                      (123) 456-7890
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email</h4>
                    <a
                      href="mailto:info@basemod.dev"
                      className="text-muted-foreground text-sm hover:text-accent transition-colors"
                    >
                      info@basemod.dev
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary border-accent/20">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-3">What to Expect</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <span>Response within 1-2 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <span>30-minute design consultation call</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <span>Personalized pricing based on your selections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <span>No pressure, just helpful information</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
}
