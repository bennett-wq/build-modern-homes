// FinancingBadge - Trust signal component for conventional financing eligibility
// Displays a subtle badge with tooltip drawer explaining MH Advantage / CHOICEHome programs
import { useState } from 'react';
import { Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InfoDrawer } from '@/components/ui/info-drawer';
import { cn } from '@/lib/utils';

interface FinancingBadgeProps {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  showIcon?: boolean;
}

export function FinancingBadge({ 
  variant = 'default', 
  className,
  showIcon = true 
}: FinancingBadgeProps) {
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
          {showIcon && <ShieldCheck className="h-4 w-4 text-accent" />}
          <span>Conventional Financing Available</span>
          <Info className="h-3.5 w-3.5 opacity-50" />
        </button>
        <FinancingInfoDrawer open={isOpen} onOpenChange={setIsOpen} />
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
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="font-medium">Financing Available</span>
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <FinancingInfoDrawer open={isOpen} onOpenChange={setIsOpen} />
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
          <ShieldCheck className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight mb-1">
            Conventional Financing Available
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Eligible for Fannie Mae MH Advantage® & Freddie Mac CHOICEHome®
            <span className="text-muted-foreground/70"> (subject to approval)</span>
          </p>
        </div>
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      </button>
      <FinancingInfoDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

interface FinancingInfoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FinancingInfoDrawer({ open, onOpenChange }: FinancingInfoDrawerProps) {
  return (
    <InfoDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent" />
          Conventional Financing Options
        </span>
      }
      description="Understanding your mortgage options for CrossMod® homes"
    >
      <div className="space-y-5">
        {/* Programs Overview */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary">
            <h4 className="font-semibold text-foreground mb-2">
              Fannie Mae MH Advantage®
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MH Advantage® allows qualifying factory-built homes to receive 
              conventional mortgage financing with terms similar to site-built homes, 
              including 30-year fixed-rate options.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-secondary">
            <h4 className="font-semibold text-foreground mb-2">
              Freddie Mac CHOICEHome®
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CHOICEHome® provides conventional financing for high-quality 
              factory-built homes that meet specific construction and design standards, 
              offering competitive rates and terms.
            </p>
          </div>
        </div>

        {/* Key Benefits */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Key Benefits</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
              <span>30-year fixed-rate mortgage options</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
              <span>Competitive interest rates similar to site-built homes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
              <span>Down payment options as low as 3% for qualified buyers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
              <span>No requirement for a chattel loan</span>
            </li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/80 leading-relaxed pt-2 border-t border-border">
          Financing availability depends on individual qualifications and lender approval. 
          BaseMod Homes works with lending partners familiar with CrossMod® financing programs.
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
