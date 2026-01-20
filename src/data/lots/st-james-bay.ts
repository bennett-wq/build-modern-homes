// St. James Bay lot data - placeholder lots until official numbering available
// Uses the same Lot type from grand-haven for consistency

import { Lot, LotStatus } from './grand-haven';

// Generate placeholder lots for St. James Bay
// Easy to edit once official lot data is available
function generateStJamesBayLots(count: number): Lot[] {
  return Array.from({ length: count }, (_, i) => {
    const lotNumber = (i + 1).toString().padStart(3, '0');
    return {
      id: i + 1,
      label: `SJB-${lotNumber}`,
      status: 'available' as LotStatus,
      polygon: [], // No polygons until site plan is mapped
      notes: 'Lot availability subject to change.',
    };
  });
}

// Generate 80 placeholder lots for St. James Bay
export const stJamesBayLots: Lot[] = generateStJamesBayLots(80);
