-- Update Manual Payment Receiver Numbers
-- Deactivate old receiver +8801934857886 for bKash and Nagad
-- Set up new Nagad receiver +8801323405346

-- 1. Deactivate old receiver (historical data preserved)
UPDATE public.payment_receivers
SET enabled = false,
    updated_at = now()
WHERE receiver_identifier = '+8801934857886';

-- 2. Upsert Nagad receiver with new number
-- First, ensure any existing active Nagad receiver is disabled if it's not the new number
UPDATE public.payment_receivers
SET enabled = false,
    updated_at = now()
WHERE provider = 'nagad' AND receiver_identifier != '+8801323405346';

-- Now insert/update the new active Nagad receiver
-- We use a subquery to avoid needing the ID if we just want to ensure one active one exists
INSERT INTO public.payment_receivers (provider, display_name, receiver_identifier, instructions, currency, enabled, sort_order)
VALUES ('nagad', 'Nagad Personal', '+8801323405346', 'Send Money to our personal Nagad number. Use Order ID as reference.', 'BDT', true, 2)
ON CONFLICT DO NOTHING;

-- If it didn't insert (because of uniqueness or existing ID), ensure the one with new number is enabled
UPDATE public.payment_receivers
SET enabled = true,
    updated_at = now()
WHERE provider = 'nagad' AND receiver_identifier = '+8801323405346';

-- 3. Ensure no active bKash receiver exists (as instructed to set status to disabled/unavailable)
UPDATE public.payment_receivers
SET enabled = false,
    updated_at = now()
WHERE provider = 'bkash';
