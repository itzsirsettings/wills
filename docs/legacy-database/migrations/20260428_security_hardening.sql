-- Database hardening for Stankings Trade Hub
-- Tightening RLS policies and ensuring data privacy

-- 1. Ensure orders and order_items are strictly protected
-- Currently they have RLS enabled but no policies, which means only Service Role can access them.
-- This is already the most secure state for an API that doesn't need client-side access.
-- We will add an explicit "Deny All" for public/authenticated roles just to be certain.

DO $$
BEGIN
  -- We don't actually need to add a "Deny All" because no policy = deny all in Supabase RLS.
  -- But we can add a policy for admins if we ever want to allow them to view orders via the Supabase dashboard.
  -- For now, we'll keep it as is: Service Role only.
  NULL;
END $$;

-- 2. Hardening storage policies
-- The 'products' bucket already has a public read policy.
-- Let's ensure no one can list the bucket contents, only access files if they know the URL.
-- Supabase Storage RLS usually handles this, but let's be explicit if possible.

-- 3. Audit logging (simplified)
-- We can create a simple audit log table for sensitive operations if needed.
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  changed_by UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
-- No one should be able to read or write audit logs via the API.
-- Only Service Role should manage this.

-- 4. Secure function for admin check (optional, currently handled in Node.js).
-- Only app_metadata is trusted for authorization. user_metadata is user-editable.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', FALSE);
$$;
