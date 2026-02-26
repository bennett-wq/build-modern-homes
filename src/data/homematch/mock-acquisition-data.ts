// Mock data for Tab 3 — Acquisition Intelligence prototype
// Simulates 50 expired/withdrawn vacant land listings across 5 municipalities

export interface MockMlsListing {
  id: string;
  mls_number: string;
  status: 'expired' | 'withdrawn' | 'canceled';
  address: string;
  city: string;
  state: string;
  zip_code: string;
  county: string;
  municipality: string;
  latitude: number;
  longitude: number;
  lot_acres: number;
  lot_sqft: number;
  frontage_ft: number;
  depth_ft: number;
  list_price: number;
  original_list_price: number;
  days_on_market: number;
  list_date: string;
  expiration_date: string;
  listing_agent_name: string;
  listing_office: string;
  coop_commission: string;
  water: string;
  sewer: string;
  electric: boolean;
  gas: string;
  topography: string;
  description: string;
}

export interface MockModelFit {
  listing_id: string;
  model_slug: string;
  model_name: string;
  build_type: string;
  fit_status: 'fits' | 'tight_fit' | 'no_fit';
  fit_reason: string | null;
  width_margin_ft: number;
  depth_margin_ft: number;
  coverage_pct: number;
  lot_price: number;
  home_price: number;
  site_work_low: number;
  site_work_high: number;
  total_delivered_low: number;
  total_delivered_high: number;
  zoning_confidence: string;
}

export interface MockAcquisitionScore {
  listing_id: string;
  total_score: number;
  seller_motivation_score: number;
  lot_viability_score: number;
  margin_potential_score: number;
  market_strength_score: number;
  score_factors: {
    seller_motivation: Record<string, unknown>;
    lot_viability: Record<string, unknown>;
    margin_potential: Record<string, unknown>;
    market_strength: Record<string, unknown>;
  };
  recommended_action: 'acquire_direct' | 'contact_seller' | 'monitor' | 'pass';
  recommended_offer: number | null;
  review_status: 'unreviewed' | 'reviewing' | 'approved' | 'passed' | 'acquired';
  notes: string;
}

export interface MockZoningDistrict {
  municipality: string;
  district_code: string;
  district_name: string;
  min_lot_width_ft: number;
  min_lot_depth_ft: number;
  min_lot_area_sqft: number;
  front_setback_ft: number;
  side_setback_ft: number;
  rear_setback_ft: number;
  max_lot_coverage_pct: number;
  max_height_ft: number;
  confidence: string;
}

// ─────────────────────────────────────────
// ZONING DATA (5 municipalities)
// ─────────────────────────────────────────

export const mockZoningDistricts: MockZoningDistrict[] = [
  {
    municipality: 'Ypsilanti Township',
    district_code: 'R-1',
    district_name: 'Single Family Residential',
    min_lot_width_ft: 60,
    min_lot_depth_ft: 120,
    min_lot_area_sqft: 7200,
    front_setback_ft: 25,
    side_setback_ft: 5,
    rear_setback_ft: 30,
    max_lot_coverage_pct: 35,
    max_height_ft: 35,
    confidence: 'verified',
  },
  {
    municipality: 'Ypsilanti Township',
    district_code: 'R-4',
    district_name: 'Multiple Family Residential',
    min_lot_width_ft: 50,
    min_lot_depth_ft: 100,
    min_lot_area_sqft: 5000,
    front_setback_ft: 25,
    side_setback_ft: 5,
    rear_setback_ft: 25,
    max_lot_coverage_pct: 40,
    max_height_ft: 35,
    confidence: 'verified',
  },
  {
    municipality: 'Wyoming',
    district_code: 'R-1',
    district_name: 'Single Family Residential',
    min_lot_width_ft: 66,
    min_lot_depth_ft: 120,
    min_lot_area_sqft: 8712,
    front_setback_ft: 25,
    side_setback_ft: 5,
    rear_setback_ft: 30,
    max_lot_coverage_pct: 35,
    max_height_ft: 35,
    confidence: 'verified',
  },
  {
    municipality: 'Byron Township',
    district_code: 'R-1',
    district_name: 'Single Family Residential',
    min_lot_width_ft: 100,
    min_lot_depth_ft: 150,
    min_lot_area_sqft: 20000,
    front_setback_ft: 30,
    side_setback_ft: 10,
    rear_setback_ft: 35,
    max_lot_coverage_pct: 30,
    max_height_ft: 35,
    confidence: 'ai_parsed',
  },
  {
    municipality: 'Georgetown Township',
    district_code: 'R-1',
    district_name: 'Single Family Residential',
    min_lot_width_ft: 80,
    min_lot_depth_ft: 130,
    min_lot_area_sqft: 12000,
    front_setback_ft: 30,
    side_setback_ft: 8,
    rear_setback_ft: 30,
    max_lot_coverage_pct: 35,
    max_height_ft: 35,
    confidence: 'ai_parsed',
  },
  {
    municipality: 'Grand Haven',
    district_code: 'R-1',
    district_name: 'Single Family Residential',
    min_lot_width_ft: 70,
    min_lot_depth_ft: 120,
    min_lot_area_sqft: 9600,
    front_setback_ft: 25,
    side_setback_ft: 7,
    rear_setback_ft: 30,
    max_lot_coverage_pct: 35,
    max_height_ft: 35,
    confidence: 'verified',
  },
];

// ─────────────────────────────────────────
// 50 MOCK LISTINGS
// ─────────────────────────────────────────

