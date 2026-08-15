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
    
    // 0. Fetch Payment Settings & Validate Gateway/Currency
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('settings')
      .select('*')
      .in('id', ['payment_providers', 'payment_config']);

    if (settingsError || !settings) throw new Error("Could not load payment settings");

    const settingsObj = settings.reduce((acc: any, curr) => {
      acc[curr.id] = curr.value;
      return acc;
    }, {});

    const providers = settingsObj.payment_providers || {};
    const config = settingsObj.payment_config || {};

    // Check if provider is enabled
    if (provider !== 'crypto_wallet' && (!providers[provider] || !providers[provider].enabled)) {
      throw new Error(`Payment gateway ${provider} is not currently enabled`);
    }

    // Check if currency is allowed
    // For now, BDT is hardcoded in some places, but let's check against config if available
    const allowedCurrency = config.default_currency || 'BDT';
    if (currency !== allowedCurrency) {
      throw new Error(`Currency ${currency} is not supported for this transaction`);
    }

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
    
    // Validate minimum amount if specified in config (generic check)
    if (config.min_order_amount && amount < config.min_order_amount) {
      throw new Error(`Order amount ${amount} is below the minimum required`);
    }

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

export const adminVerifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    paymentId: z.string().uuid(),
    approved: z.boolean(),
    notes: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    
    // Security: Verify caller has admin role via supabaseAdmin
    const { data: hasRole } = await supabaseAdmin.rpc('has_role', { 
      _user_id: userId, 
      _role: 'admin' 
    });
    
    if (!hasRole) throw new Error("Unauthorized: Admin access required");

    const { manualVerifyPayment } = await import("./payments.server");
    return await manualVerifyPayment(data.paymentId, userId, data.approved, data.notes);
  });
