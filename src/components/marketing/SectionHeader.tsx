import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({ 
  badge,
  title, 
  subtitle,
  align = "center",
  className 
}: SectionHeaderProps) {
  return (
    <div 
      className={cn(
        "mb-12 lg:mb-16",
        align === "center" && "text-center max-w-3xl mx-auto",
        align === "left" && "max-w-2xl",
        className
      )}
    >
      {badge && (
        <Badge 
          variant="secondary" 
          className="mb-4 text-xs font-medium tracking-wider uppercase px-3 py-1"
        >
          {badge}
        </Badge>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
