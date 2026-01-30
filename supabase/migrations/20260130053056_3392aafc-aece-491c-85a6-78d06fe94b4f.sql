-- Fix Security Issue #1: plaid_connections missing INSERT/UPDATE/DELETE policies
-- Block direct INSERT from all users (service role bypasses RLS for edge functions)
CREATE POLICY "block_direct_insert_plaid_connections"
ON plaid_connections
FOR INSERT
WITH CHECK (false);

-- Block all UPDATE operations (connections should be immutable)
CREATE POLICY "block_all_updates_plaid_connections"
ON plaid_connections
FOR UPDATE
USING (false);

-- Allow team members to delete connections (e.g., for GDPR data removal requests)
CREATE POLICY "team_delete_plaid_connections"
ON plaid_connections
FOR DELETE
USING (is_admin_or_builder(auth.uid()));

-- Fix Security Issue #2: verified_financials missing INSERT/DELETE policies
-- Block direct INSERT from all users (service role bypasses RLS for edge functions)
CREATE POLICY "block_direct_insert_verified_financials"
ON verified_financials
FOR INSERT
WITH CHECK (false);

-- Allow team members to delete verified financials (e.g., for data removal requests)
CREATE POLICY "team_delete_verified_financials"
ON verified_financials
FOR DELETE
USING (is_admin_or_builder(auth.uid()));