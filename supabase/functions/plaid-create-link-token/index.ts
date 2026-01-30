import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to trusted domains
const allowedOrigins = [
  'https://build-modern-homes.lovable.app',
  'https://basemodhomes.com',
  'https://id-preview--b6311393-fa2b-46a4-a734-59db659ebfc9.lovable.app',
  'https://b6311393-fa2b-46a4-a734-59db659ebfc9.lovableproject.com',
  // Some embedded / sandboxed contexts can send a "null" origin
  'null',
];

function logCorsEvent(req: Request, eventType: 'request' | 'preflight' | 'mismatch', extra?: Record<string, unknown>) {
  const origin = req.headers.get('origin') || '(none)';
  const isAllowed = allowedOrigins.includes(origin) || origin === '(none)';
  console.log(JSON.stringify({
    cors_event: eventType,
    function: 'plaid-create-link-token',
    origin,
    origin_allowed: isAllowed,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...extra,
  }));
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = allowedOrigins.includes(origin);
  
  if (origin && !isAllowed) {
    logCorsEvent(req, 'mismatch', { expected_origins: allowedOrigins });
  }
  
  const allowedOrigin = isAllowed ? origin : allowedOrigins[0];
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
    logCorsEvent(req, 'preflight');
    return new Response("ok", { headers: corsHeaders });
  }
  
  logCorsEvent(req, 'request');

  try {
    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
    const PLAID_ENV = Deno.env.get("PLAID_ENV") ?? "sandbox";

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error("Plaid credentials are missing");
    }

    const plaidBase = getPlaidBaseUrl(PLAID_ENV);

    const clientUserId = crypto.randomUUID();

    const payload = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      user: { client_user_id: clientUserId },
      client_name: "BaseMod Financial",
      products: ["assets", "liabilities", "identity"],
      country_codes: ["US"],
      language: "en",
    };

    console.log("Creating Plaid link token", { env: PLAID_ENV });

    const resp = await fetch(`${plaidBase}/link/token/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await resp.json();
    if (!resp.ok) {
      console.error("Plaid link token error", json);
      throw new Error(json?.error_message ?? "Failed to create link token");
    }

    return new Response(
      JSON.stringify({ link_token: json.link_token, expiration: json.expiration }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const corsHeaders = getCorsHeaders(req);
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("plaid-create-link-token error", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});