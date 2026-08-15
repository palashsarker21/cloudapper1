import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getAdminPaymentDetails, getPaymentVerificationAnalysis, confirmAndFulfillPayment } from '@/lib/payments.functions';
import { useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  Smartphone, 
  Calendar, 
  User, 
  ShoppingBag, 
  Mail,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute('/super-admin/payments/$paymentId')({
  component: SuperAdminPaymentDetailPage,
});

function SuperAdminPaymentDetailPage() {
  const { paymentId } = Route.useParams();
  const getDetailsFn = useServerFn(getAdminPaymentDetails);
  const getAnalysisFn = useServerFn(getPaymentVerificationAnalysis);
  const confirmFn = useServerFn(confirmAndFulfillPayment);

  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [receivedTxId, setReceivedTxId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: payment, isLoading, refetch } = useQuery({
    queryKey: ['admin-payment-detail', paymentId],
    queryFn: () => getDetailsFn({ data: { paymentId } }),
  });

  const analysisQuery = useQuery({
    queryKey: ['payment-analysis', paymentId, receivedAmount, receivedTxId],
    queryFn: () => getAnalysisFn({ 
      data: { 
        paymentId, 
        receivedAmount: Number(receivedAmount), 
        receivedTransactionId: receivedTxId 
      } 
    }),
    enabled: !!receivedAmount && !!receivedTxId && !isNaN(Number(receivedAmount)),
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmFn({
      data: {
        paymentId,
        receivedAmount: Number(receivedAmount),
        receivedTransactionId: receivedTxId,
        notes: adminNotes
      }
    }),
    onSuccess: () => {
      toast.success("Payment verified and fulfillment triggered");
      setIsConfirmModalOpen(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard");
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!payment) return <div className="p-20 text-center">Payment record not found</div>;

  const analysis = analysisQuery.data;
  const canConfirm = analysis?.result === 'READY_FOR_CONFIRMATION' || analysis?.result === 'NEEDS_REVIEW';

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2 mb-4">
            <Link to="/super-admin/payments">
              <ArrowLeft className="w-4 h-4" /> Back to Queue
            </Link>
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">Payment Review</h1>
              <p className="text-muted-foreground">Verification for Order CA-{payment.orders?.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <Badge className={cn(
              "px-4 py-1 text-sm font-bold uppercase tracking-widest",
              payment.status === 'paid' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
              payment.status === 'payment_rejected' ? "bg-red-500/10 text-red-600 border-red-500/20" :
              "bg-amber-500/10 text-amber-600 border-amber-500/20"
            )} variant="outline">
              {payment.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-effect border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-surface-1/50 border-b border-border/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <InfoItem 
                    label="Customer" 
                    value={payment.user?.email || 'Anonymous'} 
                    icon={<User className="w-4 h-4" />} 
                  />
                  <InfoItem 
                    label="Expected Amount" 
                    value={`৳${Number(payment.amount).toLocaleString()}`} 
                    subValue={payment.currency}
                    icon={<ShieldCheck className="w-4 h-4" />} 
                  />
                  <InfoItem 
                    label="Gateway" 
                    value={payment.provider} 
                    icon={<Smartphone className="w-4 h-4" />} 
                    badge
                  />
                  <InfoItem 
                    label="Submission Time" 
                    value={new Date(payment.created_at).toLocaleString()} 
                    icon={<Calendar className="w-4 h-4" />} 
                  />
                  <InfoItem 
                    label="Email Delivery" 
                    value={payment.email_delivery_requested ? 'YES' : 'NO'} 
                    icon={<Mail className="w-4 h-4" />} 
                  />
                </div>
                
                <Separator className="my-6 bg-border/10" />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Purchased Items</h3>
                  <div className="space-y-2">
                    {payment.orders?.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between p-3 rounded-xl bg-surface-2 border border-border/5">
                        <span className="font-bold">{item.product_name}</span>
                        <span className="text-primary font-black">৳{item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-surface-1/50 border-b border-border/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Customer Submission
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Customer TXID</Label>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-3 border font-mono text-sm">
                      <span className="truncate">{payment.customer_transaction_id || 'NOT PROVIDED'}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleCopy(payment.customer_transaction_id || '', 'ctxid')}
                      >
                        {copied === 'ctxid' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Sender Mobile</Label>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-3 border font-mono text-sm">
                      <span>{payment.sender_mobile || 'NOT PROVIDED'}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleCopy(payment.sender_mobile || '', 'smobile')}
                      >
                        {copied === 'smobile' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Sidebar */}
          <div className="space-y-6">
            <Card className="glass-effect border-none shadow-2xl bg-surface-2 ring-1 ring-primary/20 overflow-hidden sticky top-8">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-lg font-black uppercase tracking-tighter">Verification Console</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {payment.status === 'paid' ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">Already Verified</h3>
                      <p className="text-xs text-muted-foreground">Verified at {new Date(payment.verified_at!).toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="received-amount">Received Amount (BDT)</Label>
                        <Input 
                          id="received-amount"
                          type="number" 
                          value={receivedAmount} 
                          onChange={(e) => setReceivedAmount(e.target.value)}
                          placeholder="0.00"
                          className="bg-surface-3 border-none focus-visible:ring-primary h-12 text-lg font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="received-txid">Received TXID / Reference</Label>
                        <Input 
                          id="received-txid"
                          value={receivedTxId} 
                          onChange={(e) => setReceivedTxId(e.target.value)}
                          placeholder="Reference number"
                          className="bg-surface-3 border-none focus-visible:ring-primary h-12 font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Internal Notes</Label>
                        <Input 
                          id="notes"
                          value={adminNotes} 
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Optional verification notes"
                          className="bg-surface-3 border-none focus-visible:ring-primary"
                        />
                      </div>
                    </div>

                    {analysis && (
                      <div className={cn(
                        "p-4 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300",
                        analysis.result === 'READY_FOR_CONFIRMATION' ? "bg-emerald-500/5 border border-emerald-500/20" :
                        analysis.result === 'MISMATCH' ? "bg-red-500/5 border border-red-500/20" :
                        "bg-amber-500/5 border border-amber-500/20"
                      )}>
                        <h4 className="text-xs font-black uppercase tracking-widest text-center">Analysis Result</h4>
                        <div className="flex justify-center flex-wrap gap-2">
                          <Badge variant={analysis.result === 'READY_FOR_CONFIRMATION' ? 'success' : 'outline'} className="uppercase text-[10px]">
                            {analysis.result.replace('_', ' ')}
                          </Badge>
                          {analysis.riskFlags?.map((flag: any) => (
                            <Badge key={flag.type} variant="destructive" className="uppercase text-[10px] bg-red-500/10 text-red-600 border-red-500/20">
                              {flag.label}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t border-border/10">
                          <MatchRow label="Amount Match" match={analysis.matches.amount} />
                          <MatchRow label="Transaction Match" match={analysis.matches.transaction} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-4">
                      <Button 
                        className="w-full h-14 text-lg font-black tracking-tight shadow-lg shadow-primary/20" 
                        disabled={!canConfirm || confirmMutation.isPending}
                        onClick={() => setIsConfirmModalOpen(true)}
                      >
                        {confirmMutation.isPending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                        Confirm & Fulfill
                      </Button>
                      <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-600">
                        Reject Payment
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <AlertDialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <AlertDialogContent className="glass-effect border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tighter uppercase">Confirm Fulfillment?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div className="p-4 rounded-2xl bg-surface-2 space-y-3 text-foreground font-medium border border-border/5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order</span>
                  <span>CA-{payment.orders?.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-primary font-black">৳{Number(receivedAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Received ID</span>
                  <span className="font-mono">{receivedTxId}</span>
                </div>
              </div>
              <p>This action will mark the payment as verified and immediately trigger automatic license generation via Eklas.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmMutation.mutate()} 
              className="rounded-xl font-bold bg-primary hover:bg-primary/90"
            >
              Confirm & Deliver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoItem({ label, value, subValue, icon, badge = false }: { label: string, value: string, subValue?: string, icon?: React.ReactNode, badge?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-2">
        {badge ? (
          <Badge variant="outline" className="uppercase text-[10px] font-black tracking-tighter">{value}</Badge>
        ) : (
          <p className="font-bold text-sm truncate">{value}</p>
        )}
        {subValue && <span className="text-[10px] text-muted-foreground font-bold">{subValue}</span>}
      </div>
    </div>
  );
}

function MatchRow({ label, match }: { label: string, match: boolean }) {
  return (
    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        {match ? (
          <>
            <span className="text-emerald-500">MATCH</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          </>
        ) : (
          <>
            <span className="text-red-500">MISMATCH</span>
            <XCircle className="w-3 h-3 text-red-500" />
          </>
        )}
      </div>
    </div>
  );
}
