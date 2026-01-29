import { CheckCircle2, Star, Award, Home, Building2, Landmark, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProgramEligibilityCardProps {
  programs: string[];
  bestMatch?: string;
}

// Map backend keys to display config
const PROGRAM_CONFIG: Record<string, {
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  color: string;
  features: string[];
  requirements: string;
}> = {
  // Backend key format
  "mh_advantage": {
    label: "MH Advantage",
    description: "Fannie Mae program for factory-built homes meeting site-built standards",
    icon: Home,
    color: "bg-emerald-500",
    features: ["3% min down", "Up to 97% LTV", "620+ credit"],
    requirements: "Requires home to meet MH Advantage construction criteria",
  },
  "choicehome": {
    label: "CHOICEHome",
    description: "Freddie Mac program for qualifying manufactured homes",
    icon: Building2,
    color: "bg-blue-500",
    features: ["3% min down", "Up to 97% LTV", "620+ credit"],
    requirements: "Home must meet CHOICEHome eligibility requirements",
  },
  "construction_to_perm": {
    label: "Construction-to-Perm",
    description: "Single-close loan covering construction and permanent financing",
    icon: Landmark,
    color: "bg-purple-500",
    features: ["10% min down", "Up to 90% LTV", "680+ credit"],
    requirements: "Requires land ownership or purchase",
  },
  "fha_title_1": {
    label: "FHA Title I",
    description: "Government-backed manufactured home loan program",
    icon: Shield,
    color: "bg-amber-500",
    features: ["Low down payment", "580+ credit", "Primary residence only"],
    requirements: "Home must be primary residence",
  },
  "conventional": {
    label: "Conventional",
    description: "Standard mortgage with competitive terms",
    icon: CheckCircle2,
    color: "bg-slate-600",
    features: ["20% down (no PMI)", "Up to 80% LTV", "620+ credit"],
    requirements: "Best rates with 20% down payment",
  },
  // Legacy display name format (for backward compatibility)
  "MH Advantage": {
    label: "MH Advantage",
    description: "Fannie Mae program for factory-built homes meeting site-built standards",
    icon: Home,
    color: "bg-emerald-500",
    features: ["3% min down", "Up to 97% LTV", "620+ credit"],
    requirements: "Requires home to meet MH Advantage construction criteria",
  },
  "CHOICEHome": {
    label: "CHOICEHome",
    description: "Freddie Mac program for qualifying manufactured homes",
    icon: Building2,
    color: "bg-blue-500",
    features: ["3% min down", "Up to 97% LTV", "620+ credit"],
    requirements: "Home must meet CHOICEHome eligibility requirements",
  },
  "Construction-to-Perm": {
    label: "Construction-to-Perm",
    description: "Single-close loan covering construction and permanent financing",
    icon: Landmark,
    color: "bg-purple-500",
    features: ["10% min down", "Up to 90% LTV", "680+ credit"],
    requirements: "Requires land ownership or purchase",
  },
  "FHA Title I": {
    label: "FHA Title I",
    description: "Government-backed manufactured home loan program",
    icon: Shield,
    color: "bg-amber-500",
    features: ["Low down payment", "580+ credit", "Primary residence only"],
    requirements: "Home must be primary residence",
  },
  "Conventional": {
    label: "Conventional",
    description: "Standard mortgage with competitive terms",
    icon: CheckCircle2,
    color: "bg-slate-600",
    features: ["20% down (no PMI)", "Up to 80% LTV", "620+ credit"],
    requirements: "Best rates with 20% down payment",
  },
};

export function ProgramEligibilityCard({ programs, bestMatch }: ProgramEligibilityCardProps) {
  if (!programs || programs.length === 0) {
    return (
      <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground">
        <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="font-medium">No programs matched</p>
        <p className="text-xs mt-1">Based on current DTI ratios, credit score, and down payment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {programs.map((program, index) => {
        const config = PROGRAM_CONFIG[program] || {
          label: program.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: "Financing program",
          icon: CheckCircle2,
          color: "bg-slate-500",
          features: [],
          requirements: "",
        };
        const Icon = config.icon;
        const isBestMatch = index === 0; // First program is best match

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
                  "p-2 rounded-lg text-white shrink-0",
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
                {config.requirements && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{config.requirements}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
