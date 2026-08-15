import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Wallet, Smartphone, Banknote, ShieldCheck, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Logo } from '@/components/marketplace/Logo';

import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { createOrder, initiatePayment } from '@/lib/checkout.functions';
import { getPaymentReceivers } from '@/lib/admin.functions';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createPaymentRecord, getActiveCryptoWallets } from '@/lib/payments.functions';

export const Route = createFileRoute('/checkout')({
  head: () => ({
    title: 'Checkout | CloudApper',
    meta: [
      { name: 'description', content: 'Complete your purchase securely on CloudApper.' },
      { property: 'og:title', content: 'Checkout | CloudApper' },
      { property: 'og:description', content: 'Complete your purchase securely on CloudApper.' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: CheckoutPage,

});

type PaymentProvider = 'bkash' | 'nagad' | 'binance_pay' | 'bitget_pay' | 'crypto_wallet' | 'lemon_squeezy' | 'manual';

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('bkash');
  const [paymentStep, setPaymentStep] = useState<'selector' | 'details'>('selector');
  const [cryptoWallets, setCryptoWallets] = useState<any[]>([]);
  const [paymentReceivers, setPaymentReceivers] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [selectedReceiver, setSelectedReceiver] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  });

  const createOrderFn = useServerFn(createOrder);
  const initiatePaymentFn = useServerFn(initiatePayment);
  const createPaymentRecordFn = useServerFn(createPaymentRecord);
  const getCryptoWalletsFn = useServerFn(getActiveCryptoWallets);
  const getPaymentReceiversFn = useServerFn(getPaymentReceivers);

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

      // 2. Create Payment Record (Server-side price verification)
      const paymentResult = await createPaymentRecordFn({
        data: {
          orderId: orderResult.orderId,
          provider: paymentProvider as any,
          receiverId: selectedReceiver?.id,
          currency: 'BDT',
          metadata: paymentProvider === 'crypto_wallet' ? {
            wallet_address: selectedWallet?.wallet_address,
            asset: selectedWallet?.asset,
            network: selectedWallet?.network
          } : {}
        }
      });

      toast.success("Order created successfully!");
      clearCart();
      navigate({ to: '/checkout/payment/$paymentId', params: { paymentId: paymentResult.paymentId } });
    } catch (error: any) {
      toast.error(error.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadCryptoWallets = async () => {
    try {
      const wallets = await getCryptoWalletsFn();
      setCryptoWallets(wallets);
      if (wallets.length > 0) setSelectedWallet(wallets[0]);
    } catch (err) {
      console.error(err);
    }
  const loadPaymentReceivers = async () => {
    try {
      const receivers = await getPaymentReceiversFn();
      setPaymentReceivers(receivers.filter(r => r.enabled));
    } catch (err) {
      console.error(err);
    }
  };

  const { data: initialReceivers } = useQuery({
    queryKey: ['payment-receivers-checkout'],
    queryFn: () => getPaymentReceiversFn(),
  });

  const activeReceivers = initialReceivers?.filter(r => r.enabled) || [];

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="container mx-auto px-4 py-12">

      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Logo className="mr-4" />

        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Info */}
          <Card className="border-2 border-transparent bg-surface-2 shadow-sm">

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
          <Card className="border-2 border-transparent bg-surface-2 shadow-sm">

            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select your preferred payment provider.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {activeReceivers.map(receiver => (
                  <PaymentMethodButton 
                    key={receiver.id}
                    id={receiver.provider}
                    name={receiver.display_name}
                    description={`Pay via ${receiver.provider.toUpperCase()}`}
                    icon={<Smartphone className="h-6 w-6" />}
                    selected={selectedReceiver?.id === receiver.id}
                    onClick={() => {
                      setPaymentProvider(receiver.provider as any);
                      setSelectedReceiver(receiver);
                    }}
                  />
                ))}
                
                <PaymentMethodButton 
                  id="binance_pay"
                  name="Binance Pay"
                  description="Pay with Binance Pay"
                  icon={<CreditCard className="h-6 w-6" />}
                  selected={paymentProvider === 'binance_pay'}
                  onClick={() => {
                    setPaymentProvider('binance_pay');
                    setSelectedReceiver(null);
                  }}
                />
                <PaymentMethodButton 
                  id="bitget_pay"
                  name="Bitget Wallet Pay"
                  description="Pay with Bitget Wallet"
                  icon={<Wallet className="h-6 w-6" />}
                  selected={paymentProvider === 'bitget_pay'}
                  onClick={() => {
                    setPaymentProvider('bitget_pay');
                    setSelectedReceiver(null);
                  }}
                />
                <PaymentMethodButton 
                  id="crypto_wallet"
                  name="Crypto Wallet"
                  description="Pay USDT/Crypto directly from your wallet"
                  icon={<Banknote className="h-6 w-6" />}
                  selected={paymentProvider === 'crypto_wallet'}
                  onClick={() => {
                    setPaymentProvider('crypto_wallet');
                    setSelectedReceiver(null);
                    loadCryptoWallets();
                  }}
                />
              </div>

              {paymentProvider === 'crypto_wallet' && cryptoWallets.length > 0 && (
                <div className="mt-6 space-y-4 p-4 rounded-xl border bg-muted/20">
                  <Label>Select Asset & Network</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cryptoWallets.map(wallet => (
                      <Button
                        key={wallet.id}
                        type="button"
                        variant={selectedWallet?.id === wallet.id ? 'default' : 'outline'}
                        className="justify-start h-auto py-3 px-4"
                        onClick={() => setSelectedWallet(wallet)}
                      >
                        <div className="text-left">
                          <div className="font-bold">{wallet.asset}</div>
                          <div className="text-[10px] opacity-70">{wallet.network}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="border-2 border-transparent bg-surface-2 shadow-sm">
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
    </div>
  );
}

function PaymentMethodButton({ id, name, description, icon, selected, onClick }: any) {
  return (
    <Button
      type="button"
      variant={selected ? 'default' : 'outline'}
      className={`h-auto py-4 px-6 flex items-center justify-between text-left border-2 transition-all ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${selected ? 'bg-primary-foreground/10' : 'bg-muted'}`}>
          {icon}
        </div>
        <div>
          <div className="font-bold">{name}</div>
          <div className="text-xs opacity-70">{description}</div>
        </div>
      </div>
      {selected && <Check className="h-5 w-5" />}
    </Button>
  );
}


