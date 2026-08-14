import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden border bg-background transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <Badge className="absolute left-3 top-3 bg-background/80 text-foreground backdrop-blur-sm">
            {product.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-1 text-sm text-yellow-500">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
        <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-2 text-xl font-bold text-foreground">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export const FeaturedProducts = () => {
  // Empty state if no data, but here we provide some demo data as per "foundation"
  const products: Product[] = [
    {
      id: "1",
      name: "Midjourney Prompt Library",
      category: "Prompts",
      price: 19.99,
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1675557009875-436f49d7af8f?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: "2",
      name: "ChatGPT Plus 1-Month Credit",
      category: "AI Credits",
      price: 22.00,
      rating: 4.9,
      reviews: 856,
      image: "https://images.unsplash.com/photo-1673172496993-48b4882c89f2?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: "3",
      name: "Automated SEO Tool Suite",
      category: "AI Tools",
      price: 49.00,
      rating: 4.7,
      reviews: 56,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: "4",
      name: "Modern UI Kit for React",
      category: "Templates",
      price: 35.00,
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=400",
    },
  ];

  return (
    <section className="py-16">
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
          <Button variant="ghost" className="hidden sm:flex">
            View All Marketplace
          </Button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
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
