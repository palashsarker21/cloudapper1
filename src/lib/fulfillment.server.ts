import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type FulfillmentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface FulfillmentOptions {
  orderId: string;
  userId: string;
  actor?: string;
}

export async function processOrderFulfillment(orderId: string) {
  // 1. Fetch order and items
  const { data: orderData, error: orderError } = await (supabaseAdmin
    .from('orders' as any)
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .single() as any);

  const order = orderData;
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
    const { data: productData, error: productError } = await (supabaseAdmin
      .from('products' as any)
      .select('*')
      .eq('id', item.product_id)
      .single() as any);

    const product = productData;
    if (productError || !product) continue;

    const idempotencyKey = `fulfillment-${orderId}-${item.id}`;
    
    // Check if already fulfilled - search for successful license first
    const { data: existingLicense } = await (supabaseAdmin
      .from('licenses' as any)
      .select('id')
      .eq('order_item_id', item.id)
      .eq('status', 'active')
      .maybeSingle() as any);

    if (existingLicense) {
      console.log(`[Fulfillment] Order item ${item.id} already has an active license. Skipping.`);
      
      // Ensure fulfillment record is marked completed
      await supabaseAdmin.from('fulfillments' as any).update({ 
        status: 'completed', 
        updated_at: new Date().toISOString() 
      }).eq('idempotency_key', idempotencyKey);
      
      continue;
    }

    // Check existing fulfillment record
    const { data: existingFulfillment } = await (supabaseAdmin
      .from('fulfillments' as any)
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle() as any);

    if (existingFulfillment && existingFulfillment.status === 'completed') {
      console.log(`[Fulfillment] Item ${item.id} fulfillment already completed. Skipping.`);
      continue;
    }

    // Create or get fulfillment record
    let fulfillment = existing;
    if (!fulfillment) {
      const { data: createdData, error: createError } = await (supabaseAdmin
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
        .single() as any);
      
      if (createError) {
        console.error(`[Fulfillment] Error creating record for ${item.id}`, createError);
        continue;
      }
      fulfillment = createdData;
    }

    try {
      // Update to processing
      await updateFulfillmentStatus(fulfillment.id, 'processing');
      await logFulfillmentEvent(fulfillment.id, 'started', { method: product.delivery_method });

      // Execute delivery based on method
      if (product.delivery_method === 'license_key') {
        // Check if it's Eklas powered
        // For now we assume extension products use Eklas
        if (product.product_type === 'browser_extensions') {
          const { generateEklasLicense } = await import("./license-fulfillment.server");
          await generateEklasLicense(orderId, item.id, {
            ...product,
            customer_id: order.customer_id,
            fulfillment_id: fulfillment.id
          }, order.customer_email);
        } else {
          // Fallback to legacy inventory system
          await deliverLicense(fulfillment, item, product, order.customer_id!);
        }
      } else if (product.delivery_method === 'instant_download') {
        await deliverDigitalFile(fulfillment, item, product, order.customer_id!);
      } else {
        // Manual delivery remains in processing/pending for admin
        await logFulfillmentEvent(fulfillment.id, 'manual_required', { product: product.name });
        continue; // Don't mark completed yet
      }

      // Mark completed
      await updateFulfillmentStatus(fulfillment.id, 'completed');
      await logFulfillmentEvent(fulfillment.id, 'completed');
      
      console.log(`[Fulfillment] Completed fulfillment for item ${item.id}`);

    } catch (err: any) {
      console.error(`[Fulfillment] Failed for item ${item.id}`, err);
      await updateFulfillmentStatus(fulfillment.id, 'failed', err.message);
      await logFulfillmentEvent(fulfillment.id, 'failed', { error: err.message });
      
      // Log to system audit logs if available
      try {
        await supabaseAdmin.from('audit_logs' as any).insert({
          actor_id: order.customer_id,
          action: 'LICENSE_GENERATION_FAILED',
          target_type: 'order',
          target_id: orderId,
          metadata: { error: err.message, item_id: item.id }
        });
      } catch (e) {}
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

