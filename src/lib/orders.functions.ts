import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    orderId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { orderId } = data;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        status,
        created_at,
        total,
        currency,
        order_items (
          product_id,
          product_name,
          quantity
        ),
        payments (
          status,
          provider
        ),
        fulfillments (
          id,
          status,
          fulfillment_type,
          metadata,
          error_message
        ),
        entitlements (
          id,
          type,
          data,
          download_count,
          max_downloads
        )
      `)
      .eq("id", orderId)
      .single();


    if (error || !order) {
      throw new Error("Order not found.");
    }

    return order;
  });
