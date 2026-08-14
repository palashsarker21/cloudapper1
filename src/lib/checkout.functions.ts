import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createOrderSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { items, customerEmail, customerName, couponCode, notes } = data;
    const userId = context.userId;

    // 1. Fetch products and validate status/inventory
    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("status", "active");

    if (productsError || !products || products.length !== items.length) {
      throw new Error("One or more products are unavailable or inactive.");
    }

    // 2. Calculate subtotal and validate inventory
    let subtotal = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      
      // Inventory check
      if (product.inventory_type === "finite") {
        if (Number(product.stock_quantity || 0) < item.quantity) {
          throw new Error(`Product "${product.name}" is out of stock.`);
        }
      } else if (product.inventory_type === "license") {
        const { count, error: countError } = await supabaseAdmin
          .from("product_licenses")
          .select("id", { count: "exact", head: true })
          .eq("product_id", product.id)
          .eq("status", "available");
        
        if (countError || (count || 0) < item.quantity) {
          throw new Error(`Product "${product.name}" has no available licenses.`);
        }
      }

      const price = product.sale_price || product.price;
      subtotal += Number(price) * item.quantity;
    }

    // 3. Handle Coupon
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("is_active", true)
        .single();

      if (!couponError && coupon) {
        // Validate date
        const now = new Date();
        const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
        const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

        if ((!startsAt || now >= startsAt) && (!expiresAt || now <= expiresAt)) {
          if (subtotal >= Number(coupon.min_purchase_amount)) {
            couponId = coupon.id;
            if (coupon.discount_type === "percentage") {
              discountAmount = subtotal * (Number(coupon.discount_value) / 100);
              if (coupon.max_discount_amount) {
                discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount));
              }
            } else {
              discountAmount = Number(coupon.discount_value);
            }
          }
        }
      }
    }

    const total = subtotal - discountAmount;

    // 4. Create Order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: userId,
        customer_email: customerEmail,
        customer_name: customerName ?? null,
        subtotal,
        discount_amount: discountAmount,
        total,
        status: "pending",
        coupon_id: couponId,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error("Failed to create order.");
    }

    // 5. Create Order Items
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const price = product.sale_price || product.price;
      return {
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: Number(price),
        total_price: Number(price) * item.quantity,
      };
    });

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItems);
    if (itemsError) {
      throw new Error("Failed to create order items.");
    }

    return { orderId: order.id, total: order.total };
  });

export const initiatePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    orderId: z.string().uuid(),
    provider: z.enum(["bkash", "nagad", "binance_pay", "manual"]),
    paymentDetails: z.any().optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { orderId, provider, paymentDetails } = data;
    const userId = context.userId;

    // Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("customer_id", userId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found.");
    }

    // Create a pending payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: orderId,
        provider,
        amount: order.total,
        status: "pending",
        provider_transaction_id: paymentDetails?.transactionId ?? null,
        screenshot_url: paymentDetails?.screenshotUrl ?? null,
        verification_status: "pending",
      })
      .select()
      .single();

    if (paymentError || !payment) {
      throw new Error("Failed to initiate payment.");
    }

    return {
      paymentId: payment.id,
      status: payment.status,
      provider,
    };
  });

