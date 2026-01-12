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
  },
];

export function getDevelopmentBySlug(slug: string): Development | undefined {
  return developments.find(d => d.slug === slug);
}
