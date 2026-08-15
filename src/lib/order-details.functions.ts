import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getOrderDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    orderId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { orderId } = data;
    const { userId } = context;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url,
            delivery_method,
            product_type
          )
        ),
        payments (*),
        fulfillments (*),
        entitlements (*)
      `)
      .eq("id", orderId)
      .eq("customer_id", userId)
      .single();

    if (error || !order) {
      throw new Error("Order not found or unauthorized.");
    }

    return order as any;
  });
