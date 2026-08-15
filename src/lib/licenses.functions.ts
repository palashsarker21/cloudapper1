import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getMyLicenses = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: licenses, error } = await (supabase
      .from('licenses' as any)
      .select(`
        *,
        products (
          name,
          image_url,
          delivery_instructions
        )
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false }) as any);

    if (error) throw error;
    return licenses;
  });

export const getLicenseKey = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ licenseId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: key, error } = await supabase.rpc('get_decrypted_license' as any, {
      _license_id: data.licenseId
    });

    if (error) throw error;
    return { key };
  });

export const getLicenseInventory = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ productId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: licenses, error } = await (supabaseAdmin
      .from('product_licenses' as any)
      .select('*')
      .eq('product_id', data.productId)
      .order('created_at', { ascending: false }) as any);

    if (error) throw error;
    return licenses;
  });

export const updateLicenseStatus = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    licenseId: z.string(),
    status: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('product_licenses' as any)
      .update({ status: data.status })
      .eq('id', data.licenseId);

    if (error) throw error;
    return { success: true };
  });

export const addLicenseKeys = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    productId: z.string(),
    keys: z.array(z.string())
  }).parse(data))
  .handler(async ({ data }) => {
    const records = data.keys.map(key => ({
      product_id: data.productId,
      license_key: key,
      status: 'available'
    }));

    const { error } = await supabaseAdmin
      .from('product_licenses' as any)
      .insert(records);

    if (error) throw error;
    return { success: true };
  });
