-- Hardening SECURITY DEFINER functions

-- 1. has_role
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. get_decrypted_license
ALTER FUNCTION public.get_decrypted_license(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_decrypted_license(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_decrypted_license(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_decrypted_license(uuid) TO authenticated, service_role;

-- 3. decrement_stock
ALTER FUNCTION public.decrement_stock(uuid, integer) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) TO authenticated, service_role;

-- 4. claim_license
ALTER FUNCTION public.claim_license(uuid, uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.claim_license(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_license(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_license(uuid, uuid) TO authenticated, service_role;
