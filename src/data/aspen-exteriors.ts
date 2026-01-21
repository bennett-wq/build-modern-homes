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
    primaryColor: 'hsl(25, 40%, 35%)',      // Warm brown siding
    secondaryColor: 'hsl(35, 25%, 75%)',    // Tan/beige trim
    accentColor: 'hsl(20, 50%, 45%)',       // Wood/rust accent
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Timeless navy blue with crisp white trim',
    previewImage: '/images/models/aspen/packages/classic-navy.png',
    primaryColor: 'hsl(215, 45%, 28%)',     // Deep navy siding
    secondaryColor: 'hsl(40, 10%, 95%)',    // White/cream trim
    accentColor: 'hsl(25, 65%, 45%)',       // Copper/wood accent
  },
  {
    id: 'warm-gray',
    name: 'Warm Gray',
    description: 'Sophisticated gray with clean modern lines',
    previewImage: '/images/models/aspen/packages/warm-gray.png',
    primaryColor: 'hsl(210, 10%, 55%)',     // Medium warm gray siding
    secondaryColor: 'hsl(210, 8%, 75%)',    // Light gray trim
    accentColor: 'hsl(25, 55%, 42%)',       // Brown wood accent
  },
  {
    id: 'craftsman-sage',
    name: 'Craftsman Sage',
    description: 'Earthy sage green with craftsman-style details',
    previewImage: '/images/models/aspen/packages/craftsman-sage.png',
    primaryColor: 'hsl(125, 25%, 38%)',     // Sage green siding
    secondaryColor: 'hsl(35, 40%, 35%)',    // Brown trim/stone
    accentColor: 'hsl(30, 55%, 48%)',       // Warm wood accent
  },
  {
    id: 'coastal-white',
    name: 'Coastal White',
    description: 'Bright coastal white with dark roof contrast',
    previewImage: '/images/models/aspen/packages/coastal-white.png',
    primaryColor: 'hsl(40, 15%, 92%)',      // Cream/white siding
    secondaryColor: 'hsl(200, 8%, 45%)',    // Gray stone
    accentColor: 'hsl(25, 60%, 40%)',       // Brown/wood accent
  },
  {
    id: 'modern-charcoal',
    name: 'Modern Charcoal',
    description: 'Bold charcoal with sleek contemporary styling',
    previewImage: '/images/models/aspen/packages/modern-charcoal.png',
    primaryColor: 'hsl(200, 8%, 20%)',      // Dark charcoal siding
    secondaryColor: 'hsl(200, 5%, 35%)',    // Charcoal stone
    accentColor: 'hsl(25, 70%, 45%)',       // Cedar/wood accent
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
