-- Revoke from PUBLIC (both anon and authenticated)
REVOKE EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_license(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;

-- Revoke specifically from authenticated/anon just in case
REVOKE ALL ON FUNCTION public.decrement_stock(UUID, INTEGER) FROM authenticated, anon;
REVOKE ALL ON FUNCTION public.claim_license(UUID, UUID) FROM authenticated, anon;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated, anon;

-- Explicitly GRANT to service_role (which is the intended caller for server-side logic)
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_license(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;
