// ============================================================================
// Centralized "What's Included" Copy Configuration
// Single source of truth for inclusions/exclusions content site-wide
// ============================================================================

export type InclusionCategory = {
  key: string;
  title: string;
  items: string[];
};

export type InclusionsCopy = {
  accordion: {
    includedTitle: string;
    includedNote?: string;
    categories: InclusionCategory[];
    notIncludedTitle: string;
    notIncludedNote?: string;
    notIncludedItems: string[];
  };
  modal: {
    title: string;
    subtitle: string;
    sections: {
      title: string;
      description: string;
    }[];
    footerNote: string;
  };
};

export const INCLUSIONS_COPY: InclusionsCopy = {
  accordion: {
    includedTitle: "What's included",
    includedNote:
      "Standard features included with the home package. Final specs confirmed in your written quote.",
    categories: [
      {
        key: "kitchen",
        title: "Kitchen",
        items: [
          "Cabinetry package (as specified for the series)",
          "Countertops (series standard material)",
          "Tile backsplash (as specified)",
          "Stainless steel sink with faucet",
          "Standard appliance package: range, refrigerator, dishwasher, built‑in microwave, and vent hood (upgrade options available)",
        ],
      },
      {
        key: "bathrooms",
        title: "Bathrooms",
        items: [
          "Vanity cabinetry (series standard)",
          "Countertops and backsplash (as specified)",
          "Fiberglass tub/shower units (as shown on plan)",
          "Faucets and bath accessories (as specified)",
          "Mirrors at vanities",
          "Bathroom ventilation (fans/vents as specified)",
        ],
      },
      {
        key: "interior",
        title: "Interior finishes",
        items: [
          "Drywall interior finish (as specified for series/build type)",
          "Interior doors and trim (as specified)",
          "Interior paint/primer package (as specified)",
          "Lighting package (as specified)",
          "Flooring provided per plan/series (some areas may be finished on‑site depending on scope)",
        ],
      },
      {
        key: "mechanical",
        title: "Mechanical & electrical",
        items: [
          "HVAC system and ductwork (as specified)",
          "Water heater (as specified)",
          "Electrical panel, outlets, switches, and lighting rough‑in (as specified)",
          "Smoke/CO detectors (as specified)",
          "Plumbing fixtures and standard connections at the home (as specified)",
        ],
      },
      {
        key: "windows",
        title: "Windows",
        items: [
          "Energy‑efficient vinyl windows (as specified)",
          "Exterior doors (as specified)",
        ],
      },
      {
        key: "exterior",
        title: "Exterior inclusions",
        items: [
          "Architectural shingles (as specified)",
          "Siding and exterior trim package (as specified)",
          "Exterior lighting (as specified)",
        ],
      },
    ],
    notIncludedTitle: "Not included / site dependent",
    notIncludedNote:
      "These items vary by site, jurisdiction, and final scope. They are confirmed after a site review and in your written quote.",
    notIncludedItems: [
      "Foundation and excavation (site‑built) — not included",
      "Utility trenching/runs and tap fees (water/sewer/septic/electric/gas) — site dependent",
      "Permits, impact fees, and jurisdictional requirements — site dependent (including civil/engineering, tree tagging, etc.)",
      "Driveways, sidewalks/flatwork, landscaping, fencing, irrigation — not included unless quoted",
      "Retaining walls, unusual grading/drainage, rock removal, soil remediation — site dependent",
      "Appliance upgrades and selection upgrades beyond the standard package — optional",
      "General contractor/builder overhead & profit — varies by delivery model and is confirmed in the final written quote",
    ],
  },

  modal: {
    title: "What's included in your price",
    subtitle: "A high‑level breakdown of what your estimate covers.",
    sections: [
      {
        title: "BaseMod Home Package",
        description:
          "Your factory‑built home with standard features and selected plan options, built to factory or modular standards (as applicable).",
      },
      {
        title: "Appliances & Standard Finishes",
        description:
          "Standard appliance package and finish specifications (cabinetry, counters, fixtures) as defined by the series/model. Upgrades are available.",
      },
      {
        title: "Professional Installation",
        description:
          "Home set and on‑site completion scope as quoted (varies by site and delivery model). Foundation/excavation are not included unless explicitly quoted.",
      },
      {
        title: "Freight & Delivery",
        description:
          "Transportation from the factory to the build site. Route and access conditions may affect final delivery cost.",
      },
    ],
    footerNote:
      "All estimates are preliminary and subject to site review. Final pricing is confirmed in a written quote.",
  },
};
