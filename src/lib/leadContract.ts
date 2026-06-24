// ============================================================================
// Lead delivery contract (pure, dependency-free)
// ----------------------------------------------------------------------------
// Shared source of truth for buyer lead submission: types, normalization,
// validation, the public.quotes row mapping, and the "material fields"
// signature used for idempotency. Browser copy for client-side UX (requestId
// reuse, optimistic checks). The CANONICAL, Deno-tested server contract lives at
// supabase/functions/_shared/leadContract.ts and MUST stay identical to this.
//
// Pragmatic no-migration bridge (approved): all lead sources are stored in
// public.quotes. Foreign-key columns are only set when a verified DB UUID is
// available; otherwise the human-readable selection lives in the notes
// envelope. This is a lead-capture bridge, NOT a normalized CRM schema.
// ============================================================================

export const LEAD_SOURCES = [
  'build_quote',
  'land_quote',
  'community_quote',
  'contact',
  'consultation',
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

// Live production enum values (verified against the database). Anything not in
// these sets is mapped to null / the column default — never invented.
export const VALID_BUILD_TYPES = new Set(['xmod', 'mod']);
export const VALID_SERVICE_PACKAGES = new Set([
  'delivered_installed',
  'supply_only',
  'community_all_in',
]);

// New buyer leads use the existing 'submitted' status (verified live enum:
// draft | submitted | contacted | converted). 'submitted' = New in the admin UI.
export const QUOTE_STATUS_SUBMITTED = 'submitted';

// Field caps (defense against oversized payloads).
export const CAPS = {
  name: 120,
  email: 200,
  phone: 40,
  message: 4000,
  address: 300,
  zip: 20,
  text: 200,
  notes: 4000,
  payloadBytes: 16_000,
} as const;

export interface LeadInput {
  requestId: string; // client-generated UUID; becomes quotes.id + idempotency key
  source: LeadSource;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  // Human-readable selection (no FK UUIDs required).
  modelName?: string;
  buildTypeRaw?: string;
  developmentName?: string;
  lotLabel?: string;
  packageName?: string;
  garageDoorName?: string;
  servicePackageRaw?: string;
  timeline?: string;
  // Structured columns that are safe to populate directly.
  totalEstimate?: number | null;
  zipCode?: string;
  address?: string;
  // Verified DB UUIDs only (left null when unavailable — never fabricated).
  developmentId?: string | null;
  lotId?: string | null;
  modelId?: string | null;
  exteriorPackageId?: string | null;
  garageDoorId?: string | null;
  // Anti-spam honeypot — must be empty for a human submission.
  honeypot?: string;
}

// Mapped row for public.quotes (only columns this bridge writes from the client).
export interface QuoteRow {
  id: string;
  source: LeadSource; // not a column — carried for the server; encoded into notes
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  total_estimate: number | null;
  zip_code: string | null;
  address: string | null;
  build_type: string | null;
  service_package: string;
  development_id: string | null;
  lot_id: string | null;
  model_id: string | null;
  exterior_package_id: string | null;
  garage_door_id: string | null;
  notes: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}

export function normalizeEmail(v: unknown): string {
  return typeof v === 'string' ? v.trim().toLowerCase() : '';
}

// Keep a single leading '+', drop everything else that is not a digit.
export function normalizePhone(v: unknown): string {
  if (typeof v !== 'string') return '';
  const trimmed = v.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/[^\d]/g, '');
}

export function normalizeName(v: unknown): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '';
}

function clean(v: unknown, cap: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, cap);
}

function validBuildType(v: unknown): string | null {
  return typeof v === 'string' && VALID_BUILD_TYPES.has(v) ? v : null;
}

function validServicePackage(v: unknown): string {
  return typeof v === 'string' && VALID_SERVICE_PACKAGES.has(v)
    ? v
    : 'delivered_installed';
}

function validUuidOrNull(v: unknown): string | null {
  return isUuid(v) ? (v as string) : null;
}

function validEstimate(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return null;
  // Reject absurd values (> $100M) rather than trusting the client.
  if (v > 100_000_000) return null;
  return Math.round(v);
}

const SOURCE_LABEL: Record<LeadSource, string> = {
  build_quote: 'Build quote',
  land_quote: 'Land quote',
  community_quote: 'Community quote',
  contact: 'Contact message',
  consultation: 'Consultation request',
};

// Deterministic, plain-text, capped notes envelope. Holds the lead source, the
// buyer message, and the human-readable selection — NOT duplicated PII. Same
// input always produces the same string (required for idempotency comparison).
export function buildNotesEnvelope(input: LeadInput): string {
  const lines: string[] = [];
  lines.push(`[source:${input.source}] [v1] ${SOURCE_LABEL[input.source]}`);

  const message = clean(input.message, CAPS.message);
  if (message) lines.push(`Message: ${message}`);

  const sel: string[] = [];
  const model = clean(input.modelName, CAPS.text);
  if (model) sel.push(`Model ${model}`);
  const bt = clean(input.buildTypeRaw, CAPS.text);
  if (bt) sel.push(bt);
  const lot = clean(input.lotLabel, CAPS.text);
  if (lot) sel.push(`Lot ${lot}`);
  const dev = clean(input.developmentName, CAPS.text);
  if (dev) sel.push(dev);
  const pkg = clean(input.packageName, CAPS.text);
  if (pkg) sel.push(`Package ${pkg}`);
  const garage = clean(input.garageDoorName, CAPS.text);
  if (garage) sel.push(`Garage ${garage}`);
  if (sel.length) lines.push(`Selection: ${sel.join(' · ')}`);

  const estimate = validEstimate(input.totalEstimate ?? null);
  if (estimate != null) {
    lines.push(
      `Budgetary estimate: $${estimate.toLocaleString('en-US')} (preliminary snapshot — not a final bid)`,
    );
  }
  const timeline = clean(input.timeline, CAPS.text);
  if (timeline) lines.push(`Timeline: ${timeline}`);

  return lines.join('\n').slice(0, CAPS.notes);
}

