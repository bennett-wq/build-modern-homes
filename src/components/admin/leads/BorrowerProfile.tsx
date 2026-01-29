import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
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

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Helper functions
    const addLine = (height: number = 5) => { y += height; };
    const checkNewPage = (requiredSpace: number = 30) => {
      if (y > 270 - requiredSpace) {
        doc.addPage();
        y = 20;
      }
    };

    // Colors
    const primaryColor: [number, number, number] = [34, 87, 122]; // Deep teal
    const accentColor: [number, number, number] = [16, 185, 129]; // Emerald
    const textColor: [number, number, number] = [31, 41, 55]; // Dark gray
    const mutedColor: [number, number, number] = [107, 114, 128]; // Muted gray

    // Header with gradient-like effect
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 45, "F");
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Pre-Qualification Report", margin, 25);
    
    // Subtitle with verification badge
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const verificationText = isVerified ? "PLAID VERIFIED" : "Self-Reported";
    doc.text(`${lead.contact_name} • ${verificationText}`, margin, 35);
    
    // Date on right
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 35);

    y = 60;

    // Section: Borrower Information
    const addSectionHeader = (title: string) => {
      checkNewPage(40);
      doc.setFillColor(245, 247, 250);
      doc.rect(margin - 5, y - 5, contentWidth + 10, 10, "F");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, y + 2);
      addLine(15);
    };

    const addField = (label: string, value: string, highlight: boolean = false) => {
      checkNewPage();
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(label, margin, y);
      
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      if (highlight) {
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFont("helvetica", "bold");
      }
      doc.setFontSize(11);
      doc.text(value, margin + 55, y);
      doc.setFont("helvetica", "normal");
      addLine(7);
    };

    const addFieldRow = (fields: { label: string; value: string; highlight?: boolean }[]) => {
      checkNewPage();
      const colWidth = contentWidth / fields.length;
      fields.forEach((field, idx) => {
        const x = margin + idx * colWidth;
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(field.label, x, y);
        
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        if (field.highlight) {
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.setFont("helvetica", "bold");
        }
        doc.setFontSize(11);
        doc.text(field.value, x, y + 5);
        doc.setFont("helvetica", "normal");
      });
      addLine(15);
    };

    // Borrower Info Section
    addSectionHeader("BORROWER INFORMATION");
    addField("Full Name", lead.contact_name);
    addField("Email", lead.contact_email);
    addField("Phone", lead.contact_phone || "Not provided");
    addField("Intended Use", lead.intended_use.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()));
    addField("Purchase Timeline", TIMEFRAME_LABELS[lead.purchase_timeframe] || lead.purchase_timeframe);
    addLine(5);

    // Loan Details Section
    addSectionHeader("LOAN DETAILS");
    addFieldRow([
      { label: "Purchase Price", value: formatCurrency(lead.purchase_price), highlight: true },
      { label: "Down Payment", value: `${formatCurrency(lead.down_payment_amount)} (${lead.down_payment_percent}%)` },
    ]);
    addFieldRow([
      { label: "Loan Amount", value: formatCurrency(lead.loan_amount_requested), highlight: true },
      { label: "Est. Monthly Payment", value: formatCurrency(lead.monthly_payment_estimate), highlight: true },
    ]);
    addFieldRow([
      { label: "Loan Term", value: `${lead.loan_term_years} years` },
      { label: "Interest Rate", value: `${lead.interest_rate}%` },
    ]);
    addLine(5);

    // Financial Profile Section
    addSectionHeader("FINANCIAL PROFILE");
    if (isVerified && verifiedFinancials) {
      // Verified badge
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.roundedRect(margin, y - 3, 85, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("✓ PLAID VERIFIED DATA", margin + 3, y + 2);
      addLine(12);
      
      addFieldRow([
        { label: "Verified Annual Income", value: formatCurrency(verifiedFinancials.verified_annual_income), highlight: true },
        { label: "Verified Monthly Income", value: formatCurrency(verifiedFinancials.verified_monthly_income), highlight: true },
      ]);
      if (verifiedFinancials.employer_name) {
        addField("Employer", verifiedFinancials.employer_name);
      }
      addFieldRow([
        { label: "Total Assets", value: formatCurrency(verifiedFinancials.verified_assets_total), highlight: true },
        { label: "Total Liabilities", value: formatCurrency(verifiedFinancials.verified_liabilities_total) },
      ]);
      const netWorth = (verifiedFinancials.verified_assets_total || 0) - (verifiedFinancials.verified_liabilities_total || 0);
      addField("Net Worth", formatCurrency(netWorth), netWorth > 0);
    } else {
      doc.setFillColor(251, 191, 36);
      doc.roundedRect(margin, y - 3, 70, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("SELF-REPORTED", margin + 3, y + 2);
      addLine(12);
      
      addField("Annual Income Range", INCOME_LABELS[lead.annual_income_range] || lead.annual_income_range);
    }
    addField("Credit Score Range", CREDIT_LABELS[lead.credit_score_range] || lead.credit_score_range);
    addField("Employment Status", lead.employment_status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()));
    addLine(5);

    // DTI Analysis Section
    addSectionHeader("DTI ANALYSIS");
    const frontDTI = lead.front_end_dti;
    const backDTI = lead.dti_ratio;
    
    // DTI boxes
    checkNewPage(30);
    const boxWidth = (contentWidth - 10) / 2;
    
    // Front-End DTI Box
    const frontColor: [number, number, number] = frontDTI && frontDTI <= 31 ? [16, 185, 129] : frontDTI && frontDTI <= 36 ? [251, 191, 36] : [239, 68, 68];
    doc.setFillColor(frontColor[0], frontColor[1], frontColor[2]);
    doc.roundedRect(margin, y, boxWidth, 25, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("FRONT-END DTI", margin + 5, y + 7);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(frontDTI ? `${frontDTI.toFixed(1)}%` : "N/A", margin + 5, y + 18);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Target: <31%", margin + boxWidth - 25, y + 18);

    // Back-End DTI Box
    const backColor: [number, number, number] = backDTI && backDTI <= 43 ? [16, 185, 129] : backDTI && backDTI <= 48 ? [251, 191, 36] : [239, 68, 68];
    doc.setFillColor(backColor[0], backColor[1], backColor[2]);
    doc.roundedRect(margin + boxWidth + 10, y, boxWidth, 25, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("BACK-END DTI", margin + boxWidth + 15, y + 7);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(backDTI ? `${backDTI.toFixed(1)}%` : "N/A", margin + boxWidth + 15, y + 18);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Target: <43%", margin + contentWidth - 20, y + 18);
    
    addLine(35);

    // Eligible Programs Section
    addSectionHeader("ELIGIBLE FINANCING PROGRAMS");
    if (lead.eligible_programs && lead.eligible_programs.length > 0) {
      lead.eligible_programs.forEach((program, idx) => {
        checkNewPage();
        if (idx === 0) {
          // Best match badge
          doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.roundedRect(margin, y - 3, 55, 7, 2, 2, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.text("★ BEST MATCH", margin + 3, y + 1);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.setFontSize(11);
          doc.text(program, margin + 60, y);
        } else {
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`• ${program}`, margin, y);
        }
        addLine(8);
      });
    } else {
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.setFontSize(10);
      doc.text("No programs matched yet", margin, y);
      addLine(8);
    }
    addLine(5);

    // Status Section
    addSectionHeader("APPLICATION STATUS");
    addField("Pre-Qualification Status", statusConfig.label);
    if (lead.pre_qualified_amount) {
      addField("Pre-Qualified Amount", formatCurrency(lead.pre_qualified_amount), true);
    }
    addField("Application Date", new Date(lead.created_at).toLocaleDateString());
    addField("Last Updated", new Date(lead.updated_at).toLocaleDateString());
    addLine(5);

    // Notes Section (if any)
    if (notes) {
      addSectionHeader("INTERNAL NOTES");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(notes, contentWidth);
      splitNotes.forEach((line: string) => {
        checkNewPage();
        doc.text(line, margin, y);
        addLine(5);
      });
    }

    // Footer on each page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 280, pageWidth, 20, "F");
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.setFontSize(8);
      doc.text(`Application #${lead.id.slice(0, 8)} • Confidential`, margin, 288);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, 288);
    }

    return doc;
  };

  const handleDownloadReport = () => {
    try {
      const doc = generatePDFReport();
      const filename = `borrower-report-${lead.contact_name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);
      toast.success("PDF report downloaded");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  // Generate simple text summary for clipboard/email
  const generateTextSummary = () => {
    return `
BORROWER PRE-QUALIFICATION SUMMARY
==================================
Name: ${lead.contact_name}
Email: ${lead.contact_email}
Phone: ${lead.contact_phone || "Not provided"}

Loan Details:
- Purchase Price: ${formatCurrency(lead.purchase_price)}
- Down Payment: ${formatCurrency(lead.down_payment_amount)} (${lead.down_payment_percent}%)
- Loan Amount: ${formatCurrency(lead.loan_amount_requested)}
- Est. Monthly Payment: ${formatCurrency(lead.monthly_payment_estimate)}

Financial Profile (${isVerified ? "Plaid Verified" : "Self-Reported"}):
- Annual Income: ${verifiedFinancials?.verified_annual_income ? formatCurrency(verifiedFinancials.verified_annual_income) : INCOME_LABELS[lead.annual_income_range]}
- Credit Score: ${CREDIT_LABELS[lead.credit_score_range]}
- Front-End DTI: ${lead.front_end_dti ? `${lead.front_end_dti.toFixed(1)}%` : "N/A"}
- Back-End DTI: ${lead.dti_ratio ? `${lead.dti_ratio.toFixed(1)}%` : "N/A"}

Eligible Programs: ${lead.eligible_programs?.join(", ") || "None matched"}
Status: ${statusConfig.label}
${lead.pre_qualified_amount ? `Pre-Qualified Amount: ${formatCurrency(lead.pre_qualified_amount)}` : ""}

Application #${lead.id.slice(0, 8)}
    `.trim();
  };

  const handleSendToLender = async () => {
    if (!lenderEmail) {
      toast.error("Please enter a lender email");
      return;
    }
    
    setIsSendingToLender(true);
    // Generate PDF and copy summary to clipboard
    try {
      const doc = generatePDFReport();
      const pdfBlob = doc.output('blob');
      const summary = generateTextSummary();
      await navigator.clipboard.writeText(summary);
      
      // Save PDF for manual attachment
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `borrower-report-${lead.contact_name.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setTimeout(() => {
        setIsSendingToLender(false);
        setSendDialogOpen(false);
        toast.success(`PDF downloaded & summary copied. Send to ${lenderEmail}`);
      }, 500);
    } catch (error) {
      console.error("Failed to prepare report:", error);
      toast.error("Failed to prepare report");
      setIsSendingToLender(false);
    }
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
