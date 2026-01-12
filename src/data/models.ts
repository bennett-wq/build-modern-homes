/**
 * MODELS DATA FILE
 * 
 * This file powers the Models listing page and individual model detail pages.
 * Models are enterprise-wide and available across all BaseMod developments.
 * 
 * HOW TO ADD A NEW MODEL:
 * 1. Add a new object to the `models` array below
 * 2. Each model needs: slug, name, sqft, beds, baths, price, description
 * 3. Add model images to: public/images/models/<slug>/
 *    - hero.webp (or .png, .jpg) - Main hero image
 *    - gallery-01.webp, gallery-02.webp, etc. - Gallery images
 *    - floor-plan.webp - Floor plan image
 * 4. The system will automatically detect and display available images
 * 
 * IMAGE PATHS:
 * - Hero: /images/models/<slug>/hero.webp
 * - Gallery: /images/models/<slug>/gallery-01.webp, gallery-02.webp, etc.
 * - Floor plan: /images/models/<slug>/floor-plan.webp
 * 
 * LEGACY IMAGES:
 * For backward compatibility, the system also checks src/assets/homes/ for existing images.
 */

export interface HomeModel {
  slug: string;
  name: string;
  sqft: number;
  beds: number;
  baths: number;
  price: number;
  description: string;
  features?: string[];
  /** Optional: override hero image path. If not provided, uses convention. */
  heroImage?: string;
  /** Optional: array of gallery image paths */
  galleryImages?: string[];
  /** Optional: floor plan image path */
  floorPlanImage?: string;
}

export const models: HomeModel[] = [
  {
    slug: "aspen",
    name: "Aspen",
    sqft: 1850,
    beds: 3,
    baths: 2,
    price: 285000,
    description: "A thoughtfully designed 3-bedroom home with an open-concept living area and spacious primary suite.",
    features: [
      "Open-concept living and dining",
      "Spacious primary suite with walk-in closet",
      "Kitchen island with seating",
      "Covered front porch",
      "Attached 2-car garage"
    ]
  },
  {
    slug: "belmont",
    name: "Belmont",
    sqft: 2100,
    beds: 4,
    baths: 2.5,
    price: 325000,
    description: "Our largest model featuring 4 bedrooms, a dedicated home office, and generous living spaces.",
    features: [
      "Four bedrooms including home office",
      "Primary suite with ensuite bath",
      "Half bath for guests",
      "Expanded kitchen with pantry",
      "Covered porch and 2-car garage"
    ]
  },
  {
    slug: "cedar",
    name: "Cedar",
    sqft: 1650,
    beds: 3,
    baths: 2,
    price: 265000,
    description: "An efficient floor plan that maximizes every square foot with smart design choices.",
    features: [
      "Efficient open layout",
      "Split bedroom design",
      "Functional kitchen with breakfast bar",
      "Covered entry porch",
      "Attached garage"
    ]
  },
  {
    slug: "hawthorn",
    name: "Hawthorn",
    sqft: 1450,
    beds: 2,
    baths: 2,
    price: 245000,
    description: "Perfect for downsizers or first-time buyers, offering comfort in a compact footprint.",
    features: [
      "Two-bedroom layout",
      "Both bedrooms with ensuite access",
      "Open living and kitchen",
      "Covered porch",
      "Single-car garage option"
    ]
  },
  {
    slug: "maple",
    name: "Maple",
    sqft: 1950,
    beds: 3,
    baths: 2.5,
    price: 305000,
    description: "Features an expansive kitchen, covered porch, and flexible bonus room.",
    features: [
      "Expansive kitchen with island",
      "Flexible bonus room",
      "Covered porch",
      "Primary suite with walk-in",
      "2.5 baths for convenience"
    ]
  },
  {
    slug: "birch",
    name: "Birch",
    sqft: 1750,
    beds: 3,
    baths: 2,
    price: 275000,
    description: "A balanced design with split-bedroom layout and open entertaining spaces.",
    features: [
      "Split bedroom layout for privacy",
      "Open entertaining spaces",
      "Kitchen with dining area",
      "Covered front entry",
      "Attached 2-car garage"
    ]
  }
];

/**
 * Get a model by its slug
 */
export function getModelBySlug(slug: string): HomeModel | undefined {
  return models.find(m => m.slug === slug);
}

/**
 * Get model image paths with fallbacks
 * Returns paths that should work whether using public/ or legacy src/assets/
 */
export function getModelImages(slug: string): {
  hero: string | null;
  gallery: string[];
  floorPlan: string | null;
} {
  // For now, return null - the component will handle legacy imports
  // In the future, images can be placed in public/images/models/<slug>/
  return {
    hero: null,
    gallery: [],
    floorPlan: null
  };
}
