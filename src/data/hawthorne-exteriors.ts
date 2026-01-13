// Hawthorne model exterior configuration
// Photo-based exterior renders with package + garage combinations

export interface HawthornePackage {
  id: string;
  name: string;
  description: string;
  // For color swatches in selector UI
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface HawthorneGarage {
  id: string;
  name: string;
  description: string;
  isUpgrade: boolean;
  color: string;
}

// 5 exterior packages for Hawthorne
export const hawthornePackages: HawthornePackage[] = [
  {
    id: 'modern-charcoal',
    name: 'Modern Charcoal',
    description: 'Sleek dark siding with crisp white trim and black accents',
    primaryColor: 'hsl(0, 0%, 25%)',
    secondaryColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(0, 0%, 10%)',
  },
  {
    id: 'slate-sage',
    name: 'Slate + Sage',
    description: 'Sophisticated slate gray with natural sage green accents',
    primaryColor: 'hsl(210, 10%, 45%)',
    secondaryColor: 'hsl(120, 15%, 55%)',
    accentColor: 'hsl(30, 20%, 40%)',
  },
  {
    id: 'coastal-mist',
    name: 'Coastal Mist',
    description: 'Light coastal palette with soft blues and weathered tones',
    primaryColor: 'hsl(200, 20%, 75%)',
    secondaryColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(200, 30%, 50%)',
  },
  {
    id: 'evergreen-cedar',
    name: 'Evergreen Cedar',
    description: 'Rich forest green paired with warm cedar wood tones',
    primaryColor: 'hsl(140, 30%, 30%)',
    secondaryColor: 'hsl(25, 50%, 45%)',
    accentColor: 'hsl(30, 40%, 35%)',
  },
  {
    id: 'black-cedar',
    name: 'Black + Cedar',
    description: 'Bold black exterior with natural cedar accents',
    primaryColor: 'hsl(0, 0%, 12%)',
    secondaryColor: 'hsl(25, 50%, 50%)',
    accentColor: 'hsl(25, 40%, 40%)',
  },
];

// 2 garage door styles (room for third later)
export const hawthorneGarages: HawthorneGarage[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Classic raised panel garage door in coordinating color',
    isUpgrade: false,
    color: 'hsl(0, 0%, 50%)',
  },
  {
    id: 'black-industrial',
    name: 'Black Industrial',
    description: 'Modern full-view aluminum with frosted glass panels',
    isUpgrade: true,
    color: 'hsl(0, 0%, 15%)',
  },
];

// Image path resolver with fallback logic
export function getHawthorneExteriorImage(
  packageId: string,
  garageId: string
): string {
  const basePath = '/images/models/hawthorne';
  
  // Primary: exact combo
  const primaryPath = `${basePath}/${packageId}__${garageId}.webp`;
  
  // Fallback chain is handled by the component with onError
  return primaryPath;
}

// Get fallback image path
export function getHawthorneFallbackImage(packageId: string): string {
  const basePath = '/images/models/hawthorne';
  return `${basePath}/${packageId}__standard.webp`;
}

// Ultimate fallback
export function getHawthorneHeroImage(): string {
  return '/images/models/hawthorne/hawthorn-hero.webp';
}

// Helper to get package by ID
export function getHawthornePackageById(id: string): HawthornePackage | undefined {
  return hawthornePackages.find(p => p.id === id);
}

// Helper to get garage by ID
export function getHawthorneGarageById(id: string): HawthorneGarage | undefined {
  return hawthorneGarages.find(g => g.id === id);
}

// Check if a model should use photo-based preview
export function isPhotoBasedModel(modelSlug: string | null | undefined): boolean {
  // Normalize "hawthorn" to "hawthorne" for backward compatibility
  const normalized = normalizeModelSlug(modelSlug);
  return normalized === 'hawthorne';
}

// Normalize model slug (handle "hawthorn" vs "hawthorne")
export function normalizeModelSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  // Support backward compatibility: "hawthorn" → "hawthorne"
  if (slug === 'hawthorn') return 'hawthorne';
  return slug;
}
