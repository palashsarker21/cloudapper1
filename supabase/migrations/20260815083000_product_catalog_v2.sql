-- Product Catalog Schema V2 enhancements
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description_bn TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS full_description_bn TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_bn TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features_bn JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_primary_product BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supported_platforms JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'instant'; -- instant, manual, scheduled

-- Product Status check constraint
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS product_status_check;
DO $$ BEGIN
    ALTER TABLE public.products ADD CONSTRAINT product_status_check CHECK (status IN ('active', 'coming_soon', 'draft', 'archived'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Product Packages Table
CREATE TABLE IF NOT EXISTS public.product_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    name_bn TEXT,
    slug TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BDT',
    duration_value INTEGER,
    duration_unit TEXT, -- day, week, month, year, lifetime
    license_plan TEXT,
    max_activations INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, slug)
);

GRANT SELECT ON public.product_packages TO anon;
GRANT SELECT ON public.product_packages TO authenticated;
GRANT ALL ON public.product_packages TO service_role;

ALTER TABLE public.product_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for active packages" ON public.product_packages
    FOR SELECT TO public USING (status = 'active');

-- Initial Primary Product: Lovable Unlimited Credits Extension
-- First, get the extensions category ID
DO $$
DECLARE
    ext_cat_id UUID;
    lovable_prod_id UUID;
BEGIN
    SELECT id INTO ext_cat_id FROM public.categories WHERE slug = 'extensions' LIMIT 1;
    
    IF ext_cat_id IS NULL THEN
        INSERT INTO public.categories (name, slug, icon, description)
        VALUES ('Extensions', 'extensions', 'Globe', 'Browser extensions and license keys')
        RETURNING id INTO ext_cat_id;
    END IF;

    -- Insert/Update Primary Product
    INSERT INTO public.products (
        name, slug, description, price, is_active, is_featured, is_primary_product, 
        category_id, product_type, status, short_description, full_description,
        supported_platforms, delivery_type
    ) VALUES (
        'Lovable Unlimited Credits Extension', 
        'lovable-unlimited-credits',
        'Unlock unlimited Lovable credit usage with CloudApper''s browser extension.',
        100.00, true, true, true,
        ext_cat_id, 'browser_extensions', 'active',
        'Unlimited Lovable credits through CloudApper''s browser extension.',
        'Unlock unlimited Lovable credit usage with CloudApper''s browser extension. Fast activation, multiple durations, and secure delivery.',
        '["Chrome", "Edge", "Brave", "Kiwi"]'::jsonb,
        'instant'
    )
    ON CONFLICT (slug) DO UPDATE SET
        is_primary_product = true,
        status = 'active'
    RETURNING id INTO lovable_prod_id;

    -- Insert Packages
    INSERT INTO public.product_packages (product_id, name, slug, price, duration_value, duration_unit, sort_order)
    VALUES 
        (lovable_prod_id, '24 Hours', '24h', 100.00, 1, 'day', 1),
        (lovable_prod_id, '3 Days', '3d', 300.00, 3, 'day', 2),
        (lovable_prod_id, '7 Days', '7d', 700.00, 7, 'day', 3),
        (lovable_prod_id, '15 Days', '15d', 1500.00, 15, 'day', 4),
        (lovable_prod_id, '30 Days', '30d', 3000.00, 30, 'day', 5),
        (lovable_prod_id, 'Lifetime', 'lifetime', 12000.00, 9999, 'lifetime', 6)
    ON CONFLICT (product_id, slug) DO NOTHING;
END $$;
