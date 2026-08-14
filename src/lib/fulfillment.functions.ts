import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getUserEntitlements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin
      .from('entitlements' as any)
      .select(`
        *,
        products (
          id,
          name,
          image_url,
          delivery_instructions
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });

export const getDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    entitlementId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { entitlementId } = data;
    const { userId } = context;

    // Verify entitlement ownership
    const { data: entitlement, error: entError } = await (supabaseAdmin
      .from('entitlements' as any)
      .select('*')
      .eq('id', entitlementId)
      .eq('user_id', userId)
      .single() as any);

    if (entError || !entitlement) throw new Error("Unauthorized or entitlement not found.");

    // Check download limits if any
    if (entitlement.max_downloads && entitlement.download_count >= entitlement.max_downloads) {
      throw new Error("Download limit reached.");
    }

    if (entitlement.type !== 'file') throw new Error("Invalid entitlement type for download.");

    const { bucket, path } = entitlement.data;

    // In a real app, we'd list files in the path and generate a signed URL for a specific file.
    // Since we don't have the specific file name, we'll assume a generic 'product.zip' or similar
    // For now, return a placeholder or generate a signed URL for a known file if possible.
    
    // Increment download count
    await supabaseAdmin
      .from('entitlements' as any)
      .update({ download_count: (entitlement.download_count || 0) + 1 })
      .eq('id', entitlementId);

    // Placeholder signed URL logic (1 hour expiry)
    const { data: signedUrl, error: storageError } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(`${path}product.zip`, 3600);

    if (storageError) {
      // Fallback for demo: just return the path if signed URL fails
      return { url: null, error: "File not found in storage. Please contact support." };
    }

    return { url: signedUrl.signedUrl };
  });
