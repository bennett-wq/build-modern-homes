import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface CalloutCardProps {
  children: React.ReactNode;
  variant?: "quote" | "highlight" | "bordered";
  className?: string;
}

export function CalloutCard({ 
  children, 
  variant = "bordered",
  className 
}: CalloutCardProps) {
  if (variant === "quote") {
    return (
      <div 
        className={cn(
          "relative pl-6 border-l-4 border-accent",
          className
        )}
      >
        <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-foreground leading-relaxed">
          {children}
        </blockquote>
      </div>
    );
  }

  if (variant === "highlight") {
    return (
      <Card 
        className={cn(
          "bg-accent/5 border-accent/20",
          className
        )}
      >
        <CardContent className="p-6 lg:p-8">
          <p className="text-lg sm:text-xl font-medium text-foreground leading-relaxed text-center">
            {children}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "border-border bg-secondary/30",
        className
      )}
    >
      <CardContent className="p-6 lg:p-8">
        {children}
      </CardContent>
    </Card>
  );
}
