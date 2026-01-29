import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Loan program eligibility thresholds
const LOAN_PROGRAMS = {
  mh_advantage: {
    name: 'MH Advantage (Fannie Mae)',
    minCredit: 620,
    maxLTV: 97,
    maxDTI: 45,
    primaryOnly: false,
  },
  choicehome: {
    name: 'CHOICEHome (Freddie Mac)',
    minCredit: 620,
    maxLTV: 97,
    maxDTI: 45,
    primaryOnly: false,
  },
  construction_to_perm: {
    name: 'Construction-to-Perm',
    minCredit: 680,
    maxLTV: 90,
    maxDTI: 43,
    primaryOnly: false,
  },
  fha_title_1: {
    name: 'FHA Title I',
    minCredit: 580,
    maxLTV: 100,
    maxDTI: 50,
    primaryOnly: true,
  },
  conventional: {
    name: 'Conventional',
    minCredit: 620,
    maxLTV: 80,
    maxDTI: 43,
    primaryOnly: false,
  },
};

// Credit score mapping from ranges to midpoint estimates
const CREDIT_SCORE_MAP: Record<string, number> = {
  'excellent_750': 775,
  'good_700': 725,
  'fair_650': 675,
  'below_650': 600,
  'unsure': 650,
};

// Income range mapping to midpoint estimates
const INCOME_MAP: Record<string, number> = {
  'under_50k': 40000,
  '50k_75k': 62500,
  '75k_100k': 87500,
  '100k_150k': 125000,
  '150k_plus': 200000,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const { application_id } = await req.json();

    if (!application_id) {
      throw new Error('application_id is required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the financing application
    const { data: application, error: appError } = await supabase
      .from('financing_applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      throw new Error('Financing application not found');
    }

    // Check for verified financials (Plaid data)
    const { data: verifiedFinancials } = await supabase
      .from('verified_financials')
      .select('*')
      .eq('application_id', application_id)
      .single();

    // Determine income to use (prefer verified, fall back to self-reported)
    let annualIncome: number;
    let monthlyIncome: number;
    let isVerified = false;

    if (verifiedFinancials?.verified_annual_income) {
      annualIncome = verifiedFinancials.verified_annual_income;
      monthlyIncome = verifiedFinancials.verified_monthly_income || annualIncome / 12;
      isVerified = true;
    } else {
      annualIncome = INCOME_MAP[application.annual_income_range] || 75000;
      monthlyIncome = annualIncome / 12;
    }

    // Get credit score estimate
    const creditScore = CREDIT_SCORE_MAP[application.credit_score_range] || 650;

    // Calculate loan details
    const purchasePrice = Number(application.purchase_price) || 0;
    const downPaymentPercent = Number(application.down_payment_percent) || 5;
    const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const ltv = (loanAmount / purchasePrice) * 100;

    // Calculate monthly housing payment (PITI estimate)
    const interestRate = Number(application.interest_rate) || 6.5;
    const loanTermYears = application.loan_term_years || 30;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    
    // Principal & Interest
    const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Property taxes (estimate 1.5% annually)
    const monthlyTaxes = (purchasePrice * 0.015) / 12;
    
    // Insurance (estimate $1800/year)
    const monthlyInsurance = 150;
    
    // PMI (if LTV > 80%)
    let monthlyPMI = 0;
    if (ltv > 80) {
      monthlyPMI = loanAmount * 0.005 / 12; // 0.5% annual PMI estimate
    }
    
    const monthlyHousingPayment = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyPMI;

    // Calculate DTI ratios
    // Front-end DTI: Housing payment / Gross monthly income
    const frontEndDTI = (monthlyHousingPayment / monthlyIncome) * 100;
    
    // Back-end DTI: (Housing + other debt) / Gross monthly income
    // Estimate other debt at 10% of income if not verified
    let monthlyDebt = monthlyIncome * 0.10;
    if (verifiedFinancials?.verified_liabilities_total) {
      // Rough estimate: assume 2% of total liabilities as monthly payment
      monthlyDebt = verifiedFinancials.verified_liabilities_total * 0.02;
    }
    const backEndDTI = ((monthlyHousingPayment + monthlyDebt) / monthlyIncome) * 100;

    // Determine eligible programs
    const eligiblePrograms: string[] = [];
    const isPrimary = application.intended_use === 'primary';

    for (const [programKey, program] of Object.entries(LOAN_PROGRAMS)) {
      // Check credit score
      if (creditScore < program.minCredit) continue;
      
      // Check LTV
      if (ltv > program.maxLTV) continue;
      
      // Check DTI
      if (backEndDTI > program.maxDTI) continue;
      
      // Check primary residence requirement
      if (program.primaryOnly && !isPrimary) continue;
      
      eligiblePrograms.push(programKey);
    }

    // Calculate maximum loan amount based on DTI limits
    const maxDTI = 43; // Conservative QM limit
    const maxMonthlyHousing = monthlyIncome * (maxDTI / 100) - monthlyDebt;
    const maxLoanForDTI = maxMonthlyHousing / (monthlyPI / loanAmount); // Scale based on rate
    const maxLoanAmount = Math.min(maxLoanForDTI, purchasePrice * 0.97);

    // Determine pre-qualification status
    let preQualStatus: string;
    let statusReason: string;

    if (backEndDTI <= 36 && creditScore >= 680 && isVerified) {
      preQualStatus = 'pre_qualified';
      statusReason = 'Strong profile with verified income';
    } else if (backEndDTI <= 43 && creditScore >= 620) {
      preQualStatus = 'pre_qualified';
      statusReason = isVerified 
        ? 'Qualified with verified financials' 
        : 'Conditionally pre-qualified pending verification';
    } else if (backEndDTI <= 50 && creditScore >= 580) {
      preQualStatus = 'needs_review';
      statusReason = 'May qualify for FHA or alternative programs';
    } else {
      preQualStatus = 'needs_review';
      statusReason = 'Requires manual underwriting review';
    }

    // Update the financing application with calculated values
    const { error: updateError } = await supabase
      .from('financing_applications')
      .update({
        dti_ratio: Math.round(backEndDTI * 100) / 100,
        front_end_dti: Math.round(frontEndDTI * 100) / 100,
        eligible_programs: eligiblePrograms,
        pre_qualification_status: preQualStatus,
        pre_qualified_amount: Math.round(maxLoanAmount),
        monthly_payment_estimate: Math.round(monthlyHousingPayment),
        loan_amount_requested: Math.round(loanAmount),
        down_payment_amount: Math.round(downPaymentAmount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', application_id);

    if (updateError) {
      console.error('Error updating application:', updateError);
    }

    console.log('Pre-qualification completed for application:', application_id, {
      status: preQualStatus,
      dti: backEndDTI,
      eligiblePrograms,
    });

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          status: preQualStatus,
          status_reason: statusReason,
          pre_qualified_amount: Math.round(maxLoanAmount),
          loan_amount: Math.round(loanAmount),
          down_payment_amount: Math.round(downPaymentAmount),
          monthly_payment_estimate: Math.round(monthlyHousingPayment),
          payment_breakdown: {
            principal_interest: Math.round(monthlyPI),
            taxes: Math.round(monthlyTaxes),
            insurance: Math.round(monthlyInsurance),
            pmi: Math.round(monthlyPMI),
          },
          dti_ratio: Math.round(backEndDTI * 100) / 100,
          front_end_dti: Math.round(frontEndDTI * 100) / 100,
          credit_score_estimate: creditScore,
          eligible_programs: eligiblePrograms.map(key => ({
            key,
            name: LOAN_PROGRAMS[key as keyof typeof LOAN_PROGRAMS].name,
          })),
          is_verified: isVerified,
          annual_income_used: Math.round(annualIncome),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in prequal engine:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
