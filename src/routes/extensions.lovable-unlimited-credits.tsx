import { createFileRoute, Link } from '@tanstack/react-router';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getProductById, getMarketplaceProducts } from '@/lib/products.functions';
import { 
  ShieldCheck, Zap, Clock, Smartphone, Globe, CheckCircle2, 
  Chrome, LayoutGrid, Info, Download, ArrowRight, Star
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/extensions/lovable-unlimited-credits')({
  component: LovableExtensionPage,
  head: () => ({
    title: 'Lovable Unlimited Credits Extension | CloudApper',
    meta: [
      { name: 'description', content: "Get CloudApper's Lovable Unlimited Credits Extension with flexible plans, secure license delivery and easy activation." },
      { property: 'og:title', content: 'Lovable Unlimited Credits Extension | CloudApper' },
      { property: 'og:description', content: 'Unlock unlimited Lovable credits usage with CloudApper browser extension.' },
      { property: 'og:image', content: 'https://cloudapper.online/brand/og-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
});

function LovableExtensionPage() {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const fetchProduct = useServerFn(getProductById);
  const fetchPackages = useServerFn(async ({ productId }: { productId: string }) => {
    const { data, error } = await supabase
      .from('product_packages')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  });

  // We know the slug, but we need the ID from the database first
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-by-slug', 'lovable-unlimited-credits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('slug', 'lovable-unlimited-credits')
        .single();
      if (error) return null;
      return data;
    }
  });

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['product-packages', product?.id],
    queryFn: () => fetchPackages({ productId: product!.id }),
    enabled: !!product?.id
  });

  if (productLoading || packagesLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-0">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Zap className="h-8 w-8 animate-pulse text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-0">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">{t.common.comingSoon}</h1>
          <Button asChild><Link to="/">{t.common.exploreMarketplace}</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const features = (language === 'bn' && product.features_bn ? (product.features_bn as string[]) : (product.features as string[])) || [
    "Unlimited Credit Access",
    "Fast Activation",
    "Simple License Activation",
    "Multiple Package Durations",
    "Secure Delivery"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-foreground">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
          </div>
          
          <div className="container relative mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
                {language === 'bn' ? 'এআই এক্সটেনশন' : 'AI Extension'}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                {language === 'bn' && product.name_bn ? product.name_bn : product.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                {language === 'bn' && product.short_description_bn ? product.short_description_bn : product.short_description}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild className="h-14 px-8 text-base">
                  <a href="#pricing">{language === 'bn' ? 'প্ল্যান দেখুন' : 'View Pricing'}</a>
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-2 rounded-full border border-border/50">
                  <span className="text-sm font-medium">{language === 'bn' ? 'শুরু মাত্র' : 'Starting from'}</span>
                  <span className="text-lg font-bold text-primary">৳100</span>
                </div>
              </div>

              <div className="mt-12 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 inline-flex gap-3 text-sm text-amber-700 dark:text-amber-400 max-w-2xl">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-left">
                  {language === 'bn' 
                    ? 'এটি ক্লাউডঅ্যাপার প্রদত্ত একটি থার্ড-পার্টি এক্সটেনশন। এটি লাভবল (Lovable) এর অফিশিয়াল প্রোডাক্ট নয়।' 
                    : 'This is a CloudApper-provided third-party extension. Not an official Lovable product.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-surface-1">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{language === 'bn' ? 'প্যাকেজসমূহ' : 'Available Packages'}</h2>
              <p className="text-muted-foreground">{language === 'bn' ? 'আপনার প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন' : 'Choose the best plan for your workflow'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {packages?.map((pkg) => (
                <Card key={pkg.id} className="relative group overflow-hidden border-2 border-transparent bg-surface-2 hover:border-primary/20 transition-all duration-300 shadow-lg flex flex-col">
                  {pkg.slug === '30d' && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1 rotate-45 translate-x-[30%] translate-y-[50%]">
                        Best Value
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{language === 'bn' && pkg.name_bn ? pkg.name_bn : pkg.name}</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">৳{Number(pkg.price).toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm">/ {pkg.duration_value} {pkg.duration_unit === 'lifetime' ? '' : (pkg.duration_value === 1 ? pkg.duration_unit : pkg.duration_unit + 's')}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>{language === 'bn' ? 'তাত্ক্ষণিক ডেলিভারি' : 'Instant Delivery'}</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>{language === 'bn' ? 'আনলিমিটেড ক্রেডিট' : 'Unlimited Credits'}</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>{pkg.max_activations} {language === 'bn' ? 'অ্যাক্টিভেশন' : 'Activations'}</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full h-12" 
                      onClick={() => {
                        addItem({
                          id: product.id,
                          package_id: pkg.id, // Important: using package ID
                          name: `${product.name} - ${pkg.name}`,
                          price: Number(pkg.price),
                          image_url: product.image_url,
                          quantity: 1
                        });
                        toast.success(t.common.addToCart);
                      }}
                    >
                      {language === 'bn' ? 'কিনুন' : 'Buy Now'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-surface-0">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">{language === 'bn' ? 'প্রধান বৈশিষ্ট্যসমূহ' : 'Product Features'}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Zap, title: language === 'bn' ? 'তাত্ক্ষণিক অ্যাক্সেস' : 'Instant Access', desc: language === 'bn' ? 'পেমেন্ট ভেরিফিকেশনের পর দ্রুত অ্যাক্টিভেশন।' : 'Fast activation after successful payment verification.' },
                { icon: ShieldCheck, title: language === 'bn' ? 'নিরাপদ ডেলিভারি' : 'Secure Delivery', desc: language === 'bn' ? 'ক্লাউডঅ্যাপার সিস্টেমের মাধ্যমে নিরাপদ লাইসেন্স ডেলিভারি।' : 'License fulfillment through controlled CloudApper system.' },
                { icon: LayoutGrid, title: language === 'bn' ? 'মাল্টিপল ডিউরেশন' : 'Multiple Durations', desc: language === 'bn' ? 'আপনার প্রয়োজন অনুযায়ী প্যাকেজ বেছে নেওয়ার সুবিধা।' : 'Choose from 24-hour to lifetime packages.' },
                { icon: Globe, title: language === 'bn' ? 'ব্রাউজার সাপোর্ট' : 'Browser Support', desc: language === 'bn' ? 'সব জনপ্রিয় ক্রোমিয়াম ব্রাউজারে কাজ করে।' : 'Works on Chrome, Edge, Brave and more.' }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface-2 border border-border/50 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Installation Guide */}
        <section className="py-24 bg-surface-1">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{language === 'bn' ? 'ইনস্টলেশন গাইড' : 'Installation Guide'}</h2>
              <p className="text-muted-foreground">{language === 'bn' ? 'কিভাবে এক্সটেনশনটি ব্যবহার করবেন' : 'Step-by-step setup instructions'}</p>
            </div>

            <div className="space-y-8">
              {[
                { step: 1, text: language === 'bn' ? 'প্যাকেজ নির্বাচন করে পেমেন্ট সম্পন্ন করুন।' : 'Select a package and complete payment.' },
                { step: 2, text: language === 'bn' ? 'পেমেন্ট ভেরিফিকেশন সাবমিট করুন (ম্যানুয়াল পেমেন্টের ক্ষেত্রে)।' : 'Submit payment info for manual verification.' },
                { step: 3, text: language === 'bn' ? 'আপনার লাইসেন্স কী "My Orders" সেকশনে পাবেন।' : 'Retrieve your license key from "My Orders".' },
                { step: 4, text: language === 'bn' ? 'সাপোর্টেড ব্রাউজার থেকে জিপ ফাইলটি ডাউনলোড এবং এক্সট্র্যাক্ট করুন।' : 'Download and extract the extension ZIP.' },
                { step: 5, text: language === 'bn' ? 'ব্রাউজার সেটিংস থেকে "Developer Mode" অন করে এক্সটেনশনটি লোড করুন।' : 'Enable "Developer Mode" and load the extension.' },
                { step: 6, text: language === 'bn' ? 'এক্সটেনশন প্যানেলে আপনার লাইসেন্স কীটি দিয়ে অ্যাক্টিভেট করুন।' : 'Enter your license key in the extension panel and activate.' }
              ].map((s) => (
                <div key={s.step} className="flex gap-6 items-start">
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0 mt-1">
                    {s.step}
                  </div>
                  <div className="p-6 rounded-2xl bg-surface-2 border border-border/50 flex-grow">
                    <p className="text-lg font-medium">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Browser Support */}
        <section className="py-24 bg-surface-0">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-16">{language === 'bn' ? 'সাপোর্টেড ব্রাউজারসমূহ' : 'Supported Browsers'}</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {['Chrome', 'Edge', 'Brave', 'Kiwi'].map((b) => (
                <div key={b} className="flex flex-col items-center gap-4 group">
                  <div className="h-20 w-20 rounded-3xl bg-surface-2 border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="h-10 w-10 text-muted-foreground/60" />
                  </div>
                  <span className="font-bold">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-[var(--brand-gradient)] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-8">{language === 'bn' ? 'আপনার ক্রেডিট লিমিট এখন আনলিমিটেড!' : 'Unlock Unlimited Potential'}</h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">
              {language === 'bn' ? 'আজই ক্লাউডঅ্যাপার এক্সটেনশনটি সংগ্রহ করুন এবং কাজ শুরু করুন।' : 'Get started with CloudApper extension today and boost your productivity.'}
            </p>
            <Button size="lg" variant="secondary" className="h-14 px-12 text-lg" asChild>
              <a href="#pricing">{language === 'bn' ? 'এখনই শুরু করুন' : 'Get Started Now'}</a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
