// Keeneland model exterior configuration
// Photo-based exterior renders with theme + garage variant support

export interface KeenelandPackage {
  id: string;
  name: string;
  description: string;
  // Hex color swatches for selector UI (exactly 3: siding, stone/accent, trim)
  swatches: [string, string, string];
  // Mapping of garage ID to preview image path
  previewByGarage: Record<string, string>;
}

export interface KeenelandGarage {
  id: string;
  name: string;
  description: string;
  // Optional color swatches for garage selector
  swatches?: [string, string];
}

// Garage options for Keeneland
export const keenelandGarages: KeenelandGarage[] = [
  {
    id: 'modern-black',
    name: 'Modern Black',
    description: 'Sleek black aluminum frames with tinted glass panels',
    swatches: ['#1a1a1a', '#333333'],
  },
  {
    id: 'modern-aluminum',
    name: 'Modern Aluminum',
    description: 'Contemporary aluminum frames with frosted glass panels',
    swatches: ['#6b6b6b', '#9a9a9a'],
  },
  {
    id: 'standard-white',
    name: 'Standard White',
    description: 'Classic raised-panel white door with clean lines',
    swatches: ['#f5f5f5', '#e0e0e0'],
  },
];

// 5 exterior packages for Keeneland (curated color schemes matching renders)
export const keenelandPackages: KeenelandPackage[] = [
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Deep navy siding with wood shutters and brick accents',
    swatches: ['#1e2533', '#6b4d3a', '#d4a574'], // Navy, brick, wood shutters
    previewByGarage: {
      'modern-black': '/images/models/keeneland/renders/keeneland-classic-navy-modern-black.jpeg',
    },
  },
  {
    id: 'coastal-white',
    name: 'Coastal White',
    description: 'Crisp white siding with dark shutters and brick wainscot',
    swatches: ['#f5f5f0', '#3d3d3d', '#6b4a3a'], // White, dark shutters, brick
    previewByGarage: {
      'modern-aluminum': '/images/models/keeneland/renders/keeneland-coastal-white-modern-aluminum.jpg',
    },
  },
  {
    id: 'craftsman-sage',
    name: 'Craftsman Sage',
    description: 'Earthy sage green with white trim and brick foundation',
    swatches: ['#7a9178', '#f5f5f0', '#6b4a3a'], // Sage, white trim, brick
    previewByGarage: {
      'modern-aluminum': '/images/models/keeneland/renders/keeneland-craftsman-sage-modern-aluminum.jpeg',
    },
  },
  {
    id: 'modern-charcoal',
    name: 'Modern Charcoal',
    description: 'Bold charcoal with cedar accents and dark brick',
    swatches: ['#2d2d2d', '#d4a574', '#4a3c32'], // Charcoal, cedar, dark brick
    previewByGarage: {
      'modern-black': '/images/models/keeneland/renders/keeneland-modern-charcoal-modern-black.jpeg',
    },
  },
  {
    id: 'warm-gray',
    name: 'Warm Gray',
    description: 'Sophisticated blue-gray with cedar shutters and white porch',
    swatches: ['#4a5568', '#d4a574', '#f5f5f0'], // Blue-gray, cedar, white
    previewByGarage: {
      'standard-white': '/images/models/keeneland/renders/keeneland-warm-gray-standard-white.jpeg',
    },
  },
];

// Default selections
export const keenelandDefaultPackageId = 'modern-charcoal';
export const keenelandDefaultGarageId = 'modern-black';

// Get Keeneland package by ID
export function getKeenelandPackageById(id: string): KeenelandPackage | undefined {
  return keenelandPackages.find(p => p.id === id);
}

// Get Keeneland garage by ID
export function getKeenelandGarageById(id: string): KeenelandGarage | undefined {
  return keenelandGarages.find(g => g.id === id);
}

// Get hero/default image
export function getKeenelandHeroImage(): string {
  return '/images/models/keeneland/keeneland-hero.jpg';
}

// Get preview image for a package + garage combo (with fallback chain)
export function getKeenelandExteriorImage(
  packageId: string | null, 
  garageId: string | null
): string {
  if (!packageId) return getKeenelandHeroImage();
  
  const pkg = getKeenelandPackageById(packageId);
  if (!pkg) return getKeenelandHeroImage();
  
  // Try exact match first
  if (garageId && pkg.previewByGarage[garageId]) {
    return pkg.previewByGarage[garageId];
  }
  
  // Fallback to first available render for this package
  const firstRender = Object.values(pkg.previewByGarage)[0];
  if (firstRender) return firstRender;
  
  // Ultimate fallback to hero
  return getKeenelandHeroImage();
}

// Check if a specific package + garage combo has a render
export function hasKeenelandVariant(packageId: string, garageId: string): boolean {
  const pkg = getKeenelandPackageById(packageId);
  return pkg ? !!pkg.previewByGarage[garageId] : false;
}

// Get all available garage IDs for a package
export function getAvailableGaragesForKeenelandPackage(packageId: string): string[] {
  const pkg = getKeenelandPackageById(packageId);
  return pkg ? Object.keys(pkg.previewByGarage) : [];
}

// Get all Keeneland render image paths (for preloading)
export function getAllKeenelandRenderImages(): string[] {
  const images: string[] = [getKeenelandHeroImage()];
  keenelandPackages.forEach(pkg => {
    Object.values(pkg.previewByGarage).forEach(path => {
      if (!images.includes(path)) {
        images.push(path);
      }
    });
  });
  return images;
}

// Check if model is Keeneland
export function isKeenelandModel(slug: string | null | undefined): boolean {
  return slug === 'keeneland';
}
