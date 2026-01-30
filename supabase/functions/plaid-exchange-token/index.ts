import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to trusted domains
const allowedOrigins = [
  'https://build-modern-homes.lovable.app',
  'https://id-preview--b6311393-fa2b-46a4-a734-59db659ebfc9.lovable.app',
  'https://b6311393-fa2b-46a4-a734-59db659ebfc9.lovableproject.com',
  // Some embedded / sandboxed contexts can send a "null" origin
  'null',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

function getPlaidBaseUrl(env: string) {
  if (env === "production") return "https://production.plaid.com";
  if (env === "development") return "https://development.plaid.com";
  return "https://sandbox.plaid.com";
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
    const PLAID_ENV = Deno.env.get("PLAID_ENV") ?? "sandbox";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Backend configuration is missing");
    }
    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error("Plaid credentials are missing");
    }

    const { public_token, application_id, institution_name } = await req.json();
    if (!public_token) throw new Error("public_token is required");
    if (!application_id) throw new Error("application_id is required");

    const plaidBase = getPlaidBaseUrl(PLAID_ENV);

    console.log("Exchanging Plaid public token", { env: PLAID_ENV, application_id });

    const exchangeResp = await fetch(`${plaidBase}/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token,
      }),
    });

    const exchangeJson = await exchangeResp.json();
    if (!exchangeResp.ok) {
      console.error("Plaid exchange error", exchangeJson);
      throw new Error(exchangeJson?.error_message ?? "Failed to exchange public token");
    }

    const accessToken = exchangeJson.access_token as string | undefined;
    const itemId = exchangeJson.item_id as string | undefined;
    if (!accessToken || !itemId) throw new Error("Missing access_token or item_id");

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await admin.from("plaid_connections").insert({
      application_id,
      plaid_item_id: itemId,
      access_token: accessToken,
      institution_name: institution_name ?? null,
      products_enabled: null,
      consent_timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to store plaid connection", error);
      throw new Error("Failed to store bank connection");
    }

    return new Response(JSON.stringify({ success: true, item_id: itemId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const corsHeaders = getCorsHeaders(req);
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("plaid-exchange-token error", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});