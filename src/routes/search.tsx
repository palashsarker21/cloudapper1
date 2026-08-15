import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { getMarketplaceProducts, getCategoryBySlug } from '@/lib/products.functions';
import { ProductCard } from '@/components/marketplace/FeaturedProducts';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Filter, SlidersHorizontal, PackageX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z.string().default('newest'),
  page: z.number().default(1),
  productType: z.string().optional(),
  duration: z.string().optional(),
});

export const Route = createFileRoute('/search')({
  validateSearch: (search) => searchSchema.parse(search),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch() as any;
  const navigate = Route.useNavigate();
  const fetchProducts = useServerFn(getMarketplaceProducts);
  
  const { data, isLoading } = useQuery({
    queryKey: ['search-products', search],
    queryFn: () => fetchProducts({ 
      data: {
        q: search.q,
        category: search.category,
        minPrice: search.minPrice,
        maxPrice: search.maxPrice,
        sort: search.sort,
        page: search.page,
        productType: search.productType,
        duration: search.duration
      }
    }),
  });

  const handlePriceRange = (range: [number, number | undefined]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        minPrice: range[0],
        maxPrice: range[1],
        page: 1
      })
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Price Range (BDT)</h4>
                  <div className="space-y-2">
                    {[
                      { label: "৳0–৳500", range: [0, 500] },
                      { label: "৳501–৳1,000", range: [501, 1000] },
                      { label: "৳1,001–৳3,000", range: [1001, 3000] },
                      { label: "৳3,001–৳10,000", range: [3001, 10000] },
                      { label: "৳10,001+", range: [10001, undefined] },
                    ].map((p) => (
                      <button 
                        key={p.label}
                        onClick={() => handlePriceRange(p.range as [number, number | undefined])}
                        className={cn(
                          "w-full text-left text-sm py-1.5 px-3 rounded-lg hover:bg-surface-2 transition-colors",
                          search.minPrice === p.range[0] && search.maxPrice === p.range[1] ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">License Duration</h4>
                  <div className="space-y-2">
                    {['1', '3', '7', '15', '30', '9999'].map((d) => (
                      <div key={d} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`duration-${d}`} 
                          checked={search.duration === d}
                          onCheckedChange={() => navigate({ search: (prev) => ({ ...prev, duration: prev.duration === d ? undefined : d, page: 1 }) })}
                        />
                        <Label htmlFor={`duration-${d}`} className="text-sm cursor-pointer">
                          {d === '9999' ? 'Lifetime' : `${d} ${d === '1' ? 'Day' : 'Days'}`}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate({ search: { q: search.q, sort: 'newest', page: 1 } })}
            >
              Clear All Filters
            </Button>
          </aside>

          {/* Results Area */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {search.q ? `${t.common.exploreMarketplace} for "${search.q}"` : t.nav.marketplace}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isLoading ? "Searching..." : `${data?.count || 0} ${t.common.noProductsFound.toLowerCase().includes('no') ? 'products found' : 'টি পণ্য পাওয়া গেছে'}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select 
                  className="bg-surface-2 border-none rounded-lg text-sm font-medium py-2 pl-3 pr-8 focus:ring-1 focus:ring-primary/20"
                  value={search.sort}
                  onChange={(e) => navigate({ search: (prev) => ({ ...prev, sort: e.target.value, page: 1 }) })}
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="price:asc">Price: Low to High</option>
                  <option value="price:desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <Separator />

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 rounded-3xl border bg-surface-1 animate-pulse" />
                ))}
              </div>
            ) : data?.products && data.products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.products.map((p: any) => (
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

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      disabled={search.page === 1}
                      onClick={() => navigate({ search: (prev) => ({ ...prev, page: prev.page - 1 }) })}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    {Array.from({ length: data.totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        variant={search.page === i + 1 ? "default" : "outline"}
                        className="w-10"
                        onClick={() => navigate({ search: (prev) => ({ ...prev, page: i + 1 }) })}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      disabled={search.page === data.totalPages}
                      onClick={() => navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-surface-2 flex items-center justify-center mb-6">
                  <PackageX className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h2 className="text-xl font-bold mb-2">{t.common.noProductsFound}</h2>
                <p className="text-muted-foreground max-w-sm mb-8">
                  {t.common.noProductsYet}
                </p>
                <Button onClick={() => navigate({ search: { q: "", sort: 'newest', page: 1 } as any })}>
                  {t.common.exploreMarketplace}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const cn = (...inputs: any[]) => {
  return inputs.filter(Boolean).join(' ');
};
