// FinancingModal - Full financing inquiry modal with eligibility form
// Opens from wizard CTAs and routes to Contact with prefilled data
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, DollarSign, Calendar, Home, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FinancingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Pre-fill from build wizard
  developmentSlug?: string;
  lotId?: number | null;
  modelSlug?: string | null;
  packageId?: string | null;
  garageDoorId?: string | null;
}

interface FinancingFormData {
  intendedUse: string;
  creditRange: string;
  purchaseTimeframe: string;
}

export function FinancingModal({
  open,
  onOpenChange,
  developmentSlug,
  lotId,
  modelSlug,
  packageId,
  garageDoorId,
}: FinancingModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FinancingFormData>({
    intendedUse: '',
    creditRange: '',
    purchaseTimeframe: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));

    // Build contact URL with all params
    const params = new URLSearchParams();
    if (developmentSlug) params.set('development', developmentSlug);
    if (lotId) params.set('lot', lotId.toString());
    if (modelSlug) params.set('model', modelSlug);
    if (packageId) params.set('package', packageId);
    if (garageDoorId) params.set('garage', garageDoorId);
    params.set('financing_interest', 'true');
    params.set('intended_use', formData.intendedUse);
    if (formData.creditRange) params.set('credit_range', formData.creditRange);
    params.set('timeframe', formData.purchaseTimeframe);

    setIsSubmitting(false);
    onOpenChange(false);
    navigate(`/contact?${params.toString()}`);
  };

  const isFormValid = formData.intendedUse && formData.purchaseTimeframe;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Check Financing Options
          </DialogTitle>
          <DialogDescription>
            See if you may qualify for conventional financing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Programs Info */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
            <h4 className="font-semibold text-foreground mb-2 text-sm">
              Conventional Financing Available
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Many BaseMod homes qualify for <strong>Fannie Mae MH Advantage®</strong> and{' '}
              <strong>Freddie Mac CHOICEHome®</strong> programs, offering 30-year conventional 
              mortgage terms similar to site-built homes.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium text-foreground">
                <CheckCircle className="h-3 w-3 text-green-600" />
                30-Year Terms
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium text-foreground">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Competitive Rates
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium text-foreground">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Low Down Payment
              </span>
            </div>
          </div>

          {/* Eligibility Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="intended-use" className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                Intended Use *
              </Label>
              <Select
                value={formData.intendedUse}
                onValueChange={(value) => setFormData(prev => ({ ...prev, intendedUse: value }))}
              >
                <SelectTrigger id="intended-use">
                  <SelectValue placeholder="How will you use this home?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary Residence</SelectItem>
                  <SelectItem value="second">Second / Vacation Home</SelectItem>
                  <SelectItem value="investment">Investment Property</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit-range" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Estimated Credit Range
                <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select
                value={formData.creditRange}
                onValueChange={(value) => setFormData(prev => ({ ...prev, creditRange: value }))}
              >
                <SelectTrigger id="credit-range">
                  <SelectValue placeholder="Select credit range (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent (750+)</SelectItem>
                  <SelectItem value="good">Good (700-749)</SelectItem>
                  <SelectItem value="fair">Fair (650-699)</SelectItem>
                  <SelectItem value="below">Below 650</SelectItem>
                  <SelectItem value="unsure">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Purchase Timeframe *
              </Label>
              <Select
                value={formData.purchaseTimeframe}
                onValueChange={(value) => setFormData(prev => ({ ...prev, purchaseTimeframe: value }))}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="When do you plan to purchase?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-3">Within 3 months</SelectItem>
                  <SelectItem value="3-6">3-6 months</SelectItem>
                  <SelectItem value="6-12">6-12 months</SelectItem>
                  <SelectItem value="12+">More than 12 months</SelectItem>
                  <SelectItem value="exploring">Just exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-2">
              This is not a loan application. We'll connect you with lending partners 
              familiar with CrossMod® financing to discuss your options.
            </p>

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact sidebar module for wizard steps 2-4
interface FinancingSidebarModuleProps {
  onOpenModal: () => void;
}

export function FinancingSidebarModule({ onOpenModal }: FinancingSidebarModuleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-1">
            Financing Available
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Many BaseMod homes qualify for 30-year conventional financing.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenModal}
            className="w-full text-xs h-8"
          >
            <DollarSign className="mr-1.5 h-3.5 w-3.5" />
            Check Financing Options
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
