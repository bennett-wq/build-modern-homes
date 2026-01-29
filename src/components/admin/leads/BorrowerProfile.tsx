import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Send,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  BadgeCheck,
  Loader2,
  ExternalLink,
  Copy,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { DTIGauge } from "./DTIGauge";
import { ProgramEligibilityCard } from "./ProgramEligibilityCard";
import { VerifiedFinancialsCard } from "./VerifiedFinancialsCard";

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

interface Lead {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  purchase_price: number;
  down_payment_amount: number;
  down_payment_percent: number;
  loan_amount_requested: number;
  loan_term_years: number;
  interest_rate: number;
  monthly_payment_estimate: number | null;
  annual_income_range: string;
  credit_score_range: string;
  employment_status: string;
  intended_use: string;
  purchase_timeframe: string;
  pre_qualification_status: string;
  pre_qualified_amount: number | null;
  verification_method: string | null;
  dti_ratio: number | null;
  front_end_dti: number | null;
  eligible_programs: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface BorrowerProfileProps {
  lead: Lead;
  verifiedFinancials: VerifiedFinancials | null;
  onBack: () => void;
  onUpdate: () => void;
}

type PrequalStatus = "pending" | "pre_qualified" | "needs_review" | "declined";

const STATUS_CONFIG: Record<PrequalStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending Review", color: "bg-amber-500", icon: Clock },
  pre_qualified: { label: "Pre-Qualified", color: "bg-emerald-500", icon: CheckCircle2 },
  needs_review: { label: "Needs Review", color: "bg-blue-500", icon: AlertCircle },
  declined: { label: "Declined", color: "bg-destructive", icon: AlertCircle },
};

const INCOME_LABELS: Record<string, string> = {
  under_50k: "Under $50,000",
  "50k_75k": "$50,000 - $75,000",
  "75k_100k": "$75,000 - $100,000",
  "100k_150k": "$100,000 - $150,000",
  "150k_plus": "$150,000+",
};

const CREDIT_LABELS: Record<string, string> = {
  excellent_750: "Excellent (750+)",
  good_700: "Good (700-749)",
  fair_650: "Fair (650-699)",
  below_650: "Below 650",
  unsure: "Unsure",
};

const TIMEFRAME_LABELS: Record<string, string> = {
  "0_3_months": "0-3 months",
  "3_6_months": "3-6 months",
  "6_12_months": "6-12 months",
  "12_plus": "12+ months",
};

