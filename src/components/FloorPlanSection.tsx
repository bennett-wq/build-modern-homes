import { useState } from "react";
import { FileText, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloorPlanThumbnail, FloorPlanImageViewer, floorPlanImages } from "@/components/FloorPlanImageViewer";

interface FloorPlanSectionProps {
  modelSlug: string;
  modelName: string;
  footprint?: string;
}

export function FloorPlanSection({ modelSlug, modelName, footprint }: FloorPlanSectionProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const hasFloorPlan = !!floorPlanImages[modelSlug];

  // If no floor plan available, show coming soon message
  if (!hasFloorPlan) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-xl border border-border text-center">
        <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">
          Floor plan coming soon
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6 bg-background rounded-xl border border-border">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Floor Plan</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Layout preview
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              View the layout for the {modelName}.
              {footprint && <span className="ml-1">Footprint: {footprint}</span>}
            </p>
          </div>
          <Button 
            onClick={() => setViewerOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            View Floor Plan
          </Button>
        </div>

        {/* Thumbnail preview */}
        <FloorPlanThumbnail
          modelSlug={modelSlug}
          modelName={modelName}
          onExpand={() => setViewerOpen(true)}
          className="max-w-2xl mx-auto w-full"
        />

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          Layouts are for marketing purposes and may vary. Final construction documents are provided after contracting.
        </p>
      </div>

      {/* Full screen viewer modal */}
      <FloorPlanImageViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        modelSlug={modelSlug}
        modelName={modelName}
      />
    </>
  );
}
