ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receiver_id uuid REFERENCES public.payment_receivers(id);

GRANT SELECT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
