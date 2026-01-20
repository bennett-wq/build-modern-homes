// Development registry for multi-development support
// Each development can have its own site plan and lot data

export interface Development {
  slug: string;
  name: string;
  city: string;
  state: string;
  sitePlanImagePath: string;
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
    sitePlanImagePath: '/images/developments/grand-haven/site-plan.png',
    description: 'A planned residential community featuring BaseMod Homes on improved lots, designed for modern living in one of Michigan\'s most desirable coastal towns.',
    status: 'active',
    locationHighlights: [
      { icon: 'Waves', title: 'Lake Michigan Access', description: 'Minutes from beautiful beaches and the iconic Grand Haven pier.' },
      { icon: 'TreePine', title: 'Natural Beauty', description: 'Surrounded by parks, trails, and Michigan\'s stunning natural landscape.' },
      { icon: 'ShoppingBag', title: 'Downtown Walkability', description: 'Close to Grand Haven\'s charming downtown shops and restaurants.' },
      { icon: 'Car', title: 'Easy Commuting', description: 'Convenient access to major routes connecting to Holland and Grand Rapids.' },
    ],
    features: [
      { icon: 'Sun', title: 'Thoughtfully Planned Lots', description: 'Each lot is sized and oriented to maximize natural light and privacy between homes.' },
      { icon: 'TreePine', title: 'Community Green Spaces', description: 'Integrated green spaces and walking paths create a connected neighborhood feel.' },
      { icon: 'MapPin', title: 'Improved Infrastructure', description: 'All lots come with utilities, roads, and site work already completed.' },
    ],
  },
  {
    slug: 'st-james-bay',
    name: 'St. James Bay',
    city: 'St. James Bay',
    state: 'Florida',
    sitePlanImagePath: '/images/developments/st-james-bay/site-plan.png',
    description: 'St. James Bay is a design-reviewed community where homes are selected to fit the neighborhood\'s architectural standards and site constraints. Choose a lot, select a conforming plan, and move through BaseMod\'s guided build experience with curated exterior packages designed for a clean, coastal-modern look.',
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
