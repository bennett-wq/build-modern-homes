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
    sqft: 2100,
    beds: 4,
    baths: 2.5,
    price: 325000,
    description: "Our largest model featuring 4 bedrooms, a dedicated home office, and generous living spaces.",
    heroImage: belmontExterior01,
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
    sqft: 1450,
    beds: 2,
    baths: 2,
    price: 245000,
    description: "Perfect for downsizers or first-time buyers, offering comfort in a compact footprint.",
    heroImage: "/images/models/hawthorne/hawthorne-hero.jpg",
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
