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
  AlertCircle,
  TrendingUp,
  Award,
  Clock,
  Download,
  Copy,
  FileText
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
import { VerificationProgress } from './VerificationProgress';
import { downloadBuyerPDF, copyBuyerSummaryToClipboard } from './BuyerFinancialSummary';

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
  const [verificationTimedOut, setVerificationTimedOut] = useState(false);
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

  // Track if we should auto-submit after bank connection
  const shouldAutoSubmitRef = useRef(false);
  
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
        // Flag for auto-submit
        shouldAutoSubmitRef.current = true;
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
  
  // Auto-submit when bank is connected and form is valid
  useEffect(() => {
    if (
      shouldAutoSubmitRef.current &&
      plaidPublicToken &&
      verificationMethod === 'plaid_verified' &&
      currentStep === 2 &&
      !isSubmitting &&
      formData.contactName.trim().length >= 2 &&
      formData.contactEmail.includes('@') &&
      formData.downPaymentPercent >= 3
    ) {
      shouldAutoSubmitRef.current = false;
      console.log('[PreQualificationFlow] Auto-submitting after bank connection');
      // Small delay for smooth UX transition
      const timer = setTimeout(() => {
        handleSubmit();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [plaidPublicToken, verificationMethod, currentStep, isSubmitting, formData]);

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
                // Flag for auto-submit
                shouldAutoSubmitRef.current = true;
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
         // Move to step 3 immediately to show verification progress
         const appId = inserted.id;
         setApplicationId(appId);
         setPreQualStatus('pending');
         setCurrentStep(3);
         setIsVerifyingFinancials(true);
         setVerificationTimedOut(false);
         
         try {
           // Exchange the Plaid token first
           const { error: exchangeError } = await supabase.functions.invoke('plaid-exchange-token', {
             body: {
               application_id: appId,
               public_token: plaidPublicToken,
               institution_name: plaidInstitutionName,
             },
           });

           if (exchangeError) {
             console.error('Plaid exchange error:', exchangeError);
             // Continue anyway - we'll use self-reported data
           }

           // Run prequal engine with timeout using Promise.race
           const timeoutPromise = new Promise<{ timedOut: true }>((resolve) => {
             setTimeout(() => resolve({ timedOut: true }), 30000); // 30s timeout
           });

           const prequalPromise = supabase.functions.invoke('prequal-engine', {
             body: { application_id: appId },
           }).then(res => ({ ...res, timedOut: false }));

           const raceResult = await Promise.race([prequalPromise, timeoutPromise]);

           if ('timedOut' in raceResult && raceResult.timedOut) {
             console.log('[PreQualificationFlow] Prequal engine timed out after 30s');
             setVerificationTimedOut(true);
             setIsVerifyingFinancials(false);
             setPreQualStatus('needs_review');
             toast({
               title: 'Verification taking longer than expected',
               description: "We're still processing your application. We'll email your results shortly.",
             });
             onComplete?.(appId);
             return;
           }

           const { data: prequalData, error: prequalError } = raceResult as any;

           if (prequalError) {
             console.error('Prequal engine error:', prequalError);
             setPreQualStatus('needs_review');
           } else if (prequalData) {
             // Map program results to UI-friendly format
             const programDescriptions: Record<string, string> = {
               mh_advantage: 'MH Advantage (Fannie Mae) — Best rates for factory-built homes',
               choicehome: 'CHOICEHome (Freddie Mac) — Competitive conventional rates',
               construction_to_perm: 'Construction-to-Perm — Single-close construction loan',
               fha_title_1: 'FHA Title I — Government-backed flexible qualification',
               conventional: 'Conventional — Standard financing with 20% down',
             };

             const eligiblePrograms = (prequalData.result?.eligible_programs || prequalData.eligible_programs || []).map((p: any) => ({
               name: p.name || (p.key || p.program || '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
               matchQuality: p.match_quality || p.match_strength || 'good',
               description: p.description || programDescriptions[p.key || p.program] || 'Qualified lending program',
             }));

             const result = prequalData.result || prequalData;
             
             setPrequalResults({
               eligiblePrograms,
               dtiRatio: result.dti?.back_end ?? result.dti_ratio ?? null,
               frontEndDti: result.dti?.front_end ?? result.front_end_dti ?? null,
               verifiedIncome: result.verification?.annual_income_used ?? result.verified_annual_income ?? null,
               monthlyPayment: result.monthly_payment_estimate ?? result.monthly_payment ?? null,
             });

             // Update status based on engine results
             const resultStatus = result.status || prequalData.status;
             setPreQualStatus(resultStatus === 'pre_qualified' ? 'pre_qualified' : 'needs_review');
             
             // Show success toast
             toast({
               title: resultStatus === 'pre_qualified' ? '🎉 You\'re Pre-Qualified!' : '✓ Analysis Complete',
               description: resultStatus === 'pre_qualified' 
                 ? 'Great news! You qualify for multiple financing programs.'
                 : 'We\'ve analyzed your financials and will follow up with options.',
             });
           }
           
           setIsVerifyingFinancials(false);
           onComplete?.(appId);
           return;
           
         } catch (err) {
           console.error('Verification flow error:', err);
           setIsVerifyingFinancials(false);
           setPreQualStatus('needs_review');
           onComplete?.(inserted.id);
           return;
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
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Premium connection card */}
            <div className={cn(
              'rounded-2xl border-2 p-5 transition-all duration-300',
              plaidPublicToken 
                ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20' 
                : 'border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20'
            )}>
              {plaidPublicToken ? (
                // Connected state
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-500/20">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-300">Bank Connected!</p>
                      <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                        {plaidInstitutionName || 'Your bank account is linked'}
                      </p>
                    </div>
                    <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                    We're verifying your income and assets. This typically takes under 30 seconds.
                  </p>
                </div>
              ) : isBankConnecting ? (
                // Connecting state
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Connecting securely...</p>
                      <p className="text-sm text-muted-foreground">
                        Complete sign-in in the secure window
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <Shield className="h-3.5 w-3.5" />
                    <span>256-bit encrypted connection</span>
                  </div>
                </div>
              ) : (
                // Not connected state - premium CTA
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20">
                      <Landmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Verify your finances instantly</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Securely connect your bank to get pre-qualified in under 2 minutes
                      </p>
                    </div>
                  </div>
                  
                  {/* What we verify */}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Income</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Assets</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Read-only</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={openBankConnect}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25 font-semibold"
                  >
                    <Landmark className="h-4 w-4 mr-2" />
                    Connect Your Bank
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  {/* Trust signals */}
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-emerald-500" />
                      <span>Bank-level security</span>
                    </div>
                    <span>•</span>
                    <span>Powered by Plaid</span>
                  </div>
                </div>
              )}
            </div>

            {/* Popup blocked fallback */}
            {bankConnectError === 'popup_blocked' && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Pop-up was blocked
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Your browser blocked the secure connection window. You can open it in this tab instead.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={openBankConnectInTab}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Open in this tab
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
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
    const hasVerifiedResults = prequalResults !== null;
    const hasEligiblePrograms = prequalResults && prequalResults.eligiblePrograms.length > 0;
    const hasDTIData = prequalResults && prequalResults.dtiRatio !== null;
    const isDTITooHigh = prequalResults && (prequalResults.dtiRatio ?? 0) > 50;

    // Show staged verification progress while loading
    if (isPending) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <VerificationProgress
            isVerifying={true}
            timeoutSeconds={35}
            onTimeout={() => setVerificationTimedOut(true)}
            onFallbackToManual={() => {
              setIsVerifyingFinancials(false);
              setPreQualStatus('needs_review');
              toast({
                title: 'Results pending',
                description: "We'll email your full verification results shortly.",
              });
            }}
          />
        </motion.div>
      );
    }

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
              ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900'
              : hasVerifiedResults
              ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900'
              : 'bg-amber-100 dark:bg-amber-900'
          )}
        >
          {isPreQualified ? (
            <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400" />
          ) : hasVerifiedResults ? (
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          )}
        </motion.div>

        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {isPreQualified
              ? "🎉 You're Pre-Qualified!"
              : hasVerifiedResults
              ? '✓ Analysis Complete'
              : 'Application Received'}
          </h3>
          <p className="text-muted-foreground">
            {isPreQualified
              ? 'Great news! You qualify for multiple financing programs.'
              : hasVerifiedResults && isDTITooHigh
              ? "We've analyzed your financials. Let's explore options that fit your budget."
              : hasVerifiedResults && !hasEligiblePrograms
              ? "We've verified your income. A specialist will help find the right program."
              : hasVerifiedResults
              ? "Your financials are verified. Here's your personalized analysis."
              : "We've received your application and will review it shortly."}
          </p>
        </div>

        {/* Verified Financial Summary - Always show if we have verified data */}
        {hasVerifiedResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {/* Verification Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-blue-700 dark:text-blue-300 font-medium">Bank Verified</span>
            </div>
            
            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {prequalResults.verifiedIncome && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Verified Income</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-300">
                    {formatCurrency(prequalResults.verifiedIncome)}
                  </p>
                  <p className="text-[10px] text-green-600 dark:text-green-400">/year</p>
                </div>
              )}
              {hasDTIData && (
                <div className={cn(
                  'p-4 rounded-xl border',
                  (prequalResults.dtiRatio ?? 0) <= 43 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
                    : (prequalResults.dtiRatio ?? 0) <= 50
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800'
                    : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800'
                )}>
                  <p className={cn(
                    'text-xs font-medium mb-1',
                    (prequalResults.dtiRatio ?? 0) <= 43 ? 'text-green-700 dark:text-green-400' :
                    (prequalResults.dtiRatio ?? 0) <= 50 ? 'text-amber-700 dark:text-amber-400' :
                    'text-red-700 dark:text-red-400'
                  )}>
                    Debt-to-Income
                  </p>
                  <p className={cn(
                    'text-xl font-bold',
                    (prequalResults.dtiRatio ?? 0) <= 43 ? 'text-green-800 dark:text-green-300' :
                    (prequalResults.dtiRatio ?? 0) <= 50 ? 'text-amber-800 dark:text-amber-300' :
                    'text-red-800 dark:text-red-300'
                  )}>
                    {prequalResults.dtiRatio?.toFixed(1)}%
                  </p>
                  <p className={cn(
                    'text-[10px]',
                    (prequalResults.dtiRatio ?? 0) <= 43 ? 'text-green-600 dark:text-green-400' :
                    (prequalResults.dtiRatio ?? 0) <= 50 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  )}>
                    {(prequalResults.dtiRatio ?? 0) <= 43 ? 'Excellent' : (prequalResults.dtiRatio ?? 0) <= 50 ? 'Review needed' : 'High ratio'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Monthly Payment Estimate */}
        {prequalResults?.monthlyPayment && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={cn(
              'p-5 rounded-2xl',
              isPreQualified
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800'
                : 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 border border-slate-200 dark:border-slate-800'
          )}>
            <p className="text-sm text-muted-foreground mb-1">
              {isPreQualified ? 'Your Monthly Payment' : 'Estimated Payment'}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(prequalResults.monthlyPayment)}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Principal, interest, taxes, insurance{formData.downPaymentPercent < 20 ? ' + PMI' : ''}
            </p>
          </motion.div>
        )}

        {/* Matched Programs - Show if we have eligible programs */}
        {hasEligiblePrograms && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-left space-y-3"
          >
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-sm">Matched Loan Programs</p>
            </div>
            <div className="space-y-2">
              {prequalResults!.eligiblePrograms.map((program, idx) => (
                <motion.div
                  key={program.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border',
                    program.matchQuality === 'excellent'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
                      : program.matchQuality === 'good'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800'
                      : 'bg-muted/50 border-border'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    program.matchQuality === 'excellent'
                      ? 'bg-green-100 dark:bg-green-900'
                      : program.matchQuality === 'good'
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-muted'
                  )}>
                    {program.matchQuality === 'excellent' ? (
                      <Award className="h-4 w-4 text-green-600" />
                    ) : (
                      <CheckCircle2 className={cn(
                        'h-4 w-4',
                        program.matchQuality === 'good' ? 'text-blue-600' : 'text-muted-foreground'
                      )} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{program.name}</p>
                      {program.matchQuality === 'excellent' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 font-bold uppercase tracking-wide">
                          Best Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{program.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Alternative options when DTI is too high */}
        {hasVerifiedResults && !hasEligiblePrograms && isDTITooHigh && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-left space-y-3"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-sm">Personalized Options</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Based on your verified income, here are some paths forward:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Explore homes in a lower price range that fit your budget</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Consider a larger down payment to reduce monthly costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Speak with our specialist about alternative programs</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Share with Lender Section - Show when verified data exists */}
        {hasVerifiedResults && verificationMethod === 'plaid_verified' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-left space-y-3"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-sm">Share with Your Lender</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Download your verified financial summary to share with lenders for faster pre-approval.
            </p>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => {
                  downloadBuyerPDF({
                    contactName: formData.contactName,
                    contactEmail: formData.contactEmail,
                    contactPhone: formData.contactPhone || undefined,
                    intendedUse: formData.intendedUse,
                    purchaseTimeframe: formData.purchaseTimeframe,
                    purchasePrice: purchasePrice,
                    downPaymentAmount: purchasePrice * (formData.downPaymentPercent / 100),
                    downPaymentPercent: formData.downPaymentPercent,
                    loanAmount: purchasePrice * (1 - formData.downPaymentPercent / 100),
                    monthlyPayment: prequalResults?.monthlyPayment || null,
                    verifiedIncome: prequalResults?.verifiedIncome || null,
                    frontEndDti: prequalResults?.frontEndDti || null,
                    backEndDti: prequalResults?.dtiRatio || null,
                    eligiblePrograms: prequalResults?.eligiblePrograms || [],
                    applicationId: applicationId || undefined,
                    isVerified: true,
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  copyBuyerSummaryToClipboard({
                    contactName: formData.contactName,
                    contactEmail: formData.contactEmail,
                    contactPhone: formData.contactPhone || undefined,
                    intendedUse: formData.intendedUse,
                    purchaseTimeframe: formData.purchaseTimeframe,
                    purchasePrice: purchasePrice,
                    downPaymentAmount: purchasePrice * (formData.downPaymentPercent / 100),
                    downPaymentPercent: formData.downPaymentPercent,
                    loanAmount: purchasePrice * (1 - formData.downPaymentPercent / 100),
                    monthlyPayment: prequalResults?.monthlyPayment || null,
                    verifiedIncome: prequalResults?.verifiedIncome || null,
                    frontEndDti: prequalResults?.frontEndDti || null,
                    backEndDti: prequalResults?.dtiRatio || null,
                    eligiblePrograms: prequalResults?.eligiblePrograms || [],
                    applicationId: applicationId || undefined,
                    isVerified: true,
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Summary
              </Button>
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-left space-y-3"
        >
          <p className="font-semibold text-sm">What's next?</p>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-100 dark:border-blue-900">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Check your email</p>
                <p className="text-muted-foreground text-xs">
                  Full details sent to {formData.contactEmail}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-100 dark:border-green-900">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Expect a call</p>
                <p className="text-muted-foreground text-xs">
                  A financing specialist will reach out within 24 hours
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <Button
          onClick={() => onOpenChange(false)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Done
        </Button>

        <p className="text-xs text-muted-foreground">
          This pre-qualification is not a commitment to lend.
          <br />
          Final approval subject to full underwriting.
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
