-- Phase 25: Risk Flagging and Detailed Audit

-- Add risk_score to payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS risk_score TEXT DEFAULT 'low';

-- Create payment_risk_flags table for deterministic flagging
CREATE TABLE IF NOT EXISTS public.payment_risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL, -- 'duplicate_txid', 'amount_mismatch', etc.
    severity TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS & Grants for risk flags
ALTER TABLE public.payment_risk_flags ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.payment_risk_flags TO authenticated;
GRANT ALL ON public.payment_risk_flags TO service_role;

CREATE POLICY "Admins can read risk flags" 
ON public.payment_risk_flags FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Enhance audit_logs with order_id and payment_id if not present
-- (Already checked they exist in some versions, but let's ensure target_id can be mapped)
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id),
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id);

