// ============================================================================
// submit-lead Edge Function
// ----------------------------------------------------------------------------
// Secure, anonymous-capable lead intake for public.quotes. Validates and
// normalizes the payload, derives user_id server-side from the Authorization
// header (never from the body), performs an idempotent insert keyed on the
// client UUID (quotes.id), and returns only the persisted id.
//
// Canonical validation/mapping/idempotency logic lives in the shared,
// Deno-tested module ../_shared/leadContract.ts (NOT mirrored browser code).
// The request handler (handleSubmitLead) takes injected data dependencies so
// index.test.ts exercises the ACTUAL function logic with mocked I/O.
// verify_jwt = false (see supabase/config.toml) so anonymous buyers can submit.
// The service-role key stays inside this function and is never exposed.
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  validateLead,
  buildQuoteRow,
  materialSignatureFromRow,
  type LeadInput,
  type QuoteRow,
} from '../_shared/leadContract.ts';

const allowedOrigins = [
  // Canonical production custom domain (build-modern-homes.lovable.app 302s here;
  // www → apex). Listed first so it is the fallback ACAO for unknown origins.
  'https://basemodhomes.com',
  'https://www.basemodhomes.com',
  'https://build-modern-homes.lovable.app',
  'https://id-preview--b6311393-fa2b-46a4-a734-59db659ebfc9.lovable.app',
  'https://b6311393-fa2b-46a4-a734-59db659ebfc9.lovableproject.com',
  'null',
];

function logCorsEvent(
  req: Request,
  eventType: 'request' | 'preflight' | 'mismatch',
  extra?: Record<string, unknown>,
) {
  const origin = req.headers.get('origin') || '(none)';
  const isAllowed = allowedOrigins.includes(origin) || origin === '(none)';
  console.log(
    JSON.stringify({
      cors_event: eventType,
      function: 'submit-lead',
      origin,
      origin_allowed: isAllowed,
      method: req.method,
      timestamp: new Date().toISOString(),
      ...extra,
    }),
  );
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const isAllowed = allowedOrigins.includes(origin);
  if (origin && !isAllowed) logCorsEvent(req, 'mismatch', { expected_origins: allowedOrigins });
  const allowedOrigin = isAllowed ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

// Conservative recent-submission spam guard (basic; a durable IP limiter would
// require a new table — noted as later hardening, not implemented here).
const RATE_WINDOW_MINUTES = 10;
const RATE_MAX_PER_WINDOW = 5;

function json(body: unknown, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Injected data dependencies — real impls hit Supabase; tests pass mocks.
export interface SubmitLeadDeps {
  // null = anonymous (user_id null); 'invalid' = a non-anon token that failed
  // verification (→ 401); string = verified user id.
  resolveUserId: (authHeader: string | null) => Promise<string | null | 'invalid'>;
  countRecentByEmail: (email: string, excludeId: string, sinceIso: string) => Promise<number>;
  insertQuote: (row: Record<string, unknown>) => Promise<{ errorCode: string | null }>;
  readQuoteById: (id: string) => Promise<Record<string, unknown> | null>;
}

export async function handleSubmitLead(req: Request, deps: SubmitLeadDeps): Promise<Response> {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    logCorsEvent(req, 'preflight');
    return new Response('ok', { headers: corsHeaders });
  }
  logCorsEvent(req, 'request');
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, corsHeaders);

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, corsHeaders);
  }

  const errors = validateLead(payload as LeadInput);
  if (errors.length) {
    // Honeypot / generic rejection — keep the message generic.
    return json({ error: 'Invalid submission', details: errors }, 400, corsHeaders);
  }

  // Derive user_id from the verified token only — never from the payload.
  const userId = await deps.resolveUserId(req.headers.get('Authorization'));
  if (userId === 'invalid') return json({ error: 'Invalid or expired token' }, 401, corsHeaders);

  const incoming = buildQuoteRow(payload as LeadInput);

  // Compare an existing row (pre-insert check or post-insert race) against the
  // incoming one: materially equivalent → idempotent duplicate; else 409 conflict.
  const sameOrConflict = (row: Record<string, unknown>): Response =>
    materialSignatureFromRow(row as unknown as QuoteRow) === materialSignatureFromRow(incoming)
      ? json({ id: incoming.id, persisted: true, duplicate: true }, 200, corsHeaders)
      : json({ error: 'This request id was already used for a different submission' }, 409, corsHeaders);

  // Idempotency BEFORE rate limiting: an already-persisted requestId is always
  // honored (duplicate) or 409'd, and is never blocked by the new-submission
  // limit. The rate limiter only applies to genuinely new request UUIDs.
  const existing = await deps.readQuoteById(incoming.id);
  if (existing) return sameOrConflict(existing);

  // New submission only — conservative recent-submission rate limit (per email).
  if (incoming.contact_email) {
    const since = new Date(Date.now() - RATE_WINDOW_MINUTES * 60_000).toISOString();
    const recent = await deps.countRecentByEmail(incoming.contact_email, incoming.id, since);
    if (recent >= RATE_MAX_PER_WINDOW) {
      return json({ error: 'Too many recent submissions. Please try again later.' }, 429, corsHeaders);
    }
  }

  // Insert. `source` is a carrier field (encoded into notes), not a quotes column.
  const { source: _source, ...quoteRow } = incoming;
  const { errorCode } = await deps.insertQuote({ ...quoteRow, user_id: userId });

  if (!errorCode) {
    return json({ id: incoming.id, persisted: true, duplicate: false }, 200, corsHeaders);
  }

  // Concurrent race: another request inserted this UUID between the pre-check and
  // this insert. Read it back and apply the same equivalent/different decision.
  if (errorCode === '23505') {
    const raced = await deps.readQuoteById(incoming.id);
    if (!raced) return json({ error: 'Could not verify existing submission' }, 500, corsHeaders);
    return sameOrConflict(raced);
  }

  console.error('submit-lead insert error', errorCode);
  return json({ error: 'Could not save your request' }, 500, corsHeaders);
}

