import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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
