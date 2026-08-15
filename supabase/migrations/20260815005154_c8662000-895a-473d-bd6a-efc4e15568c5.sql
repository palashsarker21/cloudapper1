DO $$ BEGIN
    ALTER TYPE public.payment_provider ADD VALUE IF NOT EXISTS 'bitget_pay';
    ALTER TYPE public.payment_provider ADD VALUE IF NOT EXISTS 'crypto_wallet';
    ALTER TYPE public.payment_provider ADD VALUE IF NOT EXISTS 'lemon_squeezy';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'created';
    ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'processing';
    ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'expired';
    ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'cancelled';
    ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'paid';
    ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'underpaid';
    ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'overpaid';
    ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'manual_review';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'pending_payment';
    ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'paid';
    ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'fulfilled';
    ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'completed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enhance payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_reference TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS transaction_hash TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS network TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Unique constraint for duplicate transaction protection (only when hash is not null)
CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_tx_hash_idx ON public.payments (provider, transaction_hash) WHERE transaction_hash IS NOT NULL;

-- Create payment_events table for idempotency
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider public.payment_provider NOT NULL,
    event_id TEXT NOT NULL,
    payment_id UUID REFERENCES public.payments(id),
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(provider, event_id)
);

-- Create crypto_wallets table for admin configuration
CREATE TABLE IF NOT EXISTS public.crypto_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset TEXT NOT NULL, 
    network TEXT NOT NULL, 
    wallet_address TEXT NOT NULL,
    minimum_amount DECIMAL(20, 8) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment_audit_log
CREATE TABLE IF NOT EXISTS public.payment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id),
    order_id UUID REFERENCES public.orders(id),
    actor UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    previous_status public.payment_status,
    new_status public.payment_status,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS & Grants
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT SELECT ON public.crypto_wallets TO authenticated;
GRANT SELECT, INSERT ON public.payment_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_events TO authenticated;

GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.payment_events TO service_role;
GRANT ALL ON public.crypto_wallets TO service_role;
GRANT ALL ON public.payment_audit_log TO service_role;

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view active crypto wallets" ON public.crypto_wallets FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Users can view their own audit logs" ON public.payment_audit_log FOR SELECT TO authenticated USING (auth.uid() = actor OR (SELECT user_id FROM public.payments WHERE id = payment_id) = auth.uid());
