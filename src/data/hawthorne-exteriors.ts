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

// 5 exterior packages for Hawthorne (matching provided images)
export const hawthornePackages: HawthornePackage[] = [
  {
    id: 'modern-charcoal',
    name: 'Modern Charcoal',
    description: 'Bold dark siding with natural wood accents and stone',
    primaryColor: 'hsl(220, 10%, 18%)', // Deep charcoal siding
    secondaryColor: 'hsl(30, 40%, 45%)', // Cedar wood accents
    accentColor: 'hsl(220, 8%, 35%)', // Stone/slate
  },
  {
    id: 'rustic-brown',
    name: 'Rustic Brown',
    description: 'Warm olive-brown siding with rich wood tones',
    primaryColor: 'hsl(75, 15%, 32%)', // Olive brown siding
    secondaryColor: 'hsl(30, 50%, 40%)', // Natural wood trim
    accentColor: 'hsl(200, 5%, 45%)', // Gray stone
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Deep navy blue with crisp black trim',
    primaryColor: 'hsl(220, 35%, 28%)', // Navy siding
    secondaryColor: 'hsl(80, 15%, 55%)', // Sage green gable
    accentColor: 'hsl(200, 5%, 50%)', // Gray stone
  },
  {
    id: 'warm-gray',
    name: 'Warm Gray',
    description: 'Light gray board & batten with dark trim',
    primaryColor: 'hsl(0, 0%, 92%)', // Light gray/white siding
    secondaryColor: 'hsl(35, 25%, 65%)', // Warm tan gable
    accentColor: 'hsl(220, 10%, 25%)', // Dark trim
  },
  {
    id: 'coastal-white',
    name: 'Coastal White',
    description: 'Soft blue-gray with natural stone accents',
    primaryColor: 'hsl(180, 8%, 70%)', // Light seafoam gray siding
    secondaryColor: 'hsl(45, 30%, 70%)', // Warm tan shingle gable
    accentColor: 'hsl(200, 5%, 55%)', // Gray stone
  },
];

// 4 garage door styles for Hawthorne
export const hawthorneGarages: HawthorneGarage[] = [
  {
    id: 'modern-black',
    name: 'Modern Black',
    description: 'Contemporary full-view aluminum with frosted glass panels',
    isUpgrade: true,
    color: 'hsl(0, 0%, 12%)',
  },
  {
    id: 'carriage-black',
    name: 'Carriage Black',
    description: 'Classic raised panel garage door in matte black',
    isUpgrade: false,
    color: 'hsl(0, 0%, 15%)',
  },
  {
    id: 'traditional-gray',
    name: 'Traditional Gray',
    description: 'Classic raised panel garage door in charcoal gray',
    isUpgrade: false,
    color: 'hsl(0, 0%, 40%)',
  },
  {
    id: 'black-industrial',
    name: 'Black Industrial',
    description: 'Bold industrial style with horizontal ribbing',
    isUpgrade: true,
    color: 'hsl(0, 0%, 10%)',
  },
];

// Exterior variant images: maps (packageId + garageId) → image path
// Key format: "{packageId}__{garageId}"
export const hawthorneExteriorVariantImages: Record<string, string> = {
  // Classic Navy variants
  'classic-navy__carriage-black': '/images/models/hawthorne/packages/hawthorne-classic-navy-carriage-black.webp',
  'classic-navy__modern-black': '/images/models/hawthorne/packages/hawthorne-classic-navy-modern-black.webp',
  
  // Coastal White variants
  'coastal-white__modern-black': '/images/models/hawthorne/packages/hawthorne-coastal-white-modern-black.webp',
  
  // Modern Charcoal variants
  'modern-charcoal__carriage-black': '/images/models/hawthorne/packages/hawthorne-modern-charcoal-carriage-black.webp',
  'modern-charcoal__modern-black': '/images/models/hawthorne/packages/hawthorne-modern-charcoal-modern-black.webp',
  'modern-charcoal__black-industrial': '/images/models/hawthorne/packages/hawthorne-modern-charcoal-black-industrial.webp',
  
  // Rustic Brown variants
  'rustic-brown__modern-black': '/images/models/hawthorne/packages/hawthorne-rustic-brown-modern-black.webp',
  'rustic-brown__traditional-gray': '/images/models/hawthorne/packages/hawthorne-rustic-brown-traditional-gray.webp',
  
  // Warm Gray variants
  'warm-gray__carriage-black': '/images/models/hawthorne/packages/hawthorne-warm-gray-carriage-black.jpg',
};