// Map a LeadInput to the public.quotes row this bridge writes. Deterministic.
// user_id is intentionally absent — the server derives it; the client never
// supplies it.
export function buildQuoteRow(input: LeadInput): QuoteRow {
  return {
    id: input.requestId,
    source: input.source,
    contact_name: clean(normalizeName(input.name), CAPS.name),
    contact_email: clean(normalizeEmail(input.email), CAPS.email),
    contact_phone: clean(normalizePhone(input.phone), CAPS.phone),
    status: QUOTE_STATUS_SUBMITTED,
    total_estimate: validEstimate(input.totalEstimate ?? null),
    zip_code: clean(input.zipCode, CAPS.zip),
    address: clean(input.address, CAPS.address),
    build_type: validBuildType(input.buildTypeRaw),
    service_package: validServicePackage(input.servicePackageRaw),
    development_id: validUuidOrNull(input.developmentId),
    lot_id: validUuidOrNull(input.lotId),
    model_id: validUuidOrNull(input.modelId),
    exterior_package_id: validUuidOrNull(input.exteriorPackageId),
    garage_door_id: validUuidOrNull(input.garageDoorId),
    notes: buildNotesEnvelope(input),
  };
}

// Per-source required fields, server-authoritative.
export function validateLead(input: LeadInput): string[] {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return ['payload must be an object'];

  if (!isUuid(input.requestId)) errors.push('requestId must be a valid UUID');
  if (!LEAD_SOURCES.includes(input.source))
    errors.push('source is not a recognized lead type');

  const name = normalizeName(input.name);
  if (!name) errors.push('name is required');
  else if (name.length > CAPS.name) errors.push('name is too long');

  const email = normalizeEmail(input.email);
  if (!email) errors.push('email is required');
  else if (!EMAIL_RE.test(email) || email.length > CAPS.email)
    errors.push('email is invalid');

  if (input.phone != null && input.phone !== '') {
    const phone = normalizePhone(input.phone);
    if (phone.replace('+', '').length < 7 || phone.length > CAPS.phone)
      errors.push('phone is invalid');
  }
  // name + email are the required identity for every source. Message/phone are
  // optional (the public forms mark them optional), but bounded when present.
  if (input.message != null && String(input.message).length > CAPS.message)
    errors.push('message is too long');
  if (input.address != null && String(input.address).length > CAPS.address)
    errors.push('address is too long');

  const est = input.totalEstimate;
  if (est != null && (typeof est !== 'number' || !Number.isFinite(est) || est < 0))
    errors.push('totalEstimate is invalid');

  for (const [k, v] of Object.entries({
    developmentId: input.developmentId,
    lotId: input.lotId,
    modelId: input.modelId,
    exteriorPackageId: input.exteriorPackageId,
    garageDoorId: input.garageDoorId,
  })) {
    if (v != null && v !== '' && !isUuid(v)) errors.push(`${k} must be a UUID`);
  }

  if (input.honeypot != null && String(input.honeypot).trim() !== '')
    errors.push('rejected'); // honeypot tripped

  // Oversized serialized payload guard.
  try {
    if (JSON.stringify(input).length > CAPS.payloadBytes)
      errors.push('payload is too large');
  } catch {
    errors.push('payload is not serializable');
  }

  return errors;
}

// The fields that define whether two submissions are "the same". Excludes id,
// status, user_id, timestamps, and default-only columns. Used both client-side
// (to decide requestId reuse) and server-side (idempotency conflict check).
export function materialFields(row: QuoteRow) {
  return {
    contact_name: row.contact_name ?? null,
    contact_email: row.contact_email ?? null,
    contact_phone: row.contact_phone ?? null,
    total_estimate: row.total_estimate == null ? null : Number(row.total_estimate),
    build_type: row.build_type ?? null,
    service_package: row.service_package ?? null,
    zip_code: row.zip_code ?? null,
    address: row.address ?? null,
    notes: row.notes ?? null,
  };
}

export function materialSignatureFromRow(row: QuoteRow): string {
  return JSON.stringify(materialFields(row));
}

export function materialSignature(input: LeadInput): string {
  return materialSignatureFromRow(buildQuoteRow(input));
}

// True when two rows represent the same submission (idempotent retry) vs a
// materially different payload reusing the same id (→ 409 conflict).
export function isSameSubmission(a: QuoteRow, b: QuoteRow): boolean {
  return materialSignatureFromRow(a) === materialSignatureFromRow(b);
}
