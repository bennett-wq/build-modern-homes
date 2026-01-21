// Aspen model exterior configuration
// Photo-based exterior renders with curated package options

export interface AspenPackage {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  // For color swatches in selector UI
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// 6 exterior packages for Aspen (curated color schemes)
export const aspenPackages: AspenPackage[] = [
  {
    id: 'rustic-brown',
    name: 'Rustic Brown',
    description: 'Warm brown tones with natural wood accents',
    previewImage: '/images/models/aspen/packages/rustic-brown.png',
    primaryColor: 'hsl(25, 35%, 35%)',
    secondaryColor: 'hsl(30, 20%, 85%)',
    accentColor: 'hsl(25, 45%, 50%)',
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Timeless navy blue with crisp white trim',
    previewImage: '/images/models/aspen/packages/classic-navy.png',
    primaryColor: 'hsl(220, 50%, 25%)',
    secondaryColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
  {
    id: 'warm-gray',
    name: 'Warm Gray',
    description: 'Sophisticated gray with clean modern lines',
    previewImage: '/images/models/aspen/packages/warm-gray.png',
    primaryColor: 'hsl(210, 8%, 50%)',
    secondaryColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
  {
    id: 'craftsman-sage',
    name: 'Craftsman Sage',
    description: 'Earthy sage green with craftsman-style details',
    previewImage: '/images/models/aspen/packages/craftsman-sage.png',
    primaryColor: 'hsl(140, 20%, 45%)',
    secondaryColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
  {
    id: 'coastal-white',
    name: 'Coastal White',
    description: 'Bright coastal white with dark roof contrast',
    previewImage: '/images/models/aspen/packages/coastal-white.png',
    primaryColor: 'hsl(0, 0%, 98%)',
    secondaryColor: 'hsl(0, 0%, 95%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
  {
    id: 'modern-charcoal',
    name: 'Modern Charcoal',
    description: 'Bold charcoal with sleek contemporary styling',
    previewImage: '/images/models/aspen/packages/modern-charcoal.png',
    primaryColor: 'hsl(210, 10%, 30%)',
    secondaryColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(30, 50%, 50%)',
  },
];

// Get Aspen package by ID
export function getAspenPackageById(id: string): AspenPackage | undefined {
  return aspenPackages.find(p => p.id === id);
}

// Get preview image for a package (with fallback)
export function getAspenPackageImage(packageId: string | null): string {
  if (!packageId) {
    return '/images/models/aspen/packages/classic-navy.png'; // Default package
  }
  const pkg = getAspenPackageById(packageId);
  return pkg?.previewImage || '/images/models/aspen/packages/classic-navy.png';
}

// Get Aspen hero/default image
export function getAspenHeroImage(): string {
  return '/images/models/aspen/packages/classic-navy.png';
}
