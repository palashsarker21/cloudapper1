import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPaymentDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ paymentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        orders (
          *,
          order_items (*)
        )
      `)
      .eq('id', data.paymentId)
      .eq('user_id', userId)
      .single();

    if (error || !payment) throw new Error("Payment not found");
    return payment as any;
  });

export const submitCryptoTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    paymentId: z.string().uuid(),
    transactionHash: z.string().min(10)
  }).parse(data))
  .handler(async ({ data }) => {
    const { verifyCryptoTransaction } = await import("./payments.server");
    return await verifyCryptoTransaction(data.paymentId, data.transactionHash);
  });

export const getActiveCryptoWallets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from('crypto_wallets')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  });

export const createPaymentRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    orderId: z.string().uuid(),
    provider: z.enum(['bkash', 'binance_pay', 'bitget_pay', 'crypto_wallet', 'lemon_squeezy']),
    currency: z.string().default('BDT'),
    metadata: z.any().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { orderId, provider, currency, metadata } = data;

    // 1. Verify Order & Price Server-Side
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_id', userId)
      .single();

    if (orderError || !order) throw new Error("Order not found");

    // Amount Protection: We use the total from the verified order record
    const amount = order.total;

    // 2. Determine Expiry (30 mins default)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // 3. Create Payment Record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        user_id: userId,
        provider,
        amount,
        currency,
        status: 'pending',
        expires_at: expiresAt,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (paymentError || !payment) throw new Error("Failed to create payment record");

    return { paymentId: payment.id };
  });
