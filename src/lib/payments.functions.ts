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
        ),
        receiver:receiver_id (*)
      `)
      .eq('id', data.paymentId)
      .eq('user_id', userId)
      .single();

    if (error || !payment) throw new Error("Payment not found");
    return payment as any;
  });

export const submitPaymentVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    paymentId: z.string().uuid(),
    transactionId: z.string().min(3),
    senderMobile: z.string().optional(),
    emailDeliveryRequested: z.boolean().default(false)
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { paymentId, transactionId, senderMobile, emailDeliveryRequested } = data;
    
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('provider, status, amount, currency, order_id')
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();
      
    if (!payment) throw new Error("Payment not found");

    // Normalize transaction ID: trim whitespace
    const normalizedTxId = transactionId.trim();
    if (!normalizedTxId) throw new Error("Transaction ID is required");

    // Check for duplicate TXID for the same provider
    const { data: duplicate } = await supabaseAdmin
      .from('payments')
      .select('id, status')
      .eq('provider', payment.provider)
      .eq('customer_transaction_id', normalizedTxId)
      .neq('id', paymentId)
      .maybeSingle();

    if (duplicate) {
      // If a successful or pending payment already exists with this TXID
      throw new Error("This transaction ID has already been submitted.");
    }

    const { error } = await supabaseAdmin
      .from('payments')
      .update({
        customer_transaction_id: normalizedTxId,
        sender_mobile: senderMobile ?? null,
        email_delivery_requested: emailDeliveryRequested,
        status: 'under_review' as any,
        verification_status: 'pending'
      })
      .eq('id', paymentId);

    if (error) {
      if (error.code === '23505') throw new Error("This transaction ID has already been used.");
      throw error;
    }

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: userId,
      action: 'PAYMENT_SUBMITTED',
      target_type: 'payment',
      target_id: paymentId,
      metadata: { transactionId: normalizedTxId, senderMobile, emailDeliveryRequested }
    });

    return { status: 'under_review' };

    return { status };
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
    provider: z.string(),
    receiverId: z.string().uuid().optional(),
    currency: z.string().default('BDT'),
    metadata: z.any().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { orderId, provider, receiverId, currency, metadata } = data;
    
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

    // Check if provider/receiver is enabled
    if (provider !== 'crypto_wallet') {
      if (receiverId) {
        const { data: receiver } = await supabaseAdmin.from('payment_receivers').select('enabled').eq('id', receiverId).single();
        if (!receiver || !receiver.enabled) throw new Error("This payment destination is not currently active");
      } else if (!providers[provider] || !providers[provider].enabled) {
        throw new Error(`Payment gateway ${provider} is not currently enabled`);
      }
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
        provider: provider as any,
        receiver_id: (receiverId || null) as any,
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

export const getAdminPaymentDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ paymentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: hasRole } = await supabaseAdmin.rpc('has_role', { _user_id: userId, _role: 'super_admin' });
    if (!hasRole) throw new Error("Unauthorized");

    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        user:user_id (email),
        orders (
          *,
          order_items (*)
        )
      `)
      .eq('id', data.paymentId)
      .single();

    if (error || !payment) throw new Error("Payment not found");
    return payment as any;
  });

export const getPaymentVerificationAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    paymentId: z.string().uuid(),
    receivedAmount: z.number(),
    receivedTransactionId: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: hasRole } = await supabaseAdmin.rpc('has_role', { _user_id: userId, _role: 'super_admin' });
    if (!hasRole) throw new Error("Unauthorized");

    const { data: payment } = await (supabaseAdmin
      .from('payments' as any)
      .select('*, orders(total)')
      .eq('id', data.paymentId)
      .single() as any);

    if (!payment) throw new Error("Payment not found");

    const expectedAmount = Number(payment.amount);
    const receivedAmount = data.receivedAmount;
    const normalizedReceivedTxId = data.receivedTransactionId.trim();
    
    let result = 'READY_FOR_CONFIRMATION';
    const matches = {
      amount: Math.abs(receivedAmount - expectedAmount) < 0.01,
      transaction: payment.customer_transaction_id === normalizedReceivedTxId,
      provider: true
    };

    const riskFlags = [];

    if (!matches.amount) {
      result = 'MISMATCH';
      riskFlags.push({ type: 'amount_mismatch', label: 'Amount Mismatch', severity: 'medium' });
    }

    if (!matches.transaction) {
      riskFlags.push({ type: 'txid_mismatch', label: 'TXID Mismatch', severity: 'low' });
    }

    // Check received transaction uniqueness
    const { data: duplicate } = await (supabaseAdmin
      .from('payments' as any)
      .select('id')
      .eq('received_transaction_id', normalizedReceivedTxId)
      .neq('id', data.paymentId)
      .maybeSingle() as any);

    if (duplicate) {
      result = 'DUPLICATE_TRANSACTION';
      riskFlags.push({ type: 'duplicate_received_txid', label: 'Duplicate Received TXID', severity: 'high' });
    }

    return { result, matches, expectedAmount, receivedAmount, riskFlags };
  });

export const confirmAndFulfillPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    paymentId: z.string().uuid(),
    receivedAmount: z.number(),
    receivedTransactionId: z.string(),
    notes: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: hasRole } = await supabaseAdmin.rpc('has_role', { _user_id: userId, _role: 'super_admin' });
    if (!hasRole) throw new Error("Unauthorized");

    const { manualVerifyPayment } = await import("./payments.server");
    
    // Update payment to paid
    await supabaseAdmin
      .from('payments')
      .update({
        received_amount: data.receivedAmount,
        received_transaction_id: data.receivedTransactionId,
        verified_at: new Date().toISOString(),
        verified_by: userId,
        admin_notes: data.notes ?? null,
        status: 'paid' as any
      })

      .eq('id', data.paymentId);

    return await manualVerifyPayment(data.paymentId, userId, true, data.notes);
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

