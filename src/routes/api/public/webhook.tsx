import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // In a real production environment, you MUST verify the signature from the provider (bKash, Nagad, etc.)
        // This endpoint acts as a generic entry for webhooks.
        
        try {
          const payload = await request.json();
          console.log('[Webhook] Received payload:', payload);

          // Example logic for generic payment success webhook
          // payload should contain something like { order_id: '...', status: 'success', provider: '...' }
          
          const orderId = payload.order_id || payload.orderId;
          const status = payload.status;
          
          if (orderId && status === 'success') {
            // Update payment and order status using admin client
            const { data: payment } = await supabaseAdmin
              .from('payments')
              .update({ status: 'paid', paid_at: new Date().toISOString(), verification_status: 'verified' })
              .eq('order_id', orderId)
              .select()
              .single();

            if (payment) {
              await supabaseAdmin
                .from('orders')
                .update({ status: 'paid' })
                .eq('id', orderId);

              // Trigger Fulfillment
              const { processOrderFulfillment } = await import('@/lib/fulfillment.server');
              await processOrderFulfillment(orderId);
            }
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (err: any) {
          console.error('[Webhook] Error processing:', err);
          return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  }
});
