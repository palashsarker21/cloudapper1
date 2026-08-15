import { Star, ShoppingCart, ExternalLink, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

import { useServerFn } from "@tanstack/react-start";
import { getFeaturedProducts } from "@/lib/products.functions";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  sku?: string | null;
  product_type?: string | null;
  license_duration?: number | null;
  inventory_type?: string | null;
  stock_status?: string | null;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const isExtension = product.product_type === 'browser_extensions';
  const isInStock = product.stock_status === 'in_stock';

  return (
    <Card className="group overflow-hidden border-2 border-transparent bg-surface-2 transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-2 flex flex-col rounded-[var(--brand-radius)] hover:border-primary/20">
      <CardHeader className="p-0">
        <Link to="/product/$productId" params={{ productId: product.id }} className="block relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <Badge className="bg-surface-2/90 text-foreground backdrop-blur-md border-primary/20">
              {product.category}
            </Badge>
            {product.license_duration && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 backdrop-blur-md">
                {product.license_duration >= 9999 ? 'Lifetime' : `${product.license_duration} ${product.license_duration === 1 ? 'Day' : 'Days'}`}
              </Badge>
            )}
          </div>

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm" className="pointer-events-none">
              View Details
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <div className="mb-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Zap className="h-3 w-3" />
            Instant Delivery
          </div>
          <Badge variant={isInStock ? "success" : "destructive"} className="text-[10px] h-5">
            {isInStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>

        <Link to="/product/$productId" params={{ productId: product.id }}>
          <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary min-h-[3rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>24/7 Support Included</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ৳{product.price.toLocaleString()}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full h-11" 
          variant={isExtension ? "default" : "outline"}
          disabled={!isInStock}
          onClick={() => {
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image,
              quantity: 1
            });
            toast.success("Added to cart");
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isExtension ? "Get License" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export const FeaturedProducts = () => {
  const fetchFeatured = useServerFn(getFeaturedProducts);
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const data = await fetchFeatured();
      
      return (data as any[]).map(p => ({
        id: p.id,
        name: p.name,
        category: (p.categories as any)?.name || 'Product',
        price: Number(p.price),
        rating: 5.0,
        reviews: 0,
        image: p.image_url || "https://images.unsplash.com/photo-1675557009875-436f49d7af8f?auto=format&fit=crop&q=80&w=400",
        sku: p.sku,
        product_type: p.product_type,
        license_duration: p.license_duration,
        inventory_type: p.inventory_type,
        stock_status: p.stock_status,
      }));
    }
  });


  return (
    <section className="py-24 bg-surface-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hand-picked digital tools to elevate your workflow.
            </p>
          </div>
          <Button variant="ghost" className="hidden sm:flex" asChild>
            <Link to="/search" search={{ sort: 'newest', page: 1 }}>
              View All Marketplace
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-xl border bg-background animate-pulse" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-20 text-center">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};
