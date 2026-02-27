// ============================================================================
// sync-mls-listings — Supabase Edge Function
// Pulls vacant land listings from Spark API (FlexMLS), upserts into
// mls_listings, and triggers model fit / deal score recalculation.
//
// NOTE: Spark API credentials are not yet configured. This function has a
// clear interface with a mock response handler so it can be plugged in
// when credentials are ready.
//
// Reference: docs/homematch/PLATFORM-ARCHITECTURE.md Section 8.1
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

// --- CORS ---

const allowedOrigins = [
  'https://build-modern-homes.lovable.app',
  'https://id-preview--b6311393-fa2b-46a4-a734-59db659ebfc9.lovable.app',
  'https://b6311393-fa2b-46a4-a734-59db659ebfc9.lovableproject.com',
  'https://dashboard.basemodhomes.com',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// --- Types ---

interface SparkListing {
  ListingId: string;
  StandardStatus: string;
  PropertyType: string;
  UnparsedAddress: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  CountyOrParish: string;
  Latitude: number;
  Longitude: number;
  LotSizeAcres: number;
  LotSizeSquareFeet: number;
  ListPrice: number;
  OriginalListPrice: number;
  DaysOnMarket: number;
  ListingContractDate: string;
  ExpirationDate: string;
  WithdrawalDate: string;
  ListAgentFullName: string;
  ListAgentDirectPhone: string;
  ListAgentEmail: string;
  ListOfficeName: string;
  BuyerAgencyCompensation: string;
  WaterSource: string[];
  Sewer: string[];
  ElectricOnPropertyYN: boolean;
  Gas: string[];
  RoadSurfaceType: string[];
  PublicRemarks: string;
  Media: Array<{ MediaURL: string }>;
}

interface SyncOptions {
  municipalities?: string[];
  statuses?: string[];
  mode?: 'full' | 'incremental';
}

// --- Spark API Client ---

async function fetchFromSparkApi(
  _sparkToken: string,
  _options: SyncOptions
): Promise<SparkListing[]> {
  // When Spark API credentials are configured, this will make real API calls.
  // For now, return empty array to indicate no credentials.
  //
  // Future implementation:
  // const baseUrl = 'https://sparkapi.com/v1';
  // const params = new URLSearchParams({
  //   _filter: `PropertyType Eq 'Land' And StateOrProvince Eq 'MI'`,
  //   _limit: '200',
  //   _expand: 'Media',
  // });
  //
  // if (options.municipalities?.length) {
  //   const muniFilter = options.municipalities
  //     .map(m => `City Eq '${m}'`)
  //     .join(' Or ');
  //   params.set('_filter', params.get('_filter') + ` And (${muniFilter})`);
  // }
  //
  // if (options.statuses?.length) {
  //   const statusFilter = options.statuses
  //     .map(s => `StandardStatus Eq '${s}'`)
  //     .join(' Or ');
  //   params.set('_filter', params.get('_filter') + ` And (${statusFilter})`);
  // }
  //
  // const response = await fetch(`${baseUrl}/listings?${params}`, {
  //   headers: { Authorization: `Bearer ${sparkToken}` },
  // });
  //
  // if (!response.ok) throw new Error(`Spark API error: ${response.status}`);
  // const data = await response.json();
  // return data.D.Results;

  console.log('[sync-mls-listings] Spark API credentials not configured. Using mock mode.');
  return [];
}

// --- Data Mapping ---

function mapSparkToMls(spark: SparkListing): Record<string, unknown> {
  const waterSource = spark.WaterSource?.[0]?.toLowerCase() || 'unknown';
  const sewerType = spark.Sewer?.[0]?.toLowerCase() || 'unknown';

  return {
    mls_number: spark.ListingId,
    status: mapStatus(spark.StandardStatus),
    listing_type: 'vacant_land',
    address: spark.UnparsedAddress,
    city: spark.City,
    state: spark.StateOrProvince || 'MI',
    zip_code: spark.PostalCode,
    county: spark.CountyOrParish,
    municipality: spark.City, // Will be enriched by municipality lookup
    latitude: spark.Latitude,
    longitude: spark.Longitude,
    lot_acres: spark.LotSizeAcres,
    lot_sqft: spark.LotSizeSquareFeet,
    list_price: spark.ListPrice,
    original_list_price: spark.OriginalListPrice,
    days_on_market: spark.DaysOnMarket,
    list_date: spark.ListingContractDate || null,
    expiration_date: spark.ExpirationDate || null,
    withdrawal_date: spark.WithdrawalDate || null,
    listing_agent_name: spark.ListAgentFullName,
    listing_agent_phone: spark.ListAgentDirectPhone,
    listing_agent_email: spark.ListAgentEmail,
    listing_office: spark.ListOfficeName,
    coop_commission: spark.BuyerAgencyCompensation,
    water: waterSource.includes('public') || waterSource.includes('municipal') ? 'municipal' : waterSource.includes('well') ? 'well' : 'unknown',
    sewer: sewerType.includes('public') || sewerType.includes('municipal') ? 'municipal' : sewerType.includes('septic') ? 'septic' : 'unknown',
    electric: spark.ElectricOnPropertyYN ?? true,
    gas: spark.Gas?.[0]?.toLowerCase().includes('natural') ? 'natural' : spark.Gas?.[0]?.toLowerCase().includes('propane') ? 'propane' : 'none',
    topography: 'flat', // Default — enriched by Regrid later
    description: spark.PublicRemarks,
    photos: JSON.stringify((spark.Media || []).map(m => m.MediaURL)),
    source: 'spark_api',
    raw_data: JSON.stringify(spark),
    last_synced_at: new Date().toISOString(),
  };
}

function mapStatus(sparkStatus: string): string {
  const statusMap: Record<string, string> = {
    'Active': 'active',
    'Pending': 'pending',
    'Closed': 'sold',
    'Expired': 'expired',
    'Withdrawn': 'withdrawn',
    'Canceled': 'canceled',
  };
  return statusMap[sparkStatus] || sparkStatus.toLowerCase();
}

// --- Main Handler ---

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin client for database operations (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request options
    const body = await req.json().catch(() => ({})) as SyncOptions;
    const options: SyncOptions = {
      municipalities: body.municipalities || [],
      statuses: body.statuses || ['Expired', 'Withdrawn', 'Canceled'],
      mode: body.mode || 'incremental',
    };

    // Attempt to fetch from Spark API
    const sparkApiKey = Deno.env.get('SPARK_API_TOKEN');
    let listings: SparkListing[] = [];
    let dataSource = 'mock';

    if (sparkApiKey) {
      try {
        listings = await fetchFromSparkApi(sparkApiKey, options);
        dataSource = 'spark_api';
        console.log(`[sync-mls-listings] Fetched ${listings.length} listings from Spark API`);
      } catch (err) {
        console.error('[sync-mls-listings] Spark API error:', err);
        return new Response(
          JSON.stringify({ error: 'Spark API request failed', details: String(err) }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('[sync-mls-listings] No SPARK_API_TOKEN configured. Returning sync-ready status.');
    }

    // Upsert listings into database
    let upserted = 0;
    let errors = 0;

    for (const sparkListing of listings) {
      const mapped = mapSparkToMls(sparkListing);
      const { error: upsertError } = await adminClient
        .from('mls_listings')
        .upsert(mapped, { onConflict: 'mls_number' });

      if (upsertError) {
        console.error(`[sync-mls-listings] Upsert error for ${sparkListing.ListingId}:`, upsertError);
        errors++;
      } else {
        upserted++;
      }
    }

    // Return sync results
    return new Response(
      JSON.stringify({
        success: true,
        data_source: dataSource,
        spark_api_configured: !!sparkApiKey,
        total_fetched: listings.length,
        upserted,
        errors,
        sync_options: options,
        synced_at: new Date().toISOString(),
        message: sparkApiKey
          ? `Synced ${upserted} listings from Spark API`
          : 'Spark API not configured. Set SPARK_API_TOKEN env variable to enable live sync.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[sync-mls-listings] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
