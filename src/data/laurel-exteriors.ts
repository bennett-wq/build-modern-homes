// ============================================================================
// Laurel Exterior Configuration
// Supports garage configuration selection with dynamic hero images
// ============================================================================

export type LaurelGarageType = 'none' | 'two-door' | 'single-door';

export interface LaurelGarageOption {
  id: LaurelGarageType;
  name: string;
  description: string;
  heroImage: string;
  isDefault?: boolean;
}

export const laurelGarageOptions: LaurelGarageOption[] = [
  {
    id: 'none',
    name: 'No Garage',
    description: 'Home only with site-built porch',
    heroImage: '/images/models/laurel/hero-no-garage.webp',
    isDefault: true,
  },
  {
    id: 'two-door',
    name: 'Two-Car Garage (Two Doors)',
    description: 'Site-built attached garage with two separate doors',
    heroImage: '/images/models/laurel/hero-garage-two-door.webp',
  },
  {
    id: 'single-door',
    name: 'Two-Car Garage (Single Door)',
    description: 'Site-built attached garage with one large modern door',
    heroImage: '/images/models/laurel/hero-garage-single-door.webp',
  },
];

export const laurelColorVariants = {
  white: {
    name: 'Modern White',
    description: 'Clean white board-and-batten with natural wood accents',
    primaryHex: '#FFFFFF',
    accentHex: '#8B7355',
    garageImages: {
      none: '/images/models/laurel/hero-no-garage.webp',
      'two-door': '/images/models/laurel/hero-garage-two-door.webp',
      'single-door': '/images/models/laurel/hero-garage-single-door.webp',
    },
  },
  black: {
    name: 'Modern Black',
    description: 'Bold black board-and-batten with natural wood accents',
    primaryHex: '#1A1A1A',
    accentHex: '#8B7355',
    garageImages: {
      none: '/images/models/laurel/hero-black-no-garage.webp',
      // Future: add black variants with garage
    },
  },
};

/**
 * Get the appropriate hero image for Laurel based on garage selection
 */
export function getLaurelHeroImage(garageType: LaurelGarageType = 'none', colorVariant: 'white' | 'black' = 'white'): string {
  const variant = laurelColorVariants[colorVariant];
  
  if (colorVariant === 'black') {
    // Black variant only has no-garage image currently
    return variant.garageImages.none || '/images/models/laurel/hero-black-no-garage.webp';
  }
  
  return variant.garageImages[garageType] || '/images/models/laurel/hero-no-garage.webp';
}

/**
 * Get the default garage option
 */
export function getDefaultLaurelGarageOption(): LaurelGarageOption {
  return laurelGarageOptions.find(opt => opt.isDefault) || laurelGarageOptions[0];
}

/**
 * Check if Laurel model to enable garage selection
 */
export function isLaurelModel(slug: string): boolean {
  return slug === 'laurel';
}
