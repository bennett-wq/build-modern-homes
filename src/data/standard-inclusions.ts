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
      { text: 'Cabinetry package', note: 'as specified for series' },
      { text: 'Countertops', note: 'series standard material' },
      { text: 'Stainless steel sink with faucet' },
      { text: 'Range/cooktop hookup', note: 'appliance by owner' },
      { text: 'Refrigerator space with water line rough-in' },
      { text: 'Dishwasher rough-in' },
      { text: 'Microwave/hood vent rough-in' },
      { text: 'Pantry storage', note: 'where shown on plan' },
    ],
  },
  {
    id: 'baths',
    name: 'Bathrooms',
    icon: 'Bath',
    items: [
      { text: 'Vanity cabinetry', note: 'series standard' },
      { text: 'Cultured marble or laminate countertops' },
      { text: 'Fiberglass tub/shower units', note: 'as shown on plan' },
      { text: 'Chrome fixtures package' },
      { text: 'Mirrors at all vanities' },
      { text: 'Exhaust ventilation' },
      { text: 'Water-resistant flooring' },
    ],
  },
  {
    id: 'interior',
    name: 'Interior Finishes',
    icon: 'Home',
    items: [
      { text: 'Drywall throughout', note: 'taped, textured, primed' },
      { text: 'Interior paint package', note: 'series standard colors' },
      { text: 'Flooring package', note: 'LVP/carpet as specified' },
      { text: 'Interior doors and hardware' },
      { text: 'Trim and molding package' },
      { text: 'Closet shelving', note: 'where shown' },
      { text: 'Window blinds or coverings', note: 'series standard' },
    ],
  },
  {
    id: 'mechanical',
    name: 'Mechanical & Electrical',
    icon: 'Zap',
    items: [
      { text: 'HVAC system', note: 'sized for home' },
      { text: 'Electric panel', note: '200A typical' },
      { text: 'Wiring throughout to code' },
      { text: 'Light fixtures at all locations' },
      { text: 'Outlets and switches per plan' },
      { text: 'Smoke and CO detectors' },
      { text: 'Water heater', note: 'standard capacity' },
      { text: 'Plumbing rough-in complete' },
    ],
  },
  {
    id: 'exterior',
    name: 'Windows & Exterior',
    icon: 'Sun',
    items: [
      { text: 'Vinyl windows', note: 'double-pane, Low-E' },
      { text: 'Exterior entry doors', note: 'as shown on plan' },
      { text: 'Siding package', note: 'series standard or upgrade' },
      { text: 'Roofing system', note: 'architectural shingles typical' },
      { text: 'Gutters and downspouts' },
      { text: 'Exterior trim and fascia' },
      { text: 'Garage door', note: 'where included in plan' },
    ],
  },
];

// ============================================================================
// COMMON EXCLUSIONS (Site-dependent items)
// ============================================================================

export const commonExclusions: ExclusionItem[] = [
  { text: 'Land and lot purchase', reason: 'Unless Community All-in selected' },
  { text: 'Site preparation and grading', reason: 'Varies by lot conditions' },
  { text: 'Foundation system', reason: 'Included in install package' },
  { text: 'Utility connections to property line', reason: 'Site-dependent' },
  { text: 'Well and septic systems', reason: 'If not on municipal utilities' },
  { text: 'Permits and impact fees', reason: 'Varies by jurisdiction' },
  { text: 'Landscaping and exterior improvements', reason: 'Owner responsibility' },
  { text: 'Appliances', reason: 'Unless specified as included' },
  { text: 'Furniture and window treatments', reason: 'Owner responsibility' },
  { text: 'Driveway and walkways', reason: 'Site-specific' },
  { text: 'Retaining walls or special grading', reason: 'If required by lot' },
  { text: 'HOA or ARB fees', reason: 'If applicable' },
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
