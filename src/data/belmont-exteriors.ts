// Belmont model exterior configuration
// Photo-based exterior renders with curated package options

export interface BelmontPackage {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  // For color swatches in selector UI
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// 6 exterior packages for Belmont (curated color schemes)
export const belmontPackages: BelmontPackage[] = [
  {
    id: 'modern-charcoal',
    name: 'Modern Charcoal',
    description: 'Bold charcoal with sleek contemporary styling',
    previewImage: '/images/models/belmont/packages/modern-charcoal.jpg',
    primaryColor: 'hsl(210, 10%, 25%)',
    secondaryColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
  {
    id: 'coastal-white',
    name: 'Coastal White',
    description: 'Bright coastal white with dark roof contrast',
    previewImage: '/images/models/belmont/packages/coastal-white.jpg',
    primaryColor: 'hsl(0, 0%, 98%)',
    secondaryColor: 'hsl(210, 10%, 40%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Timeless navy blue with crisp white trim',
    previewImage: '/images/models/belmont/packages/classic-navy.jpg',
    primaryColor: 'hsl(220, 50%, 25%)',
    secondaryColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
  {
    id: 'warm-gray',
    name: 'Warm Gray',
    description: 'Sophisticated gray with clean modern lines',
    previewImage: '/images/models/belmont/packages/warm-gray.jpg',
    primaryColor: 'hsl(210, 8%, 55%)',
    secondaryColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
  {
    id: 'craftsman-sage',
    name: 'Craftsman Sage',
    description: 'Earthy sage green with craftsman-style details',
    previewImage: '/images/models/belmont/packages/craftsman-sage.jpg',
    primaryColor: 'hsl(140, 20%, 45%)',
    secondaryColor: 'hsl(30, 30%, 40%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
  {
    id: 'rustic-brown',
    name: 'Rustic Brown',
    description: 'Warm brown tones with natural wood accents',
    previewImage: '/images/models/belmont/packages/rustic-brown.jpg',
    primaryColor: 'hsl(25, 35%, 40%)',
    secondaryColor: 'hsl(30, 20%, 85%)',
    accentColor: 'hsl(25, 45%, 50%)',
  },
];

// Get Belmont package by ID
export function getBelmontPackageById(id: string): BelmontPackage | undefined {
  return belmontPackages.find(p => p.id === id);
}

// Get preview image for a package (with fallback)
export function getBelmontPackageImage(packageId: string | null): string {
  if (!packageId) {
    return '/images/models/belmont/packages/modern-charcoal.jpg'; // Default package
  }
  const pkg = getBelmontPackageById(packageId);
  return pkg?.previewImage || '/images/models/belmont/packages/modern-charcoal.jpg';
}

// Get Belmont hero/default image
export function getBelmontHeroImage(): string {
  return '/images/models/belmont/packages/modern-charcoal.jpg';
}
