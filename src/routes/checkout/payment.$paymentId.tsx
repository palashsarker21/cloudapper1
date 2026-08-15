import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPaymentDetails, submitCryptoTransaction } from '@/lib/payments.functions';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Check, AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';

export const Route = createFileRoute('/checkout/payment/$paymentId')({
  component: PaymentProcessingPage,
});

function PaymentProcessingPage() {
  const { paymentId } = Route.useParams();
  const getDetailsFn = useServerFn(getPaymentDetails);
  const submitTxFn = useServerFn(submitCryptoTransaction);
  const [txId, setTxId] = useState('');
  
  const { data: payment, isLoading, refetch } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => getDetailsFn({ data: { paymentId } }),
    refetchInterval: 10000,
  });

  const submitMutation = useMutation({
    mutationFn: (txHash: string) => submitTxFn({ data: { paymentId, transactionHash: txHash } }),
    onSuccess: () => {
      toast.success("Transaction submitted for review");
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!payment) return <div className="p-20 text-center">Payment not found</div>;

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-12 px-4 max-w-2xl">
        <Card className="border-2 border-transparent bg-surface-2 shadow-sm">
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
            <CardDescription>Order #{payment.orders.id.slice(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-xl text-sm flex justify-between">
              <span>Amount Due</span>
              <span className="font-bold text-lg">{payment.amount} {payment.currency}</span>
            </div>

            {payment.provider === 'crypto_wallet' && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-sm">
                  <div className="flex gap-2 text-yellow-800 dark:text-yellow-400 font-bold mb-2">
                    <AlertTriangle className="w-5 h-5" /> Send exact amount
                  </div>
                  <p>Send exactly <b>{payment.amount} {payment.currency}</b> to the following address:</p>
                  <div className="mt-4 p-2 bg-white rounded border font-mono text-xs flex items-center justify-between">
                    <span>{payment.metadata?.wallet_address || 'TBD...'}</span>
                    <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(payment.metadata?.wallet_address)}><Copy className="w-3 h-3" /></Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Submit Transaction Hash (TXID)</label>
                  <Input 
                    value={txId} 
                    onChange={(e) => setTxId(e.target.value)} 
                    placeholder="0x..." 
                  />
                  <Button 
                    className="w-full" 
                    onClick={() => submitMutation.mutate(txId)}
                    disabled={submitMutation.isPending || !txId}
                  >
                    {submitMutation.isPending ? <Loader2 className="animate-spin" /> : "Verify Transaction"}
                  </Button>
                </div>
              </div>
            )}

            {payment.status === 'processing' && (
              <div className="text-center py-10 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
                <p>Verifying your payment... this can take a few minutes.</p>
              </div>
            )}
            
            {payment.status === 'paid' && (
              <div className="text-center py-10 text-green-600 font-bold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-12 h-12" />
                Payment Confirmed!
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
