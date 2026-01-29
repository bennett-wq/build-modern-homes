import { CheckCircle2, Star, Award, Home, Building2, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProgramEligibilityCardProps {
  programs: string[];
  bestMatch?: string;
}

const PROGRAM_CONFIG: Record<string, {
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  color: string;
  features: string[];
}> = {
  "MH Advantage": {
    label: "MH Advantage",
    description: "Fannie Mae program for manufactured housing",
    icon: Home,
    color: "bg-emerald-500",
    features: ["3% down payment", "Competitive rates", "No land required"],
  },
  "CHOICEHome": {
    label: "CHOICEHome",
    description: "Freddie Mac program for factory-built homes",
    icon: Building2,
    color: "bg-blue-500",
    features: ["Conventional financing", "Flexible terms", "Primary residence"],
  },
  "Construction-to-Perm": {
    label: "Construction-to-Perm",
    description: "Single-close loan for land + home",
    icon: Landmark,
    color: "bg-purple-500",
    features: ["One closing", "Lock rate early", "Land + home bundle"],
  },
  "FHA Title I": {
    label: "FHA Title I",
    description: "Government-backed manufactured home loans",
    icon: Award,
    color: "bg-amber-500",
    features: ["Lower credit OK", "Government backed", "Fixed rates"],
  },
  "Conventional": {
    label: "Conventional",
    description: "Standard mortgage financing",
    icon: CheckCircle2,
    color: "bg-slate-500",
    features: ["Flexible terms", "No PMI at 20%", "Multiple options"],
  },
};

export function ProgramEligibilityCard({ programs, bestMatch }: ProgramEligibilityCardProps) {
  if (!programs || programs.length === 0) {
    return (
      <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground">
        <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No programs matched yet</p>
        <p className="text-xs mt-1">Complete verification to see eligible programs</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {programs.map((program) => {
        const config = PROGRAM_CONFIG[program] || {
          label: program,
          description: "Financing program",
          icon: CheckCircle2,
          color: "bg-slate-500",
          features: [],
        };
        const Icon = config.icon;
        const isBestMatch = program === bestMatch;

        return (
          <div
            key={program}
            className={cn(
              "relative p-4 rounded-lg border transition-all",
              isBestMatch
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 ring-1 ring-emerald-500"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
          >
            {isBestMatch && (
              <Badge className="absolute -top-2 right-3 bg-emerald-500 text-white">
                <Star className="h-3 w-3 mr-1" />
                Best Match
              </Badge>
            )}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg text-white",
                  config.color
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">{config.label}</h4>
                <p className="text-sm text-muted-foreground">{config.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
