import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


export const getMyLicenses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId: userId } = context;


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
      .eq('customer_id', userId)
      .order('created_at', { ascending: false }) as any);

    if (error) throw error;
    return licenses;
  });

export const getLicenseKey = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ licenseId: z.string() }).parse(data))
  .handler(async ({ data }) => {

    const { data: key, error } = await supabase.rpc('get_decrypted_license' as any, {
      _license_id: data.licenseId
    });

    if (error) throw error;
    return { key };
  });

export const getLicenseInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ productId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: isAdmin } = await (supabaseAdmin as any).rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (!isAdmin) throw new Error("Unauthorized");

    const { data: licenses, error } = await (supabaseAdmin
      .from('product_licenses' as any)
      .select('*')
      .eq('product_id', data.productId)
      .order('created_at', { ascending: false }) as any);

    if (error) throw error;
    return licenses;

  });

export const updateLicenseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    licenseId: z.string(),
    status: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: isAdmin } = await (supabaseAdmin as any).rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (!isAdmin) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from('product_licenses' as any)
      .update({ status: data.status })
      .eq('id', data.licenseId);

    if (error) throw error;
    return { success: true };
  });

export const addLicenseKeys = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    productId: z.string(),
    keys: z.array(z.string())
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: isAdmin } = await (supabaseAdmin as any).rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (!isAdmin) throw new Error("Unauthorized");

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
