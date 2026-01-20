// Home models data for BuildWizard and site-wide usage
// Each model includes specs and optional hero image

import aspenExterior01 from "@/assets/homes/aspen-exterior-01.png";
import belmontExterior01 from "@/assets/homes/belmont-exterior-01.png";
import cedarHero from "@/assets/homes/cedar-hero.png";
import mapleHero from "@/assets/homes/maple-hero.png";
import birchHero from "@/assets/homes/birch-hero.png";

export interface HomeModel {
  slug: string;
  name: string;
  sqft: number;
  beds: number;
  baths: number;
  price: number;
  description: string;
  heroImage?: string;
  floorplanImage?: string;
}

export const homeModels: HomeModel[] = [
  {
    slug: "aspen",
    name: "Aspen",
    sqft: 1850,
    beds: 3,
    baths: 2,
    price: 285000,
    description: "A thoughtfully designed 3-bedroom home with an open-concept living area and spacious primary suite.",
    heroImage: aspenExterior01,
  },
  {
    slug: "belmont",
    name: "Belmont",
    sqft: 1620,
    beds: 3,
    baths: 2,
    price: 325000,
    description: "The Belmont is a solid, efficient home with a compact 32×60 footprint that fits perfectly into tight setbacks. This 3-bedroom, 2-bath design delivers smart living spaces without wasting square footage.\n\nThe layout features an open-concept living area that flows into the kitchen and dining spaces, with a well-appointed primary suite and two additional bedrooms. A flexible 3rd bathroom can be added to the utility room for growing families or multi-generational living. Built to CrossMod® or IRC-code standards with BaseMod's curated exterior packages, the Belmont proves that efficient design and quality construction go hand in hand.",
    heroImage: belmontExterior01,
    floorplanImage: "/floorplans/belmont/belmont-floorplan.pdf",
  },
  {
    slug: "cedar",
    name: "Cedar",
    sqft: 1650,
    beds: 3,
    baths: 2,
    price: 265000,
    description: "An efficient floor plan that maximizes every square foot with smart design choices.",
    heroImage: cedarHero,
  },
  {
    slug: "hawthorne",
    name: "Hawthorne",
    sqft: 1620,
    beds: 3,
    baths: 2,
    price: 245000,
    description: "The Hawthorne is a modern barndominium-inspired home that blends clean architectural lines, efficient living, and flexible layouts into a compact, high-performing design. With an open-concept kitchen and living area, a generous primary suite, and smart circulation throughout, the Hawthorne is designed to live larger than its footprint while maintaining exceptional build efficiency.\n\nThis model is ideal for downsizers, first-time buyers, and anyone seeking a modern aesthetic with practical flexibility — whether built as a CrossMod® or IRC-code modular home. The Hawthorne's layout is intentionally adaptable, allowing buyers to configure bedrooms, bathrooms, or a dedicated office or flex space without sacrificing flow or livability. Paired with BaseMod's curated exterior packages and site-built porch and garage options, the Hawthorne delivers a refined, contemporary home that appraises, performs, and lives like a traditional site-built residence — at a more attainable price point.",
    heroImage: "/images/models/hawthorne/hawthorne-hero.jpg",
    floorplanImage: "/floorplans/hawthorne/CrossMod--3264-32-1_Hawthorne_R.pdf",
  },
  {
    slug: "maple",
    name: "Maple",
    sqft: 1950,
    beds: 3,
    baths: 2.5,
    price: 305000,
    description: "Features an expansive kitchen, covered porch, and flexible bonus room.",
    heroImage: mapleHero,
  },
  {
    slug: "birch",
    name: "Birch",
    sqft: 1750,
    beds: 3,
    baths: 2,
    price: 275000,
    description: "A balanced design with split-bedroom layout and open entertaining spaces.",
    heroImage: birchHero,
  },
];

export function getModelBySlug(slug: string): HomeModel | undefined {
  // Normalize "hawthorn" to "hawthorne" for backward compatibility
  const normalizedSlug = slug === 'hawthorn' ? 'hawthorne' : slug;
  return homeModels.find(m => m.slug === normalizedSlug);
}
