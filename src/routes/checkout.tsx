import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Wallet, Smartphone, Banknote, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { createOrder, initiatePayment } from '@/lib/checkout.functions';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
});

type PaymentProvider = 'bkash' | 'nagad' | 'binance_pay' | 'manual';

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('bkash');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  });

  const createOrderFn = useServerFn(createOrder);
  const initiatePaymentFn = useServerFn(initiatePayment);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add some products to your cart before checking out.</p>
        <Button onClick={() => navigate({ to: '/' })}>Go to Marketplace</Button>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Please login to complete your purchase");
        navigate({ to: '/login', search: { redirect: '/checkout' } });
        return;
      }

      // 1. Create Order
      const orderResult = await createOrderFn({
        data: {
          items: items.map(item => ({ productId: item.id, quantity: item.quantity })),
          customerEmail: formData.email,
          customerName: formData.name,
          notes: formData.notes,
        }
      });

      // 2. Initiate Payment
      await initiatePaymentFn({
        data: {
          orderId: orderResult.orderId,
          provider: paymentProvider,
        }
      });

      toast.success("Order created successfully!");
      clearCart();
      navigate({ to: '/track-order', search: { orderId: orderResult.orderId } });
    } catch (error: any) {
      toast.error(error.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Enter your details for the order delivery.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      required 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Input 
                    id="notes" 
                    placeholder="Any specific delivery instructions?" 
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select your preferred payment provider.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={paymentProvider === 'bkash' ? 'default' : 'outline'}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setPaymentProvider('bkash')}
                >
                  <Smartphone className="h-6 w-6" />
                  <span>bKash</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentProvider === 'nagad' ? 'default' : 'outline'}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setPaymentProvider('nagad')}
                >
                  <Wallet className="h-6 w-6" />
                  <span>Nagad</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentProvider === 'binance_pay' ? 'default' : 'outline'}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setPaymentProvider('binance_pay')}
                >
                  <CreditCard className="h-6 w-6" />
                  <span>Binance Pay</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentProvider === 'manual' ? 'default' : 'outline'}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setPaymentProvider('manual')}
                >
                  <Banknote className="h-6 w-6" />
                  <span>Manual (Bank/Other)</span>
                </Button>
              </div>

              {paymentProvider === 'manual' && (
                <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
                  <p className="font-semibold mb-2">Manual Payment Instructions:</p>
                  <p>Please contact our support team after making the payment to verify your transaction. Use the Order ID provided after checkout.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} x {item.quantity}</span>
                    <span>{item.price * item.quantity} BDT</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{subtotal} BDT</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                form="checkout-form" 
                className="w-full" 
                size="lg" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="text-center text-xs text-muted-foreground flex items-center justify-center">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Secure Payment Gateway
          </div>
        </div>
      </div>
    </div>
  );
}
