// FloorPlanViewer - Safe PDF viewer using react-pdf (no iframe)
import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Download,
  FileText,
  Loader2,
  AlertCircle,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Configure PDF.js worker from CDN (using legacy build for better compatibility)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


interface FloorPlanViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null | undefined;
  modelName: string;
  onRequestQuote?: () => void;
}

export function FloorPlanViewer({
  open,
  onOpenChange,
  pdfUrl,
  modelName,
  onRequestQuote,
}: FloorPlanViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  }, [numPages]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 2.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  // Reset state when dialog opens/closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (newOpen) {
      setPageNumber(1);
      setScale(1.0);
      setLoading(true);
      setError(false);
    }
    onOpenChange(newOpen);
  }, [onOpenChange]);

  const hasPdf = !!pdfUrl;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            {modelName} Floor Plan
          </DialogTitle>
        </DialogHeader>
        
        {hasPdf ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border shrink-0">
              <div className="flex items-center gap-1">
                {/* Zoom Controls */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="h-8 w-8"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-w-[3rem] text-center"
                  title="Reset zoom"
                >
                  {Math.round(scale * 100)}%
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={scale >= 2.5}
                  className="h-8 w-8"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Page Navigation */}
              {numPages && numPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevPage}
                    disabled={pageNumber <= 1}
                    className="h-8 w-8"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {pageNumber} / {numPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={pageNumber >= numPages}
                    className="h-8 w-8"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                  <a href={pdfUrl} download>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Open in New Tab
                  </a>
                </Button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-auto bg-muted/30 flex items-start justify-center p-4 min-h-[400px]">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <Loader2 className="h-8 w-8 text-accent animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Loading floor plan…</p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 max-w-sm text-center"
                  >
                    <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground mb-4">
                      Unable to display PDF preview. You can still download or open the file directly.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={pdfUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                      <Button size="sm" asChild>
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in Browser
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                )}

                {!error && (
                  <motion.div
                    key="document"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loading ? 0 : 1 }}
                    className="shadow-lg rounded-lg overflow-hidden bg-white"
                  >
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={null}
                      error={null}
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        loading={null}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="max-w-full"
                      />
                    </Document>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* No PDF Available - Polished placeholder */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Floor Plan Available on Request
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              The detailed floor plan for the {modelName} is available upon request. 
              Our team will provide you with comprehensive documentation.
            </p>
            {onRequestQuote && (
              <Button onClick={onRequestQuote}>
                <Mail className="h-4 w-4 mr-2" />
                Request Floor Plan
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Inline viewer component for embedding (non-modal)
interface FloorPlanInlineViewerProps {
  pdfUrl: string | null | undefined;
  modelName: string;
  className?: string;
  onRequestQuote?: () => void;
}

export function FloorPlanInlineViewer({
  pdfUrl,
  modelName,
  className,
  onRequestQuote,
}: FloorPlanInlineViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const hasPdf = !!pdfUrl;

  if (!hasPdf) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-xl bg-muted/30 border border-border", className)}>
        <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm mb-4">
          Floor plan available on request
        </p>
        {onRequestQuote && (
          <Button variant="outline" size="sm" onClick={onRequestQuote}>
            <Mail className="h-4 w-4 mr-2" />
            Request Floor Plan
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl bg-muted/30 border border-border overflow-hidden", className)}>
      {/* Compact toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">
          {modelName} Floor Plan
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2">
            <a href={pdfUrl} download>
              <Download className="h-3 w-3 mr-1" />
              Download
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="aspect-[4/3] flex items-center justify-center bg-white">
        {loading && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 text-accent animate-spin mb-2" />
            <p className="text-xs text-muted-foreground">Loading…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center p-4 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground mb-2">Preview unavailable</p>
            <Button variant="outline" size="sm" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                Open PDF
              </a>
            </Button>
          </div>
        )}

        {!error && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={null}
          >
            <Page
              pageNumber={1}
              width={400}
              loading={null}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>

      {/* Page indicator for multi-page docs */}
      {numPages && numPages > 1 && (
        <div className="px-3 py-1.5 border-t border-border bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            Page 1 of {numPages} — Open PDF to view all pages
          </p>
        </div>
      )}
    </div>
  );
}

export default FloorPlanViewer;
