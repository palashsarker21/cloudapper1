import { createFileRoute, useNavigate, Link, redirect } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, verifyPayment } from '@/lib/admin.functions';
import { useServerFn } from '@tanstack/react-start';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search, 
  Loader2, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { Logo } from '@/components/marketplace/Logo';
import { useState } from 'react';

import { toast } from 'sonner';

export const Route = createFileRoute('/admin/orders')({
  beforeLoad: ({ context }: any) => {
    if (!context.isAdmin) {
      throw redirect({ to: '/' });
    }
  },
  head: () => ({
    meta: [{ title: 'Order Management | Admin | CloudApper' }],
  }),
  component: AdminOrdersPage,
});


function AdminOrdersPage() {
  const getOrders = useServerFn(getAdminOrders);
  const verifyPaymentFn = useServerFn(verifyPayment);
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getOrders(),
  });

  const handleVerify = async (status: 'verified' | 'rejected') => {
    if (!selectedPayment) return;
    
    setIsVerifying(true);
    try {
      await verifyPaymentFn({
        data: {
          paymentId: selectedPayment.id,
          status,
          notes: verificationNotes,
        }
      });
      toast.success(`Payment ${status === 'verified' ? 'verified' : 'rejected'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedPayment(null);
      setVerificationNotes('');
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-xl font-bold">Error loading orders</h1>
          <p className="text-muted-foreground">Make sure you have admin privileges.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">

      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Logo variant="icon" className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
              <p className="text-muted-foreground">Manage customer orders and verify payments.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/settings">
                Settings
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/products">
                Products
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-2 border-transparent bg-surface-1 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customer_name || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">{order.customer_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.total} {order.currency}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'paid' ? 'success' : 
                        order.status === 'pending' ? 'warning' : 
                        'destructive'

                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.payments && order.payments.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{order.payments[0].provider}</Badge>
                          {order.payments[0].verification_status === 'pending' && (
                            <Badge variant="warning">Pending Verify</Badge>

                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No payment</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {order.payments?.some((p: any) => p.verification_status === 'pending') && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(order.payments.find((p: any) => p.verification_status === 'pending'))}>
                                Verify Payment
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Verify Payment</DialogTitle>
                                <DialogDescription>
                                  Verify transaction for order {order.id.slice(0, 8)}.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="text-muted-foreground">Provider</Label>
                                    <p className="font-medium capitalize">{selectedPayment?.provider}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Amount</Label>
                                    <p className="font-medium">{selectedPayment?.amount} {selectedPayment?.currency}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-muted-foreground">Transaction ID</Label>
                                    <p className="font-mono text-xs bg-muted p-1 rounded">
                                      {selectedPayment?.provider_transaction_id || 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                {selectedPayment?.screenshot_url && (
                                  <div className="space-y-2">
                                    <Label>Payment Proof</Label>
                                    <a 
                                      href={selectedPayment.screenshot_url} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="block aspect-video bg-muted rounded-lg overflow-hidden border hover:opacity-80 transition-opacity relative group"
                                    >
                                      <img 
                                        src={selectedPayment.screenshot_url} 
                                        alt="Payment Screenshot" 
                                        className="w-full h-full object-contain"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20">
                                        <ExternalLink className="text-white h-8 w-8" />
                                      </div>
                                    </a>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label htmlFor="verification-notes">Verification Notes</Label>
                                  <Textarea 
                                    id="verification-notes" 
                                    placeholder="Add any notes about this verification..."
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                  />
                                </div>
                              </div>

                              <DialogFooter className="flex gap-2 sm:gap-0">
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleVerify('rejected')}
                                  disabled={isVerifying}
                                >
                                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                  Reject
                                </Button>
                                <Button 
                                  variant="default" 
                                  onClick={() => handleVerify('verified')}
                                  disabled={isVerifying}
                                >
                                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                  Verify & Approve
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link to="/track-order" search={{ orderId: order.id }}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!orders || orders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
