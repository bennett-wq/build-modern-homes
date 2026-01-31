import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * BaseMod Button System
 * 
 * Hierarchy:
 * - default (primary): Solid accent fill, main CTAs
 * - secondary: Solid muted fill, supportive actions
 * - outline: Border with transparent background, secondary actions
 * - ghost: Minimal, text-only appearance, tertiary actions
 * - link: Text with underline, inline links
 * - destructive: Error/danger actions
 * 
 * All buttons:
 * - Text always visible (no hover-reveal)
 * - Consistent 150ms ease-out transitions
 * - Same border radius, font weight, icon spacing
 * - Accessible focus states
 */
const buttonVariants = cva(
  // Base styles - consistent across all variants
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg text-sm font-medium",
    // Consistent transition for all states - premium 200ms
    "transition-all duration-200 ease-out",
    // Focus ring - high contrast, accessible
    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Disabled state
    "disabled:pointer-events-none disabled:opacity-50",
    // Icon sizing
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // Active/pressed state - slight scale for tactile feel
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary - Main CTAs (Get Started, Build on This Lot, Schedule Call)
        default: [
          "bg-accent text-accent-foreground",
          "hover:bg-accent/90 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01]",
        ].join(" "),
        
        // Secondary - Supportive actions (View Models, Browse)  
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5",
        ].join(" "),
        
        // Outline - Secondary actions with border
        outline: [
          "border border-input bg-background text-foreground",
          "hover:bg-muted hover:border-muted-foreground/30 hover:-translate-y-0.5 hover:shadow-sm",
        ].join(" "),
        
        // Ghost - Tertiary/minimal actions (Learn More, Back)
        ghost: [
          "text-foreground",
          "hover:bg-muted hover:text-foreground",
        ].join(" "),
        
        // Link - Inline text links
        link: [
          "text-accent underline-offset-4",
          "hover:underline",
        ].join(" "),
        
        // Destructive - Error/danger actions
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
