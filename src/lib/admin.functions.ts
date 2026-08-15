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
      const { processOrderFulfillment } = await import("./fulfillment.server");
      await processOrderFulfillment(payment.order_id);
    }


    return { success: true };
  });

export const getSettings = createServerFn({ method: "GET" })
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

    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("*");

    if (error) throw error;
    
    // Convert array to object for easier consumption
    return data.reduce((acc: any, curr) => {
      acc[curr.id] = curr.value;
      return acc;
    }, {});
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string(),
    value: z.any(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { id, value } = data;
    const { userId, supabase } = context;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required.");
    }

    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({ id, value, updated_at: new Date().toISOString() });

    if (error) throw error;
    return { success: true };
  });

export const getCryptoWallets = createServerFn({ method: "GET" })
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

    const { data, error } = await supabaseAdmin
      .from("crypto_wallets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

export const updateCryptoWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    asset: z.string(),
    network: z.string(),
    wallet_address: z.string(),
    minimum_amount: z.number().default(0),
    is_active: z.boolean().default(true),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required.");
    }

    const { error } = await supabaseAdmin
      .from("crypto_wallets")
      .upsert({
        id: data.id as any,
        asset: data.asset,
        network: data.network,
        wallet_address: data.wallet_address,
        minimum_amount: data.minimum_amount,
        is_active: data.is_active,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  });

export const deleteCryptoWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required.");
    }

    const { error } = await supabaseAdmin
      .from("crypto_wallets")
      .delete()
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });

export const getPaymentReceivers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Unauthorized");

    const { data, error } = await supabaseAdmin
      .from("payment_receivers")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data;
  });

export const updatePaymentReceiver = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    provider: z.string(),
    display_name: z.string(),
    receiver_identifier: z.string(),
    instructions: z.string().optional(),
    currency: z.string().default('BDT'),
    minimum_amount: z.number().default(0),
    enabled: z.boolean().default(true),
    sort_order: z.number().default(0),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("payment_receivers")
      .upsert({
        id: data.id,
        provider: data.provider,
        display_name: data.display_name,
        receiver_identifier: data.receiver_identifier,
        instructions: data.instructions ?? null,
        currency: data.currency,
        minimum_amount: data.minimum_amount,
        enabled: data.enabled,
        sort_order: data.sort_order,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  });

export const deletePaymentReceiver = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("payment_receivers")
      .delete()
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });

