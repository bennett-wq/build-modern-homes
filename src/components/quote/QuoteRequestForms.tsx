// ============================================================================
// Quote Request Modal Forms
// Forms for Build on My Land, Find Land, and Community Interest
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Check,
  Copy,
  MapPin,
  Home,
  Search,
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  type QuoteRequest,
  type QuoteRequestType,
  type ContactInfo,
  type BuildOnMyLandDetails,
  type FindLandDetails,
  type SelectionSummary,
  type UtilityType,
  type FoundationType,
  type SlopeType,
  type TimelineType,
  type BudgetRange,
  generateQuoteId,
  saveQuoteRequest,
  getQuoteShareableUrl,
} from '@/types/quote-request';
import type { BuyerFacingBreakdown } from '@/hooks/usePricingEngine';
import type { BuyerPricingFlags } from '@/components/pricing/BuyerPricingDisplay';
import type { PricingMode } from '@/data/pricing-layers';

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

interface ContactFieldsProps {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
}

function ContactFields({ contact, onChange }: ContactFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Full Name *</Label>
          <Input
            id="contact-name"
            required
            value={contact.name}
            onChange={(e) => onChange({ ...contact, name: e.target.value })}
            placeholder="John Smith"
            className="transition-shadow focus:shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone *</Label>
          <Input
            id="contact-phone"
            type="tel"
            required
            value={contact.phone}
            onChange={(e) => onChange({ ...contact, phone: e.target.value })}
            placeholder="(123) 456-7890"
            className="transition-shadow focus:shadow-sm"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email *</Label>
        <Input
          id="contact-email"
          type="email"
          required
          value={contact.email}
          onChange={(e) => onChange({ ...contact, email: e.target.value })}
          placeholder="john@example.com"
          className="transition-shadow focus:shadow-sm"
        />
      </div>
    </div>
  );
}

interface ConfirmationScreenProps {
  quoteId: string;
  onClose: () => void;
}

