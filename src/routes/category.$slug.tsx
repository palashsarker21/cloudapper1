import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { getMarketplaceProducts, getCategoryBySlug } from '@/lib/products.functions';
import { ProductCard } from '@/components/marketplace/FeaturedProducts';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Separator } from '@/components/ui/separator';
import { PackageX, Loader2 } from 'lucide-react';

const categorySearchSchema = z.object({
  sort: z.string().default('newest'),
  page: z.number().default(1),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

export const Route = createFileRoute('/category/$slug')({
  validateSearch: (search) => categorySearchSchema.parse(search),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch() as any;
  
  const fetchCategory = useServerFn(getCategoryBySlug);
  const fetchProducts = useServerFn(getMarketplaceProducts);
  
  const { data: category, isLoading: isCatLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategory({ data: slug }),
  });

  const { data, isLoading: isProductsLoading } = useQuery({
    queryKey: ['category-products', slug, search],
    queryFn: () => fetchProducts({ 
      data: {
        category: slug,
        sort: search.sort,
        page: search.page,
        minPrice: search.minPrice,
        maxPrice: search.maxPrice
      }
    }),
  });

  if (isCatLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center py-20">
          <PackageX className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h1 className="text-2xl font-bold">Category Not Found</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        <Separator className="mb-8" />

        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl border bg-surface-1 animate-pulse" />
            ))}
          </div>
        ) : data?.products && data.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.products.map((p: any) => (
              <ProductCard 
                key={p.id} 
                product={{
                  id: p.id,
                  name: p.name,
                  category: p.categories?.name || category.name,
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
        ) : (
          <div className="py-20 flex flex-col items-center text-center">
            <PackageX className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <h2 className="text-xl font-semibold">No products in this category yet</h2>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
