import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminFulfillments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Unauthorized");

    const { data, error } = await supabaseAdmin
      .from('fulfillments' as any)
      .select(`
        *,
        orders (
          customer_email,
          customer_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });

export const retryFulfillment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    fulfillmentId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Unauthorized");

    const { data: fulfillment, error: fError } = await (supabaseAdmin
      .from('fulfillments' as any)
      .select('order_id, status')
      .eq('id', data.fulfillmentId)
      .single() as any);

    if (fError || !fulfillment) throw new Error("Fulfillment not found");
    if (fulfillment.status === 'completed') throw new Error("Fulfillment already completed");

    const { processOrderFulfillment } = await import("./fulfillment.server");
    await processOrderFulfillment(fulfillment.order_id);

    return { success: true };
  });
