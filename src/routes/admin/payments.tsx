import { createFileRoute, redirect } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search,
  ArrowUpRight,
  Filter,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { useServerFn } from '@tanstack/react-start';
import { adminVerifyPayment } from '@/lib/payments.functions';

export const Route = createFileRoute('/admin/payments')({
  beforeLoad: ({ context }: any) => {
    if (!context.isAdmin) {
      throw redirect({ to: '/' });
    }
  },
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const verifyFn = useServerFn(adminVerifyPayment);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            customer_email,
            customer_name
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: (variables: { paymentId: string, approved: boolean }) => 
      verifyFn({ data: { paymentId: variables.paymentId, approved: variables.approved } }),
    onSuccess: () => {
      toast.success("Payment status updated");
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const stats = {
    total: payments?.length || 0,
    paid: payments?.filter(p => p.status === 'paid').length || 0,
    pending: payments?.filter(p => p.status === 'pending').length || 0,
    review: payments?.filter(p => p.status === 'manual_review').length || 0
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Payment Dashboard</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search payments..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Volume" value={stats.total} icon={<CreditCard />} />
          <StatCard title="Paid" value={stats.paid} icon={<CheckCircle2 className="text-green-500" />} />
          <StatCard title="Pending" value={stats.pending} icon={<Clock className="text-amber-500" />} />
          <StatCard title="Manual Review" value={stats.review} icon={<AlertCircle className="text-destructive" />} />
        </div>

        <Card className="border-2 border-transparent bg-surface-1 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Real-time payment history across all providers.</CardDescription>
            </div>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments?.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-mono text-xs">#{payment.order_id.slice(0, 8)}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{(payment.orders as any)?.customer_name || 'Guest'}</div>
                        <div className="text-[10px] text-muted-foreground">{(payment.orders as any)?.customer_email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="capitalize">
                          {payment.provider?.replace('_', ' ')}
                          {payment.network && <span className="text-[8px] ml-1 opacity-50">({payment.network})</span>}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 font-bold">{payment.amount} {payment.currency}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {payment.status === 'manual_review' && (
                            <>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-green-500 h-8 w-8"
                                onClick={() => verifyMutation.mutate({ paymentId: payment.id, approved: true })}
                                disabled={verifyMutation.isPending}
                              >
                                {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-destructive h-8 w-8"
                                onClick={() => verifyMutation.mutate({ paymentId: payment.id, approved: false })}
                                disabled={verifyMutation.isPending}
                              >
                                {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                              </Button>
                            </>
                          )}
                          {payment.transaction_hash && (
                            <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="View on Block Explorer">
                              <a 
                                href={`https://tronscan.org/#/transaction/${payment.transaction_hash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <Card className="bg-surface-2 border-none">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-lg bg-surface-3">{icon}</div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{title}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: any) {
  const styles: any = {
    paid: 'bg-green-500/10 text-green-500 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    manual_review: 'bg-destructive/10 text-destructive border-destructive/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    expired: 'bg-muted text-muted-foreground border-transparent'
  };
  return <Badge className={`capitalize ${styles[status] || ''}`}>{status?.replace('_', ' ')}</Badge>;
}
