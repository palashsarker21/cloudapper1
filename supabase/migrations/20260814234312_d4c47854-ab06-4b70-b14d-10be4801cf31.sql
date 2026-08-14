
-- Create settings table for app configuration
CREATE TABLE public.settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Grant access to authenticated users (admin role checked via RLS or logic)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Initial settings data
INSERT INTO public.settings (id, value)
VALUES 
('payment_providers', '{
    "bkash": { "enabled": false, "credentials": {}, "webhook_url": "" },
    "nagad": { "enabled": false, "credentials": {}, "webhook_url": "" },
    "binance_pay": { "enabled": false, "credentials": {}, "webhook_url": "" }
}'::jsonb);
