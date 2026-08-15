import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { processOrderFulfillment } from "./fulfillment.server";

export type PaymentProvider = 'bkash' | 'nagad' | 'binance_pay' | 'bitget_pay' | 'crypto_wallet' | 'lemon_squeezy' | 'manual';
export type PaymentStatus = 'created' | 'pending' | 'processing' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'refunded' | 'underpaid' | 'overpaid' | 'manual_review' | 'awaiting_payment' | 'payment_submitted' | 'under_review' | 'ready_for_confirmation' | 'payment_verified' | 'payment_rejected';


export async function logPaymentAudit(
  paymentId: string, 
  orderId: string, 
  action: string, 
  previousStatus: PaymentStatus | null, 
  newStatus: PaymentStatus, 
  actor: string | null = 'system', 
  metadata: any = {}
) {
  // Try to use the unified audit_logs table first
  try {
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: actor && actor !== 'system' ? actor : null,
      action,
      payment_id: paymentId,
      order_id: orderId,
      target_type: 'payment',
      target_id: paymentId,
      metadata: { ...metadata, previousStatus, newStatus }
    });
  } catch (err) {
    // Fallback to old table if exists or ignore
    console.warn("Failed to log to audit_logs, trying payment_audit_log fallback", err);
    await supabaseAdmin.from('payment_audit_log').insert({
      payment_id: paymentId,
      order_id: orderId,
      actor: actor,
      action,
      previous_status: previousStatus,
      new_status: newStatus,
      metadata
    }).catch(e => console.error("Total audit logging failure", e));
  }
}

export async function calculatePaymentRisk(paymentId: string) {
  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*, orders(total)')
    .eq('id', paymentId)
    .single();
    
  if (!payment) return 'low';
  
  const flags: any[] = [];
  let riskScore = 'low';

  // 1. Amount Mismatch
  if (payment.received_amount && Number(payment.received_amount) !== Number(payment.amount)) {
    flags.push({
      flag_type: 'amount_mismatch',
      severity: 'medium',
      description: `Expected ${payment.amount}, received ${payment.received_amount}`
    });
    riskScore = 'medium';
  }

  // 2. Duplicate Customer TXID
  if (payment.customer_transaction_id) {
    const { data: duplicates } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('customer_transaction_id', payment.customer_transaction_id)
      .eq('provider', payment.provider)
      .neq('id', paymentId);
      
    if (duplicates && duplicates.length > 0) {
      flags.push({
        flag_type: 'duplicate_customer_txid',
        severity: 'high',
        description: `TXID ${payment.customer_transaction_id} already exists in another payment`
      });
      riskScore = 'high';
    }
  }
  
  // Store flags if table exists
  if (flags.length > 0) {
    await supabaseAdmin.from('payment_risk_flags').insert(
      flags.map(f => ({ ...f, payment_id: paymentId }))
    ).catch(() => {});
  }
  
  await supabaseAdmin.from('payments').update({ risk_score: riskScore }).eq('id', paymentId).catch(() => {});
  
  return riskScore;
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus, providerReference?: string, metadata: any = {}, actor: string | null = 'system') {
  const { data: currentPayment, error: fetchError } = await supabaseAdmin
    .from('payments')
    .select('status, order_id, amount')
    .eq('id', paymentId)
    .single();

  if (fetchError || !currentPayment) throw new Error(`Payment ${paymentId} not found`);

  const previousStatus = currentPayment.status as PaymentStatus;
  
  if (previousStatus === status) return currentPayment;

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
    metadata: { ...((currentPayment as any).metadata || {}), ...metadata }
  };

  if (providerReference) updateData.provider_reference = providerReference;
  if (status === 'paid') updateData.paid_at = new Date().toISOString();

  const { data: updatedPayment, error: updateError } = await supabaseAdmin
    .from('payments')
    .update(updateData)
    .eq('id', paymentId)
    .select()
    .single();

  if (updateError) throw updateError;

  await logPaymentAudit(paymentId, currentPayment.order_id, `Status updated to ${status}`, previousStatus, status, actor, metadata);

  // Trigger Order Status & Fulfillment if Paid
  if (status === 'paid') {
    await supabaseAdmin
      .from('orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', currentPayment.order_id);
    
    // Asynchronous fulfillment trigger
    processOrderFulfillment(currentPayment.order_id).catch(err => {
      console.error(`[PaymentService] Fulfillment failed for order ${currentPayment.order_id}`, err);
    });
  }

  return updatedPayment;
}

export async function verifyCryptoTransaction(paymentId: string, txHash: string) {
  const { data: payment, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error || !payment) throw new Error("Payment not found");

  // Check for duplicate TXID
  const { data: duplicate } = await supabaseAdmin
    .from('payments')
    .select('id')
    .eq('transaction_hash', txHash)
    .neq('id', paymentId)
    .maybeSingle();

  if (duplicate) {
    await updatePaymentStatus(paymentId, 'manual_review', undefined, { 
      reason: 'Duplicate transaction hash detected',
      txHash 
    });
    throw new Error("This transaction hash has already been used.");
  }

  // Update payment with TX hash and move to processing
  await supabaseAdmin
    .from('payments')
    .update({ 
      transaction_hash: txHash,
      status: 'processing',
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId);

  await logPaymentAudit(paymentId, payment.order_id, 'TXID Submitted', 'pending', 'processing', payment.user_id, { txHash });

  // In a real production app, we would now trigger an off-chain observer 
  // or call a blockchain API (Etherscan, TronScan, etc.) to verify the TX.
  // For this phase, we move to 'manual_review' to let admin verify.
  
  await updatePaymentStatus(paymentId, 'manual_review', undefined, { 
    message: 'Transaction submitted. Awaiting manual blockchain verification.',
    txHash 
  });

  return { status: 'manual_review', message: 'Transaction submitted for verification.' };
}

export async function getPaymentMethodConfig(provider: PaymentProvider) {
  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('*')
    .eq('id', 'payment_providers')
    .single();
  
  const providers = (settings?.value as any) || {};
  return providers[provider];
}

export async function manualVerifyPayment(paymentId: string, adminUserId: string, approved: boolean, notes?: string) {
  const status = approved ? 'paid' : 'failed';
  return await updatePaymentStatus(paymentId, status, undefined, { 
    manual_verification: true,
    verified_by: adminUserId,
    notes 
  }, adminUserId);
}
