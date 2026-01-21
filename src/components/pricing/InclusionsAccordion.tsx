// ============================================================================
// What's Included / Not Included Accordions
// Reusable component for displaying standard inclusions and exclusions
// ============================================================================

import { 
  ChefHat, 
  Bath, 
  Home, 
  Zap, 
  Sun, 
  Check, 
  X, 
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  getInclusionCategories, 
  getExclusions,
  type InclusionCategory,
  type ExclusionItem,
} from '@/data/standard-inclusions';
import { cn } from '@/lib/utils';

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ChefHat,
  Bath,
  Home,
  Zap,
  Sun,
};

function getCategoryIcon(iconName: string) {
  return iconMap[iconName] || Home;
}

// ============================================================================
// INCLUSIONS SECTION
// ============================================================================

function InclusionCategorySection({ category }: { category: InclusionCategory }) {
  const IconComponent = getCategoryIcon(category.icon);
  
  return (
    <AccordionItem value={category.id} className="border-b border-border/50 last:border-0">
      <AccordionTrigger className="py-3 hover:no-underline group">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <IconComponent className="w-4 h-4 text-accent" />
          </div>
          <span className="text-sm font-medium text-foreground">{category.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <ul className="space-y-2 pl-11">
          {category.items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                {item.text}
                {item.note && (
                  <span className="text-muted-foreground/70 italic ml-1">
                    ({item.note})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

// ============================================================================
// EXCLUSIONS SECTION
// ============================================================================

function ExclusionsList({ exclusions }: { exclusions: ExclusionItem[] }) {
  return (
    <ul className="space-y-2">
      {exclusions.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <X className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground">
            {item.text}
            {item.reason && (
              <span className="text-muted-foreground/70 italic ml-1">
                — {item.reason}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface InclusionsAccordionProps {
  className?: string;
  /** Variant: 'full' shows both sections, 'compact' is more condensed */
  variant?: 'full' | 'compact';
  /** Default open sections */
  defaultOpen?: string[];
}

export function InclusionsAccordion({
  className = '',
  variant = 'full',
  defaultOpen = [],
}: InclusionsAccordionProps) {
  const categories = getInclusionCategories();
  const exclusions = getExclusions();
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* What's Included Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Accordion type="multiple" defaultValue={defaultOpen}>
          {/* Header for inclusions */}
          <div className="px-4 py-3 bg-green-500/5 border-b border-border">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-foreground">What's Included</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Included as standard in this series; final confirmation in written quote.
            </p>
          </div>
          
          <div className="px-4">
            {categories.map((category) => (
              <InclusionCategorySection key={category.id} category={category} />
            ))}
          </div>
        </Accordion>
      </div>
      
      {/* What's Not Included Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="exclusions" className="border-0">
            <div className="px-4 py-3 bg-amber-500/5 border-b border-border">
              <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2 flex-1">
                  <Info className="w-4 h-4 text-amber-600" />
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-foreground">Not Included / Site-Dependent</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Items that vary by site or are owner responsibility
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <div className="px-4 py-4">
                <ExclusionsList exclusions={exclusions} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

// ============================================================================
// INLINE VARIANT (for embedding in pricing panel)
// ============================================================================

export function InlineInclusionsAccordion({ className = '' }: { className?: string }) {
  const categories = getInclusionCategories();
  const exclusions = getExclusions();
  
  return (
    <div className={cn('border-t border-border', className)}>
      <Accordion type="multiple" className="w-full">
        {/* What's Included - Collapsible */}
        <AccordionItem value="whats-included" className="border-b border-border">
          <AccordionTrigger className="px-5 py-4 hover:no-underline text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="font-medium">What's Included</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-5 pb-4">
              <p className="text-xs text-muted-foreground mb-4 italic">
                Included as standard in this series; final confirmation in written quote.
              </p>
              <Accordion type="multiple" className="w-full">
                {categories.map((category) => (
                  <InclusionCategorySection key={category.id} category={category} />
                ))}
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Not Included - Collapsible */}
        <AccordionItem value="not-included" className="border-0">
          <AccordionTrigger className="px-5 py-4 hover:no-underline text-sm">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              <span className="font-medium">Not Included / Site-Dependent</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-5 pb-4">
              <p className="text-xs text-muted-foreground mb-4 italic">
                Items that vary by site or are owner responsibility.
              </p>
              <ExclusionsList exclusions={exclusions} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
