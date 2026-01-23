// AppraisalBadge - Trust signal component for appraisal-ready homes
// Displays a subtle badge with drawer explaining construction types and appraisal standards
// Uses InfoDrawer for proper overlay pattern (right slide-over on desktop, bottom sheet on mobile)
import { useState } from 'react';
import { Info, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InfoDrawer } from '@/components/ui/info-drawer';
import { cn } from '@/lib/utils';

interface AppraisalBadgeProps {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  showIcon?: boolean;
}

export function AppraisalBadge({ 
  variant = 'default', 
  className,
  showIcon = true 
}: AppraisalBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors',
            className
          )}
        >
          {showIcon && <ClipboardCheck className="h-4 w-4 text-accent" />}
          <span>Appraisal-Ready Homes</span>
          <Info className="h-3.5 w-3.5 opacity-50" />
        </button>
        <AppraisalInfoDrawer open={isOpen} onOpenChange={setIsOpen} />
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
            'bg-accent/10 border border-accent/20',
            'text-sm text-foreground hover:bg-accent/15 transition-colors',
            className
          )}
        >
          <ClipboardCheck className="h-4 w-4 text-accent" />
          <span className="font-medium">Appraisal-Ready</span>
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <AppraisalInfoDrawer open={isOpen} onOpenChange={setIsOpen} />
      </>
    );
  }

  // Default variant - full badge
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl w-full text-left',
          'bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20',
          'hover:from-accent/10 hover:to-accent/15 transition-all duration-200',
          className
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <ClipboardCheck className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight mb-1">
            Appraisal-Ready Homes
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Designed to meet conventional appraisal standards
          </p>
        </div>
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      </button>
      <AppraisalInfoDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

interface AppraisalInfoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppraisalInfoDrawer({ open, onOpenChange }: AppraisalInfoDrawerProps) {
  return (
    <InfoDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-accent" />
          Appraisals & Home Construction Types
        </span>
      }
      description="Understanding how BaseMod homes are built and appraised"
    >
      <div className="space-y-5">
        {/* Introduction */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          BaseMod homes are offered using two construction methods, each designed to 
          support conventional appraisal and financing pathways.
        </p>

        {/* Construction Types */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary border border-border">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">1</span>
              IRC Modular Homes
            </h4>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span>Built to International Residential Code (IRC)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span>Permanently installed on foundation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span>Appraised using standard site-built comparables (subject to lender/appraiser)</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-secondary border border-border">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">2</span>
              Factory-Built Homes
            </h4>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span>Built with features that may qualify for Fannie Mae MH Advantage® and Freddie Mac CHOICEHome® programs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span>Designed to appraise as real property using conventional methodologies</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-sm text-foreground font-medium leading-relaxed">
            Both construction types are designed to support conventional appraisal 
            and financing pathways, providing buyers with more options and flexibility.
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/80 leading-relaxed pt-2 border-t border-border">
          Appraisals are completed by independent licensed appraisers. Final valuation 
          depends on market comparables, site improvements, and lender requirements.
        </p>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </div>
    </InfoDrawer>
  );
}

// Link component for opening drawer from wizard steps
interface AppraisalInfoLinkProps {
  className?: string;
}

export function AppraisalInfoLink({ className }: AppraisalInfoLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors',
          className
        )}
      >
        <Info className="h-3.5 w-3.5" />
        <span>Appraisals & Construction</span>
      </button>
      <AppraisalInfoDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

// Sidebar module for wizard steps
interface AppraisalSidebarModuleProps {
  className?: string;
}

export function AppraisalSidebarModule({ className }: AppraisalSidebarModuleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={cn('p-4 rounded-xl bg-secondary border border-border', className)}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <ClipboardCheck className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-tight">
              Appraisal-Ready Homes
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Designed to meet conventional appraisal standards
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1 mt-2 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Learn More
              <Info className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
      <AppraisalInfoDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
