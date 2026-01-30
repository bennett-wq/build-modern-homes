// BuyerFinancialSummary - Lender-ready financial summary PDF and clipboard export
// For buyers to share with lenders for MH Advantage, CHOICEHome, and other programs

import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface FinancialData {
  // Buyer info
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  intendedUse: string;
  purchaseTimeframe: string;
  
  // Loan details
  purchasePrice: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  loanAmount: number;
  monthlyPayment: number | null;
  
  // Verified financials
  verifiedIncome: number | null;
  frontEndDti: number | null;
  backEndDti: number | null;
  
  // Programs
  eligiblePrograms: Array<{ name: string; matchQuality: string; description: string }>;
  
  // Status
  applicationId?: string;
  isVerified: boolean;
}

const INTENDED_USE_LABELS: Record<string, string> = {
  primary: "Primary Residence",
  second_home: "Second Home",
  investment: "Investment Property",
};

const TIMEFRAME_LABELS: Record<string, string> = {
  "0_3_months": "Within 3 months",
  "3_6_months": "3-6 months",
  "6_12_months": "6-12 months",
  "12_plus": "12+ months",
};

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function generateBuyerPDF(data: FinancialData): jsPDF {
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

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Summary", margin, 25);
  
  // Subtitle with verification badge
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const verificationText = data.isVerified ? "BANK VERIFIED" : "Self-Reported";
  doc.text(`${data.contactName} • ${verificationText}`, margin, 35);
  
  // Date on right
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 35);

  y = 60;

  // Section Header Helper
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

  // Buyer Information Section
  addSectionHeader("BUYER INFORMATION");
  addField("Full Name", data.contactName);
  addField("Email", data.contactEmail);
  if (data.contactPhone) {
    addField("Phone", data.contactPhone);
  }
  addField("Intended Use", INTENDED_USE_LABELS[data.intendedUse] || data.intendedUse);
  addField("Purchase Timeline", TIMEFRAME_LABELS[data.purchaseTimeframe] || data.purchaseTimeframe);
  addLine(5);

  // Loan Overview Section
  addSectionHeader("LOAN OVERVIEW");
  addFieldRow([
    { label: "Purchase Price", value: formatCurrency(data.purchasePrice), highlight: true },
    { label: "Down Payment", value: `${formatCurrency(data.downPaymentAmount)} (${data.downPaymentPercent}%)` },
  ]);
  addFieldRow([
    { label: "Loan Amount", value: formatCurrency(data.loanAmount), highlight: true },
    { label: "Est. Monthly Payment", value: formatCurrency(data.monthlyPayment), highlight: true },
  ]);
  addLine(5);

  // Verified Financial Profile Section
  addSectionHeader("VERIFIED FINANCIAL PROFILE");
  
  if (data.isVerified) {
    // Verified badge
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.roundedRect(margin, y - 3, 85, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("✓ BANK VERIFIED DATA", margin + 3, y + 2);
    addLine(12);
    
    if (data.verifiedIncome) {
      addFieldRow([
        { label: "Verified Annual Income", value: formatCurrency(data.verifiedIncome), highlight: true },
        { label: "Verified Monthly Income", value: formatCurrency(data.verifiedIncome / 12), highlight: true },
      ]);
    }
  } else {
    doc.setFillColor(251, 191, 36);
    doc.roundedRect(margin, y - 3, 70, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("SELF-REPORTED", margin + 3, y + 2);
    addLine(12);
  }
  addLine(5);

  // DTI Analysis Section
  addSectionHeader("DTI ANALYSIS");
  checkNewPage(30);
  const boxWidth = (contentWidth - 10) / 2;
  
  // Front-End DTI Box
  const frontDTI = data.frontEndDti;
  const frontColor: [number, number, number] = frontDTI && frontDTI <= 31 
    ? [16, 185, 129] 
    : frontDTI && frontDTI <= 36 
    ? [251, 191, 36] 
    : [239, 68, 68];
  doc.setFillColor(frontColor[0], frontColor[1], frontColor[2]);
  doc.roundedRect(margin, y, boxWidth, 30, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("FRONT-END DTI", margin + 5, y + 8);
  doc.setFontSize(7);
  doc.text("(Housing Expense Ratio)", margin + 5, y + 13);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(frontDTI ? `${frontDTI.toFixed(1)}%` : "N/A", margin + 5, y + 24);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Target: <31%", margin + boxWidth - 28, y + 24);

  // Back-End DTI Box
  const backDTI = data.backEndDti;
  const backColor: [number, number, number] = backDTI && backDTI <= 43 
    ? [16, 185, 129] 
    : backDTI && backDTI <= 48 
    ? [251, 191, 36] 
    : [239, 68, 68];
  doc.setFillColor(backColor[0], backColor[1], backColor[2]);
  doc.roundedRect(margin + boxWidth + 10, y, boxWidth, 30, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("BACK-END DTI", margin + boxWidth + 15, y + 8);
  doc.setFontSize(7);
  doc.text("(Total Debt Ratio)", margin + boxWidth + 15, y + 13);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(backDTI ? `${backDTI.toFixed(1)}%` : "N/A", margin + boxWidth + 15, y + 24);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Target: <43%", margin + contentWidth - 23, y + 24);
  
  addLine(40);

  // Eligible Programs Section
  if (data.eligiblePrograms.length > 0) {
    addSectionHeader("ELIGIBLE LOAN PROGRAMS");
    data.eligiblePrograms.forEach((program, idx) => {
      checkNewPage();
      if (idx === 0 && program.matchQuality === "excellent") {
        // Best match badge
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.roundedRect(margin, y - 3, 55, 7, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("★ BEST MATCH", margin + 3, y + 1);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(11);
        doc.text(program.name, margin + 60, y);
      } else {
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`• ${program.name}`, margin, y);
      }
      addLine(8);
    });
    addLine(5);
  }

  // Disclaimer
  checkNewPage(30);
  doc.setFillColor(245, 247, 250);
  doc.rect(margin - 5, y, contentWidth + 10, 25, "F");
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const disclaimer = [
    "This summary is based on verified bank data and is provided for informational purposes only.",
    "Final loan approval is subject to full underwriting, credit verification, and property appraisal.",
    "This pre-qualification is not a commitment to lend."
  ];
  disclaimer.forEach((line, idx) => {
    doc.text(line, margin, y + 5 + idx * 5);
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 283, pageWidth, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("BaseMod Financial", margin, 290);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, 290);
  }

  return doc;
}

export function generateBuyerTextSummary(data: FinancialData): string {
  const verificationStatus = data.isVerified ? "BANK VERIFIED" : "Self-Reported";
  const bestProgram = data.eligiblePrograms.find(p => p.matchQuality === "excellent") 
    || data.eligiblePrograms[0];
  
  return `
BASEMOD FINANCIAL - BUYER SUMMARY
=================================
Name: ${data.contactName}
Generated: ${new Date().toLocaleDateString()}
Status: ${verificationStatus}

LOAN DETAILS
Purchase Price: ${formatCurrency(data.purchasePrice)}
Down Payment: ${formatCurrency(data.downPaymentAmount)} (${data.downPaymentPercent}%)
Loan Amount: ${formatCurrency(data.loanAmount)}
Est. Monthly Payment: ${formatCurrency(data.monthlyPayment)}

VERIFIED FINANCIALS${data.isVerified ? " (Plaid)" : ""}
Annual Income: ${data.verifiedIncome ? formatCurrency(data.verifiedIncome) : "Not verified"}
Front-End DTI: ${data.frontEndDti ? `${data.frontEndDti.toFixed(1)}%` : "N/A"}
Back-End DTI: ${data.backEndDti ? `${data.backEndDti.toFixed(1)}%` : "N/A"}

ELIGIBLE PROGRAMS
${data.eligiblePrograms.length > 0 
  ? data.eligiblePrograms.map((p, i) => `${i === 0 && bestProgram?.matchQuality === "excellent" ? "★ " : "• "}${p.name}`).join("\n")
  : "Pending review"}

${data.applicationId ? `Reference: ${data.applicationId.slice(0, 8)}` : ""}

---
This pre-qualification is not a commitment to lend.
Final approval subject to full underwriting.
`.trim();
}

export function downloadBuyerPDF(data: FinancialData) {
  try {
    const doc = generateBuyerPDF(data);
    const filename = `financial-summary-${data.contactName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
    toast.success("Financial summary downloaded!");
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Failed to generate PDF");
  }
}

export function copyBuyerSummaryToClipboard(data: FinancialData) {
  try {
    const summary = generateBuyerTextSummary(data);
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy:", error);
    toast.error("Failed to copy summary");
  }
}
