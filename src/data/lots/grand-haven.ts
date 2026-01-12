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
}

// Lot data for Grand Haven development
// Polygons will be defined using the editor mode at ?edit=1
export const grandHavenLots: Lot[] = [
  {
    id: 1,
    label: 'Lot 1',
    status: 'available',
    polygon: [],
    acreage: 3.06,
    netAcreage: 2.19,
    zoning: 'R-1',
  },
  {
    id: 2,
    label: 'Lot 2',
    status: 'available',
    polygon: [],
    acreage: 2.03,
    netAcreage: 1.91,
    zoning: 'R-1',
  },
  {
    id: 3,
    label: 'Lot 3',
    status: 'available',
    polygon: [],
    acreage: 1.97,
    netAcreage: 1.86,
    zoning: 'R-1',
  },
  {
    id: 4,
    label: 'Lot 4',
    status: 'available',
    polygon: [],
    acreage: 1.52,
    netAcreage: 1.43,
    zoning: 'R-1',
  },
  {
    id: 5,
    label: 'Lot 5',
    status: 'reserved',
    polygon: [],
    acreage: 2.03,
    netAcreage: 1.91,
    zoning: 'R-1',
  },
  {
    id: 6,
    label: 'Lot 6',
    status: 'available',
    polygon: [],
    acreage: 1.98,
    netAcreage: 1.86,
    zoning: 'R-1',
  },
  {
    id: 7,
    label: 'Lot 7',
    status: 'available',
    polygon: [],
    acreage: 1.93,
    netAcreage: 1.81,
    zoning: 'R-1',
  },
  {
    id: 8,
    label: 'Lot 8',
    status: 'available',
    polygon: [],
    acreage: 1.96,
    netAcreage: 1.84,
    zoning: 'R-1',
  },
  {
    id: 9,
    label: 'Lot 9',
    status: 'sold',
    polygon: [],
    acreage: 2.45,
    netAcreage: 2.33,
    zoning: 'R-1',
  },
  {
    id: 10,
    label: 'Lot 10',
    status: 'available',
    polygon: [],
    acreage: 2.34,
    netAcreage: 2.27,
    zoning: 'R-1',
  },
  {
    id: 11,
    label: 'Lot 11',
    status: 'available',
    polygon: [],
    acreage: 2.31,
    netAcreage: 2.21,
    zoning: 'R-1',
  },
  {
    id: 12,
    label: 'Lot 12',
    status: 'available',
    polygon: [],
    acreage: 32.09,
    netAcreage: 31.38,
    zoning: 'R-1',
  },
  {
    id: 13,
    label: 'Lot 13',
    status: 'available',
    polygon: [],
    acreage: 18.16,
    netAcreage: 17.59,
    zoning: 'R-1',
  },
  {
    id: 14,
    label: 'Lot 14',
    status: 'available',
    polygon: [],
    acreage: 67.53,
    netAcreage: 65.66,
    zoning: 'I-2',
  },
  {
    id: 15,
    label: 'Lot 15',
    status: 'available',
    polygon: [],
    acreage: 2.47,
    netAcreage: 2.35,
    zoning: 'R-1',
  },
  {
    id: 16,
    label: 'Lot 16',
    status: 'available',
    polygon: [],
    acreage: 2.48,
    netAcreage: 2.34,
    zoning: 'R-1',
  },
  {
    id: 17,
    label: 'Lot 17',
    status: 'available',
    polygon: [],
    acreage: 2.44,
    netAcreage: 2.32,
    zoning: 'R-1',
  },
  {
    id: 18,
    label: 'Lot 18',
    status: 'available',
    polygon: [],
    acreage: 15.94,
    netAcreage: 15.27,
    zoning: 'R-1',
  },
];
