-- Phase 25: Unified Migration
-- 1. Tables
CREATE TABLE IF NOT EXISTS public.payment_receivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    display_name TEXT NOT NULL,
    receiver_identifier TEXT NOT NULL,
    instructions TEXT,
    currency TEXT NOT NULL DEFAULT 'BDT',
    minimum_amount NUMERIC(10, 2) DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL,
    severity TEXT DEFAULT 'low',
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- audit_logs enhancement (if audit_logs table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id);
        ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id);
    END IF;
END $$;

-- 2. payments enhancement
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS risk_score TEXT DEFAULT 'low';

-- 3. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_receivers TO authenticated;
GRANT ALL ON public.payment_receivers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_risk_flags TO authenticated;
GRANT ALL ON public.payment_risk_flags TO service_role;

-- 4. RLS
ALTER TABLE public.payment_receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_risk_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage payment receivers" ON public.payment_receivers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read enabled receivers" ON public.payment_receivers FOR SELECT TO authenticated USING (enabled = true);
CREATE POLICY "Admins read risk flags" ON public.payment_risk_flags FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. Seed
INSERT INTO public.payment_receivers (provider, display_name, receiver_identifier, instructions, currency, sort_order)
VALUES 
('bkash', 'bKash Personal', '+8801934857886', 'Send Money to our personal bKash number. Use Order ID as reference.', 'BDT', 1),
('nagad', 'Nagad Personal', '+8801934857886', 'Send Money to our personal Nagad number. Use Order ID as reference.', 'BDT', 2)
ON CONFLICT DO NOTHING;
