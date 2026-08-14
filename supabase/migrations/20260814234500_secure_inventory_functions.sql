-- Function to atomically decrement stock and prevent overselling
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stock INTEGER;
    v_inv_type inventory_type;
BEGIN
    SELECT stock_quantity, inventory_type INTO v_stock, v_inv_type
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    IF v_inv_type = 'unlimited' THEN
        RETURN TRUE;
    END IF;

    IF v_stock >= p_quantity THEN
        UPDATE products
        SET stock_quantity = stock_quantity - p_quantity
        WHERE id = p_product_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- Function to claim a license key
CREATE OR REPLACE FUNCTION public.claim_license(p_product_id UUID, p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_license_id UUID;
    v_key TEXT;
BEGIN
    SELECT id, license_key INTO v_license_id, v_key
    FROM product_licenses
    WHERE product_id = p_product_id AND status = 'available'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_license_id IS NULL THEN
        RETURN NULL;
    END IF;

    UPDATE product_licenses
    SET 
        status = 'assigned',
        assigned_to = p_user_id,
        assigned_at = now()
    WHERE id = v_license_id;

    RETURN v_key;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_stock(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_license(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_license(UUID, UUID) TO service_role;
