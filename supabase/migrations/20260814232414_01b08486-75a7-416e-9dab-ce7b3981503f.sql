-- Drop dependent policy first
DROP POLICY IF EXISTS "Allow public read access for active products" ON public.products;

-- Create Enums
DO $$ BEGIN
    CREATE TYPE public.product_type AS ENUM (
        'ai_credits', 'ai_tools', 'browser_extensions', 'saas_products', 
        'digital_files', 'templates', 'prompts', 'automation_tools', 
        'developer_tools', 'services'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.inventory_type AS ENUM ('unlimited', 'finite', 'license');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.product_status AS ENUM ('draft', 'active', 'out_of_stock', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.delivery_method AS ENUM (
        'instant_download', 'email_delivery', 'license_key', 
        'external_link', 'manual_fulfillment'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.license_status AS ENUM (
        'available', 'assigned', 'expired', 'revoked', 'suspended'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Update products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS product_type public.product_type DEFAULT 'digital_files',
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS full_description TEXT,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS whats_included JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS compatibility JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_method public.delivery_method DEFAULT 'instant_download',
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS version TEXT,
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BDT',
ADD COLUMN IF NOT EXISTS inventory_type public.inventory_type DEFAULT 'unlimited',
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS license_duration INTEGER, -- in days
ADD COLUMN IF NOT EXISTS device_limit INTEGER,
ADD COLUMN IF NOT EXISTS status public.product_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
ADD COLUMN IF NOT EXISTS resale_auth_verified BOOLEAN DEFAULT false;

-- Migrate existing data
UPDATE public.products SET status = 'active' WHERE is_active = true;
UPDATE public.products SET status = 'draft' WHERE is_active = false;

-- Remove old column
ALTER TABLE public.products DROP COLUMN IF EXISTS is_active;

-- Create product_licenses table
CREATE TABLE IF NOT EXISTS public.product_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    license_key TEXT NOT NULL,
    status public.license_status DEFAULT 'available',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create product_media table
CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    media_type TEXT NOT NULL, -- 'image', 'thumbnail', 'gallery', 'file'
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS and GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_licenses TO authenticated;
GRANT ALL ON public.product_licenses TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_media TO authenticated;
GRANT ALL ON public.product_media TO service_role;

GRANT ALL ON public.products TO authenticated;

ALTER TABLE public.product_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- Policies for public access (Marketplace)
CREATE POLICY "Allow public read access for active products v2" ON public.products
    FOR SELECT TO anon, authenticated USING (status = 'active');

CREATE POLICY "Allow public read access for product media" ON public.product_media
    FOR SELECT TO anon, authenticated USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE products.id = product_media.product_id AND products.status = 'active'
        )
    );

-- Policies for Admin access
CREATE POLICY "Admins can manage all products" ON public.products
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage product licenses" ON public.product_licenses
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage product media" ON public.product_media
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
