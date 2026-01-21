// Belmont model exterior configuration
// Photo-based exterior renders with curated package options

export interface BelmontPackage {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  // Hex color swatches for selector UI (exactly 3: primary, secondary, accent)
  swatches: [string, string, string];
  // Legacy HSL color fields for type compatibility with other package types
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// Fallback swatches if a package has none defined
export const FALLBACK_SWATCHES: [string, string, string] = ['#111827', '#E5E7EB', '#A8A29E'];

// 6 exterior packages for Belmont (curated color schemes matching renders)
export const belmontPackages: BelmontPackage[] = [
  {
    id: 'modern-charcoal',
    name: 'Modern Charcoal',
    description: 'Bold charcoal with sleek contemporary styling',
    previewImage: '/images/models/belmont/packages/modern-charcoal.jpg',
    swatches: ['#313437', '#272828', '#404241'],
    primaryColor: '#313437',
    secondaryColor: '#272828',
    accentColor: '#404241',
  },
  {
    id: 'coastal-white',
    name: 'Coastal White',
    description: 'Bright coastal white with dark roof contrast',
    previewImage: '/images/models/belmont/packages/coastal-white.jpg',
    swatches: ['#DEE3E8', '#464E4C', '#0E1415'],
    primaryColor: '#DEE3E8',
    secondaryColor: '#464E4C',
    accentColor: '#0E1415',
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Timeless navy blue with crisp white trim',
    previewImage: '/images/models/belmont/packages/classic-navy.jpg',
    swatches: ['#3A4132', '#DBE0E2', '#B1A89A'],
    primaryColor: '#3A4132',
    secondaryColor: '#DBE0E2',
    accentColor: '#B1A89A',
  },
  {
    id: 'warm-gray',
    name: 'Warm Gray',
    description: 'Sophisticated gray with clean modern lines',
    previewImage: '/images/models/belmont/packages/warm-gray.jpg',
    swatches: ['#919492', '#DBDFE2', '#3D4240'],
    primaryColor: '#919492',
    secondaryColor: '#DBDFE2',
    accentColor: '#3D4240',
  },
  {
    id: 'craftsman-sage',
    name: 'Craftsman Sage',
    description: 'Earthy sage green with craftsman-style details',
    previewImage: '/images/models/belmont/packages/craftsman-sage.jpg',
    swatches: ['#687264', '#D2D0C4', '#535247'],
    primaryColor: '#687264',
    secondaryColor: '#D2D0C4',
    accentColor: '#535247',
  },
  {
    id: 'rustic-brown',
    name: 'Rustic Brown',
    description: 'Warm brown tones with natural wood accents',
    previewImage: '/images/models/belmont/packages/rustic-brown.jpg',
    swatches: ['#6B4A3A', '#E6DFD6', '#1F2326'],
    primaryColor: '#6B4A3A',
    secondaryColor: '#E6DFD6',
    accentColor: '#1F2326',
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

// Get swatches for a package (with fallback)
export function getBelmontSwatches(packageId: string | null): [string, string, string] {
  if (!packageId) return FALLBACK_SWATCHES;
  const pkg = getBelmontPackageById(packageId);
  return pkg?.swatches || FALLBACK_SWATCHES;
}
