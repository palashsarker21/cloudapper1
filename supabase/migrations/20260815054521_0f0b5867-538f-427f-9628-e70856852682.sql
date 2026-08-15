-- Continue schema updates after enums committed
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS customer_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS sender_mobile TEXT,
ADD COLUMN IF NOT EXISTS received_amount DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS received_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS email_delivery_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Duplicate protection constraint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_provider_customer_transaction_id_key') THEN
        ALTER TABLE public.payments ADD CONSTRAINT payments_provider_customer_transaction_id_key UNIQUE (provider, customer_transaction_id);
    END IF;
END $$;

-- 5. Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can view all audit logs') THEN
        CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
            FOR SELECT TO authenticated
            USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own audit logs') THEN
        CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
            FOR SELECT TO authenticated
            USING (actor_id = auth.uid());
    END IF;
END $$;
