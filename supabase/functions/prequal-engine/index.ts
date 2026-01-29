import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to trusted domains
const allowedOrigins = [
  'https://build-modern-homes.lovable.app',
  'https://id-preview--b6311393-fa2b-46a4-a734-59db659ebfc9.lovable.app',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Timeout utility for API calls
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
    
    promise
      .then((result) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

// API timeout constant
const PLAID_API_TIMEOUT = 10000; // 10 seconds per API call

// Real-world manufactured housing loan program eligibility thresholds
// Based on actual Fannie Mae, Freddie Mac, and FHA guidelines for 2024

const LOAN_PROGRAMS = {
  // MH Advantage - Fannie Mae's manufactured housing program
  // Requires home to meet specific construction standards (MH Advantage eligible)
  mh_advantage: {
    name: 'MH Advantage',
    description: 'Fannie Mae program for factory-built homes meeting site-built standards',
    minCredit: 620,           // Fannie Mae minimum for manufactured housing
    maxLTV: 97,               // Up to 97% LTV with PMI
    maxFrontDTI: 36,          // Housing expense ratio
    maxBackDTI: 45,           // Total DTI (can go to 50% with strong compensating factors)
    primaryOnly: false,       // Available for primary, second home, and investment
    minDownPayment: 3,        // 3% minimum down payment
    priority: 1,              // Higher priority = shown first when eligible
  },
  
  // CHOICEHome - Freddie Mac's factory-built housing program
  // Similar to MH Advantage but through Freddie Mac
  choicehome: {
    name: 'CHOICEHome',
    description: 'Freddie Mac program for qualifying manufactured homes',
    minCredit: 620,           // Freddie Mac minimum
    maxLTV: 97,               // Up to 97% LTV
    maxFrontDTI: 36,          // Housing ratio
    maxBackDTI: 45,           // Total DTI limit
    primaryOnly: false,       // Primary, second home, investment
    minDownPayment: 3,        // 3% minimum
    priority: 2,
  },
  
  // FHA Title I - Government-backed manufactured housing loans
  // More lenient credit requirements, primary residence only
  fha_title_1: {
    name: 'FHA Title I',
    description: 'FHA-insured manufactured home loan with flexible qualification',
    minCredit: 580,           // FHA minimum (500-579 requires 10% down)
    maxLTV: 96.5,             // 96.5% LTV with 3.5% down
    maxFrontDTI: 31,          // FHA standard front-end ratio
    maxBackDTI: 43,           // FHA standard back-end (can go to 50% with compensating factors)
    primaryOnly: true,        // Primary residence only
    minDownPayment: 3.5,      // 3.5% minimum (10% if credit 500-579)
    priority: 3,
  },
  
  // Construction-to-Permanent - Single-close loan for land + construction
  // Higher credit and down payment requirements
  construction_to_perm: {
    name: 'Construction-to-Perm',
    description: 'Single-close loan covering land purchase and home construction',
    minCredit: 680,           // Typically higher credit required
    maxLTV: 90,               // Generally 80-90% max LTV
    maxFrontDTI: 33,          // More conservative ratios
    maxBackDTI: 43,           // Standard QM limit
    primaryOnly: false,       // Can be primary or second home
    minDownPayment: 10,       // 10-20% typically required
    priority: 4,
  },
  
  // Conventional - Standard mortgage, best with 20% down to avoid PMI
  // Baseline option for qualified borrowers
  conventional: {
    name: 'Conventional',
    description: 'Standard mortgage financing with competitive rates',
    minCredit: 620,           // Conventional minimum
    maxLTV: 97,               // Can go up to 97% but 80% avoids PMI
    maxFrontDTI: 28,          // Conservative front-end for best rates
    maxBackDTI: 43,           // QM safe harbor limit
    primaryOnly: false,       // All property types
    minDownPayment: 3,        // 3% min but 20% avoids PMI
    priority: 5,
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
  const corsHeaders = getCorsHeaders(req);
  
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
        // Parallel fetch: identity, balances, and transactions all at once
        const [balanceResp, transactionsResp] = await Promise.all([
          // Get account balances for asset verification
          withTimeout(
            fetch(`${plaidBase}/accounts/balance/get`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client_id: PLAID_CLIENT_ID,
                secret: PLAID_SECRET,
                access_token: plaidConnection.access_token,
              }),
            }),
            PLAID_API_TIMEOUT,
            'Balance fetch timed out'
          ),
          // Get transactions to verify employment (last 30 days)
          withTimeout(
            fetch(`${plaidBase}/transactions/get`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client_id: PLAID_CLIENT_ID,
                secret: PLAID_SECRET,
                access_token: plaidConnection.access_token,
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
              }),
            }),
            PLAID_API_TIMEOUT,
            'Transactions fetch timed out'
          ),
        ]);

        const balanceData = await balanceResp.json();
        const transactionsData = await transactionsResp.json();
        
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
        const sandboxAnnualIncome = PLAID_ENV === 'sandbox' ? 85000 : 0;
        const sandboxMonthlyIncome = sandboxAnnualIncome / 12;

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

    // Determine eligible programs based on real lending criteria
    const eligiblePrograms: string[] = [];
    const programDetails: Array<{ key: string; name: string; description: string; match_strength: string; priority: number }> = [];
    const isPrimary = application.intended_use === 'primary';
    const isSecondHome = application.intended_use === 'second_home';
    const isInvestment = application.intended_use === 'investment';

    console.log('Program eligibility check:', {
      creditScore,
      ltv: Math.round(ltv * 100) / 100,
      frontEndDTI: Math.round(frontEndDTI * 100) / 100,
      backEndDTI: Math.round(backEndDTI * 100) / 100,
      downPaymentPercent,
      isPrimary,
    });

    for (const [programKey, program] of Object.entries(LOAN_PROGRAMS)) {
      const reasons: string[] = [];
      let eligible = true;
      
      // Check credit score
      if (creditScore < program.minCredit) {
        reasons.push(`Credit ${creditScore} < ${program.minCredit} required`);
        eligible = false;
      }
      
      // Check LTV
      if (ltv > program.maxLTV) {
        reasons.push(`LTV ${ltv.toFixed(1)}% > ${program.maxLTV}% max`);
        eligible = false;
      }
      
      // Check back-end DTI (primary qualification metric)
      if (backEndDTI > program.maxBackDTI) {
        reasons.push(`Back-end DTI ${backEndDTI.toFixed(1)}% > ${program.maxBackDTI}% max`);
        eligible = false;
      }
      
      // Check primary residence requirement
      if (program.primaryOnly && !isPrimary) {
        reasons.push('Primary residence only');
        eligible = false;
      }
      
      // Check minimum down payment
      if (downPaymentPercent < program.minDownPayment) {
        reasons.push(`Down payment ${downPaymentPercent}% < ${program.minDownPayment}% required`);
        eligible = false;
      }

      if (!eligible) {
        console.log(`${programKey} ineligible:`, reasons);
        continue;
      }
      
      eligiblePrograms.push(programKey);
      
      // Calculate match strength based on how well they qualify
      let matchStrength = 'good';
      const creditBuffer = creditScore - program.minCredit;
      const dtiBuffer = program.maxBackDTI - backEndDTI;
      const frontDtiOk = frontEndDTI <= program.maxFrontDTI;
      
      if (creditBuffer >= 60 && dtiBuffer >= 8 && frontDtiOk) {
        matchStrength = 'excellent';
      } else if (creditBuffer < 20 || dtiBuffer < 3) {
        matchStrength = 'fair';
      }
      
      console.log(`${programKey} eligible: strength=${matchStrength}, creditBuffer=${creditBuffer}, dtiBuffer=${dtiBuffer.toFixed(1)}`);
      
      programDetails.push({
        key: programKey,
        name: program.name,
        description: program.description,
        match_strength: matchStrength,
        priority: program.priority,
      });
    }

    // Sort programs by: 1) match strength, 2) priority
    programDetails.sort((a, b) => {
      const strengthOrder = { excellent: 0, good: 1, fair: 2 };
      const strengthDiff = strengthOrder[a.match_strength as keyof typeof strengthOrder] - strengthOrder[b.match_strength as keyof typeof strengthOrder];
      if (strengthDiff !== 0) return strengthDiff;
      return a.priority - b.priority;
    });
    
    // Reorder eligiblePrograms to match sorted order
    const sortedProgramKeys = programDetails.map(p => p.key);
    eligiblePrograms.length = 0;
    eligiblePrograms.push(...sortedProgramKeys);

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
    const corsHeaders = getCorsHeaders(req);
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
