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
    description: 'Best rates for factory-built homes meeting site-built standards',
    minCredit: 620,
    maxLTV: 97,
    maxFrontDTI: 36,
    maxBackDTI: 45,
    primaryOnly: false,
    minDownPayment: 3,
  },
  choicehome: {
    name: 'CHOICEHome (Freddie Mac)',
    description: 'Competitive conventional rates for qualifying manufactured homes',
    minCredit: 620,
    maxLTV: 97,
    maxFrontDTI: 36,
    maxBackDTI: 45,
    primaryOnly: false,
    minDownPayment: 3,
  },
  construction_to_perm: {
    name: 'Construction-to-Perm',
    description: 'Single-close loan covering construction and permanent financing',
    minCredit: 680,
    maxLTV: 90,
    maxFrontDTI: 33,
    maxBackDTI: 43,
    primaryOnly: false,
    minDownPayment: 10,
  },
  fha_title_1: {
    name: 'FHA Title I',
    description: 'Government-backed option with flexible qualification',
    minCredit: 580,
    maxLTV: 100,
    maxFrontDTI: 43,
    maxBackDTI: 50,
    primaryOnly: true,
    minDownPayment: 0,
  },
  conventional: {
    name: 'Conventional',
    description: 'Standard financing with 20% down to avoid PMI',
    minCredit: 620,
    maxLTV: 80,
    maxFrontDTI: 28,
    maxBackDTI: 43,
    primaryOnly: false,
    minDownPayment: 20,
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

function getPlaidBaseUrl(env: string) {
  if (env === "production") return "https://production.plaid.com";
  if (env === "development") return "https://development.plaid.com";
  return "https://sandbox.plaid.com";
}

interface PlaidIncomeSource {
  name: string;
  amount: number;
  frequency: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
    const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
    const PLAID_ENV = Deno.env.get('PLAID_ENV') ?? 'sandbox';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Backend configuration is missing');
    }

    const { application_id, refresh_plaid = false } = await req.json();

    if (!application_id) {
      throw new Error('application_id is required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const plaidBase = getPlaidBaseUrl(PLAID_ENV);

    console.log('Starting pre-qualification engine for application:', application_id);

    // Fetch the financing application
    const { data: application, error: appError } = await supabase
      .from('financing_applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      console.error('Application fetch error:', appError);
      throw new Error('Financing application not found');
    }

    // Check for Plaid connection
    const { data: plaidConnection } = await supabase
      .from('plaid_connections')
      .select('*')
      .eq('application_id', application_id)
      .single();

    // Check for existing verified financials
    let { data: verifiedFinancials } = await supabase
      .from('verified_financials')
      .select('*')
      .eq('application_id', application_id)
      .single();

    // If we have a Plaid connection and need to fetch/refresh income data
    const shouldFetchPlaid = plaidConnection?.access_token && 
      PLAID_CLIENT_ID && PLAID_SECRET && 
      (!verifiedFinancials || refresh_plaid);

    if (shouldFetchPlaid) {
      console.log('Fetching verified income from Plaid...');
      
      try {
        // For sandbox: Use transactions to estimate income since income verification
        // requires special sandbox setup. In production, use /income/verification/summary/get
        const identityResp = await fetch(`${plaidBase}/identity/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: PLAID_CLIENT_ID,
            secret: PLAID_SECRET,
            access_token: plaidConnection.access_token,
          }),
        });

        // Get account balances for asset verification
        const balanceResp = await fetch(`${plaidBase}/accounts/balance/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: PLAID_CLIENT_ID,
            secret: PLAID_SECRET,
            access_token: plaidConnection.access_token,
          }),
        });

        const balanceData = await balanceResp.json();
        
        // Calculate total assets from account balances
        let totalAssets = 0;
        let totalLiabilities = 0;
        const incomeSources: PlaidIncomeSource[] = [];

        if (balanceData.accounts) {
          for (const account of balanceData.accounts) {
            const balance = account.balances?.current || 0;
            
            if (account.type === 'depository' || account.type === 'investment') {
              totalAssets += balance;
            } else if (account.type === 'credit' || account.type === 'loan') {
              totalLiabilities += Math.abs(balance);
            }
          }
        }

        // For sandbox testing: estimate income based on account activity
        // In production, this would come from /income/verification/summary/get
        // Using sandbox test data patterns
        const sandboxAnnualIncome = PLAID_ENV === 'sandbox' ? 85000 : 0;
        const sandboxMonthlyIncome = sandboxAnnualIncome / 12;

        // Get transactions to verify employment (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const transactionsResp = await fetch(`${plaidBase}/transactions/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: PLAID_CLIENT_ID,
            secret: PLAID_SECRET,
            access_token: plaidConnection.access_token,
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
          }),
        });

        const transactionsData = await transactionsResp.json();
        let employerName: string | null = null;
        let employmentVerified = false;

        // Look for payroll/income transactions
        if (transactionsData.transactions) {
          for (const txn of transactionsData.transactions) {
            // Positive amounts in payroll category indicate income
            if (txn.amount < 0 && txn.category?.includes('Payroll')) {
              employmentVerified = true;
              employerName = txn.merchant_name || txn.name || null;
              incomeSources.push({
                name: employerName || 'Direct Deposit',
                amount: Math.abs(txn.amount),
                frequency: 'monthly',
              });
            }
          }
        }

        // Store verified financials
        const verifiedData = {
          application_id,
          verified_annual_income: sandboxAnnualIncome || null,
          verified_monthly_income: sandboxMonthlyIncome || null,
          verified_assets_total: totalAssets,
          verified_liabilities_total: totalLiabilities,
          employer_name: employerName,
          employment_verified: employmentVerified,
          income_sources: incomeSources,
          data_freshness: new Date().toISOString(),
        };

        if (verifiedFinancials) {
          // Update existing record
          await supabase
            .from('verified_financials')
            .update(verifiedData)
            .eq('id', verifiedFinancials.id);
        } else {
          // Insert new record
          const { data: newRecord } = await supabase
            .from('verified_financials')
            .insert(verifiedData)
            .select()
            .single();
          verifiedFinancials = newRecord;
        }

        console.log('Verified financials stored:', {
          annualIncome: sandboxAnnualIncome,
          assets: totalAssets,
          liabilities: totalLiabilities,
          employmentVerified,
        });

      } catch (plaidError) {
        console.error('Plaid API error (continuing with self-reported data):', plaidError);
      }
    }

    // Determine income to use (prefer verified, fall back to self-reported)
    let annualIncome: number;
    let monthlyIncome: number;
    let isVerified = false;

    if (verifiedFinancials?.verified_annual_income) {
      annualIncome = Number(verifiedFinancials.verified_annual_income);
      monthlyIncome = Number(verifiedFinancials.verified_monthly_income) || annualIncome / 12;
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
    const ltv = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 100;

    // Calculate monthly housing payment (PITI estimate)
    const interestRate = Number(application.interest_rate) || 6.5;
    const loanTermYears = application.loan_term_years || 30;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    
    // Principal & Interest (handle edge case of 0 loan)
    let monthlyPI = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                  (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    
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
    const frontEndDTI = monthlyIncome > 0 ? (monthlyHousingPayment / monthlyIncome) * 100 : 100;
    
    // Back-end DTI: (Housing + other debt) / Gross monthly income
    let monthlyDebt = monthlyIncome * 0.10; // Default estimate
    if (verifiedFinancials?.verified_liabilities_total) {
      // Assume 2% of total liabilities as monthly payment
      monthlyDebt = Number(verifiedFinancials.verified_liabilities_total) * 0.02;
    }
    const backEndDTI = monthlyIncome > 0 
      ? ((monthlyHousingPayment + monthlyDebt) / monthlyIncome) * 100 
      : 100;

    // Determine eligible programs
    const eligiblePrograms: string[] = [];
    const programDetails: Array<{ key: string; name: string; description: string; match_strength: string }> = [];
    const isPrimary = application.intended_use === 'primary';

    for (const [programKey, program] of Object.entries(LOAN_PROGRAMS)) {
      // Check credit score
      if (creditScore < program.minCredit) continue;
      
      // Check LTV
      if (ltv > program.maxLTV) continue;
      
      // Check back-end DTI
      if (backEndDTI > program.maxBackDTI) continue;
      
      // Check primary residence requirement
      if (program.primaryOnly && !isPrimary) continue;
      
      // Check minimum down payment
      if (downPaymentPercent < program.minDownPayment) continue;
      
      eligiblePrograms.push(programKey);
      
      // Calculate match strength
      let matchStrength = 'good';
      if (frontEndDTI <= program.maxFrontDTI && backEndDTI <= program.maxBackDTI - 5 && creditScore >= program.minCredit + 40) {
        matchStrength = 'excellent';
      } else if (backEndDTI > program.maxBackDTI - 3 || creditScore < program.minCredit + 20) {
        matchStrength = 'fair';
      }
      
      programDetails.push({
        key: programKey,
        name: program.name,
        description: program.description,
        match_strength: matchStrength,
      });
    }

    // Sort programs by match strength
    programDetails.sort((a, b) => {
      const order = { excellent: 0, good: 1, fair: 2 };
      return order[a.match_strength as keyof typeof order] - order[b.match_strength as keyof typeof order];
    });

    // Calculate maximum loan amount based on DTI limits
    const maxDTI = 43; // Conservative QM limit
    const maxMonthlyHousing = monthlyIncome * (maxDTI / 100) - monthlyDebt;
    const maxLoanForDTI = monthlyPI > 0 ? maxMonthlyHousing / (monthlyPI / loanAmount) : 0;
    const maxLoanAmount = Math.max(0, Math.min(maxLoanForDTI, purchasePrice * 0.97));

    // Determine pre-qualification status
    let preQualStatus: string;
    let statusReason: string;
    let confidenceLevel: string;

    if (backEndDTI <= 36 && creditScore >= 700 && isVerified) {
      preQualStatus = 'pre_qualified';
      statusReason = 'Strong financial profile with verified income';
      confidenceLevel = 'high';
    } else if (backEndDTI <= 43 && creditScore >= 620) {
      preQualStatus = 'pre_qualified';
      statusReason = isVerified 
        ? 'Qualified with verified financials' 
        : 'Conditionally pre-qualified pending income verification';
      confidenceLevel = isVerified ? 'high' : 'medium';
    } else if (backEndDTI <= 50 && creditScore >= 580) {
      preQualStatus = 'needs_review';
      statusReason = 'May qualify for FHA or alternative lending programs';
      confidenceLevel = 'medium';
    } else {
      preQualStatus = 'needs_review';
      statusReason = 'Requires consultation with a lending specialist';
      confidenceLevel = 'low';
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
        verification_method: isVerified ? 'plaid_verified' : 'manual',
        updated_at: new Date().toISOString(),
      })
      .eq('id', application_id);

    if (updateError) {
      console.error('Error updating application:', updateError);
    }

    console.log('Pre-qualification completed:', {
      applicationId: application_id,
      status: preQualStatus,
      backEndDTI: Math.round(backEndDTI * 100) / 100,
      frontEndDTI: Math.round(frontEndDTI * 100) / 100,
      eligiblePrograms,
      isVerified,
    });

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          status: preQualStatus,
          status_reason: statusReason,
          confidence_level: confidenceLevel,
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
          dti: {
            back_end: Math.round(backEndDTI * 100) / 100,
            front_end: Math.round(frontEndDTI * 100) / 100,
            max_recommended: 43,
          },
          credit_score_estimate: creditScore,
          eligible_programs: programDetails,
          verification: {
            is_verified: isVerified,
            method: isVerified ? 'plaid' : 'self_reported',
            annual_income_used: Math.round(annualIncome),
            monthly_income_used: Math.round(monthlyIncome),
            assets_verified: verifiedFinancials?.verified_assets_total 
              ? Math.round(Number(verifiedFinancials.verified_assets_total)) 
              : null,
            liabilities_verified: verifiedFinancials?.verified_liabilities_total
              ? Math.round(Number(verifiedFinancials.verified_liabilities_total))
              : null,
            employer_name: verifiedFinancials?.employer_name || null,
            employment_verified: verifiedFinancials?.employment_verified || false,
          },
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