export const mockListings: MockMlsListing[] = [
  // Ypsilanti Township (12 listings)
  { id: 'lot-001', mls_number: 'MLS-20240812-001', status: 'expired', address: '4521 Textile Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48197', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2223, longitude: -83.6129, lot_acres: 0.38, lot_sqft: 16553, frontage_ft: 88, depth_ft: 188, list_price: 42000, original_list_price: 55000, days_on_market: 245, list_date: '2024-02-15', expiration_date: '2024-10-18', listing_agent_name: 'Maria Santos', listing_office: 'RE/MAX Platinum', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Buildable residential lot with all utilities at street. Previously had home that was demolished.' },
  { id: 'lot-002', mls_number: 'MLS-20240315-002', status: 'expired', address: '1847 Grove Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48198', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2301, longitude: -83.6244, lot_acres: 0.52, lot_sqft: 22651, frontage_ft: 130, depth_ft: 174, list_price: 38000, original_list_price: 48000, days_on_market: 312, list_date: '2023-10-05', expiration_date: '2024-08-12', listing_agent_name: 'James Mitchell', listing_office: 'Keller Williams', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Large corner lot with 130ft frontage. Land division potential. Quiet residential street.' },
  { id: 'lot-003', mls_number: 'MLS-20240601-003', status: 'withdrawn', address: '2290 Packard Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48197', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2415, longitude: -83.6087, lot_acres: 0.31, lot_sqft: 13504, frontage_ft: 75, depth_ft: 180, list_price: 35000, original_list_price: 35000, days_on_market: 89, list_date: '2024-06-01', expiration_date: '2024-08-29', listing_agent_name: 'Linda Chen', listing_office: 'Howard Hanna', coop_commission: '2.5%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Vacant residential lot on busy corridor. Zoned R-1. All utilities available.' },
  { id: 'lot-004', mls_number: 'MLS-20230901-004', status: 'expired', address: '5102 Whittaker Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48197', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2089, longitude: -83.5982, lot_acres: 1.2, lot_sqft: 52272, frontage_ft: 200, depth_ft: 261, list_price: 65000, original_list_price: 85000, days_on_market: 420, list_date: '2023-05-10', expiration_date: '2024-07-03', listing_agent_name: 'Robert Hayes', listing_office: 'Century 21', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'propane', topography: 'gentle_slope', description: 'Over an acre on Whittaker Rd. Well and septic required. Multiple price reductions. Motivated seller.' },
  { id: 'lot-005', mls_number: 'MLS-20240401-005', status: 'expired', address: '3780 Holmes Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48198', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2178, longitude: -83.6301, lot_acres: 0.25, lot_sqft: 10890, frontage_ft: 66, depth_ft: 165, list_price: 29000, original_list_price: 34000, days_on_market: 198, list_date: '2024-04-01', expiration_date: '2024-10-16', listing_agent_name: 'Susan Park', listing_office: 'Coldwell Banker', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Affordable buildable lot in established neighborhood. Utilities at street. Ready to build.' },
  { id: 'lot-006', mls_number: 'MLS-20240520-006', status: 'expired', address: '1955 Prospect Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48198', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2356, longitude: -83.6155, lot_acres: 0.44, lot_sqft: 19166, frontage_ft: 100, depth_ft: 192, list_price: 45000, original_list_price: 52000, days_on_market: 167, list_date: '2024-05-20', expiration_date: '2024-11-03', listing_agent_name: 'David Rodriguez', listing_office: 'RE/MAX Platinum', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Near BMH Prospect Rd project. Wide frontage allows land division potential.' },
  { id: 'lot-007', mls_number: 'MLS-20231115-007', status: 'expired', address: '6201 Rawsonville Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48198', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.1945, longitude: -83.6412, lot_acres: 0.82, lot_sqft: 35719, frontage_ft: 150, depth_ft: 238, list_price: 55000, original_list_price: 70000, days_on_market: 365, list_date: '2023-11-15', expiration_date: '2024-11-14', listing_agent_name: 'Karen Williams', listing_office: 'Berkshire Hathaway', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Large lot with excellent land division potential. 150ft frontage. Price reduced significantly.' },
  { id: 'lot-008', mls_number: 'MLS-20240710-008', status: 'withdrawn', address: '3245 Tyler Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48197', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2067, longitude: -83.6033, lot_acres: 0.29, lot_sqft: 12632, frontage_ft: 72, depth_ft: 175, list_price: 32000, original_list_price: 32000, days_on_market: 45, list_date: '2024-07-10', expiration_date: '2024-08-24', listing_agent_name: 'Tom Baker', listing_office: 'Keller Williams', coop_commission: '2.5%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Residential lot withdrawn by seller. May relist in spring.' },
  { id: 'lot-009', mls_number: 'MLS-20240205-009', status: 'expired', address: '4890 Bemis Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48197', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2290, longitude: -83.5878, lot_acres: 0.35, lot_sqft: 15246, frontage_ft: 82, depth_ft: 186, list_price: 36000, original_list_price: 42000, days_on_market: 275, list_date: '2024-02-05', expiration_date: '2024-11-06', listing_agent_name: 'Amy Foster', listing_office: 'Howard Hanna', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Good residential lot on quiet street. Previous buyer financing fell through.' },
  { id: 'lot-010', mls_number: 'MLS-20240901-010', status: 'expired', address: '2710 Ecorse Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48198', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2134, longitude: -83.6200, lot_acres: 0.22, lot_sqft: 9583, frontage_ft: 60, depth_ft: 160, list_price: 25000, original_list_price: 28000, days_on_market: 135, list_date: '2024-09-01', expiration_date: '2025-01-14', listing_agent_name: 'Mike Johnson', listing_office: 'Century 21', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Compact lot on Ecorse. Minimum width for single-family. Great price point.' },
  { id: 'lot-011', mls_number: 'MLS-20240315-011', status: 'expired', address: '5560 Michigan Ave', city: 'Ypsilanti', state: 'MI', zip_code: '48197', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2256, longitude: -83.6078, lot_acres: 0.48, lot_sqft: 20909, frontage_ft: 110, depth_ft: 190, list_price: 48000, original_list_price: 60000, days_on_market: 290, list_date: '2024-03-15', expiration_date: '2024-12-30', listing_agent_name: 'Patricia Lee', listing_office: 'RE/MAX', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Commercial corridor lot with residential zoning behind. Large frontage. Multiple price drops.' },
  { id: 'lot-012', mls_number: 'MLS-20240625-012', status: 'withdrawn', address: '1320 S Harris Rd', city: 'Ypsilanti', state: 'MI', zip_code: '48198', county: 'Washtenaw', municipality: 'Ypsilanti Township', latitude: 42.2345, longitude: -83.6356, lot_acres: 0.33, lot_sqft: 14375, frontage_ft: 78, depth_ft: 184, list_price: 33000, original_list_price: 38000, days_on_market: 120, list_date: '2024-06-25', expiration_date: '2024-10-23', listing_agent_name: 'Steve Clark', listing_office: 'Coldwell Banker', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Withdrawn after no offers. Seller considering lease option. Good buildable lot.' },

  // Wyoming, Kent County (10 listings)
  { id: 'lot-013', mls_number: 'MLS-20240301-013', status: 'expired', address: '2840 Byron Center Ave SW', city: 'Wyoming', state: 'MI', zip_code: '49519', county: 'Kent', municipality: 'Wyoming', latitude: 42.8712, longitude: -85.7234, lot_acres: 0.30, lot_sqft: 13068, frontage_ft: 80, depth_ft: 163, list_price: 45000, original_list_price: 52000, days_on_market: 210, list_date: '2024-03-01', expiration_date: '2024-09-27', listing_agent_name: 'Jennifer Adams', listing_office: 'Greenridge Realty', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Prime residential lot in Wyoming. 80ft frontage meets R-1 zoning. Motivated seller.' },
  { id: 'lot-014', mls_number: 'MLS-20240115-014', status: 'expired', address: '1575 44th St SW', city: 'Wyoming', state: 'MI', zip_code: '49509', county: 'Kent', municipality: 'Wyoming', latitude: 42.8856, longitude: -85.7145, lot_acres: 0.42, lot_sqft: 18295, frontage_ft: 100, depth_ft: 183, list_price: 55000, original_list_price: 65000, days_on_market: 280, list_date: '2024-01-15', expiration_date: '2024-10-21', listing_agent_name: 'Brian Thompson', listing_office: 'Keller Williams GR', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Spacious lot on 44th St. Land division possible with 100ft frontage. Growing neighborhood.' },
  { id: 'lot-015', mls_number: 'MLS-20240501-015', status: 'expired', address: '3210 Clyde Park Ave SW', city: 'Wyoming', state: 'MI', zip_code: '49509', county: 'Kent', municipality: 'Wyoming', latitude: 42.8923, longitude: -85.7312, lot_acres: 0.28, lot_sqft: 12197, frontage_ft: 70, depth_ft: 174, list_price: 38000, original_list_price: 42000, days_on_market: 165, list_date: '2024-05-01', expiration_date: '2024-10-13', listing_agent_name: 'Sarah Miller', listing_office: 'Five Star Real Estate', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Solid buildable lot on Clyde Park. Near schools and shopping. City utilities at curb.' },
  { id: 'lot-016', mls_number: 'MLS-20240620-016', status: 'withdrawn', address: '4455 Division Ave S', city: 'Wyoming', state: 'MI', zip_code: '49548', county: 'Kent', municipality: 'Wyoming', latitude: 42.8634, longitude: -85.6789, lot_acres: 0.35, lot_sqft: 15246, frontage_ft: 85, depth_ft: 179, list_price: 42000, original_list_price: 42000, days_on_market: 75, list_date: '2024-06-20', expiration_date: '2024-09-03', listing_agent_name: 'Mark Wilson', listing_office: 'Greenridge Realty', coop_commission: '2.5%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Withdrawn by seller to wait for better market. Well-located lot on Division.' },
  { id: 'lot-017', mls_number: 'MLS-20231201-017', status: 'expired', address: '2190 Burlingame Ave SW', city: 'Wyoming', state: 'MI', zip_code: '49509', county: 'Kent', municipality: 'Wyoming', latitude: 42.8801, longitude: -85.7089, lot_acres: 0.33, lot_sqft: 14375, frontage_ft: 76, depth_ft: 189, list_price: 40000, original_list_price: 50000, days_on_market: 330, list_date: '2023-12-01', expiration_date: '2024-10-26', listing_agent_name: 'Chris Anderson', listing_office: 'RE/MAX of GR', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Long-listed lot. Three price reductions. Owner inherited property. Highly motivated.' },
  { id: 'lot-018', mls_number: 'MLS-20240801-018', status: 'expired', address: '5520 Gezon Pkwy SW', city: 'Wyoming', state: 'MI', zip_code: '49548', county: 'Kent', municipality: 'Wyoming', latitude: 42.8545, longitude: -85.7278, lot_acres: 0.26, lot_sqft: 11326, frontage_ft: 66, depth_ft: 172, list_price: 35000, original_list_price: 38000, days_on_market: 120, list_date: '2024-08-01', expiration_date: '2024-11-29', listing_agent_name: 'Laura Davis', listing_office: 'Century 21', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Minimum-width R-1 lot near retail corridor. Affordable entry point.' },
  { id: 'lot-019', mls_number: 'MLS-20240415-019', status: 'expired', address: '3890 Prairie St SW', city: 'Wyoming', state: 'MI', zip_code: '49519', county: 'Kent', municipality: 'Wyoming', latitude: 42.8767, longitude: -85.7190, lot_acres: 0.55, lot_sqft: 23958, frontage_ft: 132, depth_ft: 182, list_price: 68000, original_list_price: 78000, days_on_market: 225, list_date: '2024-04-15', expiration_date: '2024-11-25', listing_agent_name: 'Tony Garcia', listing_office: 'Keller Williams GR', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Premium lot with 132ft frontage. Clear land division into 2 lots. Estate sale — heirs motivated.' },
  { id: 'lot-020', mls_number: 'MLS-20240210-020', status: 'expired', address: '1245 36th St SW', city: 'Wyoming', state: 'MI', zip_code: '49509', county: 'Kent', municipality: 'Wyoming', latitude: 42.8890, longitude: -85.7067, lot_acres: 0.31, lot_sqft: 13504, frontage_ft: 74, depth_ft: 182, list_price: 41000, original_list_price: 46000, days_on_market: 255, list_date: '2024-02-10', expiration_date: '2024-10-22', listing_agent_name: 'Rachel Kim', listing_office: 'Howard Hanna', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Good lot on 36th. Near schools. Two price reductions — seller wants to move.' },
  { id: 'lot-021', mls_number: 'MLS-20240905-021', status: 'expired', address: '6070 Michael Ave SW', city: 'Wyoming', state: 'MI', zip_code: '49548', county: 'Kent', municipality: 'Wyoming', latitude: 42.8490, longitude: -85.7345, lot_acres: 0.27, lot_sqft: 11761, frontage_ft: 68, depth_ft: 173, list_price: 34000, original_list_price: 36000, days_on_market: 100, list_date: '2024-09-05', expiration_date: '2024-12-14', listing_agent_name: 'Dan Brown', listing_office: 'Five Star', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Affordable residential lot. Quick build potential. Clean and level.' },
  { id: 'lot-022', mls_number: 'MLS-20240105-022', status: 'expired', address: '2560 Porter St SW', city: 'Wyoming', state: 'MI', zip_code: '49519', county: 'Kent', municipality: 'Wyoming', latitude: 42.8678, longitude: -85.7156, lot_acres: 0.40, lot_sqft: 17424, frontage_ft: 96, depth_ft: 181, list_price: 52000, original_list_price: 62000, days_on_market: 310, list_date: '2024-01-05', expiration_date: '2024-11-10', listing_agent_name: 'Emily Watson', listing_office: 'Greenridge Realty', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Large corner lot on quiet street. Near parks. Long market exposure — priced aggressively now.' },

  // Byron Township (8 listings)
  { id: 'lot-023', mls_number: 'MLS-20240301-023', status: 'expired', address: '8820 Byron Center Ave SW', city: 'Byron Center', state: 'MI', zip_code: '49315', county: 'Kent', municipality: 'Byron Township', latitude: 42.8123, longitude: -85.7234, lot_acres: 0.72, lot_sqft: 31363, frontage_ft: 130, depth_ft: 241, list_price: 72000, original_list_price: 85000, days_on_market: 245, list_date: '2024-03-01', expiration_date: '2024-11-01', listing_agent_name: 'John Peters', listing_office: 'Berkshire Hathaway', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'natural', topography: 'gentle_slope', description: 'Nice lot in Byron Township. Well and septic needed. Country setting with easy access.' },
  { id: 'lot-024', mls_number: 'MLS-20240510-024', status: 'expired', address: '950 84th St SW', city: 'Byron Center', state: 'MI', zip_code: '49315', county: 'Kent', municipality: 'Byron Township', latitude: 42.8056, longitude: -85.7312, lot_acres: 1.1, lot_sqft: 47916, frontage_ft: 175, depth_ft: 274, list_price: 85000, original_list_price: 95000, days_on_market: 190, list_date: '2024-05-10', expiration_date: '2024-11-16', listing_agent_name: 'Nancy Taylor', listing_office: 'Coldwell Banker', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'natural', topography: 'flat', description: 'Over an acre in growing Byron area. Great for estate-style home. Beautiful setting.' },
  { id: 'lot-025', mls_number: 'MLS-20240715-025', status: 'withdrawn', address: '2380 76th St SW', city: 'Byron Center', state: 'MI', zip_code: '49315', county: 'Kent', municipality: 'Byron Township', latitude: 42.8189, longitude: -85.7189, lot_acres: 0.58, lot_sqft: 25265, frontage_ft: 120, depth_ft: 211, list_price: 62000, original_list_price: 62000, days_on_market: 60, list_date: '2024-07-15', expiration_date: '2024-09-13', listing_agent_name: 'Greg Hall', listing_office: 'Keller Williams', coop_commission: '2.5%', water: 'well', sewer: 'septic', electric: true, gas: 'propane', topography: 'flat', description: 'Withdrawn — seller testing market. Good lot in desirable school district.' },
  { id: 'lot-026', mls_number: 'MLS-20231001-026', status: 'expired', address: '7445 Homerich Ave SW', city: 'Byron Center', state: 'MI', zip_code: '49315', county: 'Kent', municipality: 'Byron Township', latitude: 42.8234, longitude: -85.7267, lot_acres: 0.95, lot_sqft: 41382, frontage_ft: 165, depth_ft: 251, list_price: 78000, original_list_price: 105000, days_on_market: 400, list_date: '2023-10-01', expiration_date: '2024-11-04', listing_agent_name: 'Carol Wright', listing_office: 'RE/MAX', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'natural', topography: 'gentle_slope', description: 'Nearly an acre. Significant price reductions. Owner relocated out of state — highly motivated.' },
  { id: 'lot-027', mls_number: 'MLS-20240601-027', status: 'expired', address: '1120 Burlingame Ave SW', city: 'Byron Center', state: 'MI', zip_code: '49315', county: 'Kent', municipality: 'Byron Township', latitude: 42.8167, longitude: -85.7090, lot_acres: 0.65, lot_sqft: 28314, frontage_ft: 135, depth_ft: 210, list_price: 65000, original_list_price: 72000, days_on_market: 175, list_date: '2024-06-01', expiration_date: '2024-11-23', listing_agent_name: 'Jeff Moore', listing_office: 'Five Star', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'natural', topography: 'flat', description: 'Beautiful building site in Byron. Mature trees on rear. Nice neighborhood.' },
  { id: 'lot-028', mls_number: 'MLS-20240820-028', status: 'expired', address: '3560 100th St SE', city: 'Byron Center', state: 'MI', zip_code: '49315', county: 'Kent', municipality: 'Byron Township', latitude: 42.7945, longitude: -85.6845, lot_acres: 2.1, lot_sqft: 91476, frontage_ft: 250, depth_ft: 366, list_price: 120000, original_list_price: 145000, days_on_market: 150, list_date: '2024-08-20', expiration_date: '2025-01-17', listing_agent_name: 'Paul Martinez', listing_office: 'Greenridge', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'propane', topography: 'flat', description: '2+ acres with massive land division potential. Could yield 2-3 lots at R-1 minimums. Premium location.' },
  { id: 'lot-029', mls_number: 'MLS-20240401-029', status: 'expired', address: '6780 Gladiola Ave SW', city: 'Byron Center', state: 'MI', zip_code: '49315', county: 'Kent', municipality: 'Byron Township', latitude: 42.8089, longitude: -85.7156, lot_acres: 0.55, lot_sqft: 23958, frontage_ft: 115, depth_ft: 208, list_price: 58000, original_list_price: 64000, days_on_market: 220, list_date: '2024-04-01', expiration_date: '2024-11-07', listing_agent_name: 'Lisa Brown', listing_office: 'Century 21', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'natural', topography: 'flat', description: 'Nice lot in established area. Byron Center schools. Well and septic needed.' },
  { id: 'lot-030', mls_number: 'MLS-20240915-030', status: 'expired', address: '4490 Ivanrest Ave SW', city: 'Byron Center', state: 'MI', zip_code: '49315', county: 'Kent', municipality: 'Byron Township', latitude: 42.8145, longitude: -85.7412, lot_acres: 0.80, lot_sqft: 34848, frontage_ft: 140, depth_ft: 249, list_price: 70000, original_list_price: 75000, days_on_market: 95, list_date: '2024-09-15', expiration_date: '2024-12-19', listing_agent_name: 'Scott Davis', listing_office: 'Berkshire Hathaway', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'natural', topography: 'flat', description: 'Large lot on Ivanrest. Room for bigger home + outbuilding. Close to Byron Center downtown.' },

  // Georgetown Township (10 listings)
  { id: 'lot-031', mls_number: 'MLS-20240220-031', status: 'expired', address: '4560 Baldwin St', city: 'Jenison', state: 'MI', zip_code: '49428', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.9045, longitude: -85.8312, lot_acres: 0.34, lot_sqft: 14810, frontage_ft: 85, depth_ft: 174, list_price: 52000, original_list_price: 60000, days_on_market: 260, list_date: '2024-02-20', expiration_date: '2024-11-06', listing_agent_name: 'Amy Collins', listing_office: 'Keller Williams Lakeshore', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Georgetown lot with city utilities. Jenison schools. Price reduced — seller motivated.' },
  { id: 'lot-032', mls_number: 'MLS-20240410-032', status: 'expired', address: '7890 20th Ave', city: 'Jenison', state: 'MI', zip_code: '49428', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.9112, longitude: -85.8234, lot_acres: 0.45, lot_sqft: 19602, frontage_ft: 105, depth_ft: 187, list_price: 65000, original_list_price: 72000, days_on_market: 195, list_date: '2024-04-10', expiration_date: '2024-10-22', listing_agent_name: 'Bob Fisher', listing_office: 'RE/MAX Lakeshore', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Good-size lot on 20th Ave. Potential for land division. Near shopping and schools.' },
  { id: 'lot-033', mls_number: 'MLS-20240615-033', status: 'withdrawn', address: '3120 Chicago Dr', city: 'Hudsonville', state: 'MI', zip_code: '49426', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.8978, longitude: -85.8456, lot_acres: 0.38, lot_sqft: 16553, frontage_ft: 90, depth_ft: 184, list_price: 55000, original_list_price: 55000, days_on_market: 70, list_date: '2024-06-15', expiration_date: '2024-08-24', listing_agent_name: 'Diana Ross', listing_office: 'Five Star', coop_commission: '2.5%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Chicago Dr lot near Hudsonville. Withdrawn after 70 days — may relist.' },
  { id: 'lot-034', mls_number: 'MLS-20231115-034', status: 'expired', address: '5670 Port Sheldon St', city: 'Hudsonville', state: 'MI', zip_code: '49426', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.9234, longitude: -85.8378, lot_acres: 0.50, lot_sqft: 21780, frontage_ft: 110, depth_ft: 198, list_price: 70000, original_list_price: 90000, days_on_market: 350, list_date: '2023-11-15', expiration_date: '2024-10-30', listing_agent_name: 'Kevin Lee', listing_office: 'Greenridge', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Premium lot in desirable area. Massive price reduction from $90K to $70K. Motivated estate sale.' },
  { id: 'lot-035', mls_number: 'MLS-20240305-035', status: 'expired', address: '2345 Bauer Rd', city: 'Jenison', state: 'MI', zip_code: '49428', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.9156, longitude: -85.8289, lot_acres: 0.62, lot_sqft: 27007, frontage_ft: 125, depth_ft: 216, list_price: 75000, original_list_price: 82000, days_on_market: 235, list_date: '2024-03-05', expiration_date: '2024-10-25', listing_agent_name: 'Sandra Green', listing_office: 'Coldwell Banker', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'natural', topography: 'gentle_slope', description: 'Larger lot on Bauer. Well and septic. Land division to 2 lots may be possible.' },
  { id: 'lot-036', mls_number: 'MLS-20240720-036', status: 'expired', address: '8910 48th Ave', city: 'Hudsonville', state: 'MI', zip_code: '49426', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.9089, longitude: -85.8512, lot_acres: 0.40, lot_sqft: 17424, frontage_ft: 95, depth_ft: 183, list_price: 58000, original_list_price: 62000, days_on_market: 140, list_date: '2024-07-20', expiration_date: '2024-12-07', listing_agent_name: 'Todd Martin', listing_office: 'Keller Williams', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Clean lot near Hudsonville. Good school district. Utilities available.' },
  { id: 'lot-037', mls_number: 'MLS-20240505-037', status: 'expired', address: '1780 Cottonwood Dr', city: 'Jenison', state: 'MI', zip_code: '49428', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.9023, longitude: -85.8145, lot_acres: 0.32, lot_sqft: 13939, frontage_ft: 80, depth_ft: 174, list_price: 48000, original_list_price: 53000, days_on_market: 200, list_date: '2024-05-05', expiration_date: '2024-11-21', listing_agent_name: 'Robin Young', listing_office: 'Howard Hanna', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Jenison lot in established subdivision. Cul-de-sac location. Desirable neighborhood.' },
  { id: 'lot-038', mls_number: 'MLS-20240830-038', status: 'expired', address: '6230 Warner St', city: 'Hudsonville', state: 'MI', zip_code: '49426', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.9178, longitude: -85.8423, lot_acres: 0.37, lot_sqft: 16117, frontage_ft: 88, depth_ft: 183, list_price: 56000, original_list_price: 59000, days_on_market: 110, list_date: '2024-08-30', expiration_date: '2024-12-18', listing_agent_name: 'Alex Turner', listing_office: 'RE/MAX', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Good residential lot on Warner. Hudsonville schools. Close to amenities.' },
  { id: 'lot-039', mls_number: 'MLS-20240125-039', status: 'expired', address: '4090 School Ave', city: 'Hudsonville', state: 'MI', zip_code: '49426', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.9001, longitude: -85.8367, lot_acres: 0.29, lot_sqft: 12632, frontage_ft: 80, depth_ft: 158, list_price: 45000, original_list_price: 48000, days_on_market: 285, list_date: '2024-01-25', expiration_date: '2024-11-05', listing_agent_name: 'Julie Harris', listing_office: 'Berkshire Hathaway', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Compact lot near schools. Affordable entry into Georgetown.' },
  { id: 'lot-040', mls_number: 'MLS-20240601-040', status: 'expired', address: '9150 Fillmore St', city: 'Jenison', state: 'MI', zip_code: '49428', county: 'Ottawa', municipality: 'Georgetown Township', latitude: 42.9201, longitude: -85.8201, lot_acres: 0.75, lot_sqft: 32670, frontage_ft: 150, depth_ft: 218, list_price: 88000, original_list_price: 100000, days_on_market: 220, list_date: '2024-06-01', expiration_date: '2025-01-06', listing_agent_name: 'Mike Chen', listing_office: 'Greenridge', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Large premium lot. 150ft frontage — land division to 2 lots likely feasible. Estate sale.' },

  // Grand Haven (10 listings)
  { id: 'lot-041', mls_number: 'MLS-20240401-041', status: 'expired', address: '15820 Lakeshore Dr', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0512, longitude: -86.2234, lot_acres: 0.35, lot_sqft: 15246, frontage_ft: 82, depth_ft: 186, list_price: 65000, original_list_price: 75000, days_on_market: 210, list_date: '2024-04-01', expiration_date: '2024-10-28', listing_agent_name: 'Diane Palmer', listing_office: 'Coldwell Banker Lakeshore', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Grand Haven lot near lakeshore corridor. City water and sewer. Premium location.' },
  { id: 'lot-042', mls_number: 'MLS-20240215-042', status: 'expired', address: '1240 Waverly Ave', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0456, longitude: -86.2156, lot_acres: 0.28, lot_sqft: 12197, frontage_ft: 72, depth_ft: 169, list_price: 48000, original_list_price: 55000, days_on_market: 270, list_date: '2024-02-15', expiration_date: '2024-11-11', listing_agent_name: 'Rich Stewart', listing_office: 'RE/MAX', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Residential lot in downtown Grand Haven area. Walking distance to shops and beach.' },
  { id: 'lot-043', mls_number: 'MLS-20240610-043', status: 'withdrawn', address: '920 Harbor Dr', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0534, longitude: -86.2289, lot_acres: 0.22, lot_sqft: 9583, frontage_ft: 62, depth_ft: 155, list_price: 55000, original_list_price: 55000, days_on_market: 55, list_date: '2024-06-10', expiration_date: '2024-08-04', listing_agent_name: 'Beth Anderson', listing_office: 'Lakeshore Real Estate', coop_commission: '2.5%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Small but prime lot near harbor. Withdrawn to reassess pricing strategy.' },
  { id: 'lot-044', mls_number: 'MLS-20231201-044', status: 'expired', address: '3450 Robbins Rd', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0389, longitude: -86.2078, lot_acres: 0.42, lot_sqft: 18295, frontage_ft: 95, depth_ft: 193, list_price: 72000, original_list_price: 88000, days_on_market: 340, list_date: '2023-12-01', expiration_date: '2024-11-05', listing_agent_name: 'Wayne Thomas', listing_office: 'Greenridge', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Robbins Rd lot with excellent comps. Multiple price reductions. Long DOM means negotiation leverage.' },
  { id: 'lot-045', mls_number: 'MLS-20240515-045', status: 'expired', address: '7820 Mercury Dr', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0423, longitude: -86.2145, lot_acres: 0.38, lot_sqft: 16553, frontage_ft: 88, depth_ft: 188, list_price: 60000, original_list_price: 68000, days_on_market: 185, list_date: '2024-05-15', expiration_date: '2024-11-16', listing_agent_name: 'Carol Jensen', listing_office: 'Century 21', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Mercury Dr lot in growing area. Near Clark Farm development. City utilities.' },
  { id: 'lot-046', mls_number: 'MLS-20240310-046', status: 'expired', address: '2590 Beacon Blvd', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0478, longitude: -86.2312, lot_acres: 0.50, lot_sqft: 21780, frontage_ft: 108, depth_ft: 202, list_price: 82000, original_list_price: 95000, days_on_market: 255, list_date: '2024-03-10', expiration_date: '2024-11-19', listing_agent_name: 'Nick Hoffman', listing_office: 'Keller Williams', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Large lot on Beacon. 108ft frontage. Premium Grand Haven location. Motivated — 3 price cuts.' },
  { id: 'lot-047', mls_number: 'MLS-20240720-047', status: 'expired', address: '5180 Lake Michigan Dr', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0367, longitude: -86.2189, lot_acres: 0.33, lot_sqft: 14375, frontage_ft: 78, depth_ft: 184, list_price: 58000, original_list_price: 62000, days_on_market: 130, list_date: '2024-07-20', expiration_date: '2024-11-27', listing_agent_name: 'Sara Phillips', listing_office: 'RE/MAX', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Lake Michigan Dr corridor. Good exposure. Residential zoning maintained.' },
  { id: 'lot-048', mls_number: 'MLS-20240105-048', status: 'expired', address: '1670 Pennoyer Ave', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0501, longitude: -86.2267, lot_acres: 0.26, lot_sqft: 11326, frontage_ft: 70, depth_ft: 162, list_price: 45000, original_list_price: 52000, days_on_market: 305, list_date: '2024-01-05', expiration_date: '2024-11-05', listing_agent_name: 'Tim Roberts', listing_office: 'Lakeshore RE', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Downtown-adjacent lot. Walkable location. Price dropped significantly over 10 months.' },
  { id: 'lot-049', mls_number: 'MLS-20240830-049', status: 'expired', address: '6340 Comstock St', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0445, longitude: -86.2112, lot_acres: 0.41, lot_sqft: 17860, frontage_ft: 92, depth_ft: 194, list_price: 68000, original_list_price: 74000, days_on_market: 115, list_date: '2024-08-30', expiration_date: '2024-12-23', listing_agent_name: 'Jen Miller', listing_office: 'Coldwell Banker', coop_commission: '3%', water: 'municipal', sewer: 'municipal', electric: true, gas: 'natural', topography: 'flat', description: 'Nice Comstock St lot. Good size for most models. Near Grand Haven High School.' },
  { id: 'lot-050', mls_number: 'MLS-20240425-050', status: 'expired', address: '8720 168th Ave', city: 'Grand Haven', state: 'MI', zip_code: '49417', county: 'Ottawa', municipality: 'Grand Haven', latitude: 43.0334, longitude: -86.2034, lot_acres: 0.88, lot_sqft: 38333, frontage_ft: 160, depth_ft: 240, list_price: 95000, original_list_price: 115000, days_on_market: 240, list_date: '2024-04-25', expiration_date: '2024-12-20', listing_agent_name: 'Laura White', listing_office: 'Berkshire Hathaway', coop_commission: '3%', water: 'well', sewer: 'septic', electric: true, gas: 'natural', topography: 'gentle_slope', description: 'Large lot with land division potential (2 lots). Rural feel but close to town. Well/septic required.' },
];

// ─────────────────────────────────────────
// PRE-COMPUTED MODEL FITS
// ─────────────────────────────────────────

function generateModelFits(listing: MockMlsListing): MockModelFit[] {
  const zoning = mockZoningDistricts.find(
    z => z.municipality === listing.municipality && z.district_code === 'R-1'
  ) || mockZoningDistricts.find(z => z.municipality === listing.municipality);
  if (!zoning) return [];

  const buildableWidth = listing.frontage_ft - (zoning.side_setback_ft * 2);
  const buildableDepth = listing.depth_ft - zoning.front_setback_ft - zoning.rear_setback_ft;

  const modelSpecs = [
    { slug: 'hawthorne', name: 'Hawthorne', width: 32, depth: 64, build_type: 'xmod', home_price: 97087, beds: 3, baths: 2 },
    { slug: 'hawthorne', name: 'Hawthorne (MOD)', width: 32, depth: 64, build_type: 'mod', home_price: 107904, beds: 3, baths: 2 },
    { slug: 'aspen', name: 'Aspen', width: 32, depth: 64, build_type: 'xmod', home_price: 98246, beds: 4, baths: 2 },
    { slug: 'belmont', name: 'Belmont', width: 32, depth: 64, build_type: 'xmod', home_price: 97182, beds: 3, baths: 2 },
    { slug: 'keeneland', name: 'Keeneland', width: 32, depth: 58, build_type: 'xmod', home_price: 106227, beds: 3, baths: 2 },
    { slug: 'laurel', name: 'Laurel', width: 24, depth: 48, build_type: 'mod', home_price: 95245, beds: 3, baths: 2 },
    { slug: 'cypress', name: 'Cypress', width: 16, depth: 66, build_type: 'xmod', home_price: 62213, beds: 2, baths: 2 },
  ];

  return modelSpecs.map(model => {
    const widthMargin = buildableWidth - model.width - 2; // 2ft clearance buffer
    const depthMargin = buildableDepth - model.depth;
    const coveragePct = (model.width * model.depth) / listing.lot_sqft * 100;

    let fit_status: 'fits' | 'tight_fit' | 'no_fit' = 'fits';
    let fit_reason: string | null = null;

    if (widthMargin < 0) {
      fit_status = 'no_fit';
      fit_reason = `Requires ${model.width + 2}ft width, only ${buildableWidth.toFixed(0)}ft available after setbacks`;
    } else if (depthMargin < 0) {
      fit_status = 'no_fit';
      fit_reason = `Requires ${model.depth}ft depth, only ${buildableDepth.toFixed(0)}ft available after setbacks`;
    } else if (coveragePct > zoning.max_lot_coverage_pct) {
      fit_status = 'no_fit';
      fit_reason = `Coverage ${coveragePct.toFixed(1)}% exceeds max ${zoning.max_lot_coverage_pct}%`;
    } else if (widthMargin < 4 || depthMargin < 4) {
      fit_status = 'tight_fit';
    }

    const siteWorkLow = listing.water === 'municipal' ? 35000 : 45000;
    const siteWorkHigh = listing.water === 'municipal' ? 48000 : 62000;

    return {
      listing_id: listing.id,
      model_slug: model.slug,
      model_name: model.name,
      build_type: model.build_type,
      fit_status,
      fit_reason,
      width_margin_ft: Math.max(0, widthMargin),
      depth_margin_ft: Math.max(0, depthMargin),
      coverage_pct: coveragePct,
      lot_price: listing.list_price,
      home_price: model.home_price,
      site_work_low: siteWorkLow,
      site_work_high: siteWorkHigh,
      total_delivered_low: listing.list_price + model.home_price + siteWorkLow,
      total_delivered_high: listing.list_price + model.home_price + siteWorkHigh,
      zoning_confidence: zoning.confidence,
    };
  });
}

export const mockModelFits: MockModelFit[] = mockListings.flatMap(generateModelFits);

// ─────────────────────────────────────────
// PRE-COMPUTED ACQUISITION SCORES
// ─────────────────────────────────────────

function generateAcquisitionScore(listing: MockMlsListing): MockAcquisitionScore {
  const fits = mockModelFits.filter(f => f.listing_id === listing.id && f.fit_status !== 'no_fit');
  const fitsCount = fits.length;
  const bestFit = fits.sort((a, b) => a.total_delivered_low - b.total_delivered_low)[0];

  // Seller motivation (0-25)
  let sellerMotivation = 0;
  if (listing.days_on_market > 180) sellerMotivation += 15;
  else if (listing.days_on_market > 90) sellerMotivation += 10;
  else if (listing.days_on_market > 30) sellerMotivation += 5;
  const priceReductions = listing.original_list_price > listing.list_price ? Math.ceil((listing.original_list_price - listing.list_price) / 5000) : 0;
  sellerMotivation += Math.min(10, priceReductions * 5);
  sellerMotivation = Math.min(25, sellerMotivation);

  // Lot viability (0-25)
  let lotViability = 0;
  if (fitsCount >= 5) lotViability += 10;
  else if (fitsCount >= 3) lotViability += 8;
  else if (fitsCount >= 1) lotViability += 5;
  const zoning = mockZoningDistricts.find(z => z.municipality === listing.municipality);
  if (zoning?.confidence === 'verified') lotViability += 10;
  else if (zoning?.confidence === 'ai_parsed') lotViability += 5;
  if (listing.water === 'municipal' && listing.sewer === 'municipal') lotViability += 5;
  else if (listing.water === 'municipal' || listing.sewer === 'municipal') lotViability += 2;
  lotViability = Math.min(25, lotViability);

  // Margin potential (0-25)
  let marginPotential = 0;
  if (bestFit) {
    // Rough margin calc: assume comp value = total delivered * 1.15 to 1.30
    const compMultiplier = listing.municipality === 'Grand Haven' ? 1.25 : listing.municipality === 'Georgetown Township' ? 1.20 : 1.15;
    const estValue = bestFit.total_delivered_low * compMultiplier;
    const estMarginPct = ((estValue - bestFit.total_delivered_low) / bestFit.total_delivered_low) * 100;
    if (estMarginPct > 25) marginPotential += 15;
    else if (estMarginPct > 15) marginPotential += 10;
    else if (estMarginPct > 5) marginPotential += 5;
    // Comp support
    if (listing.municipality === 'Grand Haven' || listing.municipality === 'Georgetown Township') marginPotential += 10;
    else if (listing.municipality === 'Wyoming') marginPotential += 7;
    else marginPotential += 5;
  }
  marginPotential = Math.min(25, marginPotential);

  // Market strength (0-25)
  let marketStrength = 0;
  const municipalityStrength: Record<string, number> = {
    'Ypsilanti Township': 14,
    'Wyoming': 18,
    'Byron Township': 15,
    'Georgetown Township': 20,
    'Grand Haven': 22,
  };
  marketStrength = municipalityStrength[listing.municipality] || 10;
  marketStrength = Math.min(25, marketStrength);

  const totalScore = sellerMotivation + lotViability + marginPotential + marketStrength;

  let recommendedAction: MockAcquisitionScore['recommended_action'] = 'pass';
  if (totalScore >= 80) recommendedAction = 'acquire_direct';
  else if (totalScore >= 60) recommendedAction = 'contact_seller';
  else if (totalScore >= 40) recommendedAction = 'monitor';

  const recommendedOffer = totalScore >= 60 ? Math.round(listing.list_price * 0.85 / 1000) * 1000 : null;

  return {
    listing_id: listing.id,
    total_score: totalScore,
    seller_motivation_score: sellerMotivation,
    lot_viability_score: lotViability,
    margin_potential_score: marginPotential,
    market_strength_score: marketStrength,
    score_factors: {
      seller_motivation: {
        days_on_market: listing.days_on_market,
        price_reductions: priceReductions,
        original_price: listing.original_list_price,
        current_price: listing.list_price,
        discount_pct: ((listing.original_list_price - listing.list_price) / listing.original_list_price * 100).toFixed(1),
      },
      lot_viability: {
        models_that_fit: fitsCount,
        zoning_confidence: zoning?.confidence || 'unknown',
        utilities: listing.water === 'municipal' ? 'municipal' : 'well/septic',
        topography: listing.topography,
      },
      margin_potential: {
        best_total_delivered: bestFit?.total_delivered_low || 0,
        comp_support: listing.municipality === 'Grand Haven' ? 'strong' : listing.municipality === 'Georgetown Township' ? 'strong' : 'moderate',
      },
      market_strength: {
        municipality: listing.municipality,
        activity: listing.municipality === 'Grand Haven' ? 'high' : 'medium',
      },
    },
    recommended_action: recommendedAction,
    recommended_offer: recommendedOffer,
    review_status: 'unreviewed',
    notes: '',
  };
}

export const mockAcquisitionScores: MockAcquisitionScore[] = mockListings.map(generateAcquisitionScore);

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────

export function getListingById(id: string): MockMlsListing | undefined {
  return mockListings.find(l => l.id === id);
}

export function getModelFitsForListing(listingId: string): MockModelFit[] {
  return mockModelFits.filter(f => f.listing_id === listingId);
}

export function getFittingModelsCount(listingId: string): number {
  return mockModelFits.filter(f => f.listing_id === listingId && f.fit_status !== 'no_fit').length;
}

export function getAcquisitionScore(listingId: string): MockAcquisitionScore | undefined {
  return mockAcquisitionScores.find(s => s.listing_id === listingId);
}

export function getZoningForMunicipality(municipality: string): MockZoningDistrict | undefined {
  return mockZoningDistricts.find(z => z.municipality === municipality && z.district_code === 'R-1')
    || mockZoningDistricts.find(z => z.municipality === municipality);
}
