// ============================================================================
// Standard Inclusions & Exclusions Configuration
// Defines what's included in BaseMod homes by category
// Uses safe, non-overpromising language
// ============================================================================

export interface InclusionItem {
  text: string;
  note?: string; // Optional qualifier like "as specified" or "where shown"
}

export interface InclusionCategory {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  items: InclusionItem[];
}

export interface ExclusionItem {
  text: string;
  reason?: string;
}

// ============================================================================
// STANDARD INCLUSIONS BY CATEGORY
// ============================================================================

export const standardInclusions: InclusionCategory[] = [
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: 'ChefHat',
    items: [
      { text: 'Cabinetry package', note: 'as specified for the series' },
      { text: 'Countertops', note: 'series standard material' },
      { text: 'Tile backsplash', note: 'as specified' },
      { text: 'Stainless steel sink with faucet' },
      { text: 'Standard appliance package: range, refrigerator, dishwasher, built-in microwave, and vent hood', note: 'upgrade options available' },
    ],
  },
  {
    id: 'baths',
    name: 'Bathrooms',
    icon: 'Bath',
    items: [
      { text: 'Vanity cabinetry', note: 'series standard' },
      { text: 'Countertops and backsplash', note: 'as specified' },
      { text: 'Fiberglass tub/shower units', note: 'as shown on plan' },
      { text: 'Faucets and bath accessories', note: 'as specified' },
      { text: 'Mirrors at vanities' },
      { text: 'Bathroom ventilation', note: 'fans/vents as specified' },
    ],
  },
  {
    id: 'interior',
    name: 'Interior Finishes',
    icon: 'Home',
    items: [
      { text: 'Drywall interior finish', note: 'as specified for series/build type' },
      { text: 'Interior doors and trim', note: 'as specified' },
      { text: 'Interior paint/primer package', note: 'as specified' },
      { text: 'Lighting package', note: 'as specified' },
      { text: 'Flooring provided per plan/series', note: 'some areas may be finished on-site depending on scope' },
    ],
  },
  {
    id: 'mechanical',
    name: 'Mechanical & Electrical',
    icon: 'Zap',
    items: [
      { text: 'HVAC system and ductwork', note: 'as specified' },
      { text: 'Water heater', note: 'as specified' },
      { text: 'Electrical panel, outlets, switches, and lighting rough-in', note: 'as specified' },
      { text: 'Smoke/CO detectors', note: 'as specified' },
      { text: 'Plumbing fixtures and standard connections at the home', note: 'as specified' },
    ],
  },
  {
    id: 'windows',
    name: 'Windows',
    icon: 'Sun',
    items: [
      { text: 'Energy-efficient vinyl windows', note: 'as specified' },
      { text: 'Exterior doors', note: 'as specified' },
    ],
  },
  {
    id: 'exterior',
    name: 'Exterior Inclusions',
    icon: 'DoorOpen',
    items: [
      { text: 'Architectural shingles', note: 'as specified' },
      { text: 'Siding and exterior trim package', note: 'as specified' },
      { text: 'Exterior lighting', note: 'as specified' },
    ],
  },
];

// ============================================================================
// COMMON EXCLUSIONS (Site-dependent items)
// ============================================================================

export const commonExclusions: ExclusionItem[] = [
  { text: 'Foundation and excavation (site-built)', reason: 'not included' },
  { text: 'Utility trenching/runs and tap fees (water/sewer/septic/electric/gas)', reason: 'site dependent' },
  { text: 'Permits, impact fees, and jurisdictional requirements', reason: 'site dependent (including civil/engineering, tree tagging, etc.)' },
  { text: 'Driveways, sidewalks/flatwork, landscaping, fencing, irrigation', reason: 'not included unless quoted' },
  { text: 'Retaining walls, unusual grading/drainage, rock removal, soil remediation', reason: 'site dependent' },
  { text: 'Appliance upgrades and selection upgrades beyond the standard package', reason: 'optional' },
  { text: 'General contractor/builder overhead & profit', reason: 'varies by delivery model and is confirmed in the final written quote' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get inclusion categories for display
 */
export function getInclusionCategories(): InclusionCategory[] {
  return standardInclusions;
}

/**
 * Get exclusions list for display
 */
export function getExclusions(): ExclusionItem[] {
  return commonExclusions;
}

/**
 * Get inclusion category by ID
 */
export function getInclusionCategoryById(id: string): InclusionCategory | undefined {
  return standardInclusions.find(cat => cat.id === id);
}
