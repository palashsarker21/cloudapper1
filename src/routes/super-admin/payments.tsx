import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { verifyPayment } from '@/lib/admin.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CreditCard,
  DollarSign,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const Route = createFileRoute('/super-admin/payments')({
  component: SuperAdminPaymentsPage,
});

function SuperAdminPaymentsPage() {
  const verifyFn = useServerFn(verifyPayment);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['super-admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (customer_name, customer_email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: (variables: { id: string, status: 'verified' | 'rejected' }) => 
      verifyFn({ data: { paymentId: variables.id, status: variables.status } }),
    onSuccess: () => {
      toast.success("Payment status updated");
      refetch();
    },
    onError: () => toast.error("Verification failed")
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Payment Verification</h1>
            <p className="text-muted-foreground">Approve or reject platform transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Pending" count={payments?.filter(p => p.verification_status === 'pending').length || 0} icon={<Clock className="h-4 w-4" />} color="text-amber-500" />
          <StatsCard title="Verified" count={payments?.filter(p => p.verification_status === 'verified').length || 0} icon={<CheckCircle2 className="h-4 w-4" />} color="text-emerald-500" />
          <StatsCard title="Rejected" count={payments?.filter(p => p.verification_status === 'rejected').length || 0} icon={<XCircle className="h-4 w-4" />} color="text-red-500" />
          <StatsCard title="Total Revenue" count={`৳${payments?.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString() || 0}`} icon={<DollarSign className="h-4 w-4" />} color="text-primary" />
        </div>

        <div className="glass-effect rounded-2xl border-none shadow-xl overflow-hidden">
          <div className="p-4 border-b border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-1/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Transaction ID or email..." 
                className="pl-10 bg-surface-2 border-none focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="glass-effect">
                <Filter className="h-4 w-4 mr-2" />
                Gateways
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground">Auditing payments...</div>
            ) : (
              <Table>
                <TableHeader className="bg-surface-1/50">
                  <TableRow>
                    <TableHead className="font-bold">Transaction</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Gateway</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map((payment: any) => (
                    <TableRow key={payment.id} className="hover:bg-surface-1/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] uppercase">{payment.provider_transaction_id || 'NO-TXID'}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(payment.created_at).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{(payment.orders as any)?.customer_name || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">{(payment.orders as any)?.customer_email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        ৳{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">
                          {payment.provider}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.verification_status === 'verified' ? 'success' : payment.verification_status === 'pending' ? 'outline' : 'destructive'} className="text-[10px] uppercase">
                          {payment.verification_status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.verification_status === 'pending' && (
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10"
                              onClick={() => mutation.mutate({ id: payment.id, status: 'verified' })}
                              disabled={mutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                              onClick={() => mutation.mutate({ id: payment.id, status: 'rejected' })}
                              disabled={mutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {payment.screenshot_url && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={payment.screenshot_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatsCard({ title, count, icon, color }: any) {
  return (
    <Card className="glass-effect border-none shadow-md">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
            <h3 className={`text-xl font-black ${color}`}>{count}</h3>
          </div>
          <div className="p-2 rounded-lg bg-surface-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
