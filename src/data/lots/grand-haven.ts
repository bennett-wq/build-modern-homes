/**
 * LOT DATA FILE - Grand Haven
 * 
 * This file contains lot data for the Grand Haven development.
 * 
 * HOW TO UPDATE LOT DATA:
 * 1. Update the status of existing lots as they are reserved or sold
 * 2. Add new lots by adding objects to the `lots` array
 * 
 * HOW TO ADD REAL LOT COORDINATES:
 * The `position` field uses percentage-based coordinates (0-100) relative to the site plan image.
 * - position.x: percentage from left edge (0 = left, 100 = right)
 * - position.y: percentage from top edge (0 = top, 100 = bottom)
 * 
 * For more precise lot boundaries, you can add a `polygon` field with an array of coordinate pairs:
 * polygon: [
 *   { x: 10, y: 20 },
 *   { x: 15, y: 20 },
 *   { x: 15, y: 30 },
 *   { x: 10, y: 30 }
 * ]
 * 
 * To get accurate coordinates:
 * 1. Open your site plan image in an image editor
 * 2. Note the image dimensions (width x height)
 * 3. For each lot center or corner, calculate: (pixel position / dimension) * 100
 * 4. Update the position or polygon values accordingly
 */

export type LotStatus = 'available' | 'reserved' | 'sold';

export interface Lot {
  id: string;
  number: number;
  status: LotStatus;
  /** Percentage-based position for pin placement (x: 0-100, y: 0-100) */
  position: { x: number; y: number };
  /** Optional: lot acreage */
  acres?: number;
  /** Optional: lot price (if sold separately from home) */
  price?: number;
  /** Optional: premium lot features */
  features?: string[];
  /** Optional: polygon coordinates for precise lot boundaries */
  polygon?: { x: number; y: number }[];
}

export const grandHavenLots: Lot[] = [
  // Row 1 - North side of development
  {
    id: "gh-lot-1",
    number: 1,
    status: "sold",
    position: { x: 15, y: 20 },
    acres: 0.25,
    features: ["Corner lot", "Extra privacy"]
  },
  {
    id: "gh-lot-2",
    number: 2,
    status: "sold",
    position: { x: 25, y: 20 },
    acres: 0.22
  },
  {
    id: "gh-lot-3",
    number: 3,
    status: "reserved",
    position: { x: 35, y: 20 },
    acres: 0.22
  },
  {
    id: "gh-lot-4",
    number: 4,
    status: "available",
    position: { x: 45, y: 20 },
    acres: 0.24,
    features: ["Premium lot", "Wooded backyard"]
  },
  {
    id: "gh-lot-5",
    number: 5,
    status: "available",
    position: { x: 55, y: 20 },
    acres: 0.23
  },
  
  // Row 2 - Middle section
  {
    id: "gh-lot-6",
    number: 6,
    status: "available",
    position: { x: 15, y: 45 },
    acres: 0.26,
    features: ["Corner lot"]
  },
  {
    id: "gh-lot-7",
    number: 7,
    status: "available",
    position: { x: 25, y: 45 },
    acres: 0.21
  },
  {
    id: "gh-lot-8",
    number: 8,
    status: "reserved",
    position: { x: 35, y: 45 },
    acres: 0.22
  },
  {
    id: "gh-lot-9",
    number: 9,
    status: "available",
    position: { x: 45, y: 45 },
    acres: 0.22
  },
  {
    id: "gh-lot-10",
    number: 10,
    status: "available",
    position: { x: 55, y: 45 },
    acres: 0.25,
    features: ["Premium lot", "Near green space"]
  },
  
  // Row 3 - South side
  {
    id: "gh-lot-11",
    number: 11,
    status: "available",
    position: { x: 15, y: 70 },
    acres: 0.24
  },
  {
    id: "gh-lot-12",
    number: 12,
    status: "available",
    position: { x: 25, y: 70 },
    acres: 0.23
  },
  {
    id: "gh-lot-13",
    number: 13,
    status: "available",
    position: { x: 35, y: 70 },
    acres: 0.22
  },
  {
    id: "gh-lot-14",
    number: 14,
    status: "available",
    position: { x: 45, y: 70 },
    acres: 0.22
  },
  {
    id: "gh-lot-15",
    number: 15,
    status: "available",
    position: { x: 55, y: 70 },
    acres: 0.28,
    features: ["Corner lot", "Largest lot"]
  }
];

/**
 * Get lot by ID
 */
export function getLotById(id: string): Lot | undefined {
  return grandHavenLots.find(lot => lot.id === id);
}

/**
 * Get lots by status
 */
export function getLotsByStatus(status: LotStatus): Lot[] {
  return grandHavenLots.filter(lot => lot.status === status);
}

/**
 * Get lot availability summary
 */
export function getLotSummary(): { available: number; reserved: number; sold: number; total: number } {
  return {
    available: grandHavenLots.filter(l => l.status === 'available').length,
    reserved: grandHavenLots.filter(l => l.status === 'reserved').length,
    sold: grandHavenLots.filter(l => l.status === 'sold').length,
    total: grandHavenLots.length
  };
}
