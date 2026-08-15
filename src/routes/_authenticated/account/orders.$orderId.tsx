import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getOrderDetails } from '@/lib/order-details.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Package, 
  FileText, 
  Download, 
  Key, 
  AlertCircle,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_authenticated/account/orders/$orderId')({
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { orderId } = Route.useParams();
  const fetchOrder = useServerFn(getOrderDetails);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: () => fetchOrder({ data: { orderId } }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">We couldn't retrieve the details for this order.</p>
          <Button asChild>
            <Link to="/_authenticated/account/entitlements">Back to Library</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', status: 'completed' },
    { label: 'Payment Processing', status: order.status === 'pending' ? 'current' : 'completed' },
    { label: 'Payment Confirmed', status: order.status === 'paid' || order.status === 'processing' || order.status === 'completed' ? 'completed' : 'pending' },
    { label: 'Preparing Delivery', status: order.status === 'processing' ? 'current' : (order.status === 'completed' ? 'completed' : 'pending') },
    { label: 'Delivered', status: order.status === 'completed' ? 'completed' : 'pending' },
    { label: 'Completed', status: order.status === 'completed' ? 'completed' : 'pending' },
  ];

  // Adjust steps based on failure
  if (order.status === 'cancelled' || order.status === 'failed') {
    steps[1].status = 'failed';
    steps[1].label = order.status === 'cancelled' ? 'Order Cancelled' : 'Order Failed';
    steps.splice(2);
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed': return 'success';
      case 'pending':
      case 'processing': return 'warning';
      case 'failed':
      case 'cancelled':
      case 'refunded': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/_authenticated/account/entitlements">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground font-mono text-sm">{order.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Status Timeline */}
            <Card className="border-2 border-transparent bg-surface-1 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Delivery Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-muted lg:left-0 lg:right-0 lg:top-[15px] lg:bottom-auto lg:h-0.5 lg:w-full" />
                  
                  <div className="relative flex flex-col gap-8 lg:flex-row lg:justify-between lg:gap-4">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-4 lg:flex-col lg:items-center lg:text-center lg:gap-2 relative z-10">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-surface-1",
                          step.status === 'completed' ? "border-success bg-success/10 text-success" :
                          step.status === 'current' ? "border-primary bg-primary/10 text-primary animate-pulse" :
                          step.status === 'failed' ? "border-destructive bg-destructive/10 text-destructive" :
                          "border-muted text-muted-foreground"
                        )}>
                          {step.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : 
                           step.status === 'failed' ? <XCircle className="h-4 w-4" /> :
                           <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <div className="lg:mt-2">
                          <p className={cn(
                            "text-sm font-medium leading-none",
                            step.status === 'pending' ? "text-muted-foreground" : "text-foreground"
                          )}>{step.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="border-2 border-transparent bg-surface-1 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Items Purchased</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="py-6 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {item.products?.image_url ? (
                              <img src={item.products.image_url} alt={item.product_name} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <Package className="h-8 w-8 text-muted-foreground/40" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{item.product_name}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] capitalize">{item.products?.product_type || 'Digital'}</Badge>
                              <Badge variant="secondary" className="text-[10px]">Qty: {item.quantity}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{item.total_price} {order.currency}</p>
                          <p className="text-xs text-muted-foreground">{item.unit_price} each</p>
                        </div>
                      </div>

                      {/* Delivery Info for this item */}
                      {order.status === 'completed' && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <FileText className="h-4 w-4 text-primary" />
                              Delivery Available
                            </div>
                            <Button size="sm" variant="default" className="h-8 px-3 text-xs" asChild>
                              <Link to="/_authenticated/account/entitlements">
                                Access Product
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Summary */}
            <Card className="border-2 border-transparent bg-surface-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date</span>
                    <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="h-5 py-0 px-2 capitalize">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium capitalize">{order.payments?.[0]?.provider || 'N/A'}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{order.subtotal} {order.currency}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span>-{order.discount_amount} {order.currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-primary">{order.total} {order.currency}</span>
                  </div>
                </div>

                <Separator />

                <div className="pt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                Need help?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you have questions about your order or delivery status, please contact our support team. Mention your Order ID for faster assistance.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
