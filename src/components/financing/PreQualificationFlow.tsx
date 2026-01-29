// PreQualificationFlow - 3-Step Pre-Qualification Wizard for BaseMod Financial
// Captures leads with financial qualification data
// 
// Architecture: Uses popup-based bank connection to avoid iframe/overlay conflicts
// in embedded environments (Lovable editor preview, etc.)

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Home,
  Landmark,
  Keyboard,
  ExternalLink,
  AlertCircle
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

type VerificationMethod = 'manual' | 'plaid_verified';
type PreQualStatus = 'pending' | 'pre_qualified' | 'needs_review' | null;

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
  const [preQualStatus, setPreQualStatus] = useState<PreQualStatus>(null);
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('manual');
  const [plaidPublicToken, setPlaidPublicToken] = useState<string | null>(null);
  const [plaidInstitutionName, setPlaidInstitutionName] = useState<string | null>(null);
  const [isVerifyingFinancials, setIsVerifyingFinancials] = useState(false);
  const [isBankConnecting, setIsBankConnecting] = useState(false);
  const [bankConnectError, setBankConnectError] = useState<string | null>(null);
  
  // Session ID for secure popup communication
  const connectSessionIdRef = useRef<string | null>(null);
  
  const [prequalResults, setPrequalResults] = useState<{
    eligiblePrograms: Array<{ name: string; matchQuality: string; description: string }>;
    dtiRatio: number | null;
    frontEndDti: number | null;
    verifiedIncome: number | null;
    monthlyPayment: number | null;
  } | null>(null);
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

  // Listen for messages from the bank connect popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== window.location.origin) {
        console.warn('[PreQualificationFlow] Ignoring message from unknown origin:', event.origin);
        return;
      }

      const data = event.data;
      
      // Check if this is a Plaid connect result
      if (data?.type !== 'plaid-connect-result') return;

      // Validate session ID
      if (data.sessionId !== connectSessionIdRef.current) {
        console.warn('[PreQualificationFlow] Ignoring message with mismatched sessionId');
        return;
      }

      console.log('[PreQualificationFlow] Received bank connect result:', data);
      setIsBankConnecting(false);

      if (data.success) {
        setPlaidPublicToken(data.publicToken);
        setPlaidInstitutionName(data.institutionName || null);
        setBankConnectError(null);
        toast({
          title: 'Bank connected',
          description: `Successfully connected to ${data.institutionName || 'your bank'}.`,
        });
      } else {
        setBankConnectError(data.error || 'Connection failed');
        if (data.error && data.error !== 'User cancelled') {
          toast({
            title: 'Connection failed',
            description: data.error,
            variant: 'destructive',
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  // Open bank connect in a popup (handles embedded environment)
  const openBankConnect = useCallback(() => {
    // Generate a unique session ID for this connection attempt
    const sessionId = crypto.randomUUID();
    connectSessionIdRef.current = sessionId;
    
    setBankConnectError(null);
    setIsBankConnecting(true);

    // Build the URL with session ID
    const url = `/secure-bank-connect?sessionId=${encodeURIComponent(sessionId)}`;

    // Try to open as popup
    const popup = window.open(
      url,
      'plaid_connect',
      'width=450,height=700,left=200,top=100,toolbar=no,menubar=no'
    );

    if (!popup || popup.closed) {
      // Popup was blocked - show error with fallback
      console.warn('[PreQualificationFlow] Popup blocked');
      setIsBankConnecting(false);
      setBankConnectError('popup_blocked');
    } else {
      // Focus the popup
      popup.focus();

      // Poll to detect if user closes popup without completing
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer);
          // Check localStorage for result (fallback communication)
          const storedResult = localStorage.getItem(`plaid-connect-${sessionId}`);
          if (storedResult) {
            try {
              const result = JSON.parse(storedResult);
              if (result.success) {
                setPlaidPublicToken(result.publicToken);
                setPlaidInstitutionName(result.institutionName || null);
              }
              localStorage.removeItem(`plaid-connect-${sessionId}`);
            } catch (e) {
              console.warn('[PreQualificationFlow] Failed to parse stored result');
            }
          }
          setIsBankConnecting(false);
        }
      }, 500);
    }
  }, []);

  // Fallback: Open in same tab (when popup is blocked)
  const openBankConnectInTab = useCallback(() => {
    const sessionId = crypto.randomUUID();
    connectSessionIdRef.current = sessionId;
    
    // Store current state so we can resume
    sessionStorage.setItem('prequal-return-state', JSON.stringify({
      formData,
      purchasePrice,
      quoteId,
      step: currentStep,
    }));

    window.location.href = `/secure-bank-connect?sessionId=${encodeURIComponent(sessionId)}&returnUrl=${encodeURIComponent(window.location.href)}`;
  }, [formData, purchasePrice, quoteId, currentStep]);

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
      const status: 'pending' | 'pre_qualified' | 'needs_review' =
        verificationMethod === 'plaid_verified' ? 'pending' : calculatePreQualStatus();

      // Calculate monthly payment estimate for storage
      const monthlyRate = 6.875 / 100 / 12;
      const numPayments = 30 * 12;
      const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      const monthlyTax = (purchasePrice * 0.015) / 12;
      const monthlyInsurance = 1800 / 12;
      const monthlyPMI = formData.downPaymentPercent < 20 ? (loanAmount * 0.005) / 12 : 0;
      const monthlyPayment = Math.round(monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI);

       const { data: inserted, error } = await supabase
         .from('financing_applications')
         .insert({
          quote_id: quoteId || null,
          user_id: null, // Explicitly set to null for anonymous submissions
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
          loan_term_years: 30,
          interest_rate: 6.875,
          monthly_payment_estimate: monthlyPayment,
          purchase_timeframe: formData.purchaseTimeframe as '0_3_months' | '3_6_months' | '6_12_months' | '12_plus',
          pre_qualification_status: status,
          pre_qualified_amount: status === 'pre_qualified' ? loanAmount * 1.1 : null,
           verification_method: verificationMethod,
         })
         .select('id')
         .single();

      if (error) throw error;

       // If Plaid was selected, save the public_token server-side and run prequal engine
       if (verificationMethod === 'plaid_verified' && plaidPublicToken && inserted?.id) {
         const { error: exchangeError } = await supabase.functions.invoke('plaid-exchange-token', {
           body: {
             application_id: inserted.id,
             public_token: plaidPublicToken,
             institution_name: plaidInstitutionName,
           },
         });

         if (exchangeError) {
           console.error('Plaid exchange error:', exchangeError);
           toast({
             title: 'Bank connection issue',
             description: "We saved your application, but couldn't finalize the bank connection. We'll follow up to complete verification.",
           });
         } else {
           // Run prequal engine to get verified results
           setIsVerifyingFinancials(true);
           try {
             const { data: prequalData, error: prequalError } = await supabase.functions.invoke('prequal-engine', {
               body: { application_id: inserted.id },
             });

             if (!prequalError && prequalData) {
               // Map program results to UI-friendly format
               const programDescriptions: Record<string, string> = {
                 mh_advantage: 'Fannie Mae program with conventional terms for manufactured homes',
                 choicehome: 'Freddie Mac program offering competitive rates for factory-built homes',
                 construction_to_perm: 'Single-close loan covering construction and permanent financing',
                 fha_title_1: 'FHA-insured loan for manufactured homes with flexible requirements',
                 conventional: 'Standard conventional mortgage with competitive rates',
               };

               const eligiblePrograms = (prequalData.eligible_programs || []).map((p: any) => ({
                 name: p.program.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
                 matchQuality: p.match_quality,
                 description: programDescriptions[p.program] || 'Qualified lending program',
               }));

               setPrequalResults({
                 eligiblePrograms,
                 dtiRatio: prequalData.dti_ratio,
                 frontEndDti: prequalData.front_end_dti,
                 verifiedIncome: prequalData.verified_annual_income,
                 monthlyPayment: prequalData.monthly_payment,
               });

               // Update status based on engine results
               if (prequalData.status === 'pre_qualified') {
                 setPreQualStatus('pre_qualified');
               } else if (prequalData.status === 'needs_review') {
                 setPreQualStatus('needs_review');
               }
             }
           } catch (prequalErr) {
             console.error('Prequal engine error:', prequalErr);
           } finally {
             setIsVerifyingFinancials(false);
           }
         }
       }

      const newApplicationId = inserted?.id ?? crypto.randomUUID();
      setApplicationId(newApplicationId);
      setPreQualStatus(status === 'pending' ? 'pending' : status);
      setCurrentStep(3);
      onComplete?.(newApplicationId);

      toast({
        title: status === 'pre_qualified' ? '🎉 Congratulations!' : '✓ Application Received',
        description: status === 'pre_qualified' 
          ? "You're pre-qualified! We'll be in touch soon."
          : "We've received your application and will review it shortly.",
      });

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
    if (verificationMethod === 'plaid_verified') {
      return Boolean(plaidPublicToken) && formData.downPaymentPercent >= 3;
    }
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
          <motion.div
            initial={false}
            animate={{
              scale: currentStep === step ? 1.1 : 1,
              backgroundColor: currentStep === step 
                ? 'rgb(37, 99, 235)' // blue-600
                : currentStep > step 
                ? 'rgb(34, 197, 94)' // green-500
                : 'rgb(229, 231, 235)', // gray-200
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
              currentStep === step
                ? 'text-white shadow-lg ring-4 ring-blue-200 dark:ring-blue-900'
                : currentStep > step
                ? 'text-white'
                : 'text-muted-foreground'
            )}
          >
            {currentStep > step ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <CheckCircle2 className="h-6 w-6" />
              </motion.div>
            ) : (
              step
            )}
          </motion.div>
          {step < 3 && (
            <motion.div
              initial={false}
              animate={{
                backgroundColor: currentStep > step ? 'rgb(34, 197, 94)' : 'rgb(229, 231, 235)',
              }}
              transition={{ duration: 0.3 }}
              className="w-16 h-1.5 rounded-full"
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
        <h3 className="text-lg font-semibold">Verify your financials</h3>
        <p className="text-sm text-muted-foreground">
          Choose quick bank verification or enter details manually
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Verification Method</Label>
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => {
                setVerificationMethod('plaid_verified');
              }}
              className={cn(
                'w-full text-left rounded-xl border p-4 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
                verificationMethod === 'plaid_verified'
                  ? 'bg-muted/50 border-ring'
                  : 'bg-background border-border hover:bg-muted/30'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md border border-border bg-background p-2">
                    <Landmark className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Connect bank (recommended)</p>
                      <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Fast</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Verify income & assets securely to speed up your decision.
                    </p>
                  </div>
                </div>
                {verificationMethod === 'plaid_verified' ? (
                  <CheckCircle2 className="h-5 w-5 text-foreground" />
                ) : null}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setVerificationMethod('manual');
                setPlaidPublicToken(null);
                setPlaidInstitutionName(null);
              }}
              className={cn(
                'w-full text-left rounded-xl border p-4 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
                verificationMethod === 'manual'
                  ? 'bg-muted/50 border-ring'
                  : 'bg-background border-border hover:bg-muted/30'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md border border-border bg-background p-2">
                    <Keyboard className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Manual entry</p>
                    <p className="text-sm text-muted-foreground">
                      Answer a few questions to estimate eligibility.
                    </p>
                  </div>
                </div>
                {verificationMethod === 'manual' ? (
                  <CheckCircle2 className="h-5 w-5 text-foreground" />
                ) : null}
              </div>
            </button>
          </div>
        </div>

        {verificationMethod === 'plaid_verified' && (
          <div className="space-y-3">
            {/* Connection status card */}
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">Bank verification</p>
                  <p className="text-xs text-muted-foreground">
                    {plaidInstitutionName
                      ? `Connected to ${plaidInstitutionName}`
                      : 'Connect your bank to continue.'}
                  </p>
                </div>
                {plaidPublicToken ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Connected</span>
                  </div>
                ) : isBankConnecting ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={openBankConnect}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* Popup blocked fallback */}
            {bankConnectError === 'popup_blocked' && (
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Pop-up blocked
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      Your browser blocked the secure connection window.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={openBankConnectInTab}
                    >
                      Open in this tab instead
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Security notice */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <p>
                Bank connection opens in a secure window. Your credentials are encrypted
                and never shared with us.
              </p>
            </div>
          </div>
        )}

        {verificationMethod === 'manual' && (
          <>
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
          </>
        )}

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
              {verificationMethod === 'plaid_verified' ? 'Submit Application' : 'Get Results'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => {
    const isPreQualified = preQualStatus === 'pre_qualified';
    const isPending = preQualStatus === 'pending' || isVerifyingFinancials;
    const loanAmount = purchasePrice * (1 - formData.downPaymentPercent / 100);
    const hasVerifiedResults = prequalResults && prequalResults.eligiblePrograms.length > 0;

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
              : isPending
              ? 'bg-blue-100 dark:bg-blue-900'
              : 'bg-amber-100 dark:bg-amber-900'
          )}
        >
          {isPending ? (
            <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
          ) : isPreQualified ? (
            <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400" />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          )}
        </motion.div>

        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {isPending
              ? 'Verifying your financials...'
              : isPreQualified
              ? "You're Pre-Qualified!"
              : 'Application Received'}
          </h3>
          <p className="text-muted-foreground">
            {isPending
              ? 'Analyzing your bank data to find the best programs for you.'
              : isPreQualified
              ? 'Great news! Based on your verified financials, you qualify for multiple programs.'
              : "We've received your application and will review it shortly."}
          </p>
        </div>

        {/* Verified Financial Summary - shown after prequal engine */}
        {hasVerifiedResults && prequalResults.verifiedIncome && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="p-3 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">Verified Income</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(prequalResults.verifiedIncome)}/yr
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">DTI Ratio</p>
              <p className={cn(
                'text-lg font-semibold',
                (prequalResults.dtiRatio ?? 0) <= 43 ? 'text-green-600' : 'text-amber-600'
              )}>
                {prequalResults.dtiRatio?.toFixed(1)}%
              </p>
            </div>
          </motion.div>
        )}

        {/* Amount Card */}
        <div className={cn(
          'p-6 rounded-2xl',
          isPreQualified
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800'
            : isPending
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800'
            : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800'
        )}>
          <p className="text-sm text-muted-foreground mb-1">
            {isPreQualified ? 'Pre-Qualified Amount' : 'Requested Amount'}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(isPreQualified ? loanAmount * 1.1 : loanAmount)}
          </p>
          {prequalResults?.monthlyPayment ? (
            <p className="text-sm text-muted-foreground mt-2">
              Est. <span className="font-medium text-foreground">{formatCurrency(prequalResults.monthlyPayment)}/mo</span> (PITI + PMI)
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">
              {formData.downPaymentPercent}% down • 30-year fixed
            </p>
          )}
        </div>

        {/* Matched Programs */}
        {hasVerifiedResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-left space-y-3"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <p className="font-medium text-sm">Matched Programs</p>
            </div>
            <div className="space-y-2">
              {prequalResults.eligiblePrograms.map((program, idx) => (
                <motion.div
                  key={program.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    program.matchQuality === 'excellent'
                      ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                      : program.matchQuality === 'good'
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                      : 'bg-muted/50 border-border'
                  )}
                >
                  <div className={cn(
                    'p-1.5 rounded',
                    program.matchQuality === 'excellent'
                      ? 'bg-green-100 dark:bg-green-900'
                      : program.matchQuality === 'good'
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-muted'
                  )}>
                    <CheckCircle2 className={cn(
                      'h-3 w-3',
                      program.matchQuality === 'excellent'
                        ? 'text-green-600'
                        : program.matchQuality === 'good'
                        ? 'text-blue-600'
                        : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{program.name}</p>
                      {program.matchQuality === 'excellent' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 font-medium">
                          Best Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{program.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

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
          disabled={isPending}
        >
          {isPending ? 'Analyzing...' : 'Done'}
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