function ConfirmationScreen({ quoteId, onClose }: ConfirmationScreenProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const shareableUrl = getQuoteShareableUrl(quoteId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      toast({ title: 'Link copied!', description: 'Share this link to view your quote summary.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6 space-y-6"
    >
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Request Received!</h3>
        <p className="text-muted-foreground">
          We'll be in touch within 1 business day to discuss your home.
        </p>
      </div>

      <div className="bg-muted rounded-lg p-4 space-y-3">
        <p className="text-sm text-muted-foreground">Your quote reference:</p>
        <p className="font-mono text-lg font-semibold text-foreground">{quoteId}</p>
        
        <div className="flex items-center gap-2 bg-background rounded-md border p-2">
          <input
            type="text"
            value={shareableUrl}
            readOnly
            className="flex-1 text-xs bg-transparent border-none outline-none text-muted-foreground truncate"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button onClick={onClose} className="w-full">
        Done
      </Button>
    </motion.div>
  );
}

// ============================================================================
// BUILD ON MY LAND FORM
// ============================================================================

interface BuildOnMyLandFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: SelectionSummary;
  buyerFacingBreakdown?: BuyerFacingBreakdown;
  pricingFlags?: BuyerPricingFlags;
  pricingMode: PricingMode;
}

export function BuildOnMyLandForm({
  open,
  onOpenChange,
  selection,
  buyerFacingBreakdown,
  pricingFlags,
  pricingMode,
}: BuildOnMyLandFormProps) {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteId, setQuoteId] = useState('');
  
  const [contact, setContact] = useState<ContactInfo>({ name: '', email: '', phone: '' });
  const [hasLand, setHasLand] = useState(true);
  const [details, setDetails] = useState<BuildOnMyLandDetails>({
    hasLand: true,
    address: '',
    waterType: 'unknown',
    sewerType: 'unknown',
    foundationPreference: 'unknown',
    slopeType: 'unknown',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const id = generateQuoteId();
    const quote: QuoteRequest = {
      id,
      type: 'build-on-my-land',
      createdAt: new Date().toISOString(),
      contact,
      buildOnMyLandDetails: { ...details, hasLand },
      selection,
      buyerFacingBreakdown,
      pricingFlags,
      pricingMode,
      status: 'pending',
    };
    
    saveQuoteRequest(quote);
    setQuoteId(id);
    setIsSubmitting(false);
    setStep('confirmation');
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after close animation
    setTimeout(() => {
      setStep('form');
      setContact({ name: '', email: '', phone: '' });
      setHasLand(true);
      setDetails({
        hasLand: true,
        address: '',
        waterType: 'unknown',
        sewerType: 'unknown',
        foundationPreference: 'unknown',
        slopeType: 'unknown',
        notes: '',
      });
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <AnimatePresence mode="wait">
          {step === 'confirmation' ? (
            <ConfirmationScreen quoteId={quoteId} onClose={handleClose} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Build on Your Land
                </DialogTitle>
                <DialogDescription>
                  Tell us about your property and we'll prepare a custom quote.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                <ContactFields contact={contact} onChange={setContact} />

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox
                      id="has-land"
                      checked={hasLand}
                      onCheckedChange={(checked) => setHasLand(!!checked)}
                    />
                    <Label htmlFor="has-land" className="text-sm">
                      I already have land
                    </Label>
                  </div>

                  {hasLand && (
                    <div className="space-y-4 pl-6 border-l-2 border-muted">
                      <div className="space-y-2">
                        <Label htmlFor="address">Property Address</Label>
                        <Input
                          id="address"
                          value={details.address}
                          onChange={(e) => setDetails({ ...details, address: e.target.value })}
                          placeholder="123 Main St, City, State"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Water Source</Label>
                          <Select
                            value={details.waterType}
                            onValueChange={(v) => setDetails({ ...details, waterType: v as UtilityType })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public / Municipal</SelectItem>
                              <SelectItem value="well">Well</SelectItem>
                              <SelectItem value="unknown">I don't know</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Sewer Type</Label>
                          <Select
                            value={details.sewerType}
                            onValueChange={(v) => setDetails({ ...details, sewerType: v as UtilityType })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public Sewer</SelectItem>
                              <SelectItem value="septic">Septic</SelectItem>
                              <SelectItem value="unknown">I don't know</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Foundation Preference</Label>
                          <Select
                            value={details.foundationPreference}
                            onValueChange={(v) => setDetails({ ...details, foundationPreference: v as FoundationType })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="crawl">Crawl Space</SelectItem>
                              <SelectItem value="basement">Basement</SelectItem>
                              <SelectItem value="unknown">Not sure yet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Site Slope</Label>
                          <Select
                            value={details.slopeType}
                            onValueChange={(v) => setDetails({ ...details, slopeType: v as SlopeType })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flat">Flat / Level</SelectItem>
                              <SelectItem value="moderate">Moderate Slope</SelectItem>
                              <SelectItem value="steep">Steep</SelectItem>
                              <SelectItem value="unknown">I don't know</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={details.notes}
                    onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                    placeholder="Any other details about your project..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// FIND LAND FORM
// ============================================================================

interface FindLandFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: SelectionSummary;
  buyerFacingBreakdown?: BuyerFacingBreakdown;
  pricingFlags?: BuyerPricingFlags;
  pricingMode: PricingMode;
}

export function FindLandForm({
  open,
  onOpenChange,
  selection,
  buyerFacingBreakdown,
  pricingFlags,
  pricingMode,
}: FindLandFormProps) {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteId, setQuoteId] = useState('');
  
  const [contact, setContact] = useState<ContactInfo>({ name: '', email: '', phone: '' });
  const [details, setDetails] = useState<FindLandDetails>({
    targetArea: '',
    budgetRange: 'unknown',
    timeline: 'unknown',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const id = generateQuoteId();
    const quote: QuoteRequest = {
      id,
      type: 'find-land',
      createdAt: new Date().toISOString(),
      contact,
      findLandDetails: details,
      selection,
      buyerFacingBreakdown,
      pricingFlags,
      pricingMode,
      status: 'pending',
    };
    
    saveQuoteRequest(quote);
    setQuoteId(id);
    setIsSubmitting(false);
    setStep('confirmation');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('form');
      setContact({ name: '', email: '', phone: '' });
      setDetails({
        targetArea: '',
        budgetRange: 'unknown',
        timeline: 'unknown',
        notes: '',
      });
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <AnimatePresence mode="wait">
          {step === 'confirmation' ? (
            <ConfirmationScreen quoteId={quoteId} onClose={handleClose} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Find Land to Build
                </DialogTitle>
                <DialogDescription>
                  Tell us where you'd like to build and we'll help you find the right land.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                <ContactFields contact={contact} onChange={setContact} />

                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-area">Target Area *</Label>
                    <Input
                      id="target-area"
                      required
                      value={details.targetArea}
                      onChange={(e) => setDetails({ ...details, targetArea: e.target.value })}
                      placeholder="City, county, or region"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Budget Range</Label>
                      <Select
                        value={details.budgetRange}
                        onValueChange={(v) => setDetails({ ...details, budgetRange: v as BudgetRange })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-300k">Under $300,000</SelectItem>
                          <SelectItem value="300k-400k">$300,000 - $400,000</SelectItem>
                          <SelectItem value="400k-500k">$400,000 - $500,000</SelectItem>
                          <SelectItem value="500k-plus">$500,000+</SelectItem>
                          <SelectItem value="unknown">Not sure yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Timeline</Label>
                      <Select
                        value={details.timeline}
                        onValueChange={(v) => setDetails({ ...details, timeline: v as TimelineType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asap">As soon as possible</SelectItem>
                          <SelectItem value="3-6-months">3-6 months</SelectItem>
                          <SelectItem value="6-12-months">6-12 months</SelectItem>
                          <SelectItem value="12-plus-months">12+ months</SelectItem>
                          <SelectItem value="unknown">Just exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="find-notes">Additional Notes</Label>
                  <Textarea
                    id="find-notes"
                    value={details.notes}
                    onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                    placeholder="Any preferences for land size, features, etc..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request Help Finding Land
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// NEXT STEP CARDS COMPONENT
// ============================================================================

interface NextStepCardsProps {
  selection: SelectionSummary;
  buyerFacingBreakdown?: BuyerFacingBreakdown;
  pricingFlags?: BuyerPricingFlags;
  pricingMode: PricingMode;
  className?: string;
}

export function NextStepCards({
  selection,
  buyerFacingBreakdown,
  pricingFlags,
  pricingMode,
  className = '',
}: NextStepCardsProps) {
  const [showBuildOnMyLand, setShowBuildOnMyLand] = useState(false);
  const [showFindLand, setShowFindLand] = useState(false);

  const cards = [
    {
      id: 'build-on-my-land',
      icon: Home,
      title: 'Build on My Land',
      description: 'Already have property? We will prepare a site-specific quote for your lot.',
      cta: 'Get Quote',
      onClick: () => setShowBuildOnMyLand(true),
    },
    {
      id: 'find-land',
      icon: Search,
      title: 'Find Land to Build',
      description: 'Need help finding the right lot? We will match you with available land.',
      cta: 'Start Search',
      onClick: () => setShowFindLand(true),
    },
    {
      id: 'basemod-community',
      icon: Building2,
      title: 'BaseMod Community',
      description: 'Explore turnkey lots in our planned communities with streamlined builds.',
      cta: 'View Communities',
      href: '/developments',
    },
  ];

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-foreground">Take the Next Step</h3>
        
        <div className="grid gap-3 sm:grid-cols-3">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              {card.href ? (
                <a
                  href={card.href}
                  className="block h-full p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <CardContent card={card} />
                </a>
              ) : (
                <button
                  onClick={card.onClick}
                  className="w-full h-full p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all text-left group"
                >
                  <CardContent card={card} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <BuildOnMyLandForm
        open={showBuildOnMyLand}
        onOpenChange={setShowBuildOnMyLand}
        selection={selection}
        buyerFacingBreakdown={buyerFacingBreakdown}
        pricingFlags={pricingFlags}
        pricingMode={pricingMode}
      />
      
      <FindLandForm
        open={showFindLand}
        onOpenChange={setShowFindLand}
        selection={selection}
        buyerFacingBreakdown={buyerFacingBreakdown}
        pricingFlags={pricingFlags}
        pricingMode={pricingMode}
      />
    </>
  );
}

function CardContent({ card }: { card: { icon: React.ElementType; title: string; description: string; cta: string } }) {
  const Icon = card.icon;
  
  return (
    <div className="flex flex-col h-full">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h4 className="font-medium text-foreground mb-1">{card.title}</h4>
      <p className="text-sm text-muted-foreground flex-1 mb-3">{card.description}</p>
      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
        {card.cta}
        <ArrowRight className="w-4 h-4" />
      </span>
    </div>
  );
}
