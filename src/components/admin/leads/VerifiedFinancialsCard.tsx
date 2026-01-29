import { 
  Banknote, 
  Briefcase, 
  BadgeCheck, 
  Clock,
  PiggyBank,
  CreditCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IncomeSource {
  name: string;
  amount: number;
  type: string;
}

interface VerifiedFinancials {
  verified_annual_income: number | null;
  verified_monthly_income: number | null;
  verified_assets_total: number | null;
  verified_liabilities_total: number | null;
  employer_name: string | null;
  employment_verified: boolean | null;
  income_sources: IncomeSource[] | null;
  data_freshness: string;
}

interface VerifiedFinancialsCardProps {
  financials: VerifiedFinancials | null;
  verificationMethod: string | null;
}

export function VerifiedFinancialsCard({ financials, verificationMethod }: VerifiedFinancialsCardProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isVerified = verificationMethod === "plaid_verified";
  const netWorth = (financials?.verified_assets_total ?? 0) - (financials?.verified_liabilities_total ?? 0);
  const assetsTotal = financials?.verified_assets_total ?? 0;
  const liabilitiesTotal = financials?.verified_liabilities_total ?? 0;
  const totalBalance = assetsTotal + liabilitiesTotal;
  const assetsPercentage = totalBalance > 0 ? (assetsTotal / totalBalance) * 100 : 50;

  if (!isVerified || !financials) {
    return (
      <div className="p-6 border border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground">Self-Reported Data</h4>
            <p className="text-sm text-muted-foreground mt-1">
              This borrower has not completed Plaid verification. Financial data shown is self-reported and should be verified before proceeding.
            </p>
            <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300">
              Manual Verification Required
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verified Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-emerald-500" />
          <span className="font-semibold text-foreground">Plaid Verified</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Updated {new Date(financials.data_freshness).toLocaleDateString()}
        </span>
      </div>

      {/* Income Section */}
      <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Banknote className="h-5 w-5 text-emerald-600" />
          <span className="font-medium text-foreground">Verified Income</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(financials.verified_annual_income)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(financials.verified_monthly_income)}
            </p>
          </div>
        </div>

        {/* Income Sources Breakdown */}
        {financials.income_sources && financials.income_sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Income Sources</p>
            <div className="space-y-2">
              {financials.income_sources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{source.name || source.type}</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(source.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Employment */}
      {financials.employer_name && (
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Employment</span>
            {financials.employment_verified && (
              <Badge variant="secondary" className="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30">
                <BadgeCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-foreground font-medium">{financials.employer_name}</p>
        </div>
      )}

      {/* Assets vs Liabilities */}
      <div className="p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-foreground">Balance Sheet</span>
          <span className={cn(
            "text-sm font-semibold",
            netWorth >= 0 ? "text-emerald-600" : "text-destructive"
          )}>
            Net Worth: {formatCurrency(netWorth)}
          </span>
        </div>

        {/* Visual bar */}
        <div className="relative h-4 rounded-full overflow-hidden bg-destructive/20">
          <div 
            className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-500"
            style={{ width: `${assetsPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-100 dark:bg-emerald-900/30">
              <PiggyBank className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Assets</p>
              <p className="font-semibold text-emerald-600">{formatCurrency(assetsTotal)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-red-100 dark:bg-red-900/30">
              <CreditCard className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Liabilities</p>
              <p className="font-semibold text-destructive">{formatCurrency(liabilitiesTotal)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
