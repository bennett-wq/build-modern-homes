-- ============================================================================
-- Backfill plaid_connections into source control + restrict to admin-only
-- ============================================================================
-- Context:
-- The plaid_connections table was created via Studio/Lovable UI, not via a
-- migration, so its definition has not been in source control. This migration
-- captures the current shape and tightens read/delete access from
-- "admin or builder" to "admin only".
--
-- Builders are the back-office pricing role; they should not have access to
-- customer Plaid access tokens, which grant ongoing read access to bank
-- account data (assets, liabilities, identity per plaid-create-link-token).
--
-- Plaintext encryption at rest is NOT addressed here. That is Phase 2 work
-- using Supabase Vault and dedicated RPC functions for store/read.
-- ============================================================================

-- 1. Ensure table exists with current shape. Idempotent — does nothing if
--    the live table already matches.
CREATE TABLE IF NOT EXISTS public.plaid_connections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    uuid NOT NULL,
  plaid_item_id     text NOT NULL,
  access_token      text NOT NULL,
  institution_name  text,
  products_enabled  text[] DEFAULT '{}',
  consent_timestamp timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Note: application_id should reference public.financing_applications(id)
-- with ON DELETE CASCADE. Not added here because we have not confirmed
-- existing rows are all valid references. Add in a follow-up after a
-- one-time orphan check.

ALTER TABLE public.plaid_connections ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies. Idempotent — works whether they exist or not.
DROP POLICY IF EXISTS block_all_updates_plaid_connections    ON public.plaid_connections;
DROP POLICY IF EXISTS block_direct_insert_plaid_connections  ON public.plaid_connections;
DROP POLICY IF EXISTS team_read_plaid_connections            ON public.plaid_connections;
DROP POLICY IF EXISTS team_delete_plaid_connections          ON public.plaid_connections;
DROP POLICY IF EXISTS admin_read_plaid_connections           ON public.plaid_connections;
DROP POLICY IF EXISTS admin_delete_plaid_connections         ON public.plaid_connections;

-- 3. Recreate policies. Read/Delete are admin-only (was admin OR builder).
--    Insert and Update remain hard-denied at the policy layer — only the
--    service-role edge function (which bypasses RLS) can insert.
CREATE POLICY block_all_updates_plaid_connections
  ON public.plaid_connections FOR UPDATE
  USING (false);

CREATE POLICY block_direct_insert_plaid_connections
  ON public.plaid_connections FOR INSERT
  WITH CHECK (false);

CREATE POLICY admin_read_plaid_connections
  ON public.plaid_connections FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY admin_delete_plaid_connections
  ON public.plaid_connections FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Index for application lookup performance (idempotent).
CREATE INDEX IF NOT EXISTS idx_plaid_connections_application_id
  ON public.plaid_connections(application_id);

-- 5. Documentation.
COMMENT ON TABLE public.plaid_connections IS
  'Plaid Item access tokens for financing applications. Read/Delete restricted to admin role only. Insert via service-role edge function (plaid-exchange-token) which bypasses RLS.';
COMMENT ON COLUMN public.plaid_connections.access_token IS
  'Plaintext Plaid access_token. TO BE ENCRYPTED via Supabase Vault in Phase 2 work.';