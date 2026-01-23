// ============================================================================
// What's Included / Not Included Accordions
// Reusable component for displaying standard inclusions and exclusions
// Uses centralized copy from src/content/inclusionsCopy.ts
// ============================================================================

import { 
  ChefHat, 
  Bath, 
  Home, 
  Zap, 
  Sun, 
  Check, 
  X, 
  Info,
  DoorOpen,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { INCLUSIONS_COPY, type InclusionCategory } from '@/content/inclusionsCopy';
import { cn } from '@/lib/utils';

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  kitchen: ChefHat,
  bathrooms: Bath,
  interior: Home,
  mechanical: Zap,
  windows: Sun,
  exterior: DoorOpen,
};

function getCategoryIcon(key: string) {
  return iconMap[key] || Home;
}

// ============================================================================
// INCLUSIONS SECTION
// ============================================================================

function InclusionCategorySection({ category }: { category: InclusionCategory }) {
  const IconComponent = getCategoryIcon(category.key);
  
  return (
    <AccordionItem value={category.key} className="border-b border-border/50 last:border-0">
      <AccordionTrigger className="py-3 hover:no-underline group">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <IconComponent className="w-4 h-4 text-accent" />
          </div>
          <span className="text-sm font-medium text-foreground">{category.title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <ul className="space-y-2 pl-11">
          {category.items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{item}</span>
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

function ExclusionsList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <X className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground">{item}</span>
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
  const { accordion } = INCLUSIONS_COPY;
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* What's Included Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Accordion type="multiple" defaultValue={defaultOpen}>
          {/* Header for inclusions */}
          <div className="px-4 py-3 bg-green-500/5 border-b border-border">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-foreground">{accordion.includedTitle}</h3>
            </div>
            {accordion.includedNote && (
              <p className="text-xs text-muted-foreground mt-1">
                {accordion.includedNote}
              </p>
            )}
          </div>
          
          <div className="px-4">
            {accordion.categories.map((category) => (
              <InclusionCategorySection key={category.key} category={category} />
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
                    <h3 className="text-sm font-semibold text-foreground">{accordion.notIncludedTitle}</h3>
                    {accordion.notIncludedNote && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {accordion.notIncludedNote}
                      </p>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <div className="px-4 py-4">
                <ExclusionsList items={accordion.notIncludedItems} />
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
  const { accordion } = INCLUSIONS_COPY;
  
  return (
    <div className={cn('border-t border-border', className)}>
      <Accordion type="multiple" className="w-full">
        {/* What's Included - Collapsible */}
        <AccordionItem value="whats-included" className="border-b border-border">
          <AccordionTrigger className="px-5 py-4 hover:no-underline text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="font-medium">{accordion.includedTitle}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-5 pb-4">
              {accordion.includedNote && (
                <p className="text-xs text-muted-foreground mb-4 italic">
                  {accordion.includedNote}
                </p>
              )}
              <Accordion type="multiple" className="w-full">
                {accordion.categories.map((category) => (
                  <InclusionCategorySection key={category.key} category={category} />
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
              <span className="font-medium">{accordion.notIncludedTitle}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-5 pb-4">
              {accordion.notIncludedNote && (
                <p className="text-xs text-muted-foreground mb-4 italic">
                  {accordion.notIncludedNote}
                </p>
              )}
              <ExclusionsList items={accordion.notIncludedItems} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
