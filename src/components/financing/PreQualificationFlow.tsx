// PreQualificationFlow - 3-Step Pre-Qualification Wizard for BaseMod Financial
// Captures leads with financial qualification data

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  DollarSign, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  Shield,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InfoDrawer } from '@/components/ui/info-drawer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PreQualificationFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchasePrice: number;
  quoteId?: string;
  onComplete?: (applicationId: string) => void;
}

type Step = 1 | 2 | 3;

interface FormData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  intendedUse: string;
  employmentStatus: string;
  annualIncomeRange: string;
  creditScoreRange: string;
  downPaymentPercent: number;
  purchaseTimeframe: string;
}

const INTENDED_USE_OPTIONS = [
  { value: 'primary', label: 'Primary Residence' },
  { value: 'second_home', label: 'Second Home' },
  { value: 'investment', label: 'Investment Property' },
];

const EMPLOYMENT_OPTIONS = [
  { value: 'employed', label: 'Employed (W-2)' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'other', label: 'Other' },
];

const INCOME_OPTIONS = [
  { value: 'under_50k', label: 'Under $50,000' },
  { value: '50k_75k', label: '$50,000 - $75,000' },
  { value: '75k_100k', label: '$75,000 - $100,000' },
  { value: '100k_150k', label: '$100,000 - $150,000' },
  { value: '150k_plus', label: '$150,000+' },
];

const CREDIT_OPTIONS = [
  { value: 'excellent_750', label: 'Excellent (750+)' },
  { value: 'good_700', label: 'Good (700-749)' },
  { value: 'fair_650', label: 'Fair (650-699)' },
  { value: 'below_650', label: 'Below 650' },
  { value: 'unsure', label: "I'm not sure" },
];

const TIMEFRAME_OPTIONS = [
  { value: '0_3_months', label: 'Within 3 months' },
  { value: '3_6_months', label: '3-6 months' },
  { value: '6_12_months', label: '6-12 months' },
  { value: '12_plus', label: '12+ months' },
];

const DOWN_PAYMENT_OPTIONS = [3, 5, 10, 15, 20];

