-- Phase 25: Payment Infrastructure & Manual Verification

-- 1. Create payment_receivers table for admin-configured accounts
CREATE TABLE IF NOT EXISTS public.payment_receivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- 'bkash', 'nagad', 'binance', etc.
    display_name TEXT NOT NULL,
    receiver_identifier TEXT NOT NULL, -- Phone number, wallet address, etc.
    instructions TEXT,
    currency TEXT NOT NULL DEFAULT 'BDT',
    minimum_amount NUMERIC(10, 2) DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create audit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    payment_id UUID REFERENCES public.payments(id),
    result TEXT,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Update payments table with verification fields
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS customer_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS sender_identifier TEXT,
ADD COLUMN IF NOT EXISTS received_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS received_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS risk_score TEXT DEFAULT 'low',
ADD COLUMN IF NOT EXISTS screenshot_url TEXT,
ADD COLUMN IF NOT EXISTS email_delivery_requested BOOLEAN DEFAULT false;

-- 4. RLS & Grants
ALTER TABLE public.payment_receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.payment_receivers TO authenticated;
GRANT ALL ON public.payment_receivers TO service_role;

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- Policies for payment_receivers (Admin can manage, users can only read enabled ones)
CREATE POLICY "Public can read enabled payment receivers" 
ON public.payment_receivers FOR SELECT 
TO authenticated 
USING (enabled = true);

CREATE POLICY "Admins can manage payment receivers" 
ON public.payment_receivers FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Policies for audit_logs (Only admins/super_admins can read)
CREATE POLICY "Admins can read audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 5. Seed initial manual payment accounts
INSERT INTO public.payment_receivers (provider, display_name, receiver_identifier, instructions, currency, sort_order)
VALUES 
('bkash', 'bKash Personal', '+8801934857886', 'Send Money to our personal bKash number. Use Order ID as reference.', 'BDT', 1),
('nagad', 'Nagad Personal', '+8801934857886', 'Send Money to our personal Nagad number. Use Order ID as reference.', 'BDT', 2)
ON CONFLICT DO NOTHING;

-- 6. Add unique constraint for (provider, customer_transaction_id) to prevent duplicate submissions
-- Only for non-null transaction IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_unique_transaction 
ON public.payments (provider, customer_transaction_id) 
WHERE customer_transaction_id IS NOT NULL;

