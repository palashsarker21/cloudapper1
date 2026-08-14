import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type FulfillmentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface FulfillmentOptions {
  orderId: string;
  userId: string;
  actor?: string;
}

export async function processOrderFulfillment(orderId: string) {
  // 1. Fetch order and items
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders' as any)
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error(`[Fulfillment] Order ${orderId} not found`, orderError);
    return;
  }

  if (order.status !== 'paid') {
    console.log(`[Fulfillment] Order ${orderId} is not paid. Skipping fulfillment.`);
    return;
  }

  console.log(`[Fulfillment] Starting fulfillment for order ${orderId}`);

  for (const item of (order.order_items || [])) {
    if (!item.product_id) continue;

    // Fetch product delivery info
    const { data: product } = await supabaseAdmin
      .from('products' as any)
      .select('*')
      .eq('id', item.product_id)
      .single();

    if (!product) continue;

    const idempotencyKey = `fulfillment-${orderId}-${item.id}`;
    
    // Check if already fulfilled
    const { data: existing } = await supabaseAdmin
      .from('fulfillments' as any)
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existing && (existing as any).status === 'completed') {
      console.log(`[Fulfillment] Item ${item.id} already fulfilled. Skipping.`);
      continue;
    }

    // Create or get fulfillment record
    let fulfillment = existing;
    if (!fulfillment) {
      const { data: created, error: createError } = await supabaseAdmin
        .from('fulfillments' as any)
        .insert({
          order_id: orderId,
          status: 'pending',
          fulfillment_type: product.delivery_method || 'manual_fulfillment',
          idempotency_key: idempotencyKey,
          metadata: {
            product_id: product.id,
            product_name: product.name,
            quantity: item.quantity
          }
        })
        .select()
        .single();
      
      if (createError) {
        console.error(`[Fulfillment] Error creating record for ${item.id}`, createError);
        continue;
      }
      fulfillment = created;
    }

    try {
      // Update to processing
      await updateFulfillmentStatus((fulfillment as any).id, 'processing');
      await logFulfillmentEvent((fulfillment as any).id, 'started', { method: product.delivery_method });

      // Execute delivery based on method
      if (product.delivery_method === 'license_key') {
        await deliverLicense(fulfillment, item, product, order.customer_id!);
      } else if (product.delivery_method === 'instant_download') {
        await deliverDigitalFile(fulfillment, item, product, order.customer_id!);
      } else {
        // Manual delivery remains in processing/pending for admin
        await logFulfillmentEvent((fulfillment as any).id, 'manual_required', { product: product.name });
        continue; // Don't mark completed yet
      }

      // Mark completed
      await updateFulfillmentStatus((fulfillment as any).id, 'completed');
      await logFulfillmentEvent((fulfillment as any).id, 'completed');
      
      console.log(`[Fulfillment] Completed fulfillment for item ${item.id}`);

    } catch (err: any) {
      console.error(`[Fulfillment] Failed for item ${item.id}`, err);
      await updateFulfillmentStatus((fulfillment as any).id, 'failed', err.message);
      await logFulfillmentEvent((fulfillment as any).id, 'failed', { error: err.message });
    }
  }
}

async function updateFulfillmentStatus(id: string, status: FulfillmentStatus, error?: string) {
  const update: any = { status, updated_at: new Date().toISOString() };
  if (status === 'completed') update.completed_at = new Date().toISOString();
  if (error) update.error_message = error;

  await supabaseAdmin
    .from('fulfillments' as any)
    .update(update)
    .eq('id', id);
}

async function logFulfillmentEvent(fulfillmentId: string, event: string, details: any = {}) {
  await supabaseAdmin
    .from('fulfillment_logs' as any)
    .insert({
      fulfillment_id: fulfillmentId,
      event,
      details,
      actor: 'system'
    });
}

async function deliverLicense(fulfillment: any, item: any, product: any, userId: string) {
  for (let i = 0; i < item.quantity; i++) {
    const { data: license, error } = await supabaseAdmin.rpc('claim_license', {
      p_product_id: product.id,
      p_user_id: userId
    });

    if (error) throw new Error(`License inventory exhausted: ${error.message}`);
    
    await supabaseAdmin.from('entitlements' as any).insert({
      user_id: userId,
      product_id: product.id,
      order_id: item.order_id,
      fulfillment_id: fulfillment.id,
      type: 'license',
      data: { 
        license_key: license,
        instructions: product.delivery_instructions
      }
    });
  }
}

async function deliverDigitalFile(fulfillment: any, item: any, product: any, userId: string) {
  await supabaseAdmin.from('entitlements' as any).insert({
    user_id: userId,
    product_id: product.id,
    order_id: item.order_id,
    fulfillment_id: fulfillment.id,
    type: 'file',
    data: {
      instructions: product.delivery_instructions,
      bucket: 'digital-products',
      path: `products/${product.id}/`
    }
  });
}