// Real dependencies backed by Supabase. Only constructed inside serve().
function realDeps(): SubmitLeadDeps {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    throw new Error('Backend configuration is missing');
  }
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  return {
    async resolveUserId(authHeader) {
      const bearer = authHeader?.replace(/^Bearer\s+/i, '').trim();
      // No Authorization or a bare anon-key bearer = anonymous → user_id null.
      if (!bearer || bearer === SUPABASE_ANON_KEY) return null;
      try {
        const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader as string } },
        });
        const { data, error } = await userClient.auth.getUser();
        if (error || !data?.user?.id) return 'invalid';
        return data.user.id;
      } catch {
        return 'invalid';
      }
    },
    async countRecentByEmail(email, excludeId, sinceIso) {
      const { data } = await admin
        .from('quotes')
        .select('id')
        .eq('contact_email', email)
        .neq('id', excludeId)
        .gte('created_at', sinceIso)
        .limit(RATE_MAX_PER_WINDOW + 1);
      return data?.length ?? 0;
    },
    async insertQuote(row) {
      const { error } = await admin.from('quotes').insert(row);
      return { errorCode: (error as { code?: string } | null)?.code ?? (error ? 'unknown' : null) };
    },
    async readQuoteById(id) {
      const { data } = await admin
        .from('quotes')
        .select(
          'id, contact_name, contact_email, contact_phone, total_estimate, build_type, service_package, zip_code, address, notes',
        )
        .eq('id', id)
        .single();
      return data ?? null;
    },
  };
}

// Only start the server when run as the entry module (deploy/runtime), so
// importing this file from index.test.ts does not boot an HTTP listener.
if (import.meta.main) {
  serve(async (req) => {
    try {
      return await handleSubmitLead(req, realDeps());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('submit-lead error', message);
      return json({ error: message }, 500, getCorsHeaders(req));
    }
  });
}
