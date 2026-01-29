// ============================================================================
// Step 8: Summary + CTA
// Uses canonical pricing function for consistent totals
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronDown, ChevronUp, Check, Copy, Home, MapPin, 
  Search, Building2, Phone, Mail, AlertCircle, Download, Eye, Info, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { type ModelConfig, type BuildIntent, type BuildType, exteriorConfig } from '@/data/pricing-config';
import type { PriceBreakdown, ExteriorSelection } from '@/hooks/usePricingEngine';
import { getExteriorPreviewInfo } from '@/lib/exterior-preview-utils';
import { cn } from '@/lib/utils';
import { 
  calculatePriceBreakdown as calcCanonicalPricing,
  formatPrice as formatCanonicalPrice,
  getServicePackageHeadline,
  type ServicePackage,
} from '@/lib/pricing/calculatePriceBreakdown';

interface StepSummaryProps {
  model: ModelConfig;
  buildType: string;
  breakdown: PriceBreakdown;
  exteriorSelection: ExteriorSelection;
  intent: BuildIntent | null;
  formatPrice: (price: number) => string;
  onCopyLink: () => Promise<string>;
  onBack: () => void;
  // New props for unified exterior design confirmation
  packageId?: string | null;
  garageDoorId?: string | null;
  // Fee toggle props
  zipCode: string;
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
  onUtilityFeesChange: (value: boolean) => void;
  onPermitsCostsChange: (value: boolean) => void;
  // Service package selection
  servicePackage?: 'delivered_installed' | 'supply_only' | 'community_all_in';
  // Selected option IDs for canonical pricing
  selectedOptionIds?: string[];
}

