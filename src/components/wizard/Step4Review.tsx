// Step 4: Review + Get Started - final summary with CTAs
import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Phone
} from 'lucide-react';
import { Development } from '@/data/developments';
import { Lot } from '@/data/lots/grand-haven';
import { HomeModel } from '@/data/models';
import { ExteriorPackage, GarageDoor } from '@/data/packages';
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
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Review Your Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Here's a summary of your selections
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className={cn(
          'max-w-2xl mx-auto space-y-6',
          isMobile ? '' : ''
        )}>
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Home Plan</h3>
                
                <div className="space-y-4">
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
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Est. Starting Price</span>
                      <span className="text-2xl font-semibold text-accent">
                        ${model.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      * Final pricing determined during consultation
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Share Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    value={shareableUrl}
                    readOnly
                    className="flex-1 text-sm bg-transparent border-none outline-none text-muted-foreground truncate"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Button
              size="lg"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-14 text-lg"
              onClick={() => setShowScheduleModal(true)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule a 10-Minute Call
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-12"
              asChild
            >
              <Link to={contactUrl}>
                <Phone className="mr-2 h-4 w-4" />
                Request This Lot + Model
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        development={development}
        lot={lot}
        model={model}
        package_={package_}
        garageDoor={garageDoor}
        contactUrl={contactUrl}
      />
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
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className="flex items-center gap-2">
          {colorSwatch && (
            <div 
              className="w-4 h-4 rounded border border-border flex-shrink-0"
              style={{ backgroundColor: colorSwatch }}
            />
          )}
          <p className="font-medium text-foreground">{value}</p>
        </div>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      </div>
    </div>
  );
}

// Schedule Modal Component
interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  development: Development;
  lot: Lot | null;
  model: HomeModel | null;
  package_: ExteriorPackage | null;
  garageDoor: GarageDoor | null;
  contactUrl: string;
}

function ScheduleModal({
  open,
  onOpenChange,
  development,
  lot,
  model,
  package_,
  garageDoor,
  contactUrl,
}: ScheduleModalProps) {
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
    onOpenChange(false);
    toast({
      title: "Scheduling request sent!",
      description: "We'll confirm your call within 1 business day.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Schedule Your Call
          </DialogTitle>
          <DialogDescription>
            We'll discuss your home plan and answer any questions
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="bg-muted rounded-lg p-4 text-sm space-y-1">
          <p><strong>Development:</strong> {development.name}</p>
          {lot && <p><strong>Lot:</strong> {lot.label}</p>}
          {model && <p><strong>Model:</strong> The {model.name}</p>}
          {package_ && <p><strong>Package:</strong> {package_.name}</p>}
          {garageDoor && <p><strong>Garage:</strong> {garageDoor.name}</p>}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-time">Preferred Time</Label>
              <Select
                value={formData.preferredTime}
                onValueChange={(value) => setFormData(prev => ({ ...prev, preferredTime: value }))}
              >
                <SelectTrigger>
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
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Request Call'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
