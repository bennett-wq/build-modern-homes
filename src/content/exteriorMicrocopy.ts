// src/content/exteriorMicrocopy.ts
// Centralized microcopy for the "Design Exterior" step (packages + garage tab)

export type ExteriorCopy = {
  step: { title: string; subtitle: string; arbSubtitle: string; helper?: string };
  preview: { label: string; loading: string; unavailable: string };
  tabs: { package: { label: string; helper: string }; garage: { label: string; helper: string } };
  swatches: { legend: string; tooltipTitle: string; tooltipBody: string };
  packageDescriptions: Record<string, string>;
  garage: {
    title: string;
    subtitle: string;
    helper: string;
    optionDescriptions: Record<string, string>;
  };
  chips: { lookTemplate: string; garageTemplate: string; empty: string };
  footer: { incomplete: { package: string; garage: string; connector: string }; cta: string };
};

export const EXTERIOR_COPY: ExteriorCopy = {
  step: {
    title: "Exterior",
    subtitle: "Choose a package and garage style. Your preview updates instantly.",
    arbSubtitle: "ARB-ready packages curated for community standards.",
    helper: "You can change this later.",
  },
  preview: {
    label: "Live preview",
    loading: "Updating preview…",
    unavailable: "Preview unavailable for this combination.",
  },
  tabs: {
    package: { label: "Package", helper: "Color theme + material vibe." },
    garage: { label: "Garage", helper: "Door style and finish." },
  },
  swatches: {
    legend: "Siding · Trim · Accent",
    tooltipTitle: "What these colors represent",
    tooltipBody:
      "Swatches show the package palette (siding, trim, and accent tones). Final materials are confirmed during design.",
  },
  packageDescriptions: {
    "rustic-brown": "Warm wood tones with grounded, natural contrast.",
    "classic-navy": "Deep navy with crisp trim and timeless curb appeal.",
    "warm-gray": "Soft modern gray that feels clean, calm, and versatile.",
    "craftsman-sage": "Earthy sage with craft detailing and warm texture.",
    "coastal-white": "Bright, fresh white with clean contrast and lift.",
    "modern-charcoal": "Bold charcoal with sharp, contemporary edge.",
  },
  garage: {
    title: "Garage style",
    subtitle: "Choose the door look that matches your exterior.",
    helper: "Options shown are curated per model.",
    optionDescriptions: {
      "modern-black": "Full-view modern door in a clean black finish.",
      "modern-aluminum": "Full-view modern door with a bright aluminum frame.",
      "standard-white": "Classic panel door in a crisp white finish.",
      "traditional-gray": "Subtle gray panel door for a softer, traditional look.",
      "carriage-black": "Carriage style with bold black contrast and character.",
      "black-industrial": "Industrial-style door with bold black metal framing.",
    },
  },
  chips: {
    lookTemplate: "Look: {packageName}",
    garageTemplate: "Garage: {garageName}",
    empty: "Choose a look to continue.",
  },
  footer: {
    incomplete: {
      package: "an exterior package",
      garage: "a garage door",
      connector: " and ",
    },
    cta: "Review Plan",
  },
};

// Helper to get package description with fallback
export function getPackageDescription(packageId: string, fallback?: string): string {
  return EXTERIOR_COPY.packageDescriptions[packageId] || fallback || "";
}

// Helper to get garage description with fallback
export function getGarageDescription(garageId: string, fallback?: string): string {
  return EXTERIOR_COPY.garage.optionDescriptions[garageId] || fallback || "";
}

// Helper to format chip text
export function formatChipText(template: string, replacements: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}
