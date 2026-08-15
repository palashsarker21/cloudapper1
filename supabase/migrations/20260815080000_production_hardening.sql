-- Production Hardening: Security, Idempotency and RBAC

-- 1. Ensure admin and super_admin roles are properly handled in a combined helper
CREATE OR REPLACE FUNCTION public.is_admin_or_super(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- 2. Harden orders and payments with status constraints if not already present
-- Use a check constraint for orders status
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'failed', 'cancelled', 'refunded'));

-- Use a check constraint for payments status
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check 
CHECK (status IN ('created', 'pending', 'processing', 'paid', 'failed', 'expired', 'cancelled', 'refunded', 'underpaid', 'overpaid', 'manual_review', 'awaiting_payment', 'payment_submitted', 'under_review', 'ready_for_confirmation', 'payment_verified', 'payment_rejected'));

-- 3. Ensure uniqueness for fulfillment to prevent duplicate licenses per order item
-- idempotency_key is already UNIQUE, but let's ensure it's not null
ALTER TABLE public.fulfillments ALTER COLUMN idempotency_key SET NOT NULL;

-- 4. Audit Log Helper for consistent logging
CREATE OR REPLACE FUNCTION public.log_platform_action(
    _actor_id UUID,
    _action TEXT,
    _target_type TEXT,
    _target_id TEXT,
    _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, metadata)
    VALUES (_actor_id, _action, _target_type, _target_id, _metadata);
END;
$$;

-- 5. Revoke direct access to sensitive tables for authenticated users, rely on RLS and RPC
GRANT SELECT ON public.audit_logs TO authenticated;
-- Users should not be able to insert directly into audit_logs
REVOKE INSERT ON public.audit_logs FROM authenticated;

-- 6. Ensure Super Admin role is assigned to the specified production email
-- This was mentioned in a previous phase but let's be sure
SELECT public.bootstrap_super_admin('palashsarker1993@gmail.com');
