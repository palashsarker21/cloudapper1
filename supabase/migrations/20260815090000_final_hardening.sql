-- Final Hardening: Data Integrity and Fault Tolerance

-- 1. Ensure order amounts are immutable once paid
CREATE OR REPLACE FUNCTION public.protect_paid_orders()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'paid' AND (NEW.total != OLD.total OR NEW.currency != OLD.currency) THEN
    RAISE EXCEPTION 'Cannot modify total or currency of a paid order';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_paid_orders ON public.orders;
CREATE TRIGGER trg_protect_paid_orders
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.protect_paid_orders();

-- 2. Unique index for entitlements to prevent duplicate assets per order item
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_entitlement_per_item 
ON public.entitlements (order_id, product_id, user_id) 
WHERE (metadata->>'status' IS NULL OR metadata->>'status' != 'revoked');

-- 3. Ensure payments have a back-reference constraint to orders
ALTER TABLE public.payments 
ADD CONSTRAINT fk_payments_order 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- 4. Add index for performance on status checks
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_fulfillments_status ON public.fulfillments(status);

-- 5. Helper to check if a user is a Super Admin specifically
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
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
      AND role = 'super_admin'
  )
$$;
