// ============================================================================
// Lead delivery client
// ----------------------------------------------------------------------------
// Single typed entry point used by every public buyer form. Posts to the
// `submit-lead` Edge Function (which validates, rate-limits, and performs the
// idempotent insert into public.quotes with the service role) and returns the
// confirmed persisted id. The browser never inserts directly and never holds a
// service-role key. user_id is derived server-side from the Authorization
// header — it is never sent in the payload.
// ============================================================================

import { supabase } from '@/integrations/supabase/client';
import { type LeadInput, materialSignature } from '@/lib/leadContract';

export type LeadResult =
  | { ok: true; id: string; duplicate: boolean }
  | { ok: false; status?: number; conflict?: boolean; error: string };

// Holds the last submission's signature + id so a retry of the SAME submission
// reuses the same UUID (idempotent), while a materially changed payload gets a
// fresh UUID (a new attempt).
export interface RequestIdRef {
  current: { sig: string; id: string } | null;
}

const SIGNATURE_PLACEHOLDER_ID = '00000000-0000-4000-8000-000000000000';

/**
 * Resolve the idempotency UUID for a submission. Reuses the previous id when the
 * material payload is unchanged (a retry); allocates a new id when it changed.
 */
export function resolveRequestId(
  ref: RequestIdRef,
  input: Omit<LeadInput, 'requestId'>,
): string {
  const sig = materialSignature({
    ...input,
    requestId: SIGNATURE_PLACEHOLDER_ID,
  });
  if (ref.current && ref.current.sig === sig) return ref.current.id;
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : // Extremely defensive fallback; modern browsers/Deno have randomUUID.
        `${SIGNATURE_PLACEHOLDER_ID.slice(0, 24)}${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
  ref.current = { sig, id };
  return id;
}

/**
 * Deliver a buyer lead to BaseMod. Resolves to { ok:true, id, duplicate } only
 * when the backend confirms the persisted id; otherwise { ok:false, ... }.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  try {
    const { data, error } = await supabase.functions.invoke('submit-lead', {
      body: input,
    });

    if (error) {
      // supabase-js wraps non-2xx responses in a FunctionsHttpError whose
      // `context` is the original Response. Read it to surface 409 vs 4xx/5xx.
      const ctx = (error as { context?: Response }).context;
      let status: number | undefined;
      let serverError: string | undefined;
      if (ctx && typeof ctx.status === 'number') {
        status = ctx.status;
        try {
          const body = await ctx.clone().json();
          if (body && typeof body.error === 'string') serverError = body.error;
        } catch {
          /* non-JSON error body */
        }
      }
      return {
        ok: false,
        status,
        conflict: status === 409,
        error: serverError || error.message || 'We could not deliver your request.',
      };
    }

    if (data && typeof data.id === 'string' && data.persisted) {
      return { ok: true, id: data.id, duplicate: Boolean(data.duplicate) };
    }
    return { ok: false, error: 'We could not confirm your request was received.' };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'A network error occurred.',
    };
  }
}
