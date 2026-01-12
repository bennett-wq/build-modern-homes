/**
 * DEVELOPMENTS DATA FILE
 * 
 * This file powers the Developments listing page and individual development pages.
 * 
 * HOW TO ADD A NEW DEVELOPMENT:
 * 1. Add a new object to the `developments` array below
 * 2. Each development needs: slug, name, city, state, shortDescription, longDescription
 * 3. Optional: heroImage, sitePlanImage (paths relative to public folder)
 * 4. Create lot data file at: src/data/lots/<slug>.ts (see src/data/lots/grand-haven.ts for example)
 * 5. Add site plan image to: public/images/developments/<slug>/site-plan.png
 * 6. Add hero image to: public/images/developments/<slug>/hero.png
 * 
 * IMAGE PATHS:
 * - Hero images: /images/developments/<slug>/hero.png (or .jpg, .webp)
 * - Site plan images: /images/developments/<slug>/site-plan.png
 * - Gallery images: /images/developments/<slug>/gallery-01.jpg, gallery-02.jpg, etc.
 */

export interface Development {
  slug: string;
  name: string;
  city: string;
  state: string;
  shortDescription: string;
  longDescription: string;
  heroImage?: string;
  sitePlanImage?: string;
  status: 'coming-soon' | 'selling' | 'sold-out';
  totalLots?: number;
  availableLots?: number;
  features?: string[];
  highlights?: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export const developments: Development[] = [
  {
    slug: "grand-haven",
    name: "Grand Haven",
    city: "Grand Haven",
    state: "Michigan",
    shortDescription: "A walkable, thoughtfully planned community in beautiful Grand Haven, Michigan, featuring modern CrossMod® homes on improved lots.",
    longDescription: "Our flagship development in Grand Haven offers the perfect blend of small-town charm and modern living. Located minutes from Lake Michigan's stunning beaches and Grand Haven's charming downtown, this community features thoughtfully planned lots, integrated green spaces, and homes designed for how people live today.",
    heroImage: "/images/developments/grand-haven/hero.png",
    sitePlanImage: "/images/developments/grand-haven/site-plan.png",
    status: "selling",
    totalLots: 24,
    availableLots: 18,
    features: [
      "Lake Michigan Access",
      "Downtown Walkability",
      "Improved Lots",
      "Community Green Spaces"
    ],
    highlights: [
      {
        icon: "waves",
        title: "Lake Michigan Access",
        description: "Minutes from beautiful beaches and the iconic Grand Haven pier."
      },
      {
        icon: "trees",
        title: "Natural Beauty",
        description: "Surrounded by parks, trails, and Michigan's stunning natural landscape."
      },
      {
        icon: "shopping-bag",
        title: "Downtown Walkability",
        description: "Close to Grand Haven's charming downtown shops and restaurants."
      },
      {
        icon: "car",
        title: "Easy Commuting",
        description: "Convenient access to major routes connecting to Holland and Grand Rapids."
      }
    ]
  },
  {
    slug: "ypsilanti",
    name: "Ypsilanti",
    city: "Ypsilanti",
    state: "Michigan",
    shortDescription: "Coming soon to Ypsilanti, Michigan – a new BaseMod community bringing modern, attainable homes to the Ann Arbor area.",
    longDescription: "Our upcoming Ypsilanti development will bring BaseMod's signature approach to the vibrant Ann Arbor area. With excellent access to employment centers, universities, and cultural amenities, this community will offer modern CrossMod® homes at attainable prices. Site planning is currently underway.",
    status: "coming-soon",
    features: [
      "Ann Arbor Area",
      "University Proximity",
      "Urban Amenities",
      "Coming 2025"
    ]
  },
  {
    slug: "carrabelle",
    name: "Carrabelle",
    city: "Carrabelle",
    state: "Florida",
    shortDescription: "Discover coastal Florida living in Carrabelle – BaseMod homes designed for the Gulf Coast lifestyle.",
    longDescription: "BaseMod is expanding to Florida's beautiful Forgotten Coast. Our Carrabelle development will offer the same quality CrossMod® construction adapted for coastal living, with hurricane-resistant features and designs that embrace indoor-outdoor Florida living. Development details coming soon.",
    status: "coming-soon",
    features: [
      "Gulf Coast Location",
      "Coastal Design",
      "Hurricane Resistant",
      "Coming 2025"
    ]
  }
];

/**
 * Get a development by its slug
 */
export function getDevelopmentBySlug(slug: string): Development | undefined {
  return developments.find(d => d.slug === slug);
}

/**
 * Get all developments with a specific status
 */
export function getDevelopmentsByStatus(status: Development['status']): Development[] {
  return developments.filter(d => d.status === status);
}
