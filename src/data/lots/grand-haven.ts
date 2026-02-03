// Grand Haven lot data with polygon coordinates
// Polygons use percentage-based coordinates (0-100) for responsive scaling

export type LotStatus = 'available' | 'reserved' | 'sold';

export interface LotPolygonPoint {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface Lot {
  id: number;
  label: string;
  status: LotStatus;
  polygon: LotPolygonPoint[];
  acreage?: number;
  netAcreage?: number;
  zoning?: string;
  premium?: number; // Homesite premium in dollars
  notes?: string;
  phase?: number; // Phase 1, 2, or 3
  availability?: string; // "Now", "Fall 2026", "Spring 2027"
  requiresWellSeptic?: boolean;
}

// Grand Haven Development
// Address: 11665 N Cedar Road, Grand Haven, MI
// Location: Cedar & 118th Street, Grand Haven, MI
// Status: Active (BaseMod Lots For Sale)
// Notes: No HOA restrictions on lots 1-13. All lots require well & septic.

export const grandHavenLots: Lot[] = [
  // Phase 2 - Fall 2026
  {
    id: 1,
    label: 'Lot 1',
    status: 'available',
    polygon: [],
    acreage: 3.06,
    zoning: 'R-1',
    premium: 75000,
    phase: 2,
    availability: 'Fall 2026',
    requiresWellSeptic: true,
    notes: 'Phase 2 - Available Fall 2026',
  },
  {
    id: 2,
    label: 'Lot 2',
    status: 'available',
    polygon: [],
    acreage: 2.03,
    zoning: 'R-1',
    premium: 50750,
    phase: 2,
    availability: 'Fall 2026',
    requiresWellSeptic: true,
    notes: 'Phase 2 - Available Fall 2026',
  },
  {
    id: 3,
    label: 'Lot 3',
    status: 'available',
    polygon: [],
    acreage: 1.97,
    zoning: 'R-1',
    premium: 49250,
    phase: 2,
    availability: 'Fall 2026',
    requiresWellSeptic: true,
    notes: 'Phase 2 - Available Fall 2026',
  },
  {
    id: 4,
    label: 'Lot 4',
    status: 'available',
    polygon: [],
    acreage: 1.92,
    zoning: 'R-1',
    premium: 48000,
    phase: 2,
    availability: 'Fall 2026',
    requiresWellSeptic: true,
    notes: 'Phase 2 - Available Fall 2026',
  },
  {
    id: 5,
    label: 'Lot 5',
    status: 'available',
    polygon: [],
    acreage: 2.03,
    zoning: 'R-1',
    premium: 50750,
    phase: 2,
    availability: 'Fall 2026',
    requiresWellSeptic: true,
    notes: 'Phase 2 - Available Fall 2026',
  },
  {
    id: 6,
    label: 'Lot 6',
    status: 'available',
    polygon: [],
    acreage: 1.98,
    zoning: 'R-1',
    premium: 49500,
    phase: 2,
    availability: 'Fall 2026',
    requiresWellSeptic: true,
    notes: 'Phase 2 - Available Fall 2026',
  },
  {
    id: 7,
    label: 'Lot 7',
    status: 'available',
    polygon: [],
    acreage: 1.93,
    zoning: 'R-1',
    premium: 48250,
    phase: 2,
    availability: 'Fall 2026',
    requiresWellSeptic: true,
    notes: 'Phase 2 - Available Fall 2026',
  },
  {
    id: 8,
    label: 'Lot 8',
    status: 'available',
    polygon: [],
    acreage: 1.96,
    zoning: 'R-1',
    premium: 49000,
    phase: 2,
    availability: 'Fall 2026',
    requiresWellSeptic: true,
    notes: 'Phase 2 - Available Fall 2026',
  },
  // Phase 3 - Spring 2027
  {
    id: 9,
    label: 'Lot 9',
    status: 'available',
    polygon: [],
    acreage: 2.46,
    zoning: 'R-1',
    premium: 61500,
    phase: 3,
    availability: 'Spring 2027',
    requiresWellSeptic: true,
    notes: 'Phase 3 - Available Spring 2027',
  },
  {
    id: 10,
    label: 'Lot 10',
    status: 'available',
    polygon: [],
    acreage: 2.40,
    zoning: 'R-1',
    premium: 60000,
    phase: 3,
    availability: 'Spring 2027',
    requiresWellSeptic: true,
    notes: 'Phase 3 - Available Spring 2027',
  },
  {
    id: 11,
    label: 'Lot 11',
    status: 'available',
    polygon: [],
    acreage: 2.34,
    zoning: 'R-1',
    premium: 58500,
    phase: 3,
    availability: 'Spring 2027',
    requiresWellSeptic: true,
    notes: 'Phase 3 - Available Spring 2027',
  },
  {
    id: 12,
    label: 'Lot 12',
    status: 'available',
    polygon: [],
    acreage: 32.09,
    zoning: 'R-1',
    premium: 802250,
    phase: 3,
    availability: 'Spring 2027',
    requiresWellSeptic: true,
    notes: 'Phase 3 - Large estate lot (32+ acres) - Available Spring 2027',
  },
  {
    id: 13,
    label: 'Lot 13',
    status: 'available',
    polygon: [],
    acreage: 18.16,
    zoning: 'R-1',
    premium: 454000,
    phase: 3,
    availability: 'Spring 2027',
    requiresWellSeptic: true,
    notes: 'Phase 3 - Large estate lot (18+ acres) - Available Spring 2027',
  },
  {
    id: 14,
    label: 'Lot 14',
    status: 'available',
    polygon: [],
    acreage: 67.93,
    zoning: 'I-2',
    premium: undefined, // Price TBD
    phase: 3,
    availability: 'Spring 2027',
    requiresWellSeptic: true,
    notes: 'Future Waterfront Lots - Price TBD',
  },
  // Phase 1 - Available Now
  {
    id: 15,
    label: 'Lot 15',
    status: 'available',
    polygon: [],
    acreage: 2.47,
    zoning: 'R-1',
    premium: 61750,
    phase: 1,
    availability: 'Now',
    requiresWellSeptic: true,
    notes: 'Phase 1 - Available Now',
  },
  {
    id: 16,
    label: 'Lot 16',
    status: 'available',
    polygon: [],
    acreage: 2.46,
    zoning: 'R-1',
    premium: 61500,
    phase: 1,
    availability: 'Now',
    requiresWellSeptic: true,
    notes: 'Phase 1 - Available Now',
  },
  {
    id: 17,
    label: 'Lot 17',
    status: 'available',
    polygon: [],
    acreage: 2.44,
    zoning: 'R-1',
    premium: 61000,
    phase: 1,
    availability: 'Now',
    requiresWellSeptic: true,
    notes: 'Phase 1 - Available Now',
  },
  {
    id: 18,
    label: 'Lot 18',
    status: 'available',
    polygon: [],
    acreage: 15.40,
    zoning: 'R-1',
    premium: 385000,
    phase: 1,
    availability: 'Now',
    requiresWellSeptic: true,
    notes: 'Phase 1 - Large estate lot (15+ acres) - Available Now',
  },
];
