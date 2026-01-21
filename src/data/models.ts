// Home models data for BuildWizard and site-wide usage
// Each model includes specs and optional hero image
// Hero images use canonical paths: /images/models/{slug}/hero.webp

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
    heroImage: "/images/models/aspen/hero.webp",
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
    heroImage: "/images/models/belmont/hero.webp",
    floorplanImage: "/floorplans/belmont/belmont-floorplan.pdf",
  },
  {
    slug: "keeneland",
    name: "Keeneland",
    sqft: 1635,
    beds: 3,
    baths: 2,
    price: 265000,
    description: "The Keeneland is a cost-effective, modern home designed to deliver strong livability and design flexibility within a highly efficient footprint. At 1,635 square feet with a 32' × 58' footprint, the Keeneland is well suited for a wide range of sites — including lots with tighter setbacks — while maintaining the feel and function of a traditional site-built home.\n\nThe base layout features 3 bedrooms and 2 bathrooms organized around an open, comfortable living core that maximizes usable space without excess. The plan lends itself especially well to creative exterior treatments, including Board-and-Batten siding, modern color palettes, and BaseMod's curated exterior packages — making it an excellent option for buyers seeking a clean, contemporary look at an attainable price point.\n\nAvailable as a CrossMod® (HUD-code) or IRC-code modular home, the Keeneland offers a versatile, efficient solution for first-time buyers, downsizers, and anyone looking for a modern modular home that appraises, performs, and lives like a site-built residence.",
    heroImage: "/images/models/keeneland/hero.webp",
    floorplanImage: "/floorplans/keeneland/keeneland-floorplan.pdf",
  },
  {
    slug: "hawthorne",
    name: "Hawthorne",
    sqft: 1620,
    beds: 3,
    baths: 2,
    price: 245000,
    description: "The Hawthorne is a modern barndominium-inspired home that blends clean architectural lines, efficient living, and flexible layouts into a compact, high-performing design. With an open-concept kitchen and living area, a generous primary suite, and smart circulation throughout, the Hawthorne is designed to live larger than its footprint while maintaining exceptional build efficiency.\n\nThis model is ideal for downsizers, first-time buyers, and anyone seeking a modern aesthetic with practical flexibility — whether built as a CrossMod® or IRC-code modular home. The Hawthorne's layout is intentionally adaptable, allowing buyers to configure bedrooms, bathrooms, or a dedicated office or flex space without sacrificing flow or livability. Paired with BaseMod's curated exterior packages and site-built porch and garage options, the Hawthorne delivers a refined, contemporary home that appraises, performs, and lives like a traditional site-built residence — at a more attainable price point.",
    heroImage: "/images/models/hawthorne/hero.webp",
    floorplanImage: "/floorplans/hawthorne/CrossMod--3264-32-1_Hawthorne_R.pdf",
  },
  {
    slug: "laurel",
    name: "Laurel",
    sqft: 1065,
    beds: 3,
    baths: 2,
    price: 225000,
    description: "The Laurel is an efficient, thoughtfully designed three-bedroom home with flexible garage options. At 1,065 square feet, the Laurel delivers strong livability in a compact footprint — ideal for first-time buyers, downsizers, and investors seeking an attainable price point without sacrificing quality. Choose from no garage, a two-car garage with two doors, or a two-car garage with a single modern door to match your site and lifestyle.",
    heroImage: "/images/models/laurel/hero-no-garage.webp",
    floorplanImage: "/floorplans/laurel/laurel-floorplan.pdf",
  },
  {
    slug: "cypress",
    name: "Cypress",
    sqft: 990,
    beds: 2,
    baths: 2,
    price: 185000,
    description: "The Cypress is an efficient 990 sq ft two-bedroom design with a flexible den/office space. At just 16' × 66', it's the most compact CrossMod® option in the BaseMod lineup — ideal for narrow lots, accessory dwelling units, or buyers seeking maximum efficiency without sacrificing quality. The open-concept living area and smart circulation deliver surprising livability in a streamlined footprint.",
    heroImage: "/images/models/cypress/hero-v2.webp",
    floorplanImage: "/floorplans/cypress/cypress-floorplan.pdf",
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
