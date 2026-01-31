import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon?: LucideIcon;
  title: string;
  body: string;
  className?: string;
  variant?: "default" | "numbered";
  number?: number;
}

export function FeatureCard({ 
  icon: Icon,
  title, 
  body,
  className,
  variant = "default",
  number,
}: FeatureCardProps) {
  return (
    <Card 
      className={cn(
        "h-full border-border bg-card transition-all duration-300",
        "hover:shadow-lg hover:border-accent/30 hover:-translate-y-1",
        className
      )}
    >
      <CardContent className="p-6 lg:p-8">
        {variant === "numbered" && number !== undefined && (
          <div className="mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent font-semibold text-sm">
              {String(number).padStart(2, '0')}
            </span>
          </div>
        )}
        {variant === "default" && Icon && (
          <div className="mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-accent" />
            </div>
          </div>
        )}
        <h3 className="text-lg lg:text-xl font-semibold text-card-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
          {body}
        </p>
      </CardContent>
    </Card>
  );
}
