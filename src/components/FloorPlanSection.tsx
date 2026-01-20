import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloorPlanSectionProps {
  modelSlug: string;
  modelName: string;
}

export function FloorPlanSection({ modelSlug, modelName }: FloorPlanSectionProps) {
  // Use relative path - works on any domain (basemodhomes.com, www.basemodhomes.com, preview, etc.)
  const pdfPath = `/floorplans/${modelSlug}/${modelSlug}-floorplan.pdf`;

  return (
    <div className="flex flex-col gap-4 mb-10 p-6 bg-background rounded-lg border border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Floor Plans</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Download the complete floor plan documentation for the {modelName} model.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <a 
              href={pdfPath}
              target="_blank" 
              rel="noreferrer"
            >
              <FileText className="mr-2 h-4 w-4" />
              View Floor Plans (PDF)
            </a>
          </Button>
          <Button asChild variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <a 
              href={pdfPath}
              download
            >
              <Download className="mr-2 h-4 w-4" />
              Download Floor Plan
            </a>
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        If the PDF doesn't open, <a href={pdfPath} download className="underline hover:text-accent">click here to download</a>.
      </p>
    </div>
  );
}
