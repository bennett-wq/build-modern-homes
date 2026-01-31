import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  containerSize?: "default" | "narrow" | "wide";
  background?: "default" | "muted" | "primary" | "accent";
  spacing?: "default" | "hero" | "compact";
  id?: string;
}

export function Section({ 
  children, 
  className,
  containerClassName,
  containerSize = "default",
  background = "default",
  spacing = "default",
  id,
}: SectionProps) {
  return (
    <section 
      id={id}
      className={cn(
        // Spacing
        spacing === "compact" && "py-12 sm:py-16",
        spacing === "default" && "py-16 sm:py-20 lg:py-24",
        spacing === "hero" && "py-20 sm:py-24 lg:py-32",
        // Background
        background === "default" && "bg-background",
        background === "muted" && "bg-secondary/40",
        background === "primary" && "bg-primary text-primary-foreground",
        background === "accent" && "bg-accent/5",
        className
      )}
    >
      <Container size={containerSize} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
