import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required.");
    }

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        payments (*),
        order_items (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return orders;
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    paymentId: z.string().uuid(),
    status: z.enum(["verified", "rejected"]),
    notes: z.string().optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { paymentId, status, notes } = data;
    const { userId, supabase } = context;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required.");
    }

    // Start verification process
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .update({
        verification_status: status,
        verified_by: userId,
        verified_at: new Date().toISOString(),
        verification_notes: notes ?? null,
        status: status === "verified" ? "paid" : "failed",
        paid_at: status === "verified" ? new Date().toISOString() : null,
      })
      .eq("id", paymentId)
      .select()
      .single();

    if (paymentError || !payment) {
      throw new Error("Failed to update payment status.");
    }

    // If payment verified, update order status to 'paid'
    if (status === "verified") {
      await supabaseAdmin
        .from("orders")
        .update({ status: "paid" })
        .eq("id", payment.order_id);

      // Trigger Fulfillment Logic
      // 1. Get order items
      const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("*")
        .eq("order_id", payment.order_id);

      if (items) {
        for (const item of items) {
          if (!item.product_id) continue;
          
          const { data: product } = await supabaseAdmin
            .from("products")
            .select("inventory_type, delivery_method")
            .eq("id", item.product_id)
            .single();

          if (product?.inventory_type === "license") {
            // Find the order's customer_id
            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("customer_id")
              .eq("id", payment.order_id)
              .single();
            
            if (order?.customer_id) {
              const productId: string = item.product_id;
              const customerId: string = order.customer_id;
              
              // Assign license keys
              for (let i = 0; i < item.quantity; i++) {
                await supabaseAdmin.rpc("claim_license", {
                  p_product_id: productId,
                  p_user_id: customerId,
                });
              }
            }
          } else if (product?.inventory_type === "finite") {
            const productId: string = item.product_id;
            // Decrement stock
            await supabaseAdmin.rpc("decrement_stock", {
              p_product_id: productId,
              p_quantity: item.quantity,
            });
          }
        }
      }
    }

    return { success: true };
  });
