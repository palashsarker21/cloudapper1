
-- Fix all public SECURITY DEFINER functions
ALTER FUNCTION public.decrement_stock(UUID, INTEGER) SET search_path = public;
ALTER FUNCTION public.claim_license(UUID, UUID) SET search_path = public;

-- Revoke execute from public
REVOKE EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_license(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;

-- Grant to authenticated/service_role as needed
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_license(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
