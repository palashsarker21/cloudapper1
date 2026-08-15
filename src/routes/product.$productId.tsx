import { createFileRoute, Link } from '@tanstack/react-router';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingCart, 
  ChevronLeft, 
  Star, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Download,
  CheckCircle2,
  Share2,
  Heart,
  Loader2,
  Check,
  Info
} from 'lucide-react';
import { Logo } from '@/components/marketplace/Logo';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { useServerFn } from '@tanstack/react-start';
import { getRelatedProducts } from '@/lib/products.functions';
import { ProductCard } from '@/components/marketplace/FeaturedProducts';




export const Route = createFileRoute('/product/$productId')({
  head: ({ params }) => ({
    title: `Product Detail | CloudApper`,
    meta: [
      { name: 'description', content: 'View details and purchase this AI product on CloudApper with secure delivery.' },
      { property: 'og:title', content: 'Product Detail | CloudApper' },
      { property: 'og:description', content: 'Discover high-quality AI tools and digital products with instant delivery.' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],

  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);


  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', productId)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;

      const isExtension = data.product_type === 'browser_extensions';
      const features = (data.features as string[]) || [
        "Secure delivery",
        "Verified quality",
        "Premium support",
        "Instant access"
      ];
      
      const compatibility = data.compatibility as any;

      return {
        id: data.id,
        name: data.name,
        category: (data.categories as any)?.name || 'Product',
        price: `৳${Number(data.price).toLocaleString()}`,
        rating: 5.0,
        reviews: 0,
        description: data.description || data.short_description || "No description available.",
        fullDescription: data.full_description,
        image: data.image_url,
        product_type: data.product_type,
        license_duration: data.license_duration,
        sku: data.sku,
        category_id: data.category_id,
        delivery_instructions: data.delivery_instructions,
        features,
        specs: [
          { label: "SKU", value: data.sku || 'N/A' },
          { label: "Duration", value: data.license_duration ? (data.license_duration >= 9999 ? 'Lifetime' : `${data.license_duration} Days`) : 'N/A' },
          { label: "Delivery", value: data.delivery_method?.replace('_', ' ') || "Instant" },
          { label: "Status", value: (data.stock_status || 'in_stock').replace('_', ' ') },
          { label: "Added", value: new Date(data.created_at).toLocaleDateString() }
        ],
        highlights: [
          { icon: ShieldCheck, title: "Verified", description: isExtension ? "Lovable-Compatible" : "Secure access" },
          { icon: Zap, title: "Instant", description: "Automatic delivery" },
          { icon: Clock, title: "Support", description: "24/7 priority help" }
        ],
        compatibility,
        importantNote: isExtension ? "Compatibility and availability may depend on the current extension, browser and third-party service environment. Please review the current product instructions before purchase." : null,
        backupNote: "Always keep a backup of your project and important data using services such as GitHub and Supabase."
      };
    }
  });

  const fetchRelated = useServerFn(getRelatedProducts);
  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', productId, (product as any)?.category_id],
    queryFn: () => fetchRelated({ productId, categoryId: (product as any)?.category_id } as any),
    enabled: !!product
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/">Back to Marketplace</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb / Back button */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Marketplace
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Logo variant="wordmark" />
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Image Gallery Placeholder */}
          <div className="space-y-4">
            <div className="aspect-video bg-muted/30 border border-muted rounded-3xl flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Download className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-medium">Product Preview Image</p>
                  <p className="text-sm opacity-60">High-resolution screenshot or mockup</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted/20 border border-muted/50 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-muted-foreground/40 font-mono">IMG_0{i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                  {product.category}
                </Badge>
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm font-semibold text-foreground">{product.rating}</span>
                  <span className="ml-1 text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
              <p className="text-2xl font-bold text-primary">{product.price}</p>
              
              <div className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
              
              {product.importantNote && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3 text-sm text-amber-700 dark:text-amber-400">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>{product.importantNote}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-1 h-14 text-base gap-2"
                onClick={() => {
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price.replace(/[^0-9.-]+/g,"")),
                    image_url: product.image ?? null,
                    quantity: 1
                  });
                  setAdded(true);
                  toast.success("Added to cart");
                  setTimeout(() => setAdded(false), 2000);
                }}
              >
                {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                {added ? "Added" : (product.product_type === 'browser_extensions' ? "Get License" : "Add to Cart")}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-14 w-14">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {product.highlights.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabs */}
        <div className="mt-20">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
              <TabsTrigger 
                value="features" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8"
              >
                Features
              </TabsTrigger>
              <TabsTrigger 
                value="compatibility" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8"
              >
                Compatibility
              </TabsTrigger>
              <TabsTrigger 
                value="instructions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8"
              >
                Instructions
              </TabsTrigger>
              <TabsTrigger 
                value="specs" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8"
              >
                Specifications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="py-8 space-y-6">
              <h3 className="text-xl font-bold">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-muted/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="compatibility" className="py-8 space-y-6">
              <h3 className="text-xl font-bold">Supported Environments</h3>
              {product.compatibility ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">System Environments</h4>
                    <ul className="space-y-2">
                      {product.compatibility.environments?.map((env: string, i: number) => (
                        <li key={i} className="text-muted-foreground flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {env}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">Browsers</h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {product.compatibility?.chrome && (
                        <li className="text-muted-foreground flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" /> Chrome
                        </li>
                      )}
                      {product.compatibility?.firefox && (
                        <li className="text-muted-foreground flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" /> Firefox
                        </li>
                      )}
                      {product.compatibility?.edge && (
                        <li className="text-muted-foreground flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" /> Edge
                        </li>
                      )}
                      {product.compatibility?.safari && (
                        <li className="text-muted-foreground flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" /> Safari
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="md:col-span-2 p-4 rounded-xl bg-muted/30 border text-sm italic text-muted-foreground">
                    Note: {product.compatibility.mobile}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Compatibility details not specified.</p>
              )}
            </TabsContent>

            <TabsContent value="instructions" className="py-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Delivery & Activation</h3>
                  <div className="p-6 rounded-3xl border bg-surface-2 space-y-4">
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
                      <p className="text-sm text-muted-foreground">{product.delivery_instructions}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Important Notes</h3>
                  <div className="p-6 rounded-3xl border bg-destructive/5 border-destructive/10 space-y-4">
                    <div className="flex gap-4">
                      <ShieldCheck className="h-6 w-6 text-destructive shrink-0" />
                      <p className="text-sm text-muted-foreground">{product.backupNote}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specs" className="py-8">
              <Card className="rounded-[var(--brand-radius)] overflow-hidden border-2 border-transparent bg-surface-2">
                <CardContent className="p-0">
                  <div className="divide-y border-t-0">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                        <span className="font-medium text-muted-foreground">{spec.label}</span>
                        <span className="font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-32 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Related Products</h2>
              <Button variant="ghost" asChild>
                <Link to="/">View Marketplace</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => (
                <ProductCard 
                  key={p.id} 
                  product={{
                    id: p.id,
                    name: p.name,
                    category: p.categories?.name || 'Product',
                    price: Number(p.price),
                    rating: 5.0,
                    reviews: 0,
                    image: p.image_url || "https://images.unsplash.com/photo-1675557009875-436f49d7af8f?auto=format&fit=crop&q=80&w=400",
                    sku: p.sku,
                    product_type: p.product_type,
                    license_duration: p.license_duration,
                    inventory_type: p.inventory_type,
                    stock_status: p.stock_status,
                  }} 
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
