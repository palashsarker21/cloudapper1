import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPaymentDetails, submitCryptoTransaction, submitPaymentVerification } from '@/lib/payments.functions';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Copy, Check, AlertTriangle, ExternalLink, CheckCircle2, Smartphone, Clock } from 'lucide-react';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { cn } from '@/lib/utils';


export const Route = createFileRoute('/checkout/payment/$paymentId')({
  component: PaymentProcessingPage,
});

function PaymentProcessingPage() {
  const { paymentId } = Route.useParams();
  const navigate = useNavigate();
  const getDetailsFn = useServerFn(getPaymentDetails);
  const submitTxFn = useServerFn(submitCryptoTransaction);
  const submitManualFn = useServerFn(submitPaymentVerification);
  
  const [txId, setTxId] = useState('');
  const [senderMobile, setSenderMobile] = useState('');
  const [emailDelivery, setEmailDelivery] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const { data: payment, isLoading, refetch } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => getDetailsFn({ data: { paymentId } }),
    refetchInterval: (query) => {
      const data = query.state.data as any;
      if (data?.status === 'paid' || data?.status === 'payment_rejected') return false;
      return 10000;
    },
  });


  const submitManualMutation = useMutation({
    mutationFn: () => submitManualFn({ 
      data: { 
        paymentId, 
        transactionId: txId, 
        senderMobile: senderMobile || undefined,
        emailDeliveryRequested: emailDelivery 
      } 
    }),
    onSuccess: () => {
      toast.success("Payment submitted successfully. Your payment is now under review.");
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const submitCryptoMutation = useMutation({
    mutationFn: (txHash: string) => submitTxFn({ data: { paymentId, transactionHash: txHash } }),
    onSuccess: () => {
      toast.success("Transaction submitted for review");
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!payment) return <div className="p-20 text-center">Payment not found</div>;

  const receiver = (payment as any).receiver;
  const receiverNumber = receiver?.receiver_identifier || "+8801934857886";
  const isManual = payment.provider === 'bkash' || payment.provider === 'nagad' || receiver !== null;
  const isSubmitted = ['payment_submitted', 'under_review', 'ready_for_confirmation'].includes(payment.status);

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-12 px-4 max-w-2xl">
        <Card className="border-2 border-transparent bg-surface-2 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Payment Verification</CardTitle>
                <CardDescription className="mt-1">Order ID: CA-{payment.orders.id.slice(0, 8).toUpperCase()}</CardDescription>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                payment.status === 'paid' ? "bg-green-500/10 text-green-600" : 
                payment.status === 'payment_rejected' ? "bg-red-500/10 text-red-600" :
                "bg-blue-500/10 text-blue-600"
              )}>
                {payment.status.replace('_', ' ')}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Order Items Summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Purchased Items</h4>
              <div className="space-y-2">
                {payment.orders.order_items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-tight">{item.product_name}</p>
                        <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black">৳{Number(item.total_price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Section */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-3 border shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Payable Amount</p>
                <p className="text-4xl font-black text-primary tracking-tighter">
                  {payment.currency === 'BDT' ? '৳' : ''}{Number(payment.amount).toLocaleString()}
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative z-10 shadow-lg shadow-primary/10">
                <Smartphone className="w-7 h-7" />
              </div>
            </div>

            {/* bKash / Nagad specific UI */}
            {isManual && !isSubmitted && payment.status !== 'paid' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-5 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Smartphone className="w-5 h-5" />
                    <span>Send Money To</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-1 rounded-xl border shadow-sm">
                    <span className="text-xl font-mono font-bold tracking-widest">{receiverNumber}</span>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(receiverNumber)} className="h-9 gap-2">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Please complete the payment on your mobile first, then submit the Transaction ID below.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="txid">Transaction ID *</Label>
                    <div className="relative">
                      <Input 
                        id="txid"
                        value={txId} 
                        onChange={(e) => setTxId(e.target.value)} 
                        placeholder="Paste or type transaction ID"
                        className="h-12 pr-10"
                      />
                      <Smartphone className="absolute right-3 top-3 w-5 h-5 text-muted-foreground/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender">Sender Mobile Number (Optional)</Label>
                    <Input 
                      id="sender"
                      value={senderMobile} 
                      onChange={(e) => setSenderMobile(e.target.value)} 
                      placeholder="e.g. 017XXXXXXXX"
                      className="h-12"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="email-delivery" 
                      checked={emailDelivery}
                      onCheckedChange={(checked) => setEmailDelivery(!!checked)}
                    />
                    <Label htmlFor="email-delivery" className="text-sm cursor-pointer">
                      Send my license to my email ({payment.user?.email || payment.orders.customer_email})
                    </Label>
                  </div>

                  <Button 
                    className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                    onClick={() => submitManualMutation.mutate()}
                    disabled={submitManualMutation.isPending || !txId}
                  >
                    {submitManualMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                      </div>
                    ) : "Submit Payment"}
                  </Button>
                </div>
              </div>
            )}

            {/* Crypto Wallet specific UI */}
            {payment.provider === 'crypto_wallet' && !isSubmitted && payment.status !== 'paid' && (
              <div className="space-y-6">
                <div className="p-5 border-2 border-yellow-500/20 rounded-2xl bg-yellow-500/5 text-sm space-y-3">
                  <div className="flex gap-2 text-yellow-700 dark:text-yellow-400 font-bold items-center">
                    <AlertTriangle className="w-5 h-5" /> 
                    <span>Strict Payment Rules</span>
                  </div>
                  <p>Send exactly <b>{payment.amount} {payment.currency}</b> to the following address:</p>
                  <div className="p-3 bg-surface-1 rounded-xl border shadow-sm font-mono text-xs flex items-center justify-between">
                    <span className="truncate mr-2">{payment.metadata?.wallet_address || 'TBD...'}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(payment.metadata?.wallet_address || '')}><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Transaction Hash (TXID)</Label>
                    <Input 
                      value={txId} 
                      onChange={(e) => setTxId(e.target.value)} 
                      placeholder="0x..." 
                      className="h-12"
                    />
                  </div>
                  <Button 
                    className="w-full h-14 text-lg font-bold" 
                    onClick={() => submitCryptoMutation.mutate(txId)}
                    disabled={submitCryptoMutation.isPending || !txId}
                  >
                    {submitCryptoMutation.isPending ? <Loader2 className="animate-spin" /> : "Verify Transaction"}
                  </Button>
                </div>
              </div>
            )}

            {/* Submission Successful / Reviewing State */}
            {isSubmitted && (
              <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                  <Clock className="w-10 h-10 text-blue-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Payment Under Review</h3>
                  <p className="text-muted-foreground px-8">
                    We've received your submission. A moderator is currently verifying your transaction. This usually takes 5-30 minutes.
                  </p>
                </div>
                
                <div className="max-w-xs mx-auto space-y-4 pt-4">
                  <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                    <StatusStep label="Payment Submitted" completed={true} />
                    <StatusStep label="Moderator Review" active={true} />
                    <StatusStep label="Payment Verified" />
                    <StatusStep label="License Generated" />
                  </div>
                </div>
              </div>
            )}

            {/* Verification Processing State */}
            {payment.status === 'processing' && (
              <div className="text-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                <p className="text-lg font-medium">Verifying your payment...</p>
                <p className="text-sm text-muted-foreground">This can take a few minutes. Please don't close this page.</p>
              </div>
            )}
            
            {/* Payment Verified / Fulfillment State */}
            {(payment.status === 'paid' || payment.status === 'payment_verified') && (
              <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-green-600">Payment Verified!</h3>
                  <p className="text-muted-foreground">Your order is being fulfilled. Digital assets will appear in your account shortly.</p>
                </div>
                <Button 
                  className="mt-4 gap-2" 
                  onClick={() => navigate({ to: '/track-order', search: { orderId: payment.orders.id } })}
                >
                  <ExternalLink className="w-4 h-4" />
                  Track Order
                </Button>

              </div>
            )}

            {/* Rejection State */}
            {payment.status === 'payment_rejected' && (
              <div className="text-center py-12 space-y-6 animate-in shake duration-500">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-red-600">Payment Rejected</h3>
                  <p className="text-muted-foreground font-medium">Reason: {payment.rejection_reason || 'Unknown'}</p>
                  {payment.admin_notes && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-800 text-xs text-left italic">
                      Admin Note: {payment.admin_notes}
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Try Resubmitting
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

function StatusStep({ label, completed = false, active = false }: { label: string, completed?: boolean, active?: boolean }) {
  return (
    <div className="flex items-center gap-4 relative z-10">
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300",
        completed ? "bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)]" : 
        active ? "bg-surface-2 border-primary animate-pulse" : 
        "bg-surface-2 border-muted text-muted-foreground"
      )}>
        {completed ? <Check className="w-3.5 h-3.5" /> : <div className={cn("w-2 h-2 rounded-full", active ? "bg-primary" : "bg-muted")} />}
      </div>
      <span className={cn(
        "text-sm font-bold tracking-tight",
        completed ? "text-primary" : 
        active ? "text-foreground" : 
        "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
}

