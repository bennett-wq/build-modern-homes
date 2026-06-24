// Deno tests for the ACTUAL submit-lead handler + the canonical _shared module.
// Data I/O is injected (SubmitLeadDeps) so we exercise the real request logic:
// validation, server-derived user_id, idempotency (duplicate vs 409), and the
// security invariants — without a live database.
//
//   npx --yes deno test supabase/functions/submit-lead/index.test.ts
import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { handleSubmitLead, type SubmitLeadDeps } from './index.ts';
import { buildQuoteRow, type LeadInput } from '../_shared/leadContract.ts';

const UUID_A = '11111111-1111-4111-8111-111111111111';

function makeReq(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://example.test/functions/v1/submit-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function baseInput(over: Partial<LeadInput> = {}): LeadInput {
  return {
    requestId: UUID_A,
    source: 'build_quote',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '5551234567',
    ...over,
  };
}

function mockDeps(over: Partial<SubmitLeadDeps> = {}): SubmitLeadDeps {
  return {
    resolveUserId: () => Promise.resolve(null),
    countRecentByEmail: () => Promise.resolve(0),
    insertQuote: () => Promise.resolve({ errorCode: null }),
    readQuoteById: () => Promise.resolve(null),
    ...over,
  };
}

Deno.test('valid anonymous submission persists with user_id null', async () => {
  const inserted: Record<string, unknown>[] = [];
  const res = await handleSubmitLead(
    makeReq(baseInput()),
    mockDeps({
      insertQuote: (row) => {
        inserted.push(row);
        return Promise.resolve({ errorCode: null });
      },
    }),
  );
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body, { id: UUID_A, persisted: true, duplicate: false });
  assertEquals(inserted.length, 1);
  assertEquals(inserted[0].user_id, null);
  assertEquals(inserted[0].status, 'submitted');
});

Deno.test('authenticated submission derives user_id from the verified token', async () => {
  const inserted: Record<string, unknown>[] = [];
  const res = await handleSubmitLead(
    makeReq(baseInput(), { Authorization: 'Bearer user-token' }),
    mockDeps({
      resolveUserId: () => Promise.resolve('user-abc'),
      insertQuote: (row) => {
        inserted.push(row);
        return Promise.resolve({ errorCode: null });
      },
    }),
  );
  assertEquals(res.status, 200);
  assertEquals(inserted[0].user_id, 'user-abc');
});

Deno.test('a body-supplied user_id is ignored (anti-spoofing)', async () => {
  const inserted: Record<string, unknown>[] = [];
  const payload = { ...baseInput(), user_id: 'attacker-controlled' };
  await handleSubmitLead(
    makeReq(payload),
    mockDeps({
      resolveUserId: () => Promise.resolve(null),
      insertQuote: (row) => {
        inserted.push(row);
        return Promise.resolve({ errorCode: null });
      },
    }),
  );
  assertEquals(inserted[0].user_id, null);
});

Deno.test('invalid / expired non-anon token → 401', async () => {
  const res = await handleSubmitLead(
    makeReq(baseInput(), { Authorization: 'Bearer expired' }),
    mockDeps({ resolveUserId: () => Promise.resolve('invalid') }),
  );
  assertEquals(res.status, 401);
});

Deno.test('malformed UUID → 400', async () => {
  const res = await handleSubmitLead(makeReq(baseInput({ requestId: 'nope' })), mockDeps());
  assertEquals(res.status, 400);
});

Deno.test('malformed email → 400', async () => {
  const res = await handleSubmitLead(makeReq(baseInput({ email: 'bad' })), mockDeps());
  assertEquals(res.status, 400);
});

Deno.test('oversized payload → 400', async () => {
  const res = await handleSubmitLead(makeReq(baseInput({ message: 'x'.repeat(20_000) })), mockDeps());
  assertEquals(res.status, 400);
});

Deno.test('invalid source → 400', async () => {
  const bad = { ...baseInput(), source: 'spam' } as unknown as LeadInput;
  const res = await handleSubmitLead(makeReq(bad), mockDeps());
  assertEquals(res.status, 400);
});

Deno.test('honeypot → 400', async () => {
  const res = await handleSubmitLead(makeReq(baseInput({ honeypot: 'bot' })), mockDeps());
  assertEquals(res.status, 400);
});

Deno.test('database failure → 500 (no false success)', async () => {
  const res = await handleSubmitLead(
    makeReq(baseInput()),
    mockDeps({ insertQuote: () => Promise.resolve({ errorCode: 'unknown' }) }),
  );
  assertEquals(res.status, 500);
});

Deno.test('rate limit exceeded → 429', async () => {
  const res = await handleSubmitLead(
    makeReq(baseInput()),
    mockDeps({ countRecentByEmail: () => Promise.resolve(5) }),
  );
  assertEquals(res.status, 429);
});

Deno.test('equivalent retry (same id, same content) → duplicate=true', async () => {
  const existingRow = buildQuoteRow(baseInput()); // identical material content
  const res = await handleSubmitLead(
    makeReq(baseInput()),
    mockDeps({
      insertQuote: () => Promise.resolve({ errorCode: '23505' }),
      readQuoteById: () => Promise.resolve(existingRow as unknown as Record<string, unknown>),
    }),
  );
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body, { id: UUID_A, persisted: true, duplicate: true });
});

Deno.test('same id with materially different content → 409', async () => {
  const existingRow = buildQuoteRow(baseInput({ message: 'a totally different message' }));
  const res = await handleSubmitLead(
    makeReq(baseInput({ message: 'the original message' })),
    mockDeps({
      insertQuote: () => Promise.resolve({ errorCode: '23505' }),
      readQuoteById: () => Promise.resolve(existingRow as unknown as Record<string, unknown>),
    }),
  );
  assertEquals(res.status, 409);
});

Deno.test('conflict but missing existing row → 500 (never blind success)', async () => {
  const res = await handleSubmitLead(
    makeReq(baseInput()),
    mockDeps({
      insertQuote: () => Promise.resolve({ errorCode: '23505' }),
      readQuoteById: () => Promise.resolve(null),
    }),
  );
  assertEquals(res.status, 500);
});
