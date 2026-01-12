// Exterior packages and garage door options for BuildWizard
// Curated combos for a premium proptech experience

export interface ExteriorPackage {
  id: string;
  name: string;
  description: string;
  sidingColor: string; // HSL for preview
  trimColor: string;
  accentColor: string;
  roofColor: string;
}

export interface GarageDoor {
  id: string;
  name: string;
  description: string;
  style: 'traditional' | 'carriage' | 'modern' | 'craftsman';
  color: string; // HSL for preview
}

export const exteriorPackages: ExteriorPackage[] = [
  {
    id: 'modern-charcoal',
    name: 'Modern Charcoal',
    description: 'Sleek dark siding with crisp white trim and black accents',
    sidingColor: 'hsl(0, 0%, 25%)',
    trimColor: 'hsl(0, 0%, 98%)',
    accentColor: 'hsl(0, 0%, 10%)',
    roofColor: 'hsl(0, 0%, 20%)',
  },
  {
    id: 'coastal-white',
    name: 'Coastal White',
    description: 'Bright white siding with navy accents and weathered wood touches',
    sidingColor: 'hsl(0, 0%, 98%)',
    trimColor: 'hsl(0, 0%, 100%)',
    accentColor: 'hsl(215, 50%, 35%)',
    roofColor: 'hsl(0, 0%, 35%)',
  },
  {
    id: 'craftsman-sage',
    name: 'Craftsman Sage',
    description: 'Earthy sage green with cream trim and natural wood details',
    sidingColor: 'hsl(120, 15%, 45%)',
    trimColor: 'hsl(45, 30%, 90%)',
    accentColor: 'hsl(30, 40%, 45%)',
    roofColor: 'hsl(30, 20%, 30%)',
  },
  {
    id: 'warm-gray',
    name: 'Warm Gray',
    description: 'Sophisticated warm gray with white trim and bronze accents',
    sidingColor: 'hsl(30, 5%, 55%)',
    trimColor: 'hsl(0, 0%, 100%)',
    accentColor: 'hsl(30, 30%, 40%)',
    roofColor: 'hsl(0, 0%, 30%)',
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Timeless navy siding with bright white trim and brass touches',
    sidingColor: 'hsl(215, 50%, 30%)',
    trimColor: 'hsl(0, 0%, 100%)',
    accentColor: 'hsl(45, 80%, 50%)',
    roofColor: 'hsl(0, 0%, 25%)',
  },
  {
    id: 'rustic-brown',
    name: 'Rustic Brown',
    description: 'Rich brown siding with cream accents and copper details',
    sidingColor: 'hsl(25, 30%, 35%)',
    trimColor: 'hsl(40, 25%, 88%)',
    accentColor: 'hsl(20, 70%, 45%)',
    roofColor: 'hsl(20, 20%, 25%)',
  },
];

export const garageDoors: GarageDoor[] = [
  {
    id: 'carriage-black',
    name: 'Carriage Black',
    description: 'Classic carriage style with iron hardware in matte black',
    style: 'carriage',
    color: 'hsl(0, 0%, 15%)',
  },
  {
    id: 'carriage-white',
    name: 'Carriage White',
    description: 'Traditional carriage design in bright white with decorative hinges',
    style: 'carriage',
    color: 'hsl(0, 0%, 98%)',
  },
  {
    id: 'modern-aluminum',
    name: 'Modern Aluminum',
    description: 'Contemporary full-view aluminum with frosted glass panels',
    style: 'modern',
    color: 'hsl(0, 0%, 70%)',
  },
  {
    id: 'craftsman-wood',
    name: 'Craftsman Wood',
    description: 'Craftsman style with wood grain texture and divided windows',
    style: 'craftsman',
    color: 'hsl(30, 40%, 35%)',
  },
  {
    id: 'traditional-gray',
    name: 'Traditional Gray',
    description: 'Classic raised panel design in warm gray',
    style: 'traditional',
    color: 'hsl(0, 0%, 50%)',
  },
  {
    id: 'modern-black',
    name: 'Modern Black',
    description: 'Sleek flush panel design in jet black',
    style: 'modern',
    color: 'hsl(0, 0%, 10%)',
  },
];

export function getPackageById(id: string): ExteriorPackage | undefined {
  return exteriorPackages.find(p => p.id === id);
}

export function getGarageDoorById(id: string): GarageDoor | undefined {
  return garageDoors.find(g => g.id === id);
}
