import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRef } from "react";
import jsPDF from "jspdf";

const BrandGuide = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Helper function
    const addText = (text: string, size: number, style: "normal" | "bold" = "normal", color: number[] = [33, 33, 33]) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", style);
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, y);
      y += lines.length * (size * 0.4) + 4;
    };

    const addColorSwatch = (name: string, hsl: string, hex: string) => {
      // Draw swatch
      const hexColor = hex.replace("#", "");
      const r = parseInt(hexColor.substring(0, 2), 16);
      const g = parseInt(hexColor.substring(2, 4), 16);
      const b = parseInt(hexColor.substring(4, 6), 16);
      
      pdf.setFillColor(r, g, b);
      pdf.rect(margin, y, 15, 10, "F");
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(33, 33, 33);
      pdf.text(name, margin + 20, y + 4);
      
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`HSL: ${hsl}`, margin + 20, y + 8);
      pdf.text(`HEX: ${hex}`, margin + 70, y + 8);
      
      y += 14;
    };

    // Title
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(46, 46, 46);
    pdf.text("BaseMod Homes", margin, y);
    y += 10;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text("Brand Guidelines", margin, y);
    y += 20;

    // Brand Overview
    addText("Brand Overview", 16, "bold");
    addText("Beautiful modular homes with real installed estimates and a clearer path to ownership—designed for real life.", 11, "normal", [80, 80, 80]);
    y += 8;

    // Logo Section
    addText("Logo", 16, "bold");
    addText("The BaseMod wordmark uses a two-tone treatment:", 11, "normal", [80, 80, 80]);
    y += 2;
    addText("• 'Base' and 'Homes' in deep charcoal (#2E2E2E)", 10, "normal", [80, 80, 80]);
    addText("• 'Mod' highlighted in warm wood accent (#9A7B4F)", 10, "normal", [80, 80, 80]);
    y += 8;

    // Wordmark demo
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(46, 46, 46);
    pdf.text("Base", margin, y);
    const baseWidth = pdf.getTextWidth("Base");
    pdf.setTextColor(154, 123, 79);
    pdf.text("Mod", margin + baseWidth, y);
    const modWidth = pdf.getTextWidth("Mod");
    pdf.setTextColor(46, 46, 46);
    pdf.text("Homes", margin + baseWidth + modWidth, y);
    y += 15;

    // Color Palette
    addText("Color Palette", 16, "bold");
    y += 2;

    addColorSwatch("Primary (Charcoal)", "0° 0% 18%", "#2E2E2E");
    addColorSwatch("Accent (Wood)", "30° 40% 45%", "#9A7B4F");
    addColorSwatch("Background", "0° 0% 100%", "#FFFFFF");
    addColorSwatch("Secondary", "30° 10% 96%", "#F5F4F2");
    addColorSwatch("Muted", "30° 5% 94%", "#F0EFED");
    addColorSwatch("Border", "30° 10% 88%", "#E3E0DB");
    y += 5;

    // Typography
    addText("Typography", 16, "bold");
    addText("Primary Font: System UI / Helvetica Neue / Sans-serif", 11, "normal", [80, 80, 80]);
    addText("Headlines: Semibold (600 weight)", 10, "normal", [100, 100, 100]);
    addText("Body: Regular (400 weight)", 10, "normal", [100, 100, 100]);
    y += 8;

    // New page for more content
    pdf.addPage();
    y = 20;

    // Tone & Voice
    addText("Tone & Voice", 16, "bold");
    addText("• Professional yet approachable", 11, "normal", [80, 80, 80]);
    addText("• Confident without being boastful", 11, "normal", [80, 80, 80]);
    addText("• Clear and transparent", 11, "normal", [80, 80, 80]);
    addText("• Modern and forward-thinking", 11, "normal", [80, 80, 80]);
    y += 8;

    // Key Messages
    addText("Key Brand Messages", 16, "bold");
    addText("Tagline: 'Make home possible again.'", 11, "bold", [80, 80, 80]);
    y += 4;
    addText("Core Value Props:", 11, "bold", [80, 80, 80]);
    addText("• Truth in pricing — Clear estimates to help you plan, no mystery math", 10, "normal", [100, 100, 100]);
    addText("• Speed with standards — Faster doesn't mean flimsy. It means organized.", 10, "normal", [100, 100, 100]);
    addText("• Pride belongs to everyone — Great design shouldn't be reserved for custom-home budgets", 10, "normal", [100, 100, 100]);
    y += 8;

    // Timeline
    addText("Build Timeline", 16, "bold");
    addText("~78 days average once the site is ready. Timing varies by permitting and site conditions.", 11, "normal", [80, 80, 80]);
    y += 8;

    // Design Principles
    addText("Design Principles", 16, "bold");
    addText("• Premium, Stripe/Airbnb-style aesthetic", 11, "normal", [80, 80, 80]);
    addText("• Generous whitespace", 11, "normal", [80, 80, 80]);
    addText("• High-contrast CTAs", 11, "normal", [80, 80, 80]);
    addText("• Subtle shadows and refined borders", 11, "normal", [80, 80, 80]);
    addText("• Photography-forward with architectural imagery", 11, "normal", [80, 80, 80]);
    y += 10;

    // Button Styles
    addText("Button Styles", 16, "bold");
    
    // Primary button
    pdf.setFillColor(154, 123, 79);
    pdf.roundedRect(margin, y, 80, 12, 2, 2, "F");
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("Get a Quote", margin + 22, y + 8);
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text("Primary CTA - Wood accent fill", margin + 85, y + 8);
    y += 18;

    // Secondary button
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, y, 80, 12, 2, 2, "FD");
    pdf.setFontSize(11);
    pdf.setTextColor(46, 46, 46);
    pdf.text("Explore Homes", margin + 18, y + 8);
    
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Secondary - Text link style", margin + 85, y + 8);
    y += 20;

    // Footer
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated ${new Date().toLocaleDateString()} | basemodhomes.com`, margin, 280);

    pdf.save("BaseMod-Brand-Guide.pdf");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">BaseMod Brand Guide</h1>
            <p className="text-muted-foreground">Visual identity and brand guidelines</p>
          </div>
          <Button onClick={downloadPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        <div ref={contentRef} className="space-y-12">
          {/* Logo Section */}
          <section className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-xl font-semibold mb-6">Logo</h2>
            <div className="flex items-center gap-8 mb-6">
              <div className="text-3xl font-bold">
                <span className="text-foreground">Base</span>
                <span className="text-accent">Mod</span>
                <span className="text-foreground">Homes</span>
              </div>
              <a 
                href="/brand/basemod-logo-icon.png" 
                download="basemod-favicon.png"
                className="text-sm text-accent hover:underline"
              >
                Download Icon →
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              The wordmark uses "Mod" highlighted in the warm wood accent color to emphasize the modular aspect.
            </p>
          </section>

          {/* Color Palette */}
          <section className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-xl font-semibold mb-6">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "Primary (Charcoal)", hsl: "0° 0% 18%", hex: "#2E2E2E", bg: "bg-primary" },
                { name: "Accent (Wood)", hsl: "30° 40% 45%", hex: "#9A7B4F", bg: "bg-accent" },
                { name: "Background", hsl: "0° 0% 100%", hex: "#FFFFFF", bg: "bg-white border" },
                { name: "Secondary", hsl: "30° 10% 96%", hex: "#F5F4F2", bg: "bg-secondary" },
                { name: "Muted", hsl: "30° 5% 94%", hex: "#F0EFED", bg: "bg-muted" },
                { name: "Border", hsl: "30° 10% 88%", hex: "#E3E0DB", bg: "bg-border" },
              ].map((color) => (
                <div key={color.name} className="space-y-2">
                  <div className={`w-full h-16 rounded-lg ${color.bg}`} />
                  <p className="font-medium text-sm">{color.name}</p>
                  <p className="text-xs text-muted-foreground">HSL: {color.hsl}</p>
                  <p className="text-xs text-muted-foreground">HEX: {color.hex}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-xl font-semibold mb-6">Typography</h2>
            <div className="space-y-4">
              <div>
                <p className="text-4xl font-semibold mb-1">Headline Semibold</p>
                <p className="text-sm text-muted-foreground">System UI / Sans-serif, 600 weight</p>
              </div>
              <div>
                <p className="text-lg">Body Regular — Beautiful modular homes designed for real life.</p>
                <p className="text-sm text-muted-foreground mt-1">System UI / Sans-serif, 400 weight</p>
              </div>
            </div>
          </section>

          {/* Key Messages */}
          <section className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-xl font-semibold mb-6">Key Messages</h2>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-lg mb-2">Tagline</p>
                <p className="text-xl text-muted-foreground">"Make home possible again."</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Value Propositions</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Truth in pricing</strong> — Clear estimates to help you plan, no mystery math</li>
                  <li>• <strong>Speed with standards</strong> — Faster doesn't mean flimsy. It means organized.</li>
                  <li>• <strong>Pride belongs to everyone</strong> — Great design shouldn't be reserved for custom-home budgets</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-xl font-semibold mb-6">Button Styles</h2>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                Get a Quote
              </Button>
              <Button variant="outline">
                Explore Homes
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                Learn More →
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BrandGuide;
