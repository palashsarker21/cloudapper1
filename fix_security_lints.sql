-- Fix security linter issues from Phase 25

-- 1. has_role function (Set search_path to public to prevent search_path mutable warning)
-- This function is likely defined already, we update it to be safe.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. Revoke execute on security definer functions from public/anon where not explicitly needed
-- Most of our functions are called from server functions via supabaseAdmin or context.supabase with Bearer token.
-- The requireSupabaseAuth middleware uses a Bearer token, so 'authenticated' role is used.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- If there are other security definer functions, we should audit them.
-- Based on previous context, 'claim_license' might be one.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'claim_license') THEN
        REVOKE EXECUTE ON FUNCTION public.claim_license(uuid, uuid) FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION public.claim_license(uuid, uuid) FROM anon;
        GRANT EXECUTE ON FUNCTION public.claim_license(uuid, uuid) TO authenticated;
    END IF;
END $$;

