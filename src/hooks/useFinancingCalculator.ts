// useFinancingCalculator - PITI Calculation Engine for BaseMod Financial
// Provides real-time monthly payment calculations with full breakdown

import { useMemo, useState, useCallback } from 'react';

export interface FinancingInput {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate?: number;
  insuranceAnnual?: number;
  pmiRate?: number;
}

export interface FinancingBreakdown {
  // Inputs
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  
  // Calculated amounts
  downPaymentAmount: number;
  loanAmount: number;
  
  // Monthly breakdown (PITI)
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  totalMonthlyPayment: number;
  
  // Totals over loan life
  totalInterestPaid: number;
  totalLoanCost: number;
  
  // Affordability
  recommendedMinIncome: number;
  debtToIncomeRatio: number;
  
  // Flags
  requiresPMI: boolean;
}

export interface UseFinancingCalculatorReturn {
  breakdown: FinancingBreakdown;
  setDownPaymentPercent: (percent: number) => void;
  setLoanTermYears: (years: number) => void;
  setInterestRate: (rate: number) => void;
  downPaymentPercent: number;
  loanTermYears: number;
  interestRate: number;
}

// Default configuration
const DEFAULT_PROPERTY_TAX_RATE = 0.015; // 1.5% annual
const DEFAULT_INSURANCE_ANNUAL = 1800; // $1,800/year
const DEFAULT_PMI_RATE = 0.005; // 0.5% annual of loan amount
const DEFAULT_INTEREST_RATE = 6.875; // Current market rate
const DEFAULT_LOAN_TERM = 30;
const PMI_THRESHOLD = 0.20; // PMI required if down payment < 20%

// DTI (Debt-to-Income) constants
const MAX_DTI_RATIO = 0.43; // 43% is typical max for qualified mortgages
const RECOMMENDED_DTI_RATIO = 0.28; // 28% is conservative recommendation

/**
 * Calculate monthly payment using standard amortization formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
function calculateMonthlyPI(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0 || annualRate <= 0 || termYears <= 0) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, numPayments);
  const denominator = Math.pow(1 + monthlyRate, numPayments) - 1;
  
  return principal * (numerator / denominator);
}

/**
 * Calculate total interest paid over loan life
 */
function calculateTotalInterest(
  monthlyPI: number,
  termYears: number,
  principal: number
): number {
  const totalPaid = monthlyPI * termYears * 12;
  return totalPaid - principal;
}