export function BorrowerProfile({ lead, verifiedFinancials, onBack, onUpdate }: BorrowerProfileProps) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [status, setStatus] = useState<PrequalStatus>(lead.pre_qualification_status as PrequalStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingToLender, setIsSendingToLender] = useState(false);
  const [lenderEmail, setLenderEmail] = useState("");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const isVerified = lead.verification_method === "plaid_verified";

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("financing_applications")
        .update({ notes, pre_qualification_status: status })
        .eq("id", lead.id);

      if (error) throw error;
      toast.success("Lead updated successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateReport = () => {
    const report = `
BORROWER PRE-QUALIFICATION REPORT
Generated: ${new Date().toLocaleDateString()}
================================

BORROWER INFORMATION
--------------------
Name: ${lead.contact_name}
Email: ${lead.contact_email}
Phone: ${lead.contact_phone || "Not provided"}

LOAN DETAILS
------------
Purchase Price: ${formatCurrency(lead.purchase_price)}
Down Payment: ${formatCurrency(lead.down_payment_amount)} (${lead.down_payment_percent}%)
Loan Amount: ${formatCurrency(lead.loan_amount_requested)}
Term: ${lead.loan_term_years} years
Interest Rate: ${lead.interest_rate}%
Est. Monthly Payment: ${formatCurrency(lead.monthly_payment_estimate)}

FINANCIAL PROFILE
-----------------
${isVerified ? "✓ PLAID VERIFIED" : "Self-Reported"}
Annual Income: ${verifiedFinancials?.verified_annual_income ? formatCurrency(verifiedFinancials.verified_annual_income) : INCOME_LABELS[lead.annual_income_range] || lead.annual_income_range}
Credit Score Range: ${CREDIT_LABELS[lead.credit_score_range] || lead.credit_score_range}
Employment: ${lead.employment_status.replace("_", " ")}
${verifiedFinancials?.employer_name ? `Employer: ${verifiedFinancials.employer_name}` : ""}

DTI RATIOS
----------
Front-End DTI: ${lead.front_end_dti ? `${lead.front_end_dti.toFixed(1)}%` : "N/A"}
Back-End DTI: ${lead.dti_ratio ? `${lead.dti_ratio.toFixed(1)}%` : "N/A"}

${verifiedFinancials ? `
VERIFIED FINANCIALS
-------------------
Total Assets: ${formatCurrency(verifiedFinancials.verified_assets_total)}
Total Liabilities: ${formatCurrency(verifiedFinancials.verified_liabilities_total)}
Net Worth: ${formatCurrency((verifiedFinancials.verified_assets_total || 0) - (verifiedFinancials.verified_liabilities_total || 0))}
` : ""}

ELIGIBLE PROGRAMS
-----------------
${lead.eligible_programs?.length ? lead.eligible_programs.join("\n") : "No programs matched"}

STATUS
------
Pre-Qualification Status: ${statusConfig.label}
${lead.pre_qualified_amount ? `Pre-Qualified Amount: ${formatCurrency(lead.pre_qualified_amount)}` : ""}

INTERNAL NOTES
--------------
${notes || "No notes"}

Application Date: ${new Date(lead.created_at).toLocaleDateString()}
Last Updated: ${new Date(lead.updated_at).toLocaleDateString()}
    `.trim();

    return report;
  };

  const handleDownloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `borrower-report-${lead.contact_name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const handleSendToLender = async () => {
    if (!lenderEmail) {
      toast.error("Please enter a lender email");
      return;
    }
    
    setIsSendingToLender(true);
    // In production, this would send via email API
    // For now, we'll copy to clipboard and show success
    const report = generateReport();
    await navigator.clipboard.writeText(report);
    
    setTimeout(() => {
      setIsSendingToLender(false);
      setSendDialogOpen(false);
      toast.success(`Report copied to clipboard. Send to ${lenderEmail}`);
    }, 1000);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(lead.contact_email);
    toast.success("Email copied to clipboard");
  };

  const copyPhone = () => {
    if (lead.contact_phone) {
      navigator.clipboard.writeText(lead.contact_phone);
      toast.success("Phone copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{lead.contact_name}</h1>
                  <Badge className={cn("text-white", statusConfig.color)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  {isVerified && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      Plaid Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Application #{lead.id.slice(0, 8)} • {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send to Lender
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send to Lender</DialogTitle>
                    <DialogDescription>
                      Send this borrower's pre-qualification report to a lender for review.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="lender-email">Lender Email</Label>
                    <Input
                      id="lender-email"
                      type="email"
                      placeholder="lender@example.com"
                      value={lenderEmail}
                      onChange={(e) => setLenderEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendToLender} disabled={isSendingToLender}>
                      {isSendingToLender ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Report
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact & Quick Stats */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{lead.contact_email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={copyEmail} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                {lead.contact_phone && (
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{lead.contact_phone}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={copyPhone} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Purchase Timeline</p>
                    <p className="text-sm font-medium">{TIMEFRAME_LABELS[lead.purchase_timeframe] || lead.purchase_timeframe}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Home className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Intended Use</p>
                    <p className="text-sm font-medium capitalize">{lead.intended_use.replace("_", " ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Loan Stats */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Loan Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Purchase Price</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(lead.purchase_price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Down Payment</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {formatCurrency(lead.down_payment_amount)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">({lead.down_payment_percent}%)</span>
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Loan Amount</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(lead.loan_amount_requested)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Term / Rate</span>
                  <span className="text-sm font-medium">{lead.loan_term_years}yr @ {lead.interest_rate}%</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium text-foreground">Est. Monthly Payment</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(lead.monthly_payment_estimate)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Status & Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Status & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pre-Qualification Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as PrequalStatus)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="pre_qualified">Pre-Qualified</SelectItem>
                      <SelectItem value="needs_review">Needs Review</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Internal Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this borrower..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>
                <Button onClick={handleSaveNotes} disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* DTI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  DTI Analysis
                  {isVerified && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-xs">
                      Verified Data
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-12 py-4">
                  <DTIGauge
                    value={lead.front_end_dti}
                    label="Front-End DTI"
                    threshold={31}
                    description="Housing Payment / Gross Income"
                  />
                  <DTIGauge
                    value={lead.dti_ratio}
                    label="Back-End DTI"
                    threshold={43}
                    description="Total Debt / Gross Income"
                  />
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">DTI Guidelines</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Healthy: Under target threshold</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">Caution: Slightly above threshold</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-muted-foreground">High Risk: Significantly above</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="financials" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="financials">Verified Financials</TabsTrigger>
                <TabsTrigger value="programs">Program Eligibility</TabsTrigger>
                <TabsTrigger value="profile">Borrower Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="financials">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VerifiedFinancialsCard
                      financials={verifiedFinancials}
                      verificationMethod={lead.verification_method}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="programs">
                <Card>
                  <CardHeader>
                    <CardTitle>Eligible Financing Programs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgramEligibilityCard
                      programs={lead.eligible_programs || []}
                      bestMatch={lead.eligible_programs?.[0]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Self-Reported Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Income Range</p>
                          <p className="text-lg font-semibold">{INCOME_LABELS[lead.annual_income_range] || lead.annual_income_range}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Credit Score Range</p>
                          <p className="text-lg font-semibold">{CREDIT_LABELS[lead.credit_score_range] || lead.credit_score_range}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Employment Status</p>
                          <p className="text-lg font-semibold capitalize">{lead.employment_status.replace("_", " ")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Intended Use</p>
                          <p className="text-lg font-semibold capitalize">{lead.intended_use.replace("_", " ")}</p>
                        </div>
                      </div>
                    </div>
                    {lead.pre_qualified_amount && (
                      <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-emerald-600 font-medium">Pre-Qualified Amount</p>
                        <p className="text-3xl font-bold text-emerald-600">{formatCurrency(lead.pre_qualified_amount)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
