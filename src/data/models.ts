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
    sqft: 1620,
    beds: 4,
    baths: 2,
    price: 285000,
    description: "The Aspen is a highly efficient 1,620 sq ft plan that delivers four true bedrooms and two full baths within a compact 32' × 60' footprint — making it one of the most versatile options in the BaseMod lineup. Designed for buyers who need maximum bedroom count without expanding the building envelope, the Aspen excels on narrow lots, infill sites, and communities with tighter setback requirements.\n\nDespite its efficiency, the layout doesn't sacrifice livability: an open-concept living and kitchen core anchors the home, while smart circulation keeps bedrooms private and functional. For added flexibility, the Aspen supports a 3 Bedroom + Office configuration, an optional butler's pantry, and an optional third bathroom — giving buyers practical upgrade paths without altering the home's overall footprint.\n\nAvailable as CrossMod® (HUD-code) or Modular (IRC-code), the Aspen can be configured for crawl or basement foundations depending on site conditions. Paired with BaseMod's curated exterior packages and site-built porch and garage options, the Aspen delivers a refined, high-performing home that appraises and lives like a traditional site-built residence — at a more attainable price point.",
    heroImage: aspenExterior01,
    floorplanImage: "/floorplans/aspen/aspen-floorplan.pdf",
  },
  {
    slug: "belmont",
    name: "Belmont",
    sqft: 1620,
    beds: 3,
    baths: 2,
    price: 325000,
    description: "The Belmont is a compact, efficient 1,620 sq ft plan designed to fit confidently on lots with tighter setbacks — without feeling small inside. The layout delivers a strong open-concept living core, three true bedrooms, and two full baths, making it an ideal everyday home for families, downsizers, and first-time buyers alike. With its 32' × 60' footprint, the Belmont is especially well-suited for narrow lots, infill sites, and communities where buildable envelopes are constrained.\n\nFor added flexibility, the plan can accommodate an optional third bathroom by leveraging space in/near the utility room (site/plumbing dependent), giving buyers a future-proof upgrade path without changing the home's overall footprint.",
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
