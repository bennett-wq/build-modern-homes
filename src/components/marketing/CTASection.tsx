import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Container } from "./Container";

interface CTASectionProps {
  headline: string;
  body?: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  variant?: "light" | "dark";
  className?: string;
}

export function CTASection({ 
  headline, 
  body,
  primaryCta,
  secondaryCta,
  variant = "dark",
  className 
}: CTASectionProps) {
  return (
    <section 
      className={cn(
        "py-16 sm:py-20 lg:py-24 border-t",
        variant === "dark" && "bg-primary border-primary",
        variant === "light" && "bg-secondary/50 border-border",
        className
      )}
    >
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <h2 
            className={cn(
              "text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-4",
              variant === "dark" && "text-primary-foreground",
              variant === "light" && "text-foreground"
            )}
          >
            {headline}
          </h2>
          {body && (
            <p 
              className={cn(
                "text-base sm:text-lg leading-relaxed mb-8",
                variant === "dark" && "text-primary-foreground/70",
                variant === "light" && "text-muted-foreground"
              )}
            >
              {body}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button 
              asChild 
              size="lg" 
              className={cn(
                "h-12 px-8 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all",
                variant === "dark" && "bg-primary-foreground text-primary hover:bg-primary-foreground/90",
                variant === "light" && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Link to={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {secondaryCta && (
              <Link 
                to={secondaryCta.href} 
                className={cn(
                  "text-base font-medium transition-colors",
                  variant === "dark" && "text-primary-foreground/80 hover:text-primary-foreground",
                  variant === "light" && "text-muted-foreground hover:text-foreground"
                )}
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
