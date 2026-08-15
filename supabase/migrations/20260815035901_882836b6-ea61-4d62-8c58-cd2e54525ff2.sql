
-- 1. Create Fulfillment System
-- Fulfillment Status Enum
DO $$ BEGIN
    CREATE TYPE public.fulfillment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fulfillment Engine Table
CREATE TABLE IF NOT EXISTS public.fulfillments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    status public.fulfillment_status DEFAULT 'pending' NOT NULL,
    fulfillment_type TEXT NOT NULL, -- 'license', 'digital_file', 'manual', etc.
    idempotency_key TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- Entitlements Table (What the customer actually owns)
CREATE TABLE IF NOT EXISTS public.entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    fulfillment_id UUID REFERENCES public.fulfillments(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'license', 'file', 'credit'
    data JSONB NOT NULL, -- contains license key, file reference, etc.
    expires_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Fulfillment Audit Logs
CREATE TABLE IF NOT EXISTS public.fulfillment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fulfillment_id UUID REFERENCES public.fulfillments(id) ON DELETE CASCADE NOT NULL,
    event TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'system', -- 'system' or admin user_id
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create License table
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL DEFAULT 'eklas',
    provider_license_id TEXT,
    license_key_encrypted TEXT NOT NULL,
    license_key_last4 TEXT NOT NULL,
    plan TEXT,
    duration_value INTEGER,
    duration_unit TEXT,
    max_activations INTEGER DEFAULT 5,
    status TEXT DEFAULT 'active' NOT NULL,
    expires_at TIMESTAMPTZ,
    generated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    delivered_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Unique Index for completed fulfillment idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_fulfillments_order_item_license 
ON public.fulfillments (order_id, idempotency_key) 
WHERE status = 'completed';

-- 4. Grants
GRANT SELECT, INSERT, UPDATE ON public.fulfillments TO authenticated;
GRANT ALL ON public.fulfillments TO service_role;

GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;

GRANT SELECT ON public.fulfillment_logs TO authenticated;
GRANT ALL ON public.fulfillment_logs TO service_role;

GRANT SELECT ON public.licenses TO authenticated;
GRANT ALL ON public.licenses TO service_role;

-- 5. RLS
ALTER TABLE public.fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- 6. Policies
CREATE POLICY "Users can view their own fulfillments"
ON public.fulfillments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = fulfillments.order_id
        AND orders.customer_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all fulfillments"
ON public.fulfillments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own entitlements"
ON public.entitlements FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all entitlements"
ON public.entitlements FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all logs"
ON public.fulfillment_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own licenses"
ON public.licenses FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY "Admins can manage all licenses"
ON public.licenses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Functions
CREATE OR REPLACE FUNCTION public.get_decrypted_license(_license_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_key TEXT;
BEGIN
    IF NOT public.has_role(auth.uid(), 'super_admin') AND NOT EXISTS (
        SELECT 1 FROM public.licenses WHERE id = _license_id AND customer_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT license_key_encrypted INTO v_key FROM public.licenses WHERE id = _license_id;
    RETURN v_key;
END;
$$;

-- 8. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fulfillments_updated_at
    BEFORE UPDATE ON public.fulfillments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
    BEFORE UPDATE ON public.licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
