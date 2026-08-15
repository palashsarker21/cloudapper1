import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/webhooks/binance')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Verify Signature (Actual integration would check headers)
        const signature = request.headers.get('x-binance-signature');
        if (!signature) {
          return new Response('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { bizType, bizStatus, bizIdStr } = body;

        // 2. Identify Payment
        const { data: payment } = await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('provider_reference', bizIdStr)
          .single();

        if (!payment) return new Response('Payment not found', { status: 404 });

        // 3. Process Status
        if (bizType === 'PAY' && bizStatus === 'PAY_SUCCESS') {
          const { updatePaymentStatus } = await import('@/lib/payments.server');
          await updatePaymentStatus(payment.id, 'paid', bizIdStr, { webhook_event: body });
        }

        return new Response('OK');
      }
    }
  }
});
