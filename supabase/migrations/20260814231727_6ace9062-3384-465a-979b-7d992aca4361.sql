-- 1. Secure storage buckets
-- product-images (public) - anyone can read
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'product-images');

-- digital-products (private) - authenticated only via signed URLs (handled by app)
-- No public SELECT policy needed for digital-products

-- 2. Fix SECURITY DEFINER warnings for has_role
-- Revoke all default execution rights
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM authenticated;

-- Grant execution to service_role (used by other security definer functions or RLS)
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO service_role;
-- Grant execution to authenticated role if it's meant to be used in their RLS
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;

-- 3. Fix user_roles RLS (Linter info: RLS enabled but no policy)
CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
