import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([])
  .handler(async () => {
    const { count: users } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
    const { count: orders } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true });
    const { data: revenue } = await supabaseAdmin.from('orders').select('total_amount').eq('status', 'paid');
    const { count: licenses } = await supabaseAdmin.from('licenses' as any).select('*', { count: 'exact', head: true });
    
    const totalRevenue = revenue?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

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
