
-- Fix SECURITY DEFINER function search path and execution privileges
ALTER FUNCTION public.get_decrypted_license(UUID) SET search_path = public;

-- Revoke execute from public and authenticated (we'll grant it back via server function which uses service_role or admin check)
REVOKE EXECUTE ON FUNCTION public.get_decrypted_license(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_decrypted_license(UUID) FROM authenticated;

-- Grant to service_role so server functions can call it
GRANT EXECUTE ON FUNCTION public.get_decrypted_license(UUID) TO service_role;
