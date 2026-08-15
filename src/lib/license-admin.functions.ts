import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([])
  .handler(async () => {
    const { count: users } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
    const { count: orders } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true });
    const { data: revenue } = await (supabaseAdmin.from('orders').select('total') as any);
    const { count: licenses } = await supabaseAdmin.from('licenses' as any).select('*', { count: 'exact', head: true });
    
    const totalRevenue = revenue?.reduce((acc: number, curr: any) => acc + (Number(curr.total) || 0), 0) || 0;

    return {
      users: users || 0,
      orders: orders || 0,
      revenue: totalRevenue,
      licenses: licenses || 0
    };
  });

export const getEklasProviderStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    const apiKey = process.env['EKLAS_LICENSE_API_KEY'];
    return {
      configured: !!apiKey,
      provider: 'Eklas',
      endpoint: 'https://io.eklas.dev/api/v1'
    };
  });

export const getRecentLicenses = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ limit: z.number().optional().default(10) }).parse(data))
  .handler(async ({ data }) => {
    const { data: licenses, error } = await (supabaseAdmin
      .from('licenses' as any)
      .select(`
        *,
        products (name),
        profiles:customer_id (email)
      `)
      .order('created_at', { ascending: false })
      .limit(data.limit) as any);
    
    if (error) throw error;
    return licenses;
  });

export const retryLicenseFulfillment = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ fulfillmentId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { processOrderFulfillment } = await import("./fulfillment.server");
    const { data: fulfillment } = await (supabaseAdmin
      .from('fulfillments' as any)
      .select('order_id')
      .eq('id', data.fulfillmentId)
      .single() as any);
    
    if (fulfillment) {
      await processOrderFulfillment(fulfillment.order_id);
    }
    
    return { success: true };
  });

export const revokeLicense = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ 
    licenseId: z.string().uuid(),
    reason: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    // 1. Mark License as Revoked
    const { data: license, error: licenseError } = await (supabaseAdmin
      .from('licenses' as any)
      .update({ 
        status: 'revoked',
        updated_at: new Date().toISOString(),
        metadata: { 
          revoke_reason: data.reason || 'Revoked by admin',
          revoked_at: new Date().toISOString()
        }
      })
      .eq('id', data.licenseId)
      .select('id, order_id, product_id, customer_id')
      .single() as any);

    if (licenseError || !license) throw new Error("License not found or update failed");

    // 2. Find and update related fulfillment
    const { data: fulfillments } = await (supabaseAdmin
      .from('fulfillments' as any)
      .select('id')
      .eq('order_id', license.order_id)
      .eq('status', 'completed') as any);

    if (fulfillments && fulfillments.length > 0) {
      for (const f of fulfillments) {
        await supabaseAdmin
          .from('fulfillments' as any)
          .update({ 
            status: 'failed',
            error_message: `License ${license.id} revoked: ${data.reason || 'No reason provided'}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', f.id);

        // Log the fulfillment change
        await supabaseAdmin
          .from('fulfillment_logs' as any)
          .insert({
            fulfillment_id: f.id,
            event: 'fulfillment_revoked',
            details: { 
              license_id: license.id, 
              reason: data.reason 
            }
          });
      }
    }

    // 3. Update Entitlements (mark as invalid/revoked)
    await supabaseAdmin
      .from('entitlements' as any)
      .update({
        metadata: { 
          status: 'revoked',
          revoked_at: new Date().toISOString()
        }
      })
      .eq('order_id', license.order_id)
      .eq('product_id', license.product_id)
      .eq('user_id', license.customer_id);

    return { success: true };
  });
