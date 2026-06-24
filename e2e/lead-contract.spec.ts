import { test, expect } from '@playwright/test';
import {
  validateLead,
  buildQuoteRow,
  materialSignature,
  isSameSubmission,
  normalizeEmail,
  normalizePhone,
  type LeadInput,
} from '../src/lib/leadContract';

// These exercise the pure contract that the submit-lead Edge Function mirrors:
// validation, normalization, the public.quotes mapping, and the material-field
// signature that decides idempotent-duplicate vs 409-conflict server-side.

const UUID_A = '11111111-1111-4111-8111-111111111111';
const UUID_B = '22222222-2222-4222-8222-222222222222';

function base(overrides: Partial<LeadInput> = {}): LeadInput {
  return {
    requestId: UUID_A,
    source: 'build_quote',
    name: '  Jane   Doe ',
    email: 'JANE@EXAMPLE.COM',
    phone: '(555) 123-4567',
    ...overrides,
  };
}

test.describe('leadContract — validation', () => {
  test('accepts a valid anonymous build quote', () => {
    expect(validateLead(base())).toEqual([]);
  });

  test('rejects a malformed requestId UUID', () => {
    expect(validateLead(base({ requestId: 'not-a-uuid' }))).toContain(
      'requestId must be a valid UUID',
    );
  });

  test('rejects an invalid email', () => {
    expect(validateLead(base({ email: 'nope' }))).toContain('email is invalid');
  });

  test('rejects an unrecognized source (invalid enum)', () => {
    const bad = { ...base(), source: 'spam' } as unknown as LeadInput;
    expect(validateLead(bad)).toContain('source is not a recognized lead type');
  });

  test('name + email suffice for contact and consultation (message optional)', () => {
    expect(validateLead(base({ source: 'contact', message: '' }))).toEqual([]);
    expect(validateLead(base({ source: 'contact', message: 'Hello' }))).toEqual([]);
    expect(validateLead(base({ source: 'consultation' }))).toEqual([]);
    expect(validateLead(base({ source: 'contact', name: '' }))).toContain('name is required');
  });

  test('trips the honeypot', () => {
    expect(validateLead(base({ honeypot: 'i-am-a-bot' }))).toContain('rejected');
  });

  test('rejects an oversized message', () => {
    expect(validateLead(base({ message: 'x'.repeat(20_000) }))).toContain(
      'message is too long',
    );
  });

  test('rejects a non-UUID foreign key', () => {
    expect(validateLead(base({ developmentId: 'abc' }))).toContain(
      'developmentId must be a UUID',
    );
  });
});

test.describe('leadContract — normalization + mapping', () => {
  test('normalizes email and phone', () => {
    expect(normalizeEmail('  A@B.CO ')).toBe('a@b.co');
    expect(normalizePhone('(555) 123-4567')).toBe('5551234567');
    expect(normalizePhone('+1 555 123 4567')).toBe('+15551234567');
  });

  test('maps build_type only for live enum values', () => {
    expect(buildQuoteRow(base({ buildTypeRaw: 'xmod' })).build_type).toBe('xmod');
    expect(buildQuoteRow(base({ buildTypeRaw: 'CrossMod' })).build_type).toBeNull();
  });

  test('service_package defaults when not a valid enum', () => {
    expect(buildQuoteRow(base({ servicePackageRaw: 'community_all_in' })).service_package).toBe(
      'community_all_in',
    );
    expect(buildQuoteRow(base({ servicePackageRaw: 'whatever' })).service_package).toBe(
      'delivered_installed',
    );
  });

  test('never fabricates a foreign key; readable selection goes to notes', () => {
    const row = buildQuoteRow(base({ developmentName: 'Grand Haven', lotLabel: '15' }));
    expect(row.development_id).toBeNull();
    expect(row.lot_id).toBeNull();
    expect(row.notes).toContain('Grand Haven');
    expect(row.notes).toContain('Lot 15');
    expect(row.notes).toContain('[source:build_quote]');
  });

  test('id is the requestId; status is submitted', () => {
    const row = buildQuoteRow(base());
    expect(row.id).toBe(UUID_A);
    expect(row.status).toBe('submitted');
    expect(row.contact_name).toBe('Jane Doe');
    expect(row.contact_email).toBe('jane@example.com');
  });

  test('clamps invalid pricing', () => {
    expect(buildQuoteRow(base({ totalEstimate: -5 })).total_estimate).toBeNull();
    expect(buildQuoteRow(base({ totalEstimate: 250_000 })).total_estimate).toBe(250_000);
  });
});

test.describe('leadContract — idempotency signatures', () => {
  test('same material payload → identical signature regardless of requestId', () => {
    expect(materialSignature(base({ requestId: UUID_A }))).toBe(
      materialSignature(base({ requestId: UUID_B })),
    );
  });

  test('changed material payload → different signature', () => {
    expect(materialSignature(base({ message: 'one' }))).not.toBe(
      materialSignature(base({ message: 'two' })),
    );
  });

  test('isSameSubmission: duplicate vs conflict decision', () => {
    const r1 = buildQuoteRow(base({ message: 'hello' }));
    const sameDataNewId = buildQuoteRow(base({ requestId: UUID_B, message: 'hello' }));
    const changedData = buildQuoteRow(base({ message: 'different' }));
    expect(isSameSubmission(r1, sameDataNewId)).toBe(true); // → duplicate=true
    expect(isSameSubmission(r1, changedData)).toBe(false); // → 409 conflict
  });
});