export function PreQualificationFlow({
  open,
  onOpenChange,
  purchasePrice,
  quoteId,
  onComplete,
}: PreQualificationFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [preQualStatus, setPreQualStatus] = useState<'pending' | 'pre_qualified' | 'needs_review' | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    intendedUse: 'primary',
    employmentStatus: 'employed',
    annualIncomeRange: '75k_100k',
    creditScoreRange: 'unsure',
    downPaymentPercent: 5,
    purchaseTimeframe: '3_6_months',
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePreQualStatus = (): 'pre_qualified' | 'needs_review' => {
    // Simple rule-based pre-qualification
    const goodCredit = ['excellent_750', 'good_700'].includes(formData.creditScoreRange);
    const highIncome = ['100k_150k', '150k_plus'].includes(formData.annualIncomeRange);
    
    if (goodCredit && highIncome) {
      return 'pre_qualified';
    }
    return 'needs_review';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const downPaymentAmount = purchasePrice * (formData.downPaymentPercent / 100);
      const loanAmount = purchasePrice - downPaymentAmount;
      const status = calculatePreQualStatus();

      const { data, error } = await supabase
        .from('financing_applications')
        .insert({
          quote_id: quoteId || null,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone || null,
          intended_use: formData.intendedUse as 'primary' | 'second_home' | 'investment',
          purchase_price: purchasePrice,
          employment_status: formData.employmentStatus as 'employed' | 'self_employed' | 'retired' | 'other',
          annual_income_range: formData.annualIncomeRange as 'under_50k' | '50k_75k' | '75k_100k' | '100k_150k' | '150k_plus',
          credit_score_range: formData.creditScoreRange as 'excellent_750' | 'good_700' | 'fair_650' | 'below_650' | 'unsure',
          down_payment_percent: formData.downPaymentPercent,
          down_payment_amount: downPaymentAmount,
          loan_amount_requested: loanAmount,
          purchase_timeframe: formData.purchaseTimeframe as '0_3_months' | '3_6_months' | '6_12_months' | '12_plus',
          pre_qualification_status: status,
          pre_qualified_amount: status === 'pre_qualified' ? loanAmount * 1.1 : null,
        })
        .select('id')
        .single();

      if (error) throw error;

      setApplicationId(data.id);
      setPreQualStatus(status);
      setCurrentStep(3);
      onComplete?.(data.id);

    } catch (error) {
      console.error('Error submitting pre-qualification:', error);
      toast({
        title: 'Submission Error',
        description: 'There was an issue submitting your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const validateStep1 = () => {
    return (
      formData.contactName.trim().length >= 2 &&
      formData.contactEmail.includes('@') &&
      formData.contactEmail.includes('.')
    );
  };

  const validateStep2 = () => {
    return (
      formData.employmentStatus &&
      formData.annualIncomeRange &&
      formData.creditScoreRange &&
      formData.downPaymentPercent >= 3
    );
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
              currentStep === step
                ? 'bg-blue-600 text-white scale-110'
                : currentStep > step
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {currentStep > step ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              step
            )}
          </div>
          {step < 3 && (
            <div
              className={cn(
                'w-12 h-1 rounded-full transition-colors duration-300',
                currentStep > step ? 'bg-green-500' : 'bg-muted'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold">Let's get started</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about yourself
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="John Smith"
            value={formData.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="pl-10"
              value={formData.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              className="pl-10"
              value={formData.contactPhone}
              onChange={(e) => updateField('contactPhone', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Intended Use</Label>
          <Select
            value={formData.intendedUse}
            onValueChange={(v) => updateField('intendedUse', v)}
          >
            <SelectTrigger>
              <Home className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTENDED_USE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={() => goToStep(2)}
        disabled={!validateStep1()}
        className="w-full"
        size="lg"
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-3">
          <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold">Financial Profile</h3>
        <p className="text-sm text-muted-foreground">
          Help us find the best options for you
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Employment Status</Label>
          <Select
            value={formData.employmentStatus}
            onValueChange={(v) => updateField('employmentStatus', v)}
          >
            <SelectTrigger>
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Annual Household Income</Label>
          <Select
            value={formData.annualIncomeRange}
            onValueChange={(v) => updateField('annualIncomeRange', v)}
          >
            <SelectTrigger>
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCOME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estimated Credit Score</Label>
          <Select
            value={formData.creditScoreRange}
            onValueChange={(v) => updateField('creditScoreRange', v)}
          >
            <SelectTrigger>
              <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CREDIT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Down Payment</Label>
          <div className="flex gap-2">
            {DOWN_PAYMENT_OPTIONS.map((percent) => (
              <button
                key={percent}
                onClick={() => updateField('downPaymentPercent', percent)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  'border',
                  formData.downPaymentPercent === percent
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-background border-border hover:border-blue-300'
                )}
              >
                {percent}%
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(purchasePrice * (formData.downPaymentPercent / 100))} down
          </p>
        </div>

        <div className="space-y-2">
          <Label>Purchase Timeframe</Label>
          <Select
            value={formData.purchaseTimeframe}
            onValueChange={(v) => updateField('purchaseTimeframe', v)}
          >
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => goToStep(1)}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!validateStep2() || isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Get Results
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => {
    const isPreQualified = preQualStatus === 'pre_qualified';
    const loanAmount = purchasePrice * (1 - formData.downPaymentPercent / 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 text-center"
      >
        {/* Success/Review Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={cn(
            'inline-flex items-center justify-center p-4 rounded-full mb-4',
            isPreQualified
              ? 'bg-green-100 dark:bg-green-900'
              : 'bg-amber-100 dark:bg-amber-900'
          )}
        >
          {isPreQualified ? (
            <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400" />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          )}
        </motion.div>

        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {isPreQualified
              ? "You're Pre-Qualified!"
              : 'Application Received'}
          </h3>
          <p className="text-muted-foreground">
            {isPreQualified
              ? 'Great news! Based on your profile, you may qualify for financing.'
              : "We've received your application and will review it shortly."}
          </p>
        </div>

        {/* Amount Card */}
        <div className={cn(
          'p-6 rounded-2xl',
          isPreQualified
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800'
            : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800'
        )}>
          <p className="text-sm text-muted-foreground mb-1">
            {isPreQualified ? 'Pre-Qualified Amount' : 'Requested Amount'}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(isPreQualified ? loanAmount * 1.1 : loanAmount)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formData.downPaymentPercent}% down • 30-year fixed
          </p>
        </div>

        {/* Next Steps */}
        <div className="text-left space-y-3">
          <p className="font-medium text-sm">What's next?</p>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded">
                <Mail className="h-3 w-3 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Check your email</p>
                <p className="text-muted-foreground text-xs">
                  We've sent confirmation to {formData.contactEmail}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded">
                <Phone className="h-3 w-3 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Expect a call</p>
                <p className="text-muted-foreground text-xs">
                  A financing specialist will reach out within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onOpenChange(false)}
          className="w-full"
          size="lg"
        >
          Done
        </Button>

        <p className="text-xs text-muted-foreground">
          This pre-qualification is not a commitment to lend.
          <br />
          Final approval subject to verification.
        </p>
      </motion.div>
    );
  };

  return (
    <InfoDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="BaseMod Financial"
      description="Pre-qualify in 2 minutes"
    >
      {renderStepIndicator()}
      
      <AnimatePresence mode="wait">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </AnimatePresence>
    </InfoDrawer>
  );
}
