import { createFileRoute, Link } from '@tanstack/react-router';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, ArrowRight, Loader2, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { Logo } from '@/components/marketplace/Logo';

import { useState, useEffect } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { getOrderStatus } from '@/lib/orders.functions';
import { useQuery } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';


export const Route = createFileRoute('/track-order')({
  validateSearch: (search: Record<string, unknown>): { orderId: string | undefined } => {
    return {
      orderId: typeof search['orderId'] === 'string' ? search['orderId'] : undefined,
    };
  },
  head: () => ({
    title: 'Track Your Order | CloudApper',
    meta: [
      { name: 'description', content: 'Track the status of your CloudApper orders for AI tools, credits, and digital products.' },
      { property: 'og:title', content: 'Track Your Order | CloudApper' },
      { property: 'og:description', content: 'Track the status of your CloudApper orders.' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: TrackOrderPage,
});


function TrackOrderPage() {
  const { orderId: searchOrderId } = Route.useSearch();
  const [orderId, setOrderId] = useState(searchOrderId || '');
  const getStatus = useServerFn(getOrderStatus);

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['order-status', searchOrderId],
    queryFn: () => getStatus({ data: { orderId: searchOrderId! } }),
    enabled: !!searchOrderId,
    retry: false,
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    // Trigger navigation to update search params, which triggers useQuery
    window.location.href = `/track-order?orderId=${orderId.trim()}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <Logo variant="icon" className="h-20 w-20 relative z-10 animate-float" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground bg-[var(--brand-gradient)] bg-clip-text text-transparent">Track Your Order</h1>


          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter your order ID to check the status of your purchase and fulfillment.
          </p>
        </div>

        <Card className="max-w-md mx-auto mb-16 border-2 border-transparent bg-surface-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Find your order</CardTitle>
            <CardDescription>
              Check the status of your AI tools or digital products delivery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="order-id" className="text-sm font-medium">Order ID</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="order-id"
                    placeholder="e.g. uuid-format-id" 
                    className="pl-9 font-mono text-sm"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Track Order'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : order ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
                <div>
                  <CardTitle className="text-lg">Order Details</CardTitle>
                  <CardDescription className="font-mono text-xs">{order.id}</CardDescription>
                </div>
                <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status as string)}
                      <div>
                        <p className="text-sm font-medium">Order Status</p>
                        <p className="text-2xl font-bold capitalize">{order.status}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Placed on</p>
                      <p className="font-medium">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-left md:text-right">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">{order.total} {order.currency}</p>
                    </div>
                    {order.payments && order.payments.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <Badge variant="outline" className="capitalize">{order.payments[0]?.provider}</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="mb-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items Purchased
                  </h3>
                  <div className="space-y-2">
                    {order.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-muted/10 p-3 rounded-lg border">
                        <span className="font-medium">{item.product_name}</span>
                        <span className="text-muted-foreground text-sm">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status === 'paid' && (
                  <div className="mt-8 space-y-6">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">Fulfillment Status</h4>
                        <div className="space-y-2 mt-1">
                          {(order.fulfillments as any) && (order.fulfillments as any).length > 0 ? (
                            (order.fulfillments as any).map((f: any) => (
                              <div key={f.id} className="flex items-center gap-2">
                                <Badge variant={f.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] py-0">
                                  {f.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {f.metadata?.product_name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Processing your digital delivery. Check back shortly.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {(order.entitlements as any) && (order.entitlements as any).length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Your Deliveries
                        </h3>
                        <div className="grid gap-3">
                          {(order.entitlements as any).map((ent: any) => (
                            <div key={ent.id} className="p-4 border rounded-lg bg-card shadow-sm">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <Badge variant="outline" className="capitalize text-[10px] mb-1">{ent.type}</Badge>
                                  <p className="font-medium text-sm">
                                    {(order.order_items as any)?.find((i: any) => i.product_id === ent.product_id)?.product_name || 'Product Delivery'}
                                  </p>
                                </div>
                              </div>
                              
                              {ent.type === 'license' && (
                                <div className="p-2 bg-muted rounded font-mono text-xs break-all border">
                                  {ent.data.license_key}
                                </div>
                              )}
                              
                              {ent.type === 'file' && (
                                <Button size="sm" variant="secondary" className="w-full" asChild>
                                  <Link to="/account/entitlements">
                                    <Package className="h-3 w-3 mr-2" />
                                    Access Downloads
                                  </Link>
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="text-center">
                          <Button variant="link" size="sm" asChild>
                            <Link to="/account/entitlements">View all your products in account →</Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        ) : searchOrderId ? (
          <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-muted rounded-2xl bg-muted/10">
            <XCircle className="h-12 w-12 text-destructive/60 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              We couldn't find an order with the ID: <code className="text-xs font-mono">{searchOrderId}</code>.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Try Another ID
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-muted rounded-2xl bg-muted/10">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Awaiting Order ID</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Enter your Order ID above to see status updates and delivery information.
            </p>
          </div>
        )}
      </main>


      <Footer />
    </div>
  );
}
