// Fullscreen exterior preview modal for immersive viewing
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ExteriorPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  packageName?: string;
  garageName?: string;
}

export function ExteriorPreviewModal({
  open,
  onOpenChange,
  imageSrc,
  packageName,
  garageName,
}: ExteriorPreviewModalProps) {
  const title = [packageName, garageName].filter(Boolean).join(' • ') || 'Exterior Preview';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 gap-0 bg-black/95 border-none">
        <DialogHeader className="absolute top-0 left-0 right-0 z-10 flex flex-row items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <DialogTitle className="text-white text-lg font-medium">
            {title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <div className="w-full h-full flex items-center justify-center p-4 pt-16">
          <img
            src={imageSrc}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
