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
  Loader2
} from 'lucide-react';


export const Route = createFileRoute('/product/$productId')({
  head: ({ params }) => ({
    title: `Product Detail | CloudApper`,
    meta: [
      { name: 'description', content: 'View details and purchase this AI product on CloudApper.' },
      { property: 'og:title', content: 'Product Detail | CloudApper' },
      { property: 'og:description', content: 'Discover high-quality AI tools and digital products.' },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', productId)
        .single();
      
      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        category: (data.categories as any)?.name || 'Product',
        price: `$${Number(data.price).toFixed(2)}`,
        rating: 5.0,
        reviews: 0,
        description: data.description || "No description available.",
        image: data.image_url,
        features: [
          "Secure delivery",
          "Verified quality",
          "Premium support",
          "Instant access"
        ],
        specs: [
          { label: "Delivery", value: data.stock_status === 'in_stock' ? "Instant" : "Delayed" },
          { label: "Status", value: data.stock_status.replace('_', ' ') },
          { label: "Added", value: new Date(data.created_at).toLocaleDateString() }
        ],
        highlights: [
          { icon: ShieldCheck, title: "Secure", description: "Fully encrypted delivery" },
          { icon: Zap, title: "Fast", description: "Optimized fulfillment" },
          { icon: Clock, title: "Support", description: "Priority help desk" }
        ]
      };
    }
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
          <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Image Gallery Placeholder */}
          <div className="space-y-4">
            <div className="aspect-video bg-muted/30 border-2 border-dashed border-muted rounded-3xl flex items-center justify-center overflow-hidden">
              <div className="flex flex-col items-center text-muted-foreground">
                <Download className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">Product Preview Image</p>
                <p className="text-sm opacity-60">High-resolution screenshot or mockup</p>
              </div>
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
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1 h-14 text-base gap-2">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
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
                value="specs" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8"
              >
                Reviews
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
            
            <TabsContent value="specs" className="py-8">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between p-4">
                        <span className="font-medium text-muted-foreground">{spec.label}</span>
                        <span className="font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="py-8 text-center text-muted-foreground italic">
              User reviews will appear here once connected to the backend.
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
