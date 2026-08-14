-- Fulfillment Status Enum
DO $$ BEGIN
    CREATE TYPE public.fulfillment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fulfillment Engine Table
CREATE TABLE public.fulfillments (
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
CREATE TABLE public.entitlements (
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
CREATE TABLE public.fulfillment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fulfillment_id UUID REFERENCES public.fulfillments(id) ON DELETE CASCADE NOT NULL,
    event TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'system', -- 'system' or admin user_id
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.fulfillments TO authenticated;
GRANT ALL ON public.fulfillments TO service_role;

GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;

GRANT SELECT ON public.fulfillment_logs TO authenticated;
GRANT ALL ON public.fulfillment_logs TO service_role;

-- RLS
ALTER TABLE public.fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_logs ENABLE ROW LEVEL SECURITY;

-- Policies for Fulfillments
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

-- Policies for Entitlements
CREATE POLICY "Users can view their own entitlements"
ON public.entitlements FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all entitlements"
ON public.entitlements FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for Logs
CREATE POLICY "Admins can view all logs"
ON public.fulfillment_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger for updated_at
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
