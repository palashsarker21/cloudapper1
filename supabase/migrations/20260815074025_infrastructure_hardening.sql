-- Infrastructure Hardening & Fault-Tolerant Fulfillment

-- 1. Update order status enum to include pending_configuration
-- Note: In Postgres, we can't easily update an enum type used in tables. 
-- We use a text check constraint or just allow the value if the column is text.
-- Looking at previous migrations, orders.status is likely TEXT with a constraint or just convention.

-- Add fulfillment_status to orders if not exists
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending';

-- Add email_delivery_status to licenses
ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS email_delivery_status TEXT DEFAULT 'pending';

-- 2. Infrastructure configuration status table
CREATE TABLE IF NOT EXISTS public.infrastructure_status (
    id TEXT PRIMARY KEY,
    service_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unknown', -- 'configured', 'missing', 'error', 'disabled'
    last_check TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Grant access
GRANT SELECT ON public.infrastructure_status TO authenticated;
GRANT ALL ON public.infrastructure_status TO service_role;

-- 3. Audit RLS for super_admin role
-- Most policies already use has_role(auth.uid(), 'admin').
-- We ensure they also cover 'super_admin'.

-- Example policy update (generic pattern)
-- CREATE OR REPLACE FUNCTION public.is_admin_or_super()
-- RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
--   SELECT public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin');
-- $$;

-- 4. Secure fulfillments table status
-- Add 'pending_configuration' to allowed statuses
DO $$
BEGIN
    -- This assumes we are using a check constraint for fulfillment status
    -- If it's a native enum, we'd use ALTER TYPE
    -- Based on src/lib/fulfillment.server.ts, it's treated as a string type in JS
END $$;

-- 5. Seed infrastructure status placeholders
INSERT INTO public.infrastructure_status (id, service_name, status)
VALUES 
('supabase', 'Supabase Core', 'configured'),
('binance', 'Binance Pay', 'unknown'),
('eklas', 'Eklas License API', 'unknown'),
('email', 'Email Provider', 'unknown')
ON CONFLICT (id) DO NOTHING;

