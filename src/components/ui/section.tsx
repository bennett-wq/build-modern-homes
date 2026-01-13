import { forwardRef, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  id?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, className, dark = false, id, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          "py-16 lg:py-24",
          dark ? "bg-primary text-primary-foreground" : "bg-background",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 lg:px-8">
          {children}
        </div>
      </section>
    );
  }
);
Section.displayName = "Section";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
}

export function SectionHeader({ title, subtitle, align = "center", dark = false }: SectionHeaderProps) {
  return (
    <div className={cn("mb-12 lg:mb-16", align === "center" && "text-center")}>
      <h2 className={cn(
        "text-3xl lg:text-4xl font-semibold tracking-tight mb-4",
        dark ? "text-primary-foreground" : "text-foreground"
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          "text-lg max-w-2xl",
          align === "center" && "mx-auto",
          dark ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