export function StepSummary({
  model,
  buildType,
  breakdown,
  exteriorSelection,
  intent,
  formatPrice,
  onCopyLink,
  onBack,
  packageId,
  garageDoorId,
  zipCode,
  includeUtilityFees,
  includePermitsCosts,
  onUtilityFeesChange,
  onPermitsCostsChange,
  servicePackage = 'delivered_installed',
  selectedOptionIds = [],
}: StepSummaryProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showInstalledEstimate, setShowInstalledEstimate] = useState(false);
  const { toast } = useToast();
  
  // Map service package to canonical pricing format
  const canonicalServicePackage: ServicePackage = servicePackage === 'supply_only' ? 'home_only' : 'installed';
  
  // Calculate canonical pricing - SINGLE SOURCE OF TRUTH
  const canonicalPricing = useMemo(() => {
    return calcCanonicalPricing({
      modelSlug: model.slug,
      buildType: buildType as BuildType,
      servicePackage: canonicalServicePackage,
      selectedOptionIds,
      includeFeesAllowance: includeUtilityFees || includePermitsCosts,
      includeSiteworkContingency: true,
    });
  }, [model.slug, buildType, canonicalServicePackage, selectedOptionIds, includeUtilityFees, includePermitsCosts]);
  
  // Determine if location is known (has valid ZIP)
  const hasValidZip = zipCode && zipCode.length === 5;
  
  // Set default toggle values based on ZIP presence (only on mount)
  useEffect(() => {
    if (!hasValidZip) {
      // No ZIP = turn off fees by default (preliminary estimate)
      onUtilityFeesChange(false);
      onPermitsCostsChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount
  
  const handleCopyLink = async () => {
    await onCopyLink();
    setCopied(true);
    toast({
      title: 'Link copied!',
      description: 'Share this link to save your build configuration.',
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Get legacy exterior selections (with null guards)
  const selectedSiding = exteriorSelection?.sidingColorId 
    ? exteriorConfig.sidingColors.find(c => c.id === exteriorSelection.sidingColorId)
    : null;
  const selectedShingle = exteriorSelection?.shingleColorId
    ? exteriorConfig.shingleColors.find(c => c.id === exteriorSelection.shingleColorId)
    : null;
  const selectedDoor = exteriorSelection?.doorStyleId
    ? exteriorConfig.doorStyles.find(d => d.id === exteriorSelection.doorStyleId)
    : null;
  
  // Get unified exterior preview info (if packageId/garageDoorId are provided)
  const exteriorInfo = getExteriorPreviewInfo(model.slug, packageId || null, garageDoorId || null);
  const hasUnifiedExterior = packageId || garageDoorId;
  
  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3"
        >
          Your Build Summary
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Review your selections and take the next step.
        </motion.p>
      </div>
      
      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Model Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Home</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium text-foreground">{model.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Build Type</span>
                <span className="font-medium text-foreground uppercase">{buildType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Square Feet</span>
                <span className="font-medium text-foreground">{model.sqft.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Beds / Baths</span>
                <span className="font-medium text-foreground">{model.beds} / {model.baths}</span>
              </div>
            </div>
          </div>
          
          {/* Exterior Design Card - Unified (if available) or Legacy */}
          {hasUnifiedExterior ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-accent" />
                    <h3 className="font-semibold text-foreground">Exterior Design</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Your selected look</p>
                </div>
                
                {/* Preview Image */}
                <div className="relative aspect-video bg-muted">
                  <img
                    src={imageError ? `/images/models/${model.slug}/${model.slug}-hero.jpg` : exteriorInfo.imageSrc}
                    alt="Final exterior preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-xs text-white/80">Final exterior preview</p>
                  </div>
                </div>
                
                {/* Selection Summary */}
                <div className="px-5 py-4 space-y-3">
                  {exteriorInfo.packageName && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Exterior package</span>
                      <div className="flex items-center gap-2">
                        {exteriorInfo.packageColor && (
                          <div 
                            className="w-4 h-4 rounded-sm border border-border shadow-sm"
                            style={{ backgroundColor: exteriorInfo.packageColor }}
                          />
                        )}
                        <span className="font-medium text-foreground">{exteriorInfo.packageName}</span>
                      </div>
                    </div>
                  )}
                  {exteriorInfo.garageName && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Garage style</span>
                      <div className="flex items-center gap-2">
                        {exteriorInfo.garageColor && (
                          <div 
                            className="w-4 h-4 rounded-sm border border-border shadow-sm"
                            style={{ backgroundColor: exteriorInfo.garageColor }}
                          />
                        )}
                        <span className="font-medium text-foreground">{exteriorInfo.garageName}</span>
                        {exteriorInfo.isUpgradeGarage && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Upgrade
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Exterior Style</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Siding</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded border border-border"
                      style={{ backgroundColor: selectedSiding?.hex }}
                    />
                    <span className="font-medium text-foreground">{selectedSiding?.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shingles</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded border border-border"
                      style={{ backgroundColor: selectedShingle?.hex }}
                    />
                    <span className="font-medium text-foreground">{selectedShingle?.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Door Style</span>
                  <span className="font-medium text-foreground">{selectedDoor?.name}</span>
                </div>
                {exteriorSelection?.blackFasciaPackage && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Black Trim Package</span>
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Floor Plan Options - Use canonical pricing items */}
          {canonicalPricing.options.items.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Selected Add-ons</h3>
              <ul className="space-y-2">
                {canonicalPricing.options.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-sm text-accent">+{formatCanonicalPrice(item.retailAmount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
        
        {/* Next Steps Panel - REPLACES center pricing card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Next Steps Card - NO pricing, just guidance */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Next steps</h3>
                  <p className="text-sm text-muted-foreground">Review and take action</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-muted-foreground">1</span>
                  </div>
                  <span className="text-muted-foreground">Review your selections on the left.</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-muted-foreground">2</span>
                  </div>
                  <span className="text-muted-foreground">Your estimate updates in the panel on the right.</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-muted-foreground">3</span>
                  </div>
                  <span className="text-muted-foreground">Final pricing is confirmed in your written quote after site review.</span>
                </li>
              </ul>
              
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Estimates exclude land and site-specific costs. Final pricing is confirmed after design review.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* CTAs */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => setLeadFormOpen(true)}
            >
              {intent === 'my-land' && (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Build on My Land
                </>
              )}
              {intent === 'find-land' && (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Find Land to Build
                </>
              )}
              {intent === 'basemod-community' && (
                <>
                  <Building2 className="w-5 h-5 mr-2" />
                  Build in a Community
                </>
              )}
              {!intent && (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Talk to Us
                </>
              )}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Save & Share
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
          
          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            Estimated pricing. Final costs confirmed through formal quote and site review. 
            Excludes land, financing costs, taxes, and unusual site conditions.
          </p>
        </motion.div>
      </div>
      
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-start pt-4 max-w-4xl mx-auto"
      >
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </motion.div>
      
      {/* Lead Form Dialog */}
      <LeadFormDialog
        open={leadFormOpen}
        onClose={() => setLeadFormOpen(false)}
        intent={intent}
        model={model}
      />
    </div>
  );
}

// Lead Form Dialog
function LeadFormDialog({
  open,
  onClose,
  intent,
  model,
}: {
  open: boolean;
  onClose: () => void;
  intent: BuildIntent | null;
  model: ModelConfig;
}) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend
    setSubmitted(true);
    toast({
      title: 'Request submitted!',
      description: "We'll be in touch within 1 business day.",
    });
  };
  
  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <DialogTitle className="mb-2">Request Submitted!</DialogTitle>
            <DialogDescription>
              Thanks for your interest in the {model.name}. Our team will reach out within 1 business day.
            </DialogDescription>
            <Button className="mt-6" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {intent === 'my-land' && 'Build on Your Land'}
            {intent === 'find-land' && 'Find Land to Build'}
            {intent === 'basemod-community' && 'Build in a Community'}
            {!intent && 'Get in Touch'}
          </DialogTitle>
          <DialogDescription>
            {intent === 'my-land' && "Tell us about your property and we'll help you plan your build."}
            {intent === 'find-land' && "Share your preferences and we'll help you find the right lot."}
            {intent === 'basemod-community' && 'Learn about our upcoming community developments.'}
            {!intent && "We'd love to help you with your build."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" required />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" required />
          </div>
          
          {intent === 'my-land' && (
            <>
              <div>
                <Label htmlFor="address">Property Address</Label>
                <Input id="address" placeholder="Street address, City, State" />
              </div>
              <div>
                <Label>Do you have utilities?</Label>
                <RadioGroup defaultValue="yes" className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="utilities-yes" />
                    <Label htmlFor="utilities-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="utilities-no" />
                    <Label htmlFor="utilities-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unsure" id="utilities-unsure" />
                    <Label htmlFor="utilities-unsure">Not sure</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
          
          {intent === 'find-land' && (
            <>
              <div>
                <Label htmlFor="targetArea">Target Area</Label>
                <Input id="targetArea" placeholder="City, county, or region" />
              </div>
              <div>
                <Label htmlFor="budget">Land Budget Range</Label>
                <Input id="budget" placeholder="e.g., $50,000 - $100,000" />
              </div>
            </>
          )}
          
          {intent === 'basemod-community' && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Communities launching soon!</strong>
                <br />
                We're developing curated communities in Michigan and Illinois. 
                Submit your info to be first in line.
              </p>
            </div>
          )}
          
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea id="notes" placeholder="Tell us more about your project..." />
          </div>
          
          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default StepSummary;