// Defaults for Hawthorne
export const hawthorneDefaultPackageId = 'modern-charcoal';
export const hawthorneDefaultGarageId = 'modern-black';

// Get all available garage IDs for a given package
export function getAvailableGaragesForPackage(packageId: string): string[] {
  const available: string[] = [];
  for (const key of Object.keys(hawthorneExteriorVariantImages)) {
    const [pkgId, garageId] = key.split('__');
    if (pkgId === packageId) {
      available.push(garageId);
    }
  }
  return available;
}

// Check if a specific package+garage combo has an image
export function hasVariantImage(packageId: string, garageId: string): boolean {
  const key = `${packageId}__${garageId}`;
  return key in hawthorneExteriorVariantImages;
}

// Image path resolver with fallback logic
export function getHawthorneExteriorImage(
  packageId: string,
  garageId: string
): string {
  const key = `${packageId}__${garageId}`;
  
  // Check if exact combo exists
  if (hawthorneExteriorVariantImages[key]) {
    return hawthorneExteriorVariantImages[key];
  }
  
  // Fallback: first available variant for this package
  const availableGarages = getAvailableGaragesForPackage(packageId);
  if (availableGarages.length > 0) {
    const fallbackKey = `${packageId}__${availableGarages[0]}`;
    return hawthorneExteriorVariantImages[fallbackKey];
  }
  
  // Ultimate fallback
  return getHawthorneHeroImage();
}

// Get fallback image path for package (without garage variant)
export function getHawthorneFallbackImage(packageId: string): string {
  // Return first available variant for this package
  const availableGarages = getAvailableGaragesForPackage(packageId);
  if (availableGarages.length > 0) {
    const key = `${packageId}__${availableGarages[0]}`;
    return hawthorneExteriorVariantImages[key];
  }
  return getHawthorneHeroImage();
}

// Get hero image with specific garage variant
export function getHawthorneHeroWithGarage(garageId: string): string {
  // Use modern-charcoal (default) with the specified garage
  const key = `modern-charcoal__${garageId}`;
  if (hawthorneExteriorVariantImages[key]) {
    return hawthorneExteriorVariantImages[key];
  }
  return getHawthorneHeroImage();
}

// Ultimate fallback - use hawthorne-hero.jpg (canonical filename)
export function getHawthorneHeroImage(): string {
  return '/images/models/hawthorne/hawthorne-hero.jpg';
}

// Helper to get package by ID
export function getHawthornePackageById(id: string): HawthornePackage | undefined {
  return hawthornePackages.find(p => p.id === id);
}

// Helper to get garage by ID
export function getHawthorneGarageById(id: string): HawthorneGarage | undefined {
  return hawthorneGarages.find(g => g.id === id);
}

// Get all variant image paths for preloading
export function getAllHawthorneVariantImages(): string[] {
  return Object.values(hawthorneExteriorVariantImages);
}

// Check if a model should use photo-based preview
export function isPhotoBasedModel(modelSlug: string | null | undefined): boolean {
  // Normalize "hawthorn" to "hawthorne" for backward compatibility
  const normalized = normalizeModelSlug(modelSlug);
  return normalized === 'hawthorne' || normalized === 'aspen' || normalized === 'belmont';
}

// Normalize model slug (handle "hawthorn" vs "hawthorne")
export function normalizeModelSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  // Support backward compatibility: "hawthorn" → "hawthorne"
  if (slug === 'hawthorn') return 'hawthorne';
  return slug;
}