export function useFinancingCalculator(
  purchasePrice: number,
  initialDownPaymentPercent: number = 5,
  options?: Partial<FinancingInput>
): UseFinancingCalculatorReturn {
  // State for adjustable parameters
  const [downPaymentPercent, setDownPaymentPercent] = useState(initialDownPaymentPercent);
  const [loanTermYears, setLoanTermYears] = useState(options?.loanTermYears ?? DEFAULT_LOAN_TERM);
  const [interestRate, setInterestRate] = useState(options?.interestRate ?? DEFAULT_INTEREST_RATE);

  // Configuration
  const propertyTaxRate = options?.propertyTaxRate ?? DEFAULT_PROPERTY_TAX_RATE;
  const insuranceAnnual = options?.insuranceAnnual ?? DEFAULT_INSURANCE_ANNUAL;
  const pmiRate = options?.pmiRate ?? DEFAULT_PMI_RATE;

  const breakdown = useMemo<FinancingBreakdown>(() => {
    // Guard against invalid inputs
    if (purchasePrice <= 0) {
      return {
        purchasePrice: 0,
        downPaymentPercent: downPaymentPercent,
        interestRate: interestRate,
        loanTermYears: loanTermYears,
        downPaymentAmount: 0,
        loanAmount: 0,
        monthlyPrincipalInterest: 0,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyPMI: 0,
        totalMonthlyPayment: 0,
        totalInterestPaid: 0,
        totalLoanCost: 0,
        recommendedMinIncome: 0,
        debtToIncomeRatio: 0,
        requiresPMI: false,
      };
    }

    // Calculate down payment and loan amount
    const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPaymentAmount;

    // Calculate monthly Principal & Interest
    const monthlyPrincipalInterest = calculateMonthlyPI(
      loanAmount,
      interestRate,
      loanTermYears
    );

    // Calculate monthly property tax (annual rate / 12)
    const monthlyPropertyTax = (purchasePrice * propertyTaxRate) / 12;

    // Calculate monthly insurance
    const monthlyInsurance = insuranceAnnual / 12;

    // Calculate PMI (if down payment < 20%)
    const requiresPMI = downPaymentPercent < PMI_THRESHOLD * 100;
    const monthlyPMI = requiresPMI ? (loanAmount * pmiRate) / 12 : 0;

    // Total monthly payment (PITI)
    const totalMonthlyPayment =
      monthlyPrincipalInterest +
      monthlyPropertyTax +
      monthlyInsurance +
      monthlyPMI;

    // Total interest over loan life
    const totalInterestPaid = calculateTotalInterest(
      monthlyPrincipalInterest,
      loanTermYears,
      loanAmount
    );

    // Total loan cost (principal + interest + tax + insurance over term)
    const totalLoanCost =
      loanAmount +
      totalInterestPaid +
      monthlyPropertyTax * loanTermYears * 12 +
      monthlyInsurance * loanTermYears * 12;

    // Recommended minimum income (based on 28% DTI)
    const recommendedMinIncome = (totalMonthlyPayment / RECOMMENDED_DTI_RATIO) * 12;

    // Debt-to-income ratio (assuming $100k income as reference)
    const referenceIncome = 100000;
    const debtToIncomeRatio = (totalMonthlyPayment * 12) / referenceIncome;

    return {
      purchasePrice,
      downPaymentPercent,
      interestRate,
      loanTermYears,
      downPaymentAmount,
      loanAmount,
      monthlyPrincipalInterest,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyPMI,
      totalMonthlyPayment,
      totalInterestPaid,
      totalLoanCost,
      recommendedMinIncome,
      debtToIncomeRatio,
      requiresPMI,
    };
  }, [
    purchasePrice,
    downPaymentPercent,
    interestRate,
    loanTermYears,
    propertyTaxRate,
    insuranceAnnual,
    pmiRate,
  ]);

  // Memoized setters with validation
  const handleSetDownPaymentPercent = useCallback((percent: number) => {
    // Clamp between 3% and 50%
    const clamped = Math.min(Math.max(percent, 3), 50);
    setDownPaymentPercent(clamped);
  }, []);

  const handleSetLoanTermYears = useCallback((years: number) => {
    // Only allow 15 or 30 year terms
    const valid = years === 15 ? 15 : 30;
    setLoanTermYears(valid);
  }, []);

  const handleSetInterestRate = useCallback((rate: number) => {
    // Clamp between 1% and 15%
    const clamped = Math.min(Math.max(rate, 1), 15);
    setInterestRate(clamped);
  }, []);

  return {
    breakdown,
    setDownPaymentPercent: handleSetDownPaymentPercent,
    setLoanTermYears: handleSetLoanTermYears,
    setInterestRate: handleSetInterestRate,
    downPaymentPercent,
    loanTermYears,
    interestRate,
  };
}

// Utility function for quick monthly estimate without full hook
export function calculateQuickMonthlyEstimate(
  purchasePrice: number,
  downPaymentPercent: number = 5,
  interestRate: number = DEFAULT_INTEREST_RATE
): number {
  if (purchasePrice <= 0) return 0;
  
  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPaymentAmount;
  
  const monthlyPI = calculateMonthlyPI(loanAmount, interestRate, 30);
  const monthlyTax = (purchasePrice * DEFAULT_PROPERTY_TAX_RATE) / 12;
  const monthlyInsurance = DEFAULT_INSURANCE_ANNUAL / 12;
  const monthlyPMI = downPaymentPercent < 20 ? (loanAmount * DEFAULT_PMI_RATE) / 12 : 0;
  
  return monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI;
}
