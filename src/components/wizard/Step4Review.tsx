// Step 4: Review + Get Started - final summary with CTAs
// Premium polish with proper Dialog handling and financing integration
import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  MapPin, 
  Home, 
  Palette, 
  DoorOpen, 
  Share2, 
  Calendar, 
  ArrowRight,
  Copy,
  Check,
  Phone,
  CheckCircle,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { Development } from '@/data/developments';
import { Lot } from '@/data/lots/grand-haven';
import { HomeModel } from '@/data/models';
import { ExteriorPackage, GarageDoor } from '@/data/packages';
import { FinancingModal } from '@/components/financing/FinancingModal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Step4ReviewProps {
  development: Development;
  lot: Lot | null;
  model: HomeModel | null;
  package_: ExteriorPackage | null;
  garageDoor: GarageDoor | null;
  contactUrl: string;
  shareableUrl: string;
  onBack: () => void;
  isMobile: boolean;
}

export function Step4Review({
  development,
  lot,
  model,
  package_,
  garageDoor,
  contactUrl,
  shareableUrl,
  onBack,
  isMobile,
}: Step4ReviewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFinancingModal, setShowFinancingModal] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link to show your selections",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Review Your Plan
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's a summary of your selections
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5 shadow-lg overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">Your Home Plan</h3>
                </div>
                
                <div className="space-y-1">
                  {/* Development */}
                  <SummaryRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Development"
                    value={development.name}
                    subValue={`${development.city}, ${development.state}`}
                  />

                  {/* Lot */}
                  <SummaryRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Lot"
                    value={lot?.label || 'Not selected'}
                    subValue={lot?.acreage ? `${lot.acreage} acres` : undefined}
                  />

                  {/* Model */}
                  <SummaryRow
                    icon={<Home className="h-4 w-4" />}
                    label="Model"
                    value={model ? `The ${model.name}` : 'Not selected'}
                    subValue={model ? `${model.sqft.toLocaleString()} sq ft • ${model.beds} bed • ${model.baths} bath` : undefined}
                  />

                  {/* Package */}
                  <SummaryRow
                    icon={<Palette className="h-4 w-4" />}
                    label="Exterior Package"
                    value={package_?.name || 'Not selected'}
                    colorSwatch={package_?.sidingColor}
                  />

                  {/* Garage Door */}
                  <SummaryRow
                    icon={<DoorOpen className="h-4 w-4" />}
                    label="Garage Door"
                    value={garageDoor?.name || 'Not selected'}
                    colorSwatch={garageDoor?.color}
                  />
                </div>

                {/* Price Estimate */}
                {model && (
                  <div className="mt-6 pt-5 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Est. Starting Price</span>
                      <span className="text-2xl font-bold text-accent">
                        ${model.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      * Final pricing determined during consultation
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Share Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.2 }}
          >
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={shareableUrl}
                    readOnly
                    aria-label="Shareable link"
                    className="flex-1 text-sm bg-transparent border-none outline-none text-muted-foreground truncate"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyLink}
                    className="shrink-0 transition-colors"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.1 }}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.1 }}
                        >
                          <Copy className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="space-y-3 pt-2"
          >
            {/* Two equal primary CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                size="lg"
                className="h-14 text-base font-semibold"
                onClick={() => setShowScheduleModal(true)}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Call
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="h-14 text-base font-semibold"
                onClick={() => setShowFinancingModal(true)}
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Check Financing
              </Button>
            </div>

            {/* Financing trust badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              <span>Conventional financing available — MH Advantage® & CHOICEHome® eligible</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Financing Modal */}
      <FinancingModal
        open={showFinancingModal}
        onOpenChange={setShowFinancingModal}
        developmentSlug={development.slug}
        lotId={lot?.id}
        modelSlug={model?.slug}
        packageId={package_?.id}
        garageDoorId={garageDoor?.id}
      />

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-accent" />
              Schedule Your Call
            </DialogTitle>
            <DialogDescription>
              We'll discuss your home plan and answer any questions
            </DialogDescription>
          </DialogHeader>

          <ScheduleForm
            development={development}
            lot={lot}
            model={model}
            package_={package_}
            garageDoor={garageDoor}
            onSuccess={() => setShowScheduleModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  colorSwatch?: string;
}

function SummaryRow({ icon, label, value, subValue, colorSwatch }: SummaryRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-accent">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {colorSwatch && (
            <div 
              className="w-4 h-4 rounded-sm border border-border shadow-sm shrink-0"
              style={{ backgroundColor: colorSwatch }}
            />
          )}
          <p className="font-semibold text-foreground">{value}</p>
        </div>
        {subValue && <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

// Schedule Form Component - extracted to avoid forwardRef issues
interface ScheduleFormProps {
  development: Development;
  lot: Lot | null;
  model: HomeModel | null;
  package_: ExteriorPackage | null;
  garageDoor: GarageDoor | null;
  onSuccess: () => void;
}

function ScheduleForm({
  development,
  lot,
  model,
  package_,
  garageDoor,
  onSuccess,
}: ScheduleFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    onSuccess();
    toast({
      title: "Scheduling request sent!",
      description: "We'll confirm your call within 1 business day.",
    });
  };

  return (
    <>
      {/* Summary */}
      <div className="bg-muted rounded-xl p-4 text-sm space-y-1.5">
        <p><span className="font-medium">Development:</span> {development.name}</p>
        {lot && <p><span className="font-medium">Lot:</span> {lot.label}</p>}
        {model && <p><span className="font-medium">Model:</span> The {model.name}</p>}
        {package_ && <p><span className="font-medium">Package:</span> {package_.name}</p>}
        {garageDoor && <p><span className="font-medium">Garage:</span> {garageDoor.name}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="schedule-name">Full Name *</Label>
            <Input
              id="schedule-name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Smith"
              className="transition-shadow focus:shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-phone">Phone *</Label>
            <Input
              id="schedule-phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(123) 456-7890"
              className="transition-shadow focus:shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="schedule-email">Email *</Label>
          <Input
            id="schedule-email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john@example.com"
            className="transition-shadow focus:shadow-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="schedule-date">Preferred Date</Label>
            <Input
              id="schedule-date"
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
              className="transition-shadow focus:shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-time">Preferred Time</Label>
            <Select
              value={formData.preferredTime}
              onValueChange={(value) => setFormData(prev => ({ ...prev, preferredTime: value }))}
            >
              <SelectTrigger className="transition-shadow focus:shadow-sm">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (9am - 12pm)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                <SelectItem value="evening">Evening (5pm - 7pm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="schedule-notes">Notes (optional)</Label>
          <Textarea
            id="schedule-notes"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any questions or specific topics you'd like to discuss?"
            className="transition-shadow focus:shadow-sm resize-none"
          />
        </div>

        <div className="flex gap-3 pt-3">
          <Button
            type="submit"
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              'Request Call'
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
