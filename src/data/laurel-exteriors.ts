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

// Canonical default hero - ALWAYS the garage version unless explicitly selecting "No Garage"
export const LAUREL_DEFAULT_HERO = '/images/models/laurel/hero-garage-two-door.webp';

export const laurelImageVariants = {
  defaultHero: LAUREL_DEFAULT_HERO,
  variants: {
    no_garage: '/images/models/laurel/hero-no-garage.webp',
    garage_two_door: '/images/models/laurel/hero-garage-two-door.webp',
    garage_single_door: '/images/models/laurel/hero-garage-single-door.webp',
  },
};

export const laurelGarageOptions: LaurelGarageOption[] = [
  {
    id: 'two-door',
    name: 'Two-Car Garage (Two Doors)',
    description: 'Site-built attached garage with two separate doors',
    heroImage: '/images/models/laurel/hero-garage-two-door.webp',
    isDefault: true, // This is now the default
  },
  {
    id: 'single-door',
    name: 'Two-Car Garage (Single Door)',
    description: 'Site-built attached garage with one large modern door',
    heroImage: '/images/models/laurel/hero-garage-single-door.webp',
  },
  {
    id: 'none',
    name: 'No Garage',
    description: 'Home only with site-built porch',
    heroImage: '/images/models/laurel/hero-no-garage.webp',
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
 * Get the appropriate hero image for Laurel based on garage selection.
 * CRITICAL: Default is ALWAYS the garage version (two-door), NOT no-garage.
 * Only returns no-garage image when explicitly selected.
 */
export function getLaurelHeroImage(
  garageType: LaurelGarageType | null | undefined = 'two-door',
  colorVariant: 'white' | 'black' = 'white'
): string {
  // If no selection made, return the canonical default (garage two-door)
  if (!garageType) {
    return LAUREL_DEFAULT_HERO;
  }

  const variant = laurelColorVariants[colorVariant];
  
  if (colorVariant === 'black') {
    // Black variant only has no-garage image currently
    return variant.garageImages.none || '/images/models/laurel/hero-black-no-garage.webp';
  }
  
  const heroPath = variant.garageImages[garageType];
  
  // NEVER fall back to no-garage - use the explicit default
  return heroPath || LAUREL_DEFAULT_HERO;
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
