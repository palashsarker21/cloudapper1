import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/track-order')({
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
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setIsSearching(true);
    // Simulation - will always show empty state as per requirements
    setTimeout(() => {
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Track Your Order</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter your order ID and email address to check the status of your purchase.
          </p>
        </div>

        <Card className="max-w-md mx-auto mb-16 border-muted/60 shadow-sm">
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
                    placeholder="e.g. ORD-123456" 
                    className="pl-9"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Track Order'}
                {!isSearching && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Empty State / Result Placeholder */}
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-muted rounded-2xl bg-muted/20">
          <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mb-6">
            <Package className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Order Information Found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            We couldn't find any order matching those details. Once real order tracking data is connected, you'll see status updates here.
          </p>
          <Button variant="outline" asChild>
            <a href="/">Return to Marketplace</a>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
