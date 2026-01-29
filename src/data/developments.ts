// Development registry for multi-development support
// Each development can have its own site plan and lot data

export interface Development {
  slug: string;
  name: string;
  city: string;
  state: string;
  sitePlanImagePath: string;
  arbGuidelinesUrl?: string;
  description?: string;
  status: 'active' | 'coming-soon' | 'sold-out';
  // Location highlights for detail page
  locationHighlights?: {
    icon: string;
    title: string;
    description: string;
  }[];
  // Development features for detail page
  features?: {
    icon: string;
    title: string;
    description: string;
  }[];
  // For ARB communities - restrict to specific models
  conformingModels?: string[];
  // For ARB communities - restrict to specific exterior packages
  arbReadyPackages?: string[];
}

export const developments: Development[] = [
  {
    slug: 'grand-haven',
    name: 'Grand Haven',
    city: 'Grand Haven',
    state: 'Michigan',
    sitePlanImagePath: '/images/developments/grand-haven/hero-site-plan.jpg',
    description: 'Beautiful large lots and waterfront community on the Grand River in Grand Haven with BaseMod homes. Located at 11665 N Cedar Road, Grand Haven, MI. No HOA restrictions on lots 1-13.',
    status: 'active',
    locationHighlights: [
      { icon: 'Waves', title: 'Grand River Waterfront', description: 'Stunning riverfront community with waterfront and scenic view lots on the Grand River.' },
      { icon: 'TreePine', title: 'Large Acreage Lots', description: 'Spacious lots ranging from 2 to 32+ acres for ultimate privacy and natural beauty.' },
      { icon: 'ShoppingBag', title: 'Downtown Grand Haven', description: 'Minutes from Grand Haven\'s charming downtown shops, restaurants, and Lake Michigan beaches.' },
      { icon: 'Car', title: 'Easy Commuting', description: 'Convenient access to major routes connecting to Holland and Grand Rapids.' },
    ],
    features: [
      { icon: 'Sun', title: 'Well & Septic Ready', description: 'All lots are prepared for well and septic system installation.' },
      { icon: 'ShieldCheck', title: 'No HOA Restrictions', description: 'Lots 1-13 have no HOA restrictions—build your dream home your way.' },
      { icon: 'MapPin', title: 'Phased Development', description: 'Phase 1 lots available now. Phase 2 Fall 2026. Phase 3 Spring 2027.' },
    ],
  },
  {
    slug: 'st-james-bay',
    name: 'St. James Bay',
    city: 'Carrabelle',
    state: 'Florida',
    sitePlanImagePath: '/images/developments/st-james-bay/hero-carrabelle-site-plan.png',
    arbGuidelinesUrl: '/docs/developments/st-james-bay/arb-guidelines.pdf',
    description: 'Beautiful Golf Course & Scenic View Lots Available with all-in BaseMod Pricing. Located at 151 Laughing Gull Ln, Carrabelle, FL 32322.',
    status: 'active',
    locationHighlights: [
      { icon: 'Waves', title: 'Coastal Living', description: 'Located in Florida\'s beautiful Gulf Coast region with access to pristine waterways.' },
      { icon: 'TreePine', title: 'Natural Preserve', description: 'Surrounded by protected natural habitats and wildlife areas.' },
      { icon: 'Sun', title: 'Year-Round Climate', description: 'Enjoy Florida\'s warm, sunny weather throughout the year.' },
      { icon: 'MapPin', title: 'Community Amenities', description: 'Access to community facilities, trails, and recreational areas.' },
    ],
    features: [
      { icon: 'ShieldCheck', title: 'Architectural Review', description: 'All exterior selections align with community design standards for a cohesive neighborhood aesthetic.' },
      { icon: 'Sun', title: 'Coastal-Modern Design', description: 'Curated exterior packages designed for Florida\'s coastal environment and lifestyle.' },
      { icon: 'MapPin', title: 'Conforming Plans', description: 'Pre-approved floor plans selected to meet community setback and design requirements.' },
    ],
    // Conforming models for St. James Bay
    conformingModels: ['aspen', 'belmont'],
    // ARB-ready packages for St. James Bay
    arbReadyPackages: ['coastal-white', 'craftsman-sage', 'modern-charcoal'],
  },
  {
    slug: 'ypsilanti',
    name: 'Ypsilanti',
    city: 'Ypsilanti',
    state: 'Michigan',
    sitePlanImagePath: '/images/developments/ypsilanti/hero-prospect-site-plan.png',
    description: 'This BaseMod community is still in planning stages for launch in 2026. Located at 1230 N Prospect Road, Ypsilanti MI. No HOA Restrictions.',
    status: 'active',
    locationHighlights: [
      { icon: 'MapPin', title: 'Prime Location', description: 'Located on N Prospect Road with easy access to Ypsilanti and Ann Arbor.' },
      { icon: 'Car', title: 'Commuter Friendly', description: 'Convenient access to I-94 and US-23 for easy commuting.' },
      { icon: 'TreePine', title: 'Natural Setting', description: 'Quiet residential area with mature trees and green spaces.' },
      { icon: 'ShoppingBag', title: 'Local Amenities', description: 'Close to shops, restaurants, and Eastern Michigan University.' },
    ],
    features: [
      { icon: 'Sun', title: 'No HOA Restrictions', description: 'Build your dream home without restrictive HOA guidelines.' },
      { icon: 'MapPin', title: 'Improved Lots', description: 'All lots come with utilities and infrastructure ready.' },
      { icon: 'TreePine', title: 'Phased Development', description: 'Phase 1 lots available now, with additional phases through 2027.' },
    ],
  },
  {
    slug: 'ann-arbor',
    name: 'Ann Arbor',
    city: 'Ann Arbor',
    state: 'Michigan',
    sitePlanImagePath: '', // No site plan yet
    description: 'An upcoming community near the University of Michigan, offering modern living in one of the state\'s most vibrant college towns.',
    status: 'coming-soon',
  },
  {
    slug: 'chicago',
    name: 'Chicago Suburbs',
    city: 'Chicago',
    state: 'Illinois',
    sitePlanImagePath: '', // No site plan yet
    description: 'A new development bringing BaseMod\'s modern modular homes to the greater Chicago metropolitan area.',
    status: 'coming-soon',
  },
];

export function getDevelopmentBySlug(slug: string): Development | undefined {
  return developments.find(d => d.slug === slug);
}
