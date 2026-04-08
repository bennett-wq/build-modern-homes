// ============================================================================
// Quote Summary Page
// Displays a saved quote with all selections and buyer-facing pricing
// ============================================================================

import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  Palette, 
  ArrowLeft, 
  Copy, 
  Check, 
  Calendar,
  Phone,
  Mail,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Section } from '@/components/ui/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BuyerPricingDisplay, type BuyerPricingFlags } from '@/components/pricing/BuyerPricingDisplay';
import { getQuoteRequestById, type QuoteRequest } from '@/types/quote-request';
import { getPricingModeLabel } from '@/lib/pricing-mode-utils';
import { useToast } from '@/hooks/use-toast';

// Format price helper
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Format date helper
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Get quote type label
function getQuoteTypeLabel(type: QuoteRequest['type']): string {
  switch (type) {
    case 'build-on-my-land':
      return 'Build on My Land';
    case 'find-land':
      return 'Find Land to Build';
    case 'basemod-community':
      return 'BaseMod Community';
    default:
      return 'Quote Request';
  }
}

export default function QuoteSummary() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const { toast } = useToast();
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (quoteId) {
      const foundQuote = getQuoteRequestById(quoteId);
      setQuote(foundQuote);
    }
    setLoading(false);
  }, [quoteId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: 'Link copied!', description: 'Share this link with your team.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Section className="bg-background">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-muted-foreground">Loading quote...</div>
          </div>
        </Section>
      </Layout>
    );
  }

  if (!quote) {
    return (
      <Layout>
        <Section className="bg-background">
          <div className="max-w-lg mx-auto text-center py-16">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">Quote Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This quote may have expired or the link is invalid.
            </p>
            <Button asChild>
              <Link to="/models">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Homes
              </Link>
            </Button>
          </div>
        </Section>
      </Layout>
    );
  }

  // Build pricing flags from saved quote
  const pricingFlags: BuyerPricingFlags = quote.pricingFlags || {
    freightPending: false,
    basementSelectedRequiresQuote: false,
    estimateConfidence: 'medium',
    hasPricing: !!quote.buyerFacingBreakdown,
    pricingMode: quote.pricingMode,
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/models">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {getQuoteTypeLabel(quote.type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(quote.createdAt)}
                  </span>
                </div>
                <h1 className="text-3xl font-semibold text-foreground tracking-tight">
                  Quote #{quote.id}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Request Received
                </Badge>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <Section className="bg-background">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{quote.contact.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{quote.contact.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{quote.contact.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Selection Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="h-5 w-5 text-primary" />
                  Home Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.selection.developmentName && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Development</p>
                      <p className="font-medium">{quote.selection.developmentName}</p>
                      {quote.selection.lotLabel && (
                        <p className="text-sm text-muted-foreground">{quote.selection.lotLabel}</p>
                      )}
                    </div>
                  </div>
                )}

                {quote.selection.modelName && (
                  <div className="flex items-start gap-3">
                    <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-medium">The {quote.selection.modelName}</p>
                      {quote.selection.buildType && (
                        <p className="text-sm text-muted-foreground">
                          {quote.selection.buildType.toUpperCase()} build type
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {quote.selection.packageName && (
                  <div className="flex items-start gap-3">
                    <Palette className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Exterior Package</p>
                      <p className="font-medium">{quote.selection.packageName}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Build Details (if applicable) */}
            {quote.buildOnMyLandDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Site Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {quote.buildOnMyLandDetails.address && (
                    <div>
                      <p className="text-muted-foreground">Property Address</p>
                      <p className="font-medium">{quote.buildOnMyLandDetails.address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Water</p>
                      <p className="font-medium capitalize">{quote.buildOnMyLandDetails.waterType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sewer</p>
                      <p className="font-medium capitalize">{quote.buildOnMyLandDetails.sewerType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Foundation</p>
                      <p className="font-medium capitalize">{quote.buildOnMyLandDetails.foundationPreference}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Site Slope</p>
                      <p className="font-medium capitalize">{quote.buildOnMyLandDetails.slopeType}</p>
                    </div>
                  </div>
                  {quote.buildOnMyLandDetails.notes && (
                    <div>
                      <p className="text-muted-foreground">Notes</p>
                      <p className="font-medium">{quote.buildOnMyLandDetails.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Find Land Details */}
            {quote.findLandDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Land Search Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Target Area</p>
                    <p className="font-medium">{quote.findLandDetails.targetArea}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Budget Range</p>
                      <p className="font-medium capitalize">
                        {quote.findLandDetails.budgetRange.replace(/-/g, ' ').replace('k', 'K')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Timeline</p>
                      <p className="font-medium capitalize">
                        {quote.findLandDetails.timeline.replace(/-/g, ' ')}
                      </p>
                    </div>
                  </div>
                  {quote.findLandDetails.notes && (
                    <div>
                      <p className="text-muted-foreground">Notes</p>
                      <p className="font-medium">{quote.findLandDetails.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Pricing */}
          <div className="space-y-6">
            {quote.buyerFacingBreakdown ? (
              <BuyerPricingDisplay
                breakdown={quote.buyerFacingBreakdown}
                flags={pricingFlags}
                variant="full"
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-1">Pricing Pending</h3>
                  <p className="text-sm text-muted-foreground">
                    A detailed quote will be provided during your consultation.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pricing Mode Label */}
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Pricing Type</p>
              <p className="text-sm font-medium text-foreground">
                {getPricingModeLabel(quote.pricingMode)}
              </p>
            </div>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What Happens Next</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <p className="text-muted-foreground">
                    Our team will review your request within 1 business day.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <p className="text-muted-foreground">
                    We'll reach out to schedule a consultation call.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <p className="text-muted-foreground">
                    You'll receive a detailed, formal quote based on your selections.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Questions?</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/contact">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
